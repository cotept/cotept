/**
 * 이메일 값 객체 (Value Object)
 * 이메일 주소에 대한 유효성 검증 및 불변성을 보장합니다.
 */
export class Email {
  // 불변성 보장을 위한 readonly 프로퍼티
  private readonly value: string;
  
  // 이메일 유효성 검증을 위한 정규식
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // private 생성자로 직접 인스턴스화 방지
  private constructor(email: string) {
    this.value = email;
  }

  /**
   * 이메일 값 객체를 생성하는 팩토리 메서드
   * @param email 이메일 문자열
   * @returns 유효한 이메일 값 객체
   * @throws Error 이메일 형식이 유효하지 않을 경우
   */
  static create(email: string): Email {
    if (!email) {
      throw new Error('이메일은 필수 값입니다.');
    }
    
    if (!this.EMAIL_REGEX.test(email)) {
      throw new Error('유효하지 않은 이메일 형식입니다.');
    }
    
    // 이메일 값 정규화 (소문자 변환)
    return new Email(email.toLowerCase());
  }

  /**
   * 이메일 값을 반환
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 다른 이메일 값 객체와의 동등성 비교
   */
  equals(other: Email): boolean {
    if (!(other instanceof Email)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * 문자열 표현 반환
   */
  toString(): string {
    return this.value;
  }
}