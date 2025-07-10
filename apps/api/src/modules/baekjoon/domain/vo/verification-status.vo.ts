/**
 * 인증 상태 값 객체
 * 백준 ID 인증 프로세스의 상태를 관리
 */
export enum VerificationStatusType {
  PENDING = "PENDING", // 인증 대기 중
  IN_PROGRESS = "IN_PROGRESS", // 인증 진행 중 (문자열 생성됨)
  COMPLETED = "COMPLETED", // 인증 완료
  FAILED = "FAILED", // 인증 실패
  EXPIRED = "EXPIRED", // 인증 만료
}

export class VerificationStatus {
  private readonly status: VerificationStatusType
  private readonly reason?: string
  private readonly updatedAt: Date

  private constructor(status: VerificationStatusType, reason?: string) {
    this.status = status
    this.reason = reason
    this.updatedAt = new Date()
  }

  /**
   * 인증 대기 상태 생성
   */
  public static pending(): VerificationStatus {
    return new VerificationStatus(VerificationStatusType.PENDING)
  }

  /**
   * 인증 진행 중 상태 생성
   */
  public static inProgress(): VerificationStatus {
    return new VerificationStatus(VerificationStatusType.IN_PROGRESS)
  }

  /**
   * 인증 완료 상태 생성
   */
  public static completed(): VerificationStatus {
    return new VerificationStatus(VerificationStatusType.COMPLETED)
  }

  /**
   * 인증 실패 상태 생성
   */
  public static failed(reason: string): VerificationStatus {
    return new VerificationStatus(VerificationStatusType.FAILED, reason)
  }

  /**
   * 인증 만료 상태 생성
   */
  public static expired(): VerificationStatus {
    return new VerificationStatus(VerificationStatusType.EXPIRED, "인증 시간이 만료되었습니다.")
  }

  /**
   * 기존 상태 값으로부터 생성
   */
  public static of(status: VerificationStatusType, reason?: string): VerificationStatus {
    return new VerificationStatus(status, reason)
  }

  /**
   * 다른 인증 상태와 동등 비교
   */
  public equals(other: VerificationStatus): boolean {
    return this.status === other.status && this.reason === other.reason
  }

  /**
   * 상태 타입 반환
   */
  public getStatus(): VerificationStatusType {
    return this.status
  }

  /**
   * 실패/만료 사유 반환
   */
  public getReason(): string | undefined {
    return this.reason
  }

  /**
   * 상태 업데이트 시간 반환
   */
  public getUpdatedAt(): Date {
    return this.updatedAt
  }

  /**
   * 원시 값(string) 반환
   */
  public toString(): string {
    return this.status
  }

  /**
   * 인증이 진행 중인지 확인
   */
  public isInProgress(): boolean {
    return this.status === VerificationStatusType.IN_PROGRESS
  }

  /**
   * 인증이 완료되었는지 확인
   */
  public isCompleted(): boolean {
    return this.status === VerificationStatusType.COMPLETED
  }

  /**
   * 인증이 실패했는지 확인
   */
  public isFailed(): boolean {
    return this.status === VerificationStatusType.FAILED
  }

  /**
   * 인증이 만료되었는지 확인
   */
  public isExpired(): boolean {
    return this.status === VerificationStatusType.EXPIRED
  }

  /**
   * 인증을 재시도할 수 있는 상태인지 확인
   */
  public canRetry(): boolean {
    return (
      this.status === VerificationStatusType.FAILED ||
      this.status === VerificationStatusType.EXPIRED ||
      this.status === VerificationStatusType.PENDING
    )
  }

  /**
   * 인증이 진행 가능한 상태인지 확인
   */
  public canProceed(): boolean {
    return this.status === VerificationStatusType.PENDING || this.status === VerificationStatusType.IN_PROGRESS
  }

  /**
   * 최종 상태인지 확인 (더 이상 변경될 수 없는 상태)
   */
  public isFinal(): boolean {
    return this.status === VerificationStatusType.COMPLETED || this.status === VerificationStatusType.EXPIRED
  }

  /**
   * 상태 전환 가능 여부 확인
   */
  public canTransitionTo(newStatus: VerificationStatusType): boolean {
    const transitions: Record<VerificationStatusType, VerificationStatusType[]> = {
      [VerificationStatusType.PENDING]: [VerificationStatusType.IN_PROGRESS, VerificationStatusType.EXPIRED],
      [VerificationStatusType.IN_PROGRESS]: [
        VerificationStatusType.COMPLETED,
        VerificationStatusType.FAILED,
        VerificationStatusType.EXPIRED,
      ],
      [VerificationStatusType.COMPLETED]: [], // 최종 상태
      [VerificationStatusType.FAILED]: [VerificationStatusType.PENDING, VerificationStatusType.IN_PROGRESS],
      [VerificationStatusType.EXPIRED]: [VerificationStatusType.PENDING, VerificationStatusType.IN_PROGRESS],
    }

    return transitions[this.status].includes(newStatus)
  }

  /**
   * 사용자 친화적인 메시지 반환
   */
  public getUserMessage(): string {
    switch (this.status) {
      case VerificationStatusType.PENDING:
        return "인증을 시작해주세요."
      case VerificationStatusType.IN_PROGRESS:
        return "프로필 이름를 수정하고 인증을 완료해주세요."
      case VerificationStatusType.COMPLETED:
        return "백준 ID 인증이 완료되었습니다."
      case VerificationStatusType.FAILED:
        return this.reason || "인증에 실패했습니다. 다시 시도해주세요."
      case VerificationStatusType.EXPIRED:
        return "인증 시간이 만료되었습니다. 다시 시도해주세요."
      default:
        return "알 수 없는 상태입니다."
    }
  }
}
