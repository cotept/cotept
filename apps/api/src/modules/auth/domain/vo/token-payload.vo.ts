/**
 * JWT 토큰의 페이로드를 나타내는 값 객체
 * 인증에 필요한 사용자 정보와 토큰 메타데이터를 캡슐화합니다.
 *
 * 참고: 이 클래스는 현재 기본 인증(Authentication) 기능에 중점을 두고 있으며,
 * 향후 인가(Authorization) 시스템과의 통합을 위해 확장될 수 있습니다.
 * RBAC+ABAC 인가 시스템이 구현될 때 역할(role)은 역할 배열로 확장되고,
 * 권한(permissions)과 속성(attributes) 정보가 추가될 수 있습니다.
 */
export class TokenPayload {
  private constructor(
    readonly userId: string,
    readonly email: string,
    // 참고: 향후 RBAC 시스템 구현시 단일 role은 roles 배열로 확장될 수 있음
    readonly role: string,
    readonly tokenType: "ACCESS" | "REFRESH",
    readonly familyId?: string,
    readonly issuedAt?: Date,
    readonly expiresAt?: Date,
  ) {}

  /**
   * 페이로드 객체를 생성합니다.
   */
  static create(params: {
    userId: string
    email: string
    role: string
    tokenType: "ACCESS" | "REFRESH"
    familyId?: string
    issuedAt?: Date
    expiresAt?: Date
  }): TokenPayload {
    if (!params.userId) {
      throw new Error("사용자 ID는 필수입니다.")
    }

    if (!params.email) {
      throw new Error("이메일은 필수입니다.")
    }

    if (!params.role) {
      throw new Error("역할은 필수입니다.")
    }

    if (!params.tokenType) {
      throw new Error("토큰 타입은 필수입니다.")
    }

    return new TokenPayload(
      params.userId,
      params.email,
      params.role,
      params.tokenType,
      params.familyId,
      params.issuedAt || new Date(),
      params.expiresAt,
    )
  }

  /**
   * JWT 표준 클레임으로 변환합니다.
   *
   * 참고: 인가 시스템 구현 시 이 메서드는 권한 및 속성 정보를
   * 포함하도록 확장될 수 있습니다. 단, JWT 크기 제한을 고려해야 합니다.
   */
  toJwtClaims(): Record<string, any> {
    const now = Math.floor(Date.now() / 1000)
    const claims: Record<string, any> = {
      sub: this.userId,
      email: this.email,
      role: this.role, // 향후 RBAC 시스템에서는 'roles' 배열로 변경될 수 있음
      type: this.tokenType,
      iat: this.issuedAt ? Math.floor(this.issuedAt.getTime() / 1000) : now,
    }

    if (this.expiresAt) {
      claims.exp = Math.floor(this.expiresAt.getTime() / 1000)
    }

    if (this.familyId) {
      claims.fid = this.familyId
    }

    return claims
  }

  /**
   * JWT 클레임에서 객체를 생성합니다.
   *
   * 참고: 인가 시스템 구현 시 추가 클레임을 파싱하도록 확장될 수 있습니다.
   */
  static fromJwtClaims(claims: Record<string, any>): TokenPayload {
    if (!claims.sub || !claims.email || !claims.role || !claims.type) {
      throw new Error("유효하지 않은 토큰 클레임입니다.")
    }

    return this.create({
      userId: claims.sub,
      email: claims.email,
      role: claims.role,
      tokenType: claims.type as "ACCESS" | "REFRESH",
      familyId: claims.fid,
      issuedAt: claims.iat ? new Date(claims.iat * 1000) : undefined,
      expiresAt: claims.exp ? new Date(claims.exp * 1000) : undefined,
    })
  }

  /**
   * 페이로드가 만료되었는지 확인합니다.
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return false // 만료 시간이 설정되지 않은 경우 만료되지 않음으로 간주
    }

    return this.expiresAt.getTime() < Date.now()
  }

  /**
   * 새로운 만료 시간으로 페이로드를 복제합니다.
   */
  withExpiresAt(expiresAt: Date): TokenPayload {
    return TokenPayload.create({
      userId: this.userId,
      email: this.email,
      role: this.role,
      tokenType: this.tokenType,
      familyId: this.familyId,
      issuedAt: this.issuedAt,
      expiresAt,
    })
  }

  /**
   * 새로운 토큰 패밀리 ID로 페이로드를 복제합니다.
   * 리프레시 토큰 로테이션에 사용됩니다.
   */
  withNewFamilyId(familyId: string): TokenPayload {
    return TokenPayload.create({
      userId: this.userId,
      email: this.email,
      role: this.role,
      tokenType: this.tokenType,
      familyId,
      issuedAt: new Date(), // 새 토큰은 현재 시간에 발급됨
      expiresAt: this.expiresAt,
    })
  }

  // TODO: 인가 시스템 구현 시 getAuthorizationContext() 메서드 추가 고려
  // 이 메서드는 인가 결정에 필요한 사용자 역할, 권한 및 속성 정보를 제공할 수 있음
}
