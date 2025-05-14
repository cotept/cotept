/**
 * 이메일 제목 값 객체
 * 제목의 유효성 검증과 정규화를 담당
 */
export class Subject {
  private readonly value: string

  // 최대 제목 길이
  private static readonly MAX_LENGTH = 100

  private constructor(subject: string) {
    // 입력 제목이 없는 경우 검증
    if (!subject || subject.trim().length === 0) {
      throw new Error("제목은 필수 값입니다.")
    }

    // 정규화된 제목 (앞뒤 공백 제거)
    const normalizedSubject = subject.trim()

    // 최대 길이 검증
    if (normalizedSubject.length > Subject.MAX_LENGTH) {
      throw new Error(`제목은 최대 ${Subject.MAX_LENGTH}자까지 입력 가능합니다.`)
    }

    // 유효한 정규화된 제목을 값으로 저장
    this.value = normalizedSubject
  }

  /**
   * 제목 값 객체 생성 팩토리 메서드
   */
  public static of(subject: string): Subject {
    return new Subject(subject)
  }

  /**
   * 다른 제목 값 객체와 동등 비교
   */
  public equals(other: Subject): boolean {
    return this.value === other.value
  }

  /**
   * 원시 값(string) 반환
   */
  public toString(): string {
    return this.value
  }

  /**
   * 값 반환
   */
  public getValue(): string {
    return this.value
  }
}
