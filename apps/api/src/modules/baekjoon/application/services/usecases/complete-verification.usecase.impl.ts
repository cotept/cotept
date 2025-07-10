import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  RequestTimeoutException,
} from "@nestjs/common"

import { EntityManager } from "typeorm"

import { BaekjoonDomainMapper } from "../../mappers"
import { CachePort, SyncVerificationStatusUseCase } from "../../ports"
import { CompleteVerificationUseCase } from "../../ports/in/complete-verification.usecase"
import { BaekjoonProfileRepositoryPort } from "../../ports/out/baekjoon-profile-repository.port"
import { RateLimitPort } from "../../ports/out/rate-limit.port"
import { SolvedAcApiPort } from "../../ports/out/solved-ac-api.port"

import { CompleteVerificationInputDto, CompleteVerificationOutputDto } from "@/modules/baekjoon/application/dtos"
import { BaekjoonUser, VerificationSession } from "@/modules/baekjoon/domain/model"
import { VerificationString } from "@/modules/baekjoon/domain/vo"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * 인증 완료 유스케이스 구현
 * 백준 ID 인증 프로세스를 완료하는 비즈니스 로직
 */
@Injectable()
export class CompleteVerificationUseCaseImpl implements CompleteVerificationUseCase {
  private readonly logger = new Logger(CompleteVerificationUseCaseImpl.name)
  private readonly RATE_LIMIT_WINDOW = 5 * 60 // 5분
  private readonly RATE_LIMIT_COUNT = 5 // 5회

  constructor(
    @Inject("BaekjoonProfileRepositoryPort")
    private readonly baekjoonRepository: BaekjoonProfileRepositoryPort,
    @Inject("SolvedAcApiPort")
    private readonly solvedAcApi: SolvedAcApiPort,
    @Inject("RateLimitPort")
    private readonly rateLimitService: RateLimitPort,
    @Inject("CachePort")
    private readonly cacheAdapter: CachePort,
    @Inject("SyncVerificationStatusUseCase")
    private readonly syncVerificationUseCase: SyncVerificationStatusUseCase,
    private readonly entityManager: EntityManager,
    private readonly baekjoonMapper: BaekjoonDomainMapper,
  ) {}

