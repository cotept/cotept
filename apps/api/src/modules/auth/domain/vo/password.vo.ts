/**
 * 비밀번호 값 객체 (Value Object)
 * 비밀번호의 유효성 검증 및 안전한 취급을 보장합니다.
 */
export class Password {
  // 불변성 보장을 위한 readonly 프로퍼티
  private readonly value: string

  // 비밀번호 검증 상수
  private static readonly MIN_LENGTH = 8
  private static readonly MAX_LENGTH = 16
  private static readonly HAS_LOWERCASE = /[a-z]/
  private static readonly HAS_UPPERCASE = /[A-Z]/
  private static readonly HAS_NUMBER = /[0-9]/
  private static readonly HAS_SPECIAL = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/

  // private 생성자로 직접 인스턴스화 방지
  private constructor(password: string) {
    this.value = password
  }

  /**
   * 비밀번호 값 객체를 생성하는 팩토리 메서드
   * @param password 비밀번호 문자열
   * @returns 유효한 비밀번호 값 객체
   * @throws Error 비밀번호가 정책을 충족하지 않을 경우
   */
  static create(password: string): Password {
    if (!password) {
      throw new Error("비밀번호는 필수 값입니다.")
    }

    if (password.length < this.MIN_LENGTH) {
      throw new Error(`비밀번호는 최소 ${this.MIN_LENGTH}자 이상이어야 합니다.`)
    }

    if (password.length > this.MAX_LENGTH) {
      throw new Error(`비밀번호는 최대 ${this.MAX_LENGTH}자 이하여야 합니다.`)
    }

    // 복잡성 검증
    let complexityErrors: string[] = []

    if (!this.HAS_LOWERCASE.test(password)) {
      complexityErrors.push("소문자를 포함해야 합니다")
    }

    if (!this.HAS_UPPERCASE.test(password)) {
      complexityErrors.push("대문자를 포함해야 합니다")
    }

    if (!this.HAS_NUMBER.test(password)) {
      complexityErrors.push("숫자를 포함해야 합니다")
    }

    if (!this.HAS_SPECIAL.test(password)) {
      complexityErrors.push("특수문자를 포함해야 합니다")
    }

    if (complexityErrors.length > 0) {
      throw new Error(`비밀번호는 ${complexityErrors.join(", ")} 조건을 충족해야 합니다.`)
    }

    // 연속된 문자나 숫자 체크 (예: 'abcdef', '123456')
    if (/(.)\1{3,}/.test(password)) {
      throw new Error("비밀번호에 4번 이상 연속된 동일 문자를 포함할 수 없습니다.")
    }

    return new Password(password)
  }

  /**
   * 해싱을 위한 원본 비밀번호 값을 반환
   * 주의: 이 메서드는 비밀번호 해싱 등 제한된 목적으로만 사용해야 합니다.
   */
  getValue(): string {
    return this.value
  }
}
