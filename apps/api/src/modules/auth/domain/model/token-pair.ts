/**
 * 액세스 토큰과 리프레시 토큰 쌍
 */
export class TokenPair {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly accessTokenExpiresIn: number,
    public readonly refreshTokenExpiresIn: number,
    private readonly accessTokenId: string,
    private readonly refreshTokenId: string,
    private readonly _familyId?: string,
    private readonly _tokenType: string = "Bearer",
  ) {}

  /**
   * 토큰 패밀리 ID 조회
   */
  get familyId(): string | undefined {
    return this._familyId
  }

  /**
   * 토큰 타입 조회
   */
  get tokenType(): string {
    return this._tokenType
  }

  /**
   * 액세스 토큰 만료 시간 조회
   */
  get accessTokenExpiresAt(): Date {
    return new Date(Date.now() + this.accessTokenExpiresIn * 1000)
  }

  /**
   * 리프레시 토큰 만료 시간 조회
   */
  get refreshTokenExpiresAt(): Date {
    return new Date(Date.now() + this.refreshTokenExpiresIn * 1000)
  }

  /**
   * 액세스 토큰 만료 여부 확인
   */
  isAccessTokenExpired(now: Date = new Date()): boolean {
    const expiresAt = new Date(Date.now() + this.accessTokenExpiresIn * 1000)
    return expiresAt < now
  }

  /**
   * 리프레시 토큰 만료 여부 확인
   */
  isRefreshTokenExpired(now: Date = new Date()): boolean {
    const expiresAt = new Date(Date.now() + this.refreshTokenExpiresIn * 1000)
    return expiresAt < now
  }

  /**
   * HTTP Authorization 헤더 형식으로 변환
   */
  toAuthorizationHeader(): string {
    return `${this._tokenType} ${this.accessToken}`
  }

  /**
   * 클라이언트 응답용 객체로 변환
   */
  toResponseObject(): {
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
  } {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenType: this._tokenType,
      expiresIn: this.accessTokenExpiresIn,
    }
  }

  /**
   * 새 토큰 쌍 생성
   */
  static create(
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresIn: number,
    refreshTokenExpiresIn: number,
    accessTokenId: string,
    refreshTokenId: string,
    familyId: string,
    tokenType: string = "Bearer",
  ): TokenPair {
    return new TokenPair(
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
      accessTokenId,
      refreshTokenId,
      familyId,
      tokenType,
    )
  }
}
