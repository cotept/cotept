/**
 * 닉네임 값 객체
 * 닉네임 형식 검증 및 정규화를 담당
 */
export class Nickname {
  private readonly value: string

  // 한글, 영문자, 숫자 허용하는 정규식 (특수문자 제외, 공백 제외)
  private static readonly NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]+$/

  private constructor(nickname: string) {
    this.value = this.normalize(nickname)
    this.validate(this.value)
  }

  /**
   * 닉네임 값 객체 생성 팩토리 메서드
   */
  public static of(nickname: string): Nickname {
    return new Nickname(nickname)
  }

  /**
   * 닉네임 유효성 검증
   */
  private validate(nickname: string): void {
    if (!nickname) {
      throw new Error("닉네임은 필수 값입니다.")
    }

    if (nickname.length < 2 || nickname.length > 50) {
      throw new Error("닉네임은 2자 이상 50자 이하여야 합니다.")
    }

    if (!Nickname.NICKNAME_REGEX.test(nickname)) {
      throw new Error("닉네임은 한글, 영문자, 숫자만 허용됩니다. (특수문자, 공백 제외)")
    }
  }

  /**
   * 닉네임 정규화 (앞뒤 공백 제거)
   */
  private normalize(nickname: string): string {
    return nickname.trim()
  }

  /**
   * 원시 값(string) 반환
   */
  public toString(): string {
    return this.value
  }

  /**
   * 다른 닉네임 값 객체와 동등 비교
   */
  public equals(other: Nickname): boolean {
    return this.value === other.value
  }

  /**
   * 닉네임이 최소 길이 요구사항을 만족하는지 확인
   */
  public isValidLength(): boolean {
    return this.value.length >= 2 && this.value.length <= 50
  }

  /**
   * 닉네임에 금지된 단어가 포함되어 있는지 확인 (향후 확장용)
   */
  public containsProfanity(bannedWords: string[] = []): boolean {
    const lowerNickname = this.value.toLowerCase()
    return bannedWords.some((word) => lowerNickname.includes(word.toLowerCase()))
  }
}
