import { Token } from './token.vo';

/**
 * 토큰 쌍 값 객체
 * 액세스 토큰과 리프레시 토큰을 함께 관리하는 불변 객체입니다.
 */
export class TokenPair {
  private readonly _accessToken: Token;
  private readonly _refreshToken: Token;
  private readonly _tokenType: string;
  private readonly _familyId?: string;

  /**
   * @param accessToken 액세스 토큰
   * @param refreshToken 리프레시 토큰
   * @param tokenType 토큰 타입 (기본값: 'Bearer')
   * @param familyId 토큰 패밀리 ID (선택)
   */
  constructor(
    accessToken: Token,
    refreshToken: Token,
    tokenType: string = 'Bearer',
    familyId?: string
  ) {
    this._accessToken = accessToken;
    this._refreshToken = refreshToken;
    this._tokenType = tokenType;
    this._familyId = familyId;
  }

  /**
   * 액세스 토큰 조회
   */
  get accessToken(): Token {
    return this._accessToken;
  }

  /**
   * 리프레시 토큰 조회
   */
  get refreshToken(): Token {
    return this._refreshToken;
  }

  /**
   * 토큰 타입 조회
   */
  get tokenType(): string {
    return this._tokenType;
  }

  /**
   * 토큰 패밀리 ID 조회
   */
  get familyId(): string | undefined {
    return this._familyId;
  }

  /**
   * 액세스 토큰 만료 여부 확인
   */
  isAccessTokenExpired(now: Date = new Date()): boolean {
    return this._accessToken.isExpired(now);
  }

  /**
   * 리프레시 토큰 만료 여부 확인
   */
  isRefreshTokenExpired(now: Date = new Date()): boolean {
    return this._refreshToken.isExpired(now);
  }

  /**
   * 모든 토큰 만료 여부 확인
   */
  isExpired(now: Date = new Date()): boolean {
    return this.isAccessTokenExpired(now) && this.isRefreshTokenExpired(now);
  }

  /**
   * 액세스 토큰만 만료되었고 리프레시 토큰은 유효한지 확인
   * (토큰 갱신이 필요한 경우)
   */
  needsRefresh(now: Date = new Date()): boolean {
    return this.isAccessTokenExpired(now) && !this.isRefreshTokenExpired(now);
  }

  /**
   * HTTP Authorization 헤더 형식으로 변환
   */
  toAuthorizationHeader(): string {
    return `${this._tokenType} ${this._accessToken.value}`;
  }

  /**
   * 클라이언트 응답용 객체로 변환
   */
  toResponseObject(): {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
  } {
    return {
      accessToken: this._accessToken.value,
      refreshToken: this._refreshToken.value,
      tokenType: this._tokenType,
      expiresIn: this._accessToken.timeToExpire()
    };
  }
}
