/**
 * 이메일 값 객체
 * 이메일 형식 검증 및 정규화를 담당
 */
export class Email {
  private readonly value: string

  // 이메일 유효성 검증 정규식
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  private constructor(email: string) {
    // 입력 이메일이 없는 경우 검증
    if (!email) {
      throw new Error("이메일은 필수 값입니다.")
    }

    // 정규화
    const normalizedEmail = this.normalize(email)

    // 정규식 검증
    if (!Email.EMAIL_REGEX.test(normalizedEmail)) {
      throw new Error("유효한 이메일 형식이 아닙니다.")
    }

    // 도메인 부분 추가 검증
    const parts = normalizedEmail.split("@")
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error("유효한 이메일 형식이 아닙니다.")
    }

    const domain = parts[1]
    if (!domain.includes(".")) {
      throw new Error("유효한 이메일 형식이 아닙니다.")
    }

    const domainParts = domain.split(".")
    if (domainParts.some((part) => !part) || domainParts.includes("")) {
      throw new Error("유효한 이메일 형식이 아닙니다.")
    }

    // 유효한 정규화된 이메일을 값으로 저장
    this.value = normalizedEmail
  }

  /**
   * 이메일 값 객체 생성 팩토리 메서드
   */
  public static of(email: string): Email {
    return new Email(email)
  }

  /**
   * 이메일 정규화 (소문자 변환, 앞뒤 공백 제거)
   */
  private normalize(email: string): string {
    return email.toLowerCase().trim()
  }

  /**
   * 다른 이메일 값 객체와 동등 비교
   */
  public equals(other: Email): boolean {
    return this.value === other.value
  }

  /**
   * 원시 값(string) 반환
   */
  public toString(): string {
    return this.value
  }

  /**
   * 도메인 부분만 추출
   */
  public getDomain(): string {
    return this.value.split("@")[1]
  }

  /**
   * 로컬 부분만 추출 (@ 앞부분)
   */
  public getLocalPart(): string {
    return this.value.split("@")[0]
  }

  /**
   * 이메일 마스킹 처리 (개인정보 보호용)
   * 예: john.doe@example.com -> j****e@example.com
   */
  public getMasked(): string {
    const localPart = this.getLocalPart()
    const domain = this.getDomain()

    if (localPart.length <= 2) {
      return `${localPart.charAt(0)}*@${domain}`
    }

    return `${localPart.charAt(0)}${"*".repeat(localPart.length - 2)}${localPart.charAt(localPart.length - 1)}@${domain}`
  }
}
