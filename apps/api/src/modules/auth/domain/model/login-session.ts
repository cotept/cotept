/**
 * 사용자 로그인 세션 정보
 */
export class LoginSession {
  constructor(
    public readonly idx: number,
    public readonly userId: number,
    public readonly token: string,
    public readonly ipAddress: string,
    public readonly userAgent: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    private _endedAt: Date | null = null,
    private _endReason: string | null = null,
  ) {}

  /**
   * 세션 종료 시간 조회
   */
  get endedAt(): Date | null {
    return this._endedAt
  }

  /**
   * 세션 종료 사유 조회
   */
  get endReason(): string | null {
    return this._endReason
  }

  /**
   * 세션 활성 상태 여부 확인
   */
  get isActive(): boolean {
    return this._endedAt === null && this.expiresAt > new Date()
  }

  /**
   * 세션 종료
   * @param reason 종료 사유
   */
  end(reason: string): LoginSession {
    if (this._endedAt !== null) {
      return this // 이미 종료된 세션
    }

    this._endedAt = new Date()
    this._endReason = reason
    return this
  }

  /**
   * 로그아웃으로 세션 종료
   */
  logout(): LoginSession {
    return this.end("LOGOUT")
  }

  /**
   * 세션 만료로 종료
   */
  expire(): LoginSession {
    return this.end("EXPIRED")
  }

  /**
   * 보안상 이슈로 세션 종료 (토큰 도난 의심 등)
   */
  terminateForSecurity(): LoginSession {
    return this.end("SECURITY_ISSUE")
  }

  /**
   * 새 로그인 세션 생성
   */
  static create(
    idx: number,
    userId: number,
    token: string,
    ipAddress: string,
    userAgent: string,
    expiresInSeconds: number,
  ): LoginSession {
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds)

    return new LoginSession(idx, userId, token, ipAddress, userAgent, expiresAt, new Date())
  }
}
