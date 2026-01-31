import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  RequestTimeoutException,
} from "@nestjs/common"

import { StartVerificationInputDto, StartVerificationOutputDto } from "@/modules/baekjoon/application/dtos"
import { BaekjoonDomainMapper } from "@/modules/baekjoon/application/mappers"
import {
  CachePort,
  RateLimitPort,
  SolvedAcApiPort,
  StartVerificationUseCase,
} from "@/modules/baekjoon/application/ports"
import { BaekjoonProfileRepositoryPort } from "@/modules/baekjoon/application/ports/out/baekjoon-profile-repository.port"
import { BaekjoonUser, VerificationSession } from "@/modules/baekjoon/domain/model"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * 인증 시작 유스케이스 구현
 * 백준 ID 인증 프로세스를 시작하는 비즈니스 로직
 */
@Injectable()
export class StartVerificationUseCaseImpl implements StartVerificationUseCase {
  private readonly logger = new Logger(StartVerificationUseCaseImpl.name)

  private readonly RATE_LIMIT_WINDOW = 30 * 60 // 30분
  private readonly SESSION_TTL = 5 * 60 * 1000 // 5분 (밀리초)

  constructor(
    @Inject(BaekjoonProfileRepositoryPort)
    private readonly baekjoonRepository: BaekjoonProfileRepositoryPort,
    @Inject(SolvedAcApiPort)
    private readonly solvedAcApi: SolvedAcApiPort,
    @Inject(RateLimitPort)
    private readonly rateLimitAdapter: RateLimitPort,
    @Inject(CachePort)
    private readonly cacheAdapter: CachePort,

    private readonly baekjoonMapper: BaekjoonDomainMapper,
  ) {}

