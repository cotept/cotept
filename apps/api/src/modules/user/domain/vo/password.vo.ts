/**
 * 비밀번호 값 객체
 * 비밀번호 정책 검증을 담당
 */
export class Password {
  private readonly value: string
  private readonly isHashed: boolean

  // 비밀번호 정책 정규식
  // 최소 8자, 최대 32자
  // 최소 하나의 대문자, 소문자, 숫자, 특수 문자 포함
  private static readonly PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/

  // 연속된 문자/숫자 감지 정규식
  private static readonly SEQUENTIAL_CHARS_REGEX =
    /(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i

  private constructor(password: string, isHashed: boolean) {
    if (!isHashed) {
      this.validate(password)
    }
    this.value = password
    this.isHashed = isHashed
  }

  /**
   * 일반 비밀번호 값 객체 생성 팩토리 메서드
   */
  public static of(password: string): Password {
    return new Password(password, false)
  }

  /**
   * 해시된 비밀번호 값 객체 생성 팩토리 메서드
   */
  public static ofHashed(hashedPassword: string): Password {
    return new Password(hashedPassword, true)
  }

  /**
   * 비밀번호 유효성 검증
   */
  private validate(password: string): void {
    if (!password) {
      throw new Error("비밀번호는 필수 값입니다.")
    }

    if (password.length < 8) {
      throw new Error("비밀번호는 최소 8자 이상이어야 합니다.")
    }

    if (password.length > 32) {
      throw new Error("비밀번호는 최대 32자까지 허용됩니다.")
    }

    if (!Password.PASSWORD_REGEX.test(password)) {
      throw new Error("비밀번호는 최소 하나의 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.")
    }

    if (Password.SEQUENTIAL_CHARS_REGEX.test(password)) {
      throw new Error("비밀번호에 연속된 문자나 숫자(123, abc 등)를 사용할 수 없습니다.")
    }
  }

  /**
   * 원시 값(string) 반환
   */
  public toString(): string {
    return this.value
  }

  /**
   * 해시된 비밀번호 여부 확인
   */
  public isAlreadyHashed(): boolean {
    return this.isHashed
  }
}
