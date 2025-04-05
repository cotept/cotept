/**
 * 이름 값 객체
 * 이름 형식 검증 및 정규화를 담당
 */
export class Name {
  private readonly value: string

  // 한글, 영문자만 허용하는 정규식 (특수문자, 숫자 제외)
  private static readonly NAME_REGEX = /^[가-힣a-zA-Z\s]+$/

  private constructor(name: string) {
    this.value = this.normalize(name)
    this.validate(this.value)
  }

  /**
   * 이름 값 객체 생성 팩토리 메서드
   */
  public static of(name: string): Name {
    return new Name(name)
  }

  /**
   * 이름 유효성 검증
   */
  private validate(name: string): void {
    if (!name) {
      throw new Error("이름은 필수 값입니다.")
    }

    if (name.length < 2 || name.length > 50) {
      throw new Error("이름은 2자 이상 50자 이하여야 합니다.")
    }

    if (!Name.NAME_REGEX.test(name)) {
      throw new Error("이름은 한글과 영문자만 허용됩니다.")
    }
  }

  /**
   * 이름 정규화 (앞뒤 공백 제거)
   */
  private normalize(name: string): string {
    return name.trim()
  }

  /**
   * 원시 값(string) 반환
   */
  public toString(): string {
    return this.value
  }

  /**
   * 다른 이름 값 객체와 동등 비교
   */
  public equals(other: Name): boolean {
    return this.value === other.value
  }

  /**
   * 이름 마스킹 처리 (개인정보 보호용)
   * 예: 홍길동 -> 홍*동
   */
  public getMasked(): string {
    if (this.value.length <= 2) {
      return this.value.charAt(0) + "*"
    }

    return this.value.charAt(0) + "*".repeat(this.value.length - 2) + this.value.charAt(this.value.length - 1)
  }
}
