import { BaekjoonHandle, VerificationStatus, VerificationStatusType, VerificationString } from "../vo"

/**
 * 인증 세션 도메인 엔티티
 * 백준 ID 인증 프로세스의 상태와 데이터를 관리
 */
export class VerificationSession {
  private static readonly MAX_ATTEMPTS = 5
  private static readonly DEFAULT_EXPIRATION_TIME = 5 * 60 * 1000 // 5분

  // 식별자
  private readonly sessionId: string
  private readonly userId: string

  // 인증 대상 정보
  private readonly handle: BaekjoonHandle

  // 인증 진행 정보
  private verificationString: VerificationString
  private status: VerificationStatus

  // 시도 관련 정보
  private attemptCount: number
  private lastAttemptAt?: Date

  // 만료 시간
  private readonly expiresAt: Date

  // 시간 관련 정보
  private readonly createdAt: Date
  private updatedAt: Date

  constructor(params: {
    sessionId?: string
    userId: string
    handle: BaekjoonHandle | string
    verificationString: VerificationString | string
    status?: VerificationStatus | VerificationStatusType
    attemptCount?: number
    lastAttemptAt?: Date
    expiresAt?: Date
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.sessionId = params.sessionId || crypto.randomUUID()
    this.userId = params.userId

    // 핸들 설정 (값 객체 또는 문자열)
    this.handle = params.handle instanceof BaekjoonHandle ? params.handle : BaekjoonHandle.of(params.handle)

    // 인증 문자열 설정
    this.verificationString =
      params.verificationString instanceof VerificationString
        ? params.verificationString
        : VerificationString.of(params.verificationString)

    // 상태 설정
    this.status =
      params.status instanceof VerificationStatus
        ? params.status
        : params.status
          ? VerificationStatus.of(params.status)
          : VerificationStatus.inProgress()

    this.attemptCount = params.attemptCount || 0
    this.lastAttemptAt = params.lastAttemptAt

    // 만료 시간 설정 (기본: 1시간 후)
    this.expiresAt = params.expiresAt || new Date(Date.now() + VerificationSession.DEFAULT_EXPIRATION_TIME)

    this.createdAt = params.createdAt || new Date()
    this.updatedAt = params.updatedAt || new Date()
  }

  /**
   * 새 인증 세션 시작
   */
  public static start(params: { userId: string; handle: string }): VerificationSession {
    const handle = BaekjoonHandle.of(params.handle)
    const verificationString = VerificationString.generateUnique()

    return new VerificationSession({
      userId: params.userId,
      handle,
      verificationString,
      status: VerificationStatus.inProgress(),
      attemptCount: 0,
    })
  }

  // Getter 메서드들
  public getSessionId(): string {
    return this.sessionId
  }

  public getUserId(): string {
    return this.userId
  }

  public getHandle(): BaekjoonHandle {
    return this.handle
  }

  public getHandleString(): string {
    return this.handle.toString()
  }

  public getVerificationString(): VerificationString {
    return this.verificationString
  }

  public getVerificationStringValue(): string {
    return this.verificationString.toString()
  }

  public getStatus(): VerificationStatus {
    return this.status
  }

  public getAttemptCount(): number {
    return this.attemptCount
  }

  public getLastAttemptAt(): Date | undefined {
    return this.lastAttemptAt
  }

  public getExpiresAt(): Date {
    return this.expiresAt
  }

  public getCreatedAt(): Date {
    return this.createdAt
  }

  public getUpdatedAt(): Date {
    return this.updatedAt
  }

  /**
   * 인증 시도 처리
   */
  public attempt(): VerificationSession {
    this.attemptCount += 1
    this.lastAttemptAt = new Date()
    this.updatedAt = new Date()
    return this
  }

  /**
   * 인증 성공 처리
   */
  public complete(): VerificationSession {
    if (!this.status.canTransitionTo(VerificationStatusType.COMPLETED)) {
      throw new Error("현재 상태에서는 인증을 완료할 수 없습니다.")
    }

    this.status = VerificationStatus.completed()
    this.updatedAt = new Date()
    return this
  }

  /**
   * 인증 실패 처리
   */
  public fail(reason: string): VerificationSession {
    if (!this.status.canTransitionTo(VerificationStatusType.FAILED)) {
      throw new Error("현재 상태에서는 인증을 실패 처리할 수 없습니다.")
    }

    this.status = VerificationStatus.failed(reason)
    this.updatedAt = new Date()
    return this
  }

  /**
   * 인증 만료 처리
   */
  public expire(): VerificationSession {
    if (!this.status.canTransitionTo(VerificationStatusType.EXPIRED)) {
      throw new Error("현재 상태에서는 인증을 만료 처리할 수 없습니다.")
    }

    this.status = VerificationStatus.expired()
    this.updatedAt = new Date()
    return this
  }

  /**
   * 세션이 만료되었는지 확인
   */
  public isExpired(): boolean {
    return new Date() > this.expiresAt || this.status.isExpired()
  }

  /**
   * 세션이 진행 중인지 확인
   */
  public isInProgress(): boolean {
    return this.status.isInProgress() && !this.isExpired()
  }

  /**
   * 세션이 완료되었는지 확인
   */
  public isCompleted(): boolean {
    return this.status.isCompleted()
  }
  /**
   * 세션이 실패되었는지 확인
   */
  public isFailed(): boolean {
    return this.status.isFailed()
  }

  /**
   * 인증을 재시도할 수 있는지 확인
   */
  public canRetry(): boolean {
    return this.status.canRetry() && !this.isExpired()
  }

  /**
   * 최대 시도 횟수 초과 여부 확인
   */
  public isMaxAttemptsExceeded(): boolean {
    return this.attemptCount >= VerificationSession.MAX_ATTEMPTS
  }

  /**
   * 인증 문자열 갱신 (새로운 문자열 생성)
   */
  public regenerateVerificationString(): VerificationSession {
    this.verificationString = VerificationString.generateUnique()
    this.updatedAt = new Date()
    return this
  }

  /**
   * 동등성 비교 (sessionId 기준)
   */
  public equals(other: VerificationSession): boolean {
    return this.sessionId === other.sessionId
  }

  /**
   * 세션 요약 정보 반환 (로깅용)
   */
  public getSummary(): string {
    return `Session(${this.sessionId.slice(0, 8)}...) - ${this.handle.toString()} - ${this.status.toString()}`
  }

  /**
   *
   */
  static create(
    userId: string,
    handle: BaekjoonHandle | string,
    verificationString: VerificationString | string,
    status: VerificationStatus | VerificationStatusType,
    attemptCount?: number,
    lastAttemptAt?: Date,
    expiresAt?: Date,
    createdAt?: Date,
    updatedAt?: Date,
  ): VerificationSession {
    return new VerificationSession({
      userId,
      handle: handle instanceof BaekjoonHandle ? handle : BaekjoonHandle.of(handle),
      verificationString:
        verificationString instanceof VerificationString
          ? verificationString
          : VerificationString.of(verificationString),
      status: status instanceof VerificationStatus ? status : VerificationStatus.of(status),
      attemptCount: attemptCount || 0,
      lastAttemptAt,
      expiresAt,
      createdAt,
      updatedAt,
    })
  }
}
