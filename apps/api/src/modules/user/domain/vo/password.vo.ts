import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_REGEX,
  SEQUENTIAL_CHARS_REGEX,
  PASSWORD_ERROR_MESSAGES,
} from "@repo/common-lib"

/**
 * 비밀번호 값 객체
 * 비밀번호 정책 검증을 담당 (정책은 @repo/common-lib에서 공유)
 */
export class Password {
  private readonly value: string
  private readonly isHashed: boolean

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
   * 비밀번호 유효성 검증 (공유 정책 사용)
   */
  private validate(password: string): void {
    if (!password) {
      throw new Error(PASSWORD_ERROR_MESSAGES.required)
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      throw new Error(PASSWORD_ERROR_MESSAGES.minLength)
    }

    if (password.length > PASSWORD_MAX_LENGTH) {
      throw new Error(PASSWORD_ERROR_MESSAGES.maxLength)
    }

    if (!PASSWORD_REGEX.test(password)) {
      throw new Error(PASSWORD_ERROR_MESSAGES.pattern)
    }

    if (SEQUENTIAL_CHARS_REGEX.test(password)) {
      throw new Error(PASSWORD_ERROR_MESSAGES.sequential)
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
