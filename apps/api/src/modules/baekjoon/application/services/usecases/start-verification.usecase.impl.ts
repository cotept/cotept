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

  private readonly RATE_LIMIT_WINDOW = 30 * 60 // 30분
  private readonly SESSION_TTL = 5 * 60 // 5분

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

      await this.checkRateLimit(userId)
      this.validateInput(userId, handle)
      await this.validateBaekjoonHandle(handle)
      await this.handleExistingSession(userId)
      await this.validateUniqueHandle(handle)

      const session = await this.createAndSaveSession(userId, handle)
      await this.recordRateLimit(userId)

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
   */
  private async handleExistingSession(userId: string): Promise<void> {
    const rateLimitKey = this.getRateLimitKey(userId)
    const existingSession = await this.cacheAdapter.get<VerificationSession>(rateLimitKey)

    if (!existingSession) {
      return // 기존 세션 없음
    }

    if (existingSession.isExpired()) {
      // 만료된 세션 정리
      existingSession.expire()
      await this.cacheAdapter.delete(rateLimitKey)
      throw new RequestTimeoutException("인증 세션이 만료되었습니다. 다시 시도해주세요.")
    }

    // 진행 중인 세션 존재
    throw new ConflictException("이미 진행 중인 인증이 있습니다. 기존 인증을 완료하거나 만료될 때까지 기다려주세요.")
  }

  /**
   * 핸들 중복 사용 검증
   */
  private async validateUniqueHandle(handle: string): Promise<void> {
    const existingUser = await this.baekjoonRepository.findBaekjoonUserByHandle(handle)

    if (existingUser && existingUser.isVerified()) {
      throw new ConflictException("이미 다른 사용자가 해당 백준 ID로 인증되었습니다.")
    }
  }

  /**
   * 새로운 인증 세션 생성 및 저장
   */
  private async createAndSaveSession(userId: string, handle: string): Promise<VerificationSession> {
    // 인증 문자열 생성
    const verificationString = VerificationString.generate()

    // 세션 생성
    const session = VerificationSession.create(userId, handle, verificationString, VerificationStatus.pending())

    // 캐시에 저장
    const rateLimitKey = this.getRateLimitKey(userId)
    await this.cacheAdapter.set<VerificationSession>(rateLimitKey, session, this.SESSION_TTL)

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
  private createResponse(session: VerificationSession): StartVerificationDto & { sessionId: string } {
    const dto = this.baekjoonMapper.toStartVerificationDto(session)

    return {
      ...dto,
      sessionId: session.getSessionId(),
    }
  }

  /**
   * Rate limit 키 생성 (일관성을 위해 함수화)
   */
  private getRateLimitKey(userId: string): string {
    return `baekjoon_verification:${userId}`
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
