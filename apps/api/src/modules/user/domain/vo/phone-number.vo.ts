/**
 * 전화번호 값 객체
 * 전화번호 형식 검증 및 정규화를 담당
 */
export class PhoneNumber {
  private readonly value: string;
  private readonly verified: boolean;
  
  // 한국 휴대폰 번호 정규식 (01X-XXXX-XXXX 또는 01XXXXXXXXX 형식)
  private static readonly KOREA_PHONE_REGEX = /^01[0-9]{8,9}$/;
  
  private constructor(phoneNumber: string, verified: boolean = false) {
    this.validate(phoneNumber);
    this.value = this.normalize(phoneNumber);
    this.verified = verified;
  }
  
  /**
   * 전화번호 값 객체 생성 팩토리 메서드
   */
  public static of(phoneNumber: string, verified: boolean = false): PhoneNumber {
    return new PhoneNumber(phoneNumber, verified);
  }
  
  /**
   * 인증된 전화번호 생성 팩토리 메서드
   */
  public static ofVerified(phoneNumber: string): PhoneNumber {
    return new PhoneNumber(phoneNumber, true);
  }
  
  /**
   * 전화번호 유효성 검증
   */
  private validate(phoneNumber: string): void {
    if (!phoneNumber) {
      throw new Error('전화번호는 필수 값입니다.');
    }
    
    const normalized = this.removeNonDigits(phoneNumber);
    
    if (!PhoneNumber.KOREA_PHONE_REGEX.test(normalized)) {
      throw new Error('유효한 한국 휴대폰 번호 형식이 아닙니다.');
    }
  }
  
  /**
   * 전화번호 정규화 (하이픈 제거, 숫자만 남김)
   */
  private normalize(phoneNumber: string): string {
    return this.removeNonDigits(phoneNumber);
  }
  
  /**
   * 숫자가 아닌 문자 제거
   */
  private removeNonDigits(phoneNumber: string): string {
    return phoneNumber.replace(/[^0-9]/g, '');
  }
  
  /**
   * 원시 값(string) 반환
   */
  public toString(): string {
    return this.value;
  }
  
  /**
   * 포맷된 전화번호 반환 (010-1234-5678 형식)
   */
  public toFormattedString(): string {
    if (this.value.length === 10) {
      return this.value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (this.value.length === 11) {
      return this.value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    return this.value;
  }
  
  /**
   * 전화번호 마스킹 처리 (개인정보 보호용)
   * 예: 01012345678 -> 010****5678
   */
  public getMasked(): string {
    if (this.value.length === 10) {
      return this.value.replace(/(\d{3})(\d{3})(\d{4})/, '$1***$3');
    } else if (this.value.length === 11) {
      return this.value.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
    }
    return this.value;
  }
  
  /**
   * 인증 상태 확인
   */
  public isVerified(): boolean {
    return this.verified;
  }
  
  /**
   * 인증 상태 변경한 새 객체 반환
   */
  public withVerified(verified: boolean): PhoneNumber {
    return new PhoneNumber(this.value, verified);
  }
  
  /**
   * 다른 전화번호 값 객체와 동등 비교
   */
  public equals(other: PhoneNumber): boolean {
    return this.value === other.value;
  }
}
