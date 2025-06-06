import { VerificationSession } from "@/modules/baekjoon/domain/model"
import { VerificationString } from "@/modules/baekjoon/domain/vo"
import { CompleteVerificationRequestDto } from "@/modules/baekjoon/infrastructure/dtos/request"
import { ErrorUtils } from "@/shared/utils/error.util"
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  RequestTimeoutException,
} from "@nestjs/common"
import { BaekjoonUser } from "../../../domain/model/baekjoon-user.model"
import { CompleteVerificationDto } from "../../dtos"
import { BaekjoonMapper } from "../../mappers"
import { CachePort } from "../../ports"
import { CompleteVerificationUseCase } from "../../ports/in/complete-verification.usecase"
import { BaekjoonRepositoryPort } from "../../ports/out/baekjoon-repository.port"
import { RateLimitPort } from "../../ports/out/rate-limit.port"
import { SolvedAcApiPort } from "../../ports/out/solved-ac-api.port"

/**
 * 인증 완료 유스케이스 구현
 * 백준 ID 인증 프로세스를 완료하는 비즈니스 로직
 */
@Injectable()
export class CompleteVerificationUseCaseImpl implements CompleteVerificationUseCase {
  private readonly logger = new Logger(CompleteVerificationUseCaseImpl.name)

  constructor(
    @Inject("BaekjoonRepositoryPort")
    private readonly baekjoonRepository: BaekjoonRepositoryPort,
    @Inject("SolvedAcApiPort")
    private readonly solvedAcApi: SolvedAcApiPort,
    @Inject("RateLimitPort")
    private readonly rateLimitService: RateLimitPort,
    @Inject("CachePort")
    private readonly cacheAdapter: CachePort,
    private readonly baekjoonMapper: BaekjoonMapper,
  ) {}

  async execute(requestDto: CompleteVerificationRequestDto): Promise<CompleteVerificationDto> {
    try {
      const { email: userId, handle, sessionId } = requestDto
      // 1. Rate Limiting 검사
      const rateLimitKey = `baekjoon_complete:${userId}`
      const canProceed = await this.rateLimitService.checkRateLimit(rateLimitKey, 5, 5 * 60) // 5분에 5회

      if (!canProceed) {
        throw new ConflictException("인증 시도가 너무 빈번합니다. 잠시 후 다시 시도해주세요.")
      }

      if (!sessionId) {
        throw new BadRequestException("인증 세션 ID가 필요합니다. 인증을 시작해주세요.")
      }

      // 2. 활성 인증 세션 조회
      let session = await this.cacheAdapter.get<VerificationSession>(sessionId)
      if (!session || session.getUserId() !== userId) {
        throw new NotFoundException("유효하지 않은 인증 세션입니다.")
      }
      if (!session) {
        throw new NotFoundException("진행 중인 인증 세션이 없습니다. 먼저 인증을 시작해주세요.")
      }

      // 3. 세션 상태 검사
      if (session.isExpired()) {
        session.expire()
        await this.cacheAdapter.delete(rateLimitKey)
        throw new RequestTimeoutException("인증 세션이 만료되었습니다. 다시 시도해주세요.")
      }

      if (session.isCompleted()) {
        throw new ConflictException("이미 완료된 인증입니다.")
      }

      if (session.isFailed()) {
        throw new BadRequestException("실패한 인증 세션입니다. 새로 시작해주세요.")
      }

      // 4. Rate limit 기록
      await this.rateLimitService.recordAttempt(rateLimitKey)

      // 5. solved.ac API로 사용자 프로필 조회
      const userAdditionalInfo = await this.solvedAcApi.getUserAdditionalInfo(session.getHandleString())
      const currentNativeName = VerificationString.of(userAdditionalInfo.nameNative || "")

      // 6. 인증 문자열 확인
      const expectedString = session.getVerificationString()
      if (!expectedString.equals(currentNativeName)) {
        // 인증 실패 - 세션 상태 업데이트
        session.fail("인증 문자열이 일치하지 않습니다.")
        await this.cacheAdapter.delete(rateLimitKey)

        return this.baekjoonMapper.toCompleteVerificationDto(session, false, "인증 문자열이 일치하지 않습니다.")
      }

      // 7. 인증 성공 - 사용자 프로필 정보 가져오기
      const solvedAcProfile = await this.solvedAcApi.getUserProfile(session.getHandleString())

      // 8. 백준 사용자 엔티티 생성 또는 업데이트
      let existingUser = await this.baekjoonRepository.findBaekjoonUserByUserId(userId)
      const currentBaekjoonUser = BaekjoonUser.fromSolvedAcApi({ ...solvedAcProfile, userId })
      // 현재 티어 정보 생성
      const currentUserTier = currentBaekjoonUser.getCurrentTier()

      // 멘토 자격 여부 판단
      const isMentorEligible = currentUserTier.isMentorEligible()

      if (existingUser) {
        existingUser.markAsVerified()
        // 기존 사용자 업데이트
        existingUser.updateProfile({
          tier: currentUserTier.getLevel(),
          solvedCount: solvedAcProfile.solvedCount,
          name: currentNativeName.toString(),
        })
      } else {
        // 새 사용자 생성
        currentBaekjoonUser.markAsVerified()
        existingUser = currentBaekjoonUser
      }

      // 9. 세션 완료 처리
      session.complete()

      // 10. 저장
      await Promise.all([this.baekjoonRepository.saveBaekjoonUser(existingUser)])

      // 11. DTO로 변환하여 반환
      return this.baekjoonMapper.toCompleteVerificationDto(
        session,
        true,
        "백준 ID 인증이 완료되었습니다.",
        existingUser.getCurrentTier().getName(),
      )
    } catch (error) {
      this.logger.error(
        `baekjoon.service.${CompleteVerificationUseCaseImpl.name}\n${ErrorUtils.getErrorMessage(error)}\n\n${ErrorUtils.getErrorStack(error)}`,
      )
      throw new BadRequestException("백준 ID 인증 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
    }
  }
}
