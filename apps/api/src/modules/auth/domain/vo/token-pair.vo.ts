/**
 * 액세스 토큰과 리프레시 토큰 쌍을 나타내는 값 객체
 * 두 토큰을 함께 관리하고 관련 메타데이터를 제공합니다.
 */
export class TokenPair {
  private constructor(
    readonly accessToken: string,
    readonly refreshToken: string,
    readonly accessTokenExpiresAt: Date,
    readonly refreshTokenExpiresAt: Date
  ) {}

  /**
   * TokenPair 객체를 생성합니다.
   */
  static create(params: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
  }): TokenPair {
    if (!params.accessToken) {
      throw new Error('액세스 토큰은 필수입니다.');
    }
    
    if (!params.refreshToken) {
      throw new Error('리프레시 토큰은 필수입니다.');
    }
    
    if (!params.accessTokenExpiresAt) {
      throw new Error('액세스 토큰 만료 시간은 필수입니다.');
    }
    
    if (!params.refreshTokenExpiresAt) {
      throw new Error('리프레시 토큰 만료 시간은 필수입니다.');
    }

    return new TokenPair(
      params.accessToken,
      params.refreshToken,
      params.accessTokenExpiresAt,
      params.refreshTokenExpiresAt
    );
  }

  /**
   * 클라이언트 응답에 사용할 수 있는 DTO 형식으로 변환합니다.
   */
  toResponseDTO(): {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } {
    const now = Date.now();
    const expiresIn = Math.floor((this.accessTokenExpiresAt.getTime() - now) / 1000);
    
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresIn: expiresIn > 0 ? expiresIn : 0
    };
  }

  /**
   * 액세스 토큰의 만료 여부를 확인합니다.
   */
  isAccessTokenExpired(): boolean {
    return this.accessTokenExpiresAt.getTime() < Date.now();
  }

  /**
   * 리프레시 토큰의 만료 여부를 확인합니다.
   */
  isRefreshTokenExpired(): boolean {
    return this.refreshTokenExpiresAt.getTime() < Date.now();
  }
}