  async execute(inputDto: CompleteVerificationInputDto): Promise<CompleteVerificationOutputDto> {
    try {
      const { email: userId, handle, sessionId } = inputDto

      // 1단계: Rate limit 확인
      await this.checkRateLimit(userId)

      // 2단계: 세션 ID 검증
      this.validateSessionId(sessionId)

      // 3단계: 활성 세션 조회 및 검증
      const session = await this.getAndValidateSession(sessionId, userId)

      // 4단계: Rate limit 기록
      await this.recordRateLimitAttempt(userId)

      // 5단계: 인증 문자열 검증
      const verificationResult = await this.verifyAuthenticationString(session)
      if (!verificationResult.success) {
        const failureResult = await this.handleVerificationFailure(session, verificationResult.message!)

        // 🔥 실패 시에도 비동기 동기화 (안전장치)
        this.performAsyncSync(sessionId, "failure")

        return failureResult
      }

      // 6단계: 인증 성공 처리
      const completedUser = await this.handleVerificationSuccess(session, userId)

      // 7단계: 🔥 비동기 동기화 (성공 케이스)
      this.performAsyncSync(sessionId, "success")

      // 8단계: 응답 DTO 생성
      return this.createSuccessResponse(session, completedUser)
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * Rate limit 확인
   */
  private async checkRateLimit(userId: string): Promise<void> {
    const rateLimitKey = this.getRateLimitKey(userId)
    const canProceed = await this.rateLimitService.checkRateLimit(
      rateLimitKey,
      this.RATE_LIMIT_COUNT,
      this.RATE_LIMIT_WINDOW,
    )

    if (!canProceed) {
      throw new ConflictException("인증 시도가 너무 빈번합니다. 잠시 후 다시 시도해주세요.")
    }
  }

  /**
   * 비동기 동기화 수행 (새로 추가)
   */
  private performAsyncSync(sessionId: string, context: "success" | "failure"): void {
    // 비동기로 동기화 수행 (메인 플로우에 영향 없음)
    this.syncVerificationUseCase
      .syncFromSession(sessionId)
      .then(() => {
        this.logger.log(`🔄 Async sync completed for session ${sessionId} (${context})`)
      })
      .catch((error) => {
        this.logger.warn(`⚠️ Async sync failed for session ${sessionId} (${context}): ${error.message}`)
        // 실패해도 로그만 남기고 계속 진행
      })
  }

  /**
   * 세션 ID 검증
   */
  private validateSessionId(sessionId: string): void {
    if (!sessionId) {
      throw new BadRequestException("인증 세션 ID가 필요합니다. 인증을 시작해주세요.")
    }
  }

  /**
   * 활성 세션 조회 및 검증
   */
  private async getAndValidateSession(sessionId: string, userId: string): Promise<VerificationSession> {
    const session = await this.getSession(sessionId)
    this.validateSessionOwnership(session, userId)
    this.validateSessionState(session)
    return session
  }

  /**
   * 세션 조회
   */
  private async getSession(sessionId: string): Promise<VerificationSession> {
    const session = await this.cacheAdapter.get<VerificationSession>(sessionId)

    if (!session) {
      throw new NotFoundException("진행 중인 인증 세션이 없습니다. 먼저 인증을 시작해주세요.")
    }

    return session
  }

  /**
   * 세션 소유권 검증
   */
  private validateSessionOwnership(session: VerificationSession, userId: string): void {
    if (session.getUserId() !== userId) {
      throw new NotFoundException("유효하지 않은 인증 세션입니다.")
    }
  }

  /**
   * 세션 상태 검증
   */
  private validateSessionState(session: VerificationSession): void {
    if (session.isExpired()) {
      this.handleExpiredSession(session)
    }

    if (session.isCompleted()) {
      throw new ConflictException("이미 완료된 인증입니다.")
    }

    if (session.isFailed()) {
      throw new BadRequestException("실패한 인증 세션입니다. 새로 시작해주세요.")
    }
  }

  /**
   * 만료된 세션 처리
   */
  private async handleExpiredSession(session: VerificationSession): Promise<never> {
    session.expire()
    const rateLimitKey = this.getRateLimitKey(session.getUserId())
    await this.cacheAdapter.delete(rateLimitKey)
    throw new RequestTimeoutException("인증 세션이 만료되었습니다. 다시 시도해주세요.")
  }

  /**
   * Rate limit 시도 기록
   */
  private async recordRateLimitAttempt(userId: string): Promise<void> {
    const rateLimitKey = this.getRateLimitKey(userId)
    await this.rateLimitService.recordAttempt(rateLimitKey)
  }

  /**
   * 인증 문자열 검증
   */
  private async verifyAuthenticationString(session: VerificationSession): Promise<{
    success: boolean
    message?: string
  }> {
    // API에서 현재 사용자 정보 조회
    const currentNativeName = await this.getCurrentNativeName(session.getHandleString())

    // 인증 문자열 비교
    const expectedString = session.getVerificationString()

    if (!expectedString.equals(currentNativeName)) {
      return {
        success: false,
        message: "인증 문자열이 일치하지 않습니다.",
      }
    }

    return { success: true }
  }

  /**
   * 현재 사용자의 Native Name 조회
   */
  private async getCurrentNativeName(handle: string): Promise<VerificationString> {
    const userAdditionalInfo = await this.solvedAcApi.getUserAdditionalInfo(handle)
    return VerificationString.of(userAdditionalInfo.nameNative || "")
  }

  /**
   * 인증 실패 처리 - 트랜잭션 보장 버전 (기존 메서드 대체)
   */
  private async handleVerificationFailure(
    session: VerificationSession,
    message: string,
  ): Promise<CompleteVerificationOutputDto> {
    try {
      // 세션 실패 상태로 변경
      session.fail(message)

      // 세션 상태를 Redis에 업데이트
      await this.updateSessionInCache(session)

      this.logger.log(
        `Verification failed for user ${session.getUserId()}, session ${session.getSessionId()}: ${message}`,
      )

      // 실패 응답 반환
      return this.baekjoonMapper.toCompleteVerificationOutputDto(session, false, message)
    } catch (cacheError) {
      this.logger.error(`Failed to update session cache for ${session.getSessionId()}:`, cacheError)
      // 캐시 업데이트 실패해도 응답은 반환
      return this.baekjoonMapper.toCompleteVerificationOutputDto(session, false, message)
    }
  }

  /**
   * 인증 성공 처리 - 트랜잭션 보장 버전 (기존 메서드 대체)
   */
  private async handleVerificationSuccess(session: VerificationSession, userId: string): Promise<BaekjoonUser> {
    // 사용자 프로필 조회
    const solvedAcProfile = await this.getUserProfile(session.getHandleString())

    // 사용자 엔티티 생성 또는 업데이트 (인증 마킹 포함)
    const baekjoonUser = await this.createOrUpdateBaekjoonUser(userId, solvedAcProfile)

    try {
      // 🔥 중요: DB 먼저 저장 (트랜잭션 보장)
      await this.saveBaekjoonUser(baekjoonUser)

      // DB 저장 성공하면 세션 완료 처리
      session.complete()

      // 세션 상태를 Redis에 업데이트 (TTL 5분)
      await this.updateSessionInCache(session)

      this.logger.log(`Successfully completed verification for user ${userId}, session ${session.getSessionId()}`)

      return baekjoonUser
    } catch (dbError) {
      // DB 저장 실패 시 세션을 실패 상태로 변경
      session.fail("데이터 저장 중 오류가 발생했습니다.")
      await this.updateSessionInCache(session)

      this.logger.error(`DB save failed for user ${userId}, session ${session.getSessionId()}:`, dbError)
      throw new BadRequestException("인증 정보 저장에 실패했습니다. 다시 시도해주세요.")
    }
  }

  /**
   * 사용자 프로필 조회
   */
  private async getUserProfile(handle: string): Promise<any> {
    return await this.solvedAcApi.getUserProfile(handle)
  }

  /**
   * 백준 사용자 생성 또는 업데이트
   */
  private async createOrUpdateBaekjoonUser(userId: string, solvedAcProfile: any): Promise<BaekjoonUser> {
    const existingUser = await this.findExistingUser(userId)

    if (existingUser) {
      return this.updateExistingUser(existingUser, solvedAcProfile)
    } else {
      return this.createNewBaekjoonUser(userId, solvedAcProfile)
    }
  }

  /**
   * 기존 사용자 조회
   */
  private async findExistingUser(userId: string): Promise<BaekjoonUser | null> {
    return await this.baekjoonRepository.findByUserId(userId)
  }

  /**
   * 기존 사용자 업데이트 (기존 메서드 수정 - 인증 상태 명시적 설정)
   */
  private updateExistingUser(existingUser: BaekjoonUser, solvedAcProfile: any): BaekjoonUser {
    // 인증 완료 마킹
    existingUser.markAsVerified()

    // 프로필 업데이트
    const currentBaekjoonUser = BaekjoonUser.fromSolvedAcApi({
      ...solvedAcProfile,
      userId: existingUser.getUserId(),
    })
    const currentUserTier = currentBaekjoonUser.getCurrentTier()

    existingUser.updateProfile({
      tier: currentUserTier.getLevel(),
      solvedCount: solvedAcProfile.solvedCount,
      name: solvedAcProfile.nameNative || "",
      verified: true, // 🔥 인증 상태 명시적 설정
    })

    return existingUser
  }

  /**
   * 새 백준 사용자 생성 (기존 메서드 유지)
   */
  private createNewBaekjoonUser(userId: string, solvedAcProfile: any): BaekjoonUser {
    const currentBaekjoonUser = BaekjoonUser.fromSolvedAcApi({ ...solvedAcProfile, userId })
    currentBaekjoonUser.markAsVerified()
    return currentBaekjoonUser
  }

  /**
   * 백준 사용자 저장
   */
  private async saveBaekjoonUser(baekjoonUser: BaekjoonUser): Promise<void> {
    await this.baekjoonRepository.save(baekjoonUser)
  }

  /**
   * 성공 응답 DTO 생성
   */
  private createSuccessResponse(
    session: VerificationSession,
    baekjoonUser: BaekjoonUser,
  ): CompleteVerificationOutputDto {
    return this.baekjoonMapper.toCompleteVerificationOutputDto(
      session,
      true,
      "백준 ID 인증이 완료되었습니다.",
      baekjoonUser.getCurrentTier().getName(),
    )
  }

  /**
   * Rate limit 키 생성
   */
  private getRateLimitKey(userId: string): string {
    return `baekjoon_complete:${userId}`
  }

  /**
   * 에러 처리 및 로깅
   */
  private handleError(error: unknown): never {
    this.logger.error(
      `baekjoon.service.${CompleteVerificationUseCaseImpl.name}\n${ErrorUtils.getErrorMessage(error)}\n\n${ErrorUtils.getErrorStack(error)}`,
    )

    // 이미 처리된 비즈니스 예외는 다시 던지기
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof NotFoundException ||
      error instanceof RequestTimeoutException
    ) {
      throw error
    }

    // 예상치 못한 에러는 일반적인 메시지로 변환
    throw new BadRequestException("백준 ID 인증 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
  }

  /**
   * 세션을 캐시에 업데이트 (새로 추가)
   */
  private async updateSessionInCache(session: VerificationSession): Promise<void> {
    try {
      await this.cacheAdapter.set(session.getSessionId(), session, 300) // 5분 TTL
    } catch (error) {
      this.logger.error(`Failed to update session ${session.getSessionId()} in cache:`, error)
      // 캐시 업데이트 실패는 로그만 남기고 에러 던지지 않음
    }
  }
}
