/**
 * 토큰 값 객체
 * 인증 시스템에서 사용되는 토큰을 표현하는 불변 객체입니다.
 */
export class Token {
  private readonly _value: string;
  private readonly _expiresAt: Date;

  /**
   * @param value 토큰 문자열 값
   * @param expiresAt 토큰 만료 시간
   */
  constructor(value: string, expiresAt: Date) {
    if (!value || value.trim().length === 0) {
      throw new Error('토큰 값은 비어있을 수 없습니다.');
    }

    if (!expiresAt) {
      throw new Error('토큰 만료 시간은 필수입니다.');
    }

    this._value = value;
    this._expiresAt = new Date(expiresAt);
  }

  /**
   * 토큰 값 조회
   */
  get value(): string {
    return this._value;
  }

  /**
   * 토큰 만료 시간 조회
   */
  get expiresAt(): Date {
    return new Date(this._expiresAt);
  }

  /**
   * 토큰 만료 여부 확인
   */
  isExpired(now: Date = new Date()): boolean {
    return this._expiresAt < now;
  }

  /**
   * 토큰 만료까지 남은 시간(초) 계산
   */
  timeToExpire(now: Date = new Date()): number {
    if (this.isExpired(now)) {
      return 0;
    }
    
    return Math.floor((this._expiresAt.getTime() - now.getTime()) / 1000);
  }

  /**
   * 값 비교
   */
  equals(other: Token): boolean {
    if (!(other instanceof Token)) {
      return false;
    }
    
    return this._value === other._value;
  }

  /**
   * 문자열 표현
   */
  toString(): string {
    return this._value;
  }
}
