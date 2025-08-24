/**
 * 인증 모듈에서 사용하는 사용자 모델
 * User 엔티티에서 인증에 필요한 정보만 추출
 */
export class AuthUser {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly salt: string,
    public readonly role: string,
    public readonly status: string,
  ) {}

  /**
   * 사용자 id 반환
   */
  getId(): number {
    return this.id
  }

  /**
   * 사용자 계정이 활성 상태인지 확인
   */
  get isActive(): boolean {
    return this.status === "ACTIVE"
  }

  /**
   * 사용자가 로그인할 수 있는 상태인지 확인
   */
  canLogin(): boolean {
    return this.isActive
  }

  /**
   * 패스워드 해시 조회
   */
  getPasswordHash(): string {
    return this.passwordHash
  }
  /**
   * 이메일 조회
   */
  getEmail(): string {
    return this.email
  }

  /**
   * 솔트 값 조회
   */
  getSalt(): string {
    return this.salt
  }

  /**
   * 로그인 시간 업데이트
   * @param lastLoginAt 로그인 시점 (기본값: 현재 시간)
   */
  updateLastLogin(lastLoginAt: Date = new Date()): void {
    // 이 클래스는 인증에 필요한 정보만 가지고 있으며, 실제 User 엔티티의 상태를 변경하지는 않습니다.
    // 이 메서드는 단순히 인터페이스의 통일성을 위해 존재합니다.
  }

  /**
   * 기존 사용자 객체에서 AuthUser 인스턴스 생성
   * @param user 사용자 객체
   * @returns AuthUser 인스턴스
   */
  static fromUser(user: any): AuthUser {
    return new AuthUser(
      user.id,
      user.email?.toString() || user.getEmailString(), // User 객체의 구조에 따라 적절히 사용
      user.passwordHash,
      user.salt,
      user.role,
      user.status,
    )
  }
}
