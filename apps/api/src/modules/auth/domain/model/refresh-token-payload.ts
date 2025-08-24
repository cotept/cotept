/**
 * 리프레시 토큰에 포함되는 페이로드 정보
 */
export class RefreshTokenPayload {
  constructor(
    public readonly sub: string,
    public readonly family: string,
    public readonly iat: number,
    public readonly exp: number,
    public readonly jti: string
  ) {}

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
    return {
      sub: this.sub,
      family: this.family,
      iat: this.iat,
      exp: this.exp,
      jti: this.jti
    };
  }

  /**
   * JWT 페이로드로부터 RefreshTokenPayload 객체 생성
   */
  static fromJwtPayload(payload: Record<string, any>): RefreshTokenPayload {
    const { sub, family, iat, exp, jti } = payload;

    // 필수 필드 검증
    if (!sub || !family || !iat || !exp || !jti) {
      throw new Error('유효하지 않은 리프레시 토큰 페이로드입니다.');
    }

    return new RefreshTokenPayload(sub, family, iat, exp, jti);
  }

  /**
   * 새 리프레시 토큰 페이로드 생성
   */
  static create(
    userId: number,
    familyId: string,
    jti: string,
    expiresInSeconds: number
  ): RefreshTokenPayload {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + expiresInSeconds;

    return new RefreshTokenPayload(
      userId.toString(), // JWT sub는 string으로 저장하되, 숫자를 문자열로 변환
      familyId,
      now,
      exp,
      jti
    );
  }
}