  async execute(inputDto: StartVerificationInputDto): Promise<StartVerificationOutputDto> {
    try {
      const { userId, handle } = inputDto
      this.logger.debug(`Starting Baekjoon verification for userId: ${userId}, handle: ${handle}`)
      // await this.checkRateLimit(userId) // 디버그할 때 주석 처리하기
      this.logger.debug(`Rate limit check passed for userId: ${userId}`)
      this.validateInput(userId, handle)
      this.logger.debug(`Input validation passed for userId: ${userId}`)
      await this.validateBaekjoonHandle(handle)
      this.logger.debug(`Baekjoon handle validation passed for userId: ${userId}`)
      await this.handleExistingSession(userId)
      this.logger.debug(`Existing session check passed for userId: ${userId}`)
      await this.validateUniqueHandle(handle)
      this.logger.debug(`Unique handle validation passed for userId: ${userId}`)

      const session = await this.createAndSaveSession(userId, handle)
      this.logger.debug(`Session creation passed for userId: ${userId}`)
      await this.recordRateLimit(userId)
      this.logger.debug(`Rate limit recording passed for userId: ${userId}`)

      return this.createResponse(session)
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * Rate limit 검사
   */
  private async checkRateLimit(userId: string): Promise<void> {
    const rateLimitKey = this.getRateLimitKey(userId)
    const canProceed = await this.rateLimitAdapter.checkRateLimit(rateLimitKey, 1, this.RATE_LIMIT_WINDOW)

    if (!canProceed) {
      throw new ConflictException("인증 요청이 너무 빈번합니다. 30분 후 다시 시도해주세요.")
    }
  }

  /**
   * 입력값 검증
   */
  private validateInput(userId: string, handle: string): void {
    BaekjoonUser.validateUserIdAndHandle({ userId, handle })
  }

  /**
   * 백준 핸들 유효성 검증
   */
  private async validateBaekjoonHandle(handle: string): Promise<void> {
    const userExists = await this.solvedAcApi.checkUserExists(handle)
    if (!userExists) {
      throw new BadRequestException("존재하지 않는 백준 ID입니다.")
    }
  }

  /**
   * 기존 진행 중인 세션 처리
   * userId → sessionId → 세션 데이터 2단계 조회로 변경
   */
  private async handleExistingSession(userId: string): Promise<void> {
    // 1단계: userId로 sessionId 조회 (매핑 조회)
    const userSessionKey = this.getUserSessionKey(userId)
    const existingSessionId = await this.cacheAdapter.get<string>(userSessionKey)

    if (!existingSessionId) {
      return // 기존 세션 없음 - 정상 진행
    }

    // 2단계: sessionId로 실제 세션 데이터 조회
    const sessionKey = this.getSessionKey(existingSessionId)
    const sessionData = await this.cacheAdapter.get<any>(sessionKey)
    this.logger.debug(
      `Found existing session for userId: ${userId}, sessionId: ${existingSessionId} sessionData:${JSON.stringify(sessionData)}`,
    )

    // 기존 세션이 있다면 삭제하고 새로 시작할 수 있도록 허용 (ConflictException 제거)
    // 사용자가 '재시도' 버튼을 눌렀을 때 기존 세션을 덮어쓰는 것이 UX상 자연스러움
    if (sessionData) {
      this.logger.debug(`Deleting existing session to restart verification for userId: ${userId}`)
      await this.cacheAdapter.delete(sessionKey)
    }

    // 사용자 세션 매핑도 삭제
    await this.cacheAdapter.delete(userSessionKey)
  }

  /**
   * 핸들 중복 사용 검증
   */
  private async validateUniqueHandle(handle: string): Promise<void> {
    const existingUser = await this.baekjoonRepository.findByBaekjoonId(handle)

    if (existingUser && existingUser.isVerified()) {
      throw new ConflictException("이미 다른 사용자가 해당 백준 ID로 인증되었습니다.")
    }
  }

  /**
   * 새로운 인증 세션 생성 및 저장
   * 세션 데이터와 userId 매핑을 분리 저장 (Single Source of Truth 패턴)
   */
  private async createAndSaveSession(userId: string, handle: string): Promise<VerificationSession> {
    // 도메인 모델을 통한 세션 생성 (verificationString 자동 생성)
    const session = VerificationSession.start({ userId, handle })

    // 1. 세션 데이터 저장 (Primary Storage)
    // 키: baekjoon_session:{sessionId}
    // 값: VerificationSession 객체 전체
    // 목적: sessionId로 O(1) 직접 조회 가능
    const sessionKey = this.getSessionKey(session.getSessionId())
    await this.cacheAdapter.set<VerificationSession>(sessionKey, session, this.SESSION_TTL)

    // 2. 사용자 매핑 저장 (Mapping for Duplicate Prevention)
    // 키: baekjoon_user_session:{userId}
    // 값: sessionId (문자열, ~40바이트)
    // 목적: 사용자당 1세션 제한 (중복 생성 방지)
    const userSessionKey = this.getUserSessionKey(userId)
    await this.cacheAdapter.set<string>(userSessionKey, session.getSessionId(), this.SESSION_TTL)

    this.logger.debug(
      `Session created - SessionId: ${session.getSessionId()}, UserId: ${userId}, TTL: ${this.SESSION_TTL / 1000}s (${this.SESSION_TTL}ms)`,
    )

    return session
  }

  /**
   * Rate limit 기록
   */
  private async recordRateLimit(userId: string): Promise<void> {
    const rateLimitKey = this.getRateLimitKey(userId)
    await this.rateLimitAdapter.recordAttempt(rateLimitKey)
  }

  /**
   * 응답 DTO 생성
   */
  private createResponse(session: VerificationSession): StartVerificationOutputDto {
    this.logger.debug(`Creating response for sessionId: ${session.getSessionId()}`)
    return this.baekjoonMapper.toStartVerificationOutputDto(session)
  }

  /**
   * Rate limit 키 생성 (rateLimitAdapter 전용)
   * 형식: baekjoon_rate_limit:{userId}
   */
  private getRateLimitKey(userId: string): string {
    return `baekjoon_rate_limit:${userId}`
  }

  /**
   * 세션 키 생성 (세션 데이터 저장/조회용 - Primary)
   * 형식: baekjoon_session:{sessionId}
   * 예시: baekjoon_session:7570040d-2cc9-4c1c-a481-49b94516ee21
   */
  private getSessionKey(sessionId: string): string {
    return `baekjoon_session:${sessionId}`
  }

  /**
   * 사용자 세션 매핑 키 생성 (userId → sessionId 매핑용)
   * 형식: baekjoon_user_session:{userId}
   * 예시: baekjoon_user_session:dudtod1596@gmail.com
   * 용도: 중복 세션 방지 (한 사용자가 여러 세션 동시 진행 차단)
   */
  private getUserSessionKey(userId: string): string {
    return `baekjoon_user_session:${userId}`
  }

  /**
   * 에러 처리 및 로깅
   */
  private handleError(error: unknown): never {
    this.logger.error(
      `baekjoon.service.${StartVerificationUseCaseImpl.name}\n${ErrorUtils.getErrorMessage(error)}\n\n${ErrorUtils.getErrorStack(error)}`,
    )

    // 이미 처리된 비즈니스 예외는 다시 던지기
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof RequestTimeoutException
    ) {
      throw error
    }

    // 예상치 못한 에러는 일반적인 메시지로 변환
    throw new BadRequestException("백준 ID 인증 시작 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
  }
}
