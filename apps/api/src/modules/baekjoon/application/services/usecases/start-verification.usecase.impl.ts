import { StartVerificationDto } from "@/modules/baekjoon/application/dtos"
import { BaekjoonMapper } from "@/modules/baekjoon/application/mappers"
import {
  BaekjoonRepositoryPort,
  CachePort,
  RateLimitPort,
  SolvedAcApiPort,
  StartVerificationUseCase,
} from "@/modules/baekjoon/application/ports"
import { BaekjoonUser, VerificationSession } from "@/modules/baekjoon/domain/model"
import { VerificationStatus, VerificationString } from "@/modules/baekjoon/domain/vo"
import { StartVerificationRequestDto } from "@/modules/baekjoon/infrastructure/dtos/request"
import { ErrorUtils } from "@/shared/utils/error.util"
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  RequestTimeoutException,
} from "@nestjs/common"

/**
 * 인증 시작 유스케이스 구현
 * 백준 ID 인증 프로세스를 시작하는 비즈니스 로직
 */
@Injectable()
export class StartVerificationUseCaseImpl implements StartVerificationUseCase {
  private readonly logger = new Logger(StartVerificationUseCaseImpl.name)
  private readonly solvedacProfileLink = "https://solved.ac/settings/profile"
  private readonly message = "프로필 이름을 제공한 문자열로 수정해주세요"

  constructor(
    @Inject("BaekjoonRepositoryPort")
    private readonly baekjoonRepository: BaekjoonRepositoryPort,
    @Inject("SolvedAcApiPort")
    private readonly solvedAcApi: SolvedAcApiPort,
    @Inject("RateLimitPort")
    private readonly rateLimitAdapter: RateLimitPort,
    @Inject("CachePort")
    private readonly cacheAdapter: CachePort,
    private readonly baekjoonMapper: BaekjoonMapper,
  ) {}

  async execute(requestDto: StartVerificationRequestDto): Promise<StartVerificationDto & { sessionId: string }> {
    try {
      const { email: userId, handle } = requestDto
      // 1. Rate Limiting 검사
      const rateLimitKey = `baekjoon_verification:${userId}`
      const canProceed = await this.rateLimitAdapter.checkRateLimit(rateLimitKey, 1, 30 * 60) // 30분에 1회

      if (!canProceed) {
        throw new ConflictException("인증 요청이 너무 빈번합니다. 30분 후 다시 시도해주세요.")
      }

      BaekjoonUser.validateUserIdAndHandle({ userId, handle })

      // 2. 백준 핸들 유효성 검사 (solved.ac API로 확인)
      const userExists = await this.solvedAcApi.checkUserExists(handle)
      if (!userExists) {
        throw new BadRequestException("존재하지 않는 백준 ID입니다.")
      }

      // 3. 이미 진행 중인 인증 세션이 있는지 확인
      const existingSession = await this.cacheAdapter.get<VerificationSession>(rateLimitKey)
      if (existingSession && !existingSession.isExpired()) {
        throw new ConflictException(
          "이미 진행 중인 인증이 있습니다. 기존 인증을 완료하거나 만료될 때까지 기다려주세요.",
        )
      }

      // 4. 기존 세션이 만료되었다면 만료 처리
      if (existingSession && existingSession.isExpired()) {
        existingSession.expire()
        await this.cacheAdapter.delete(rateLimitKey)
        throw new RequestTimeoutException("인증 세션이 만료되었습니다. 다시 시도해주세요.")
      }

      // 5. 이미 해당 핸들로 인증된 사용자가 있는지 확인
      const existingUser = await this.baekjoonRepository.findBaekjoonUserByHandle(handle)
      if (existingUser && existingUser.isVerified()) {
        throw new ConflictException("이미 다른 사용자가 해당 백준 ID로 인증되었습니다.")
      }

      // 6. 새로운 인증 세션 생성
      const verificationString = VerificationString.generate()

      const session = VerificationSession.create(userId, handle, verificationString, VerificationStatus.pending())

      // 7. 세션 저장
      await this.cacheAdapter.set<VerificationSession>(rateLimitKey, session, 5 * 60)

      // 8. Rate limit 기록
      await this.rateLimitAdapter.recordAttempt(rateLimitKey)

      // 9. DTO로 변환하여 반환
      const dto = this.baekjoonMapper.toStartVerificationDto(session)

      return {
        ...dto,
        sessionId: session.getSessionId(),
      }
    } catch (error) {
      this.logger.error(
        `baekjoon.service.${StartVerificationUseCaseImpl.name}\n${ErrorUtils.getErrorMessage(error)}\n\n${ErrorUtils.getErrorStack(error)}`,
      )
      throw new BadRequestException("백준 ID 인증 시작 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
    }
  }
}
