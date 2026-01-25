/**
 * 인증 문자열 값 객체
 * 백준 프로필 bio 인증에 사용되는 랜덤 문자열을 관리
 */
export class VerificationString {
  private readonly value: string

  // 한글 형용사 + 동물 이름 리스트
  private static readonly ADJECTIVES = [
    "귀여운",
    "똑똑한",
    "용감한",
    "재빠른",
    "착한",
    "밝은",
    "순수한",
    "활발한",
    "차분한",
    "친근한",
    "멋진",
    "예쁜",
    "강한",
    "부지런한",
    "온순한",
    "배부른",
  ]

  private static readonly ANIMALS = [
    "고양이",
    "강아지",
    "토끼",
    "햄스터",
    "다람쥐",
    "곰",
    "사자",
    "호랑이",
    "여우",
    "늑대",
    "펭귄",
    "돌고래",
    "판다",
    "코알라",
    "캥거루",
    "기린",
  ]

  private constructor(value: string) {
    if (!value) {
      throw new Error("인증 문자열은 필수 값입니다.")
    }

    // 기본 형식 검증: "형용사+동물+숫자" 패턴
    if (!this.isValidFormat(value)) {
      throw new Error("인증 문자열은 '형용사+동물+숫자' 형식이어야 합니다.")
    }

    this.value = value
  }

  /**
   * 랜덤 인증 문자열 생성 팩토리 메서드
   */
  public static generate(): VerificationString {
    const adjective = this.getRandomElement(this.ADJECTIVES)
    const animal = this.getRandomElement(this.ANIMALS)
    const numbers = this.generateRandomNumbers(8) // 8자리 숫자

    const verificationString = `${adjective}${animal}${numbers}`
    return new VerificationString(verificationString)
  }

  /**
   * 기존 문자열로부터 인증 문자열 생성 팩토리 메서드
   */
  public static of(value: string): VerificationString {
    return new VerificationString(value)
  }

  /**
   * 배열에서 랜덤 요소 선택
   */
  private static getRandomElement(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)]
  }

  /**
   * 지정된 길이의 랜덤 숫자 문자열 생성
   */
  private static generateRandomNumbers(length: number): string {
    let result = ""
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString()
    }
    return result
  }

  /**
   * 인증 문자열 형식 검증
   */
  private isValidFormat(value: string): boolean {
    // 기본 길이 검증 (최소 10자, 최대 30자)
    if (value.length < 10 || value.length > 30) {
      return false
    }

    // 마지막 8자리가 숫자인지 확인
    const numbers = value.slice(-8)
    if (!/^\d{8}$/.test(numbers)) {
      return false
    }

    // 앞부분이 한글인지 확인
    const prefix = value.slice(0, -8)
    if (!/^[가-힣]+$/.test(prefix)) {
      return false
    }

    return true
  }

  /**
   * 다른 인증 문자열과 동등 비교
   */
  public equals(other: VerificationString): boolean {
    return this.value === other.value
  }

  /**
   * 원시 값(string) 반환
   */
  public toString(): string {
    return this.value
  }

  /**
   * 인증 문자열 길이 반환
   */
  public getLength(): number {
    return this.value.length
  }

  /**
   * 숫자 부분만 추출
   */
  public getNumberPart(): string {
    return this.value.slice(-8)
  }

  /**
   * 한글 부분만 추출 (형용사+동물)
   */
  public getKoreanPart(): string {
    return this.value.slice(0, -8)
  }

  /**
   * 인증 문자열이 만료되었는지 확인 (생성 후 1시간)
   */
  public isExpired(createdAt: Date): boolean {
    const now = new Date()
    const expiryTime = new Date(createdAt.getTime() + 60 * 60 * 1000) // 1시간 후
    return now > expiryTime
  }

  /**
   * 만료 시간 계산
   */
  public getExpiryDate(createdAt: Date): Date {
    return new Date(createdAt.getTime() + 60 * 60 * 1000) // 1시간 후
  }

  /**
   * 중복 방지를 위한 유니크 문자열 생성 (타임스탬프 포함)
   */
  public static generateUnique(): VerificationString {
    const adjective = this.getRandomElement(this.ADJECTIVES)
    const animal = this.getRandomElement(this.ANIMALS)

    // 현재 시간을 기반으로 한 8자리 숫자 생성
    const timestamp = Date.now()
    const timestampStr = timestamp.toString()
    const numbers = timestampStr.slice(-8) // 마지막 8자리 사용

    const verificationString = `${adjective}${animal}${numbers}`
    return new VerificationString(verificationString)
  }
}
