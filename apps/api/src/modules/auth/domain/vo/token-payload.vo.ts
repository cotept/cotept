/**
 * 토큰 페이로드 값 객체
 * JWT 토큰에 포함되는 페이로드 정보를 표현하는 불변 객체입니다.
 */
export class TokenPayload {
  private readonly _sub: string;
  private readonly _iat: number;
  private readonly _exp: number;
  private readonly _jti: string;
  private readonly _role?: string;
  private readonly _email?: string;
  private readonly _metadata?: Record<string, any>;

  /**
   * @param sub 사용자 ID (subject)
   * @param iat 발급 시간 (issued at)
   * @param exp 만료 시간 (expiration time)
   * @param jti 토큰 고유 ID (JWT ID)
   * @param role 사용자 역할 (선택)
   * @param email 사용자 이메일 (선택)
   * @param metadata 추가 메타데이터 (선택)
   */
  constructor(
    sub: string,
    iat: number,
    exp: number,
    jti: string,
    role?: string,
    email?: string,
    metadata?: Record<string, any>
  ) {
    if (!sub || sub.trim().length === 0) {
      throw new Error('사용자 ID는 필수입니다.');
    }

    if (!jti || jti.trim().length === 0) {
      throw new Error('토큰 고유 ID는 필수입니다.');
    }

    if (exp <= iat) {
      throw new Error('토큰 만료 시간은 발급 시간보다 이후여야 합니다.');
    }

    this._sub = sub;
    this._iat = iat;
    this._exp = exp;
    this._jti = jti;
    this._role = role;
    this._email = email;
    this._metadata = metadata ? { ...metadata } : undefined;
  }

  /**
   * 사용자 ID 조회
   */
  get sub(): string {
    return this._sub;
  }

  /**
   * 토큰 발급 시간 조회 (Unix timestamp)
   */
  get iat(): number {
    return this._iat;
  }

  /**
   * 토큰 만료 시간 조회 (Unix timestamp)
   */
  get exp(): number {
    return this._exp;
  }

  /**
   * 토큰 고유 ID 조회
   */
  get jti(): string {
    return this._jti;
  }

  /**
   * 사용자 역할 조회
   */
  get role(): string | undefined {
    return this._role;
  }

  /**
   * 사용자 이메일 조회
   */
  get email(): string | undefined {
    return this._email;
  }

  /**
   * 추가 메타데이터 조회
   */
  get metadata(): Record<string, any> | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  /**
   * 토큰 만료 여부 확인
   */
  isExpired(now: Date = new Date()): boolean {
    const currentTimestamp = Math.floor(now.getTime() / 1000);
    return this._exp < currentTimestamp;
  }

  /**
   * JWT 토큰에 사용할 페이로드 객체로 변환
   */
  toJwtPayload(): Record<string, any> {
    const payload: Record<string, any> = {
      sub: this._sub,
      iat: this._iat,
      exp: this._exp,
      jti: this._jti,
    };

    if (this._role) {
      payload.role = this._role;
    }

    if (this._email) {
      payload.email = this._email;
    }

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
    const { sub, iat, exp, jti, role, email, ...metadata } = payload;

    // 필수 필드 검증
    if (!sub || !iat || !exp || !jti) {
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
      iat,
      exp,
      jti,
      role,
      email,
      Object.keys(metadata).length > 0 ? metadata : undefined,
    );
  }
}
