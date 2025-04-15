/**
 * 액세스 토큰에 포함되는 페이로드 정보
 */
export class TokenPayload {
  constructor(
    public readonly sub: string,
    public readonly email: string,
    public readonly role: string,
    public readonly iat: number,
    public readonly exp: number,
    public readonly jti: string,
    private readonly _metadata?: Record<string, any>
  ) {}

  /**
   * 메타데이터 조회
   */
  get metadata(): Record<string, any> | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  /**
   * 토큰 만료 여부 확인
   */
  isExpired(now: Date = new Date()): boolean {
    const currentTimestamp = Math.floor(now.getTime() / 1000);
    return this.exp < currentTimestamp;
  }

  /**
   * JWT 토큰에 사용할 페이로드 객체로 변환
   */
  toJSON(): Record<string, any> {
    const payload: Record<string, any> = {
      sub: this.sub,
      email: this.email,
      role: this.role,
      iat: this.iat,
      exp: this.exp,
      jti: this.jti
    };

    if (this._metadata) {
      // 메타데이터를 평탄화하여 페이로드에 포함
      Object.entries(this._metadata).forEach(([key, value]) => {
        payload[key] = value;
      });
    }

    return payload;
  }

  /**
   * JWT 페이로드로부터 TokenPayload 객체 생성
   */
  static fromJwtPayload(payload: Record<string, any>): TokenPayload {
    const { sub, email, role, iat, exp, jti, ...metadata } = payload;

    // 필수 필드 검증
    if (!sub || !iat || !exp || !jti || !email || !role) {
      throw new Error('유효하지 않은 토큰 페이로드입니다.');
    }

    // 메타데이터에 포함되지 않아야 할 표준 JWT 클레임 제거
    const stdClaims = ['nbf', 'aud', 'iss'];
    stdClaims.forEach(claim => {
      if (metadata[claim] !== undefined) {
        delete metadata[claim];
      }
    });

    return new TokenPayload(
      sub,
      email,
      role,
      iat,
      exp,
      jti,
      Object.keys(metadata).length > 0 ? metadata : undefined
    );
  }

  /**
   * 새 토큰 페이로드 생성
   */
  static create(
    userId: string,
    email: string,
    role: string,
    jti: string,
    expiresInSeconds: number,
    metadata?: Record<string, any>
  ): TokenPayload {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + expiresInSeconds;

    return new TokenPayload(
      userId,
      email,
      role,
      now,
      exp,
      jti,
      metadata
    );
  }
}
