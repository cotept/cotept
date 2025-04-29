/**
 * 인증 유형
 */
export enum AuthType {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  COMPANY = 'COMPANY'
}

/**
 * 인증 코드 및 검증 정보
 */
export class AuthVerification {
  constructor(
    public readonly id: string,
    public readonly userId: string | null,
    public readonly authType: AuthType,
    public readonly target: string,
    private readonly _verificationCode: string,
    public readonly expiresAt: Date,
    private _verified: boolean = false,
    private _verifiedAt: Date | null = null,
    private _attemptCount: number = 0,
    public readonly ipAddress: string | null = null,
    public readonly createdAt: Date = new Date()
  ) {}

  /**
   * 인증 코드 조회
   */
  get verificationCode(): string {
    return this._verificationCode;
  }

  /**
   * 인증 완료 여부 조회
   */
  get verified(): boolean {
    return this._verified;
  }

  /**
   * 인증 완료 시간 조회
   */
  get verifiedAt(): Date | null {
    return this._verifiedAt;
  }

  /**
   * 인증 시도 횟수 조회
   */
  get attemptCount(): number {
    return this._attemptCount;
  }

  /**
   * 인증 코드가 만료되었는지 확인
   */
  get isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  /**
   * 인증 시도 횟수 증가
   */
  incrementAttemptCount(): AuthVerification {
    this._attemptCount += 1;
    return this;
  }

  /**
   * 인증 완료 처리
   */
  markAsVerified(): AuthVerification {
    this._verified = true;
    this._verifiedAt = new Date();
    return this;
  }

  /**
   * 인증 코드 확인
   * @param code 입력된 인증 코드
   * @returns 인증 성공 여부
   */
  verify(code: string): boolean {
    if (this.isExpired || this._verified) {
      return false;
    }

    this.incrementAttemptCount();

    if (this._verificationCode !== code) {
      return false;
    }

    this.markAsVerified();
    return true;
  }

  /**
   * 6자리 난수 코드 생성
   */
  static generateRandomCode(): string {
    // 100000-999999 사이의 난수 생성
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return randomNumber.toString();
  }

  /**
   * 인증 검증 객체 생성
   * @param userId 사용자 ID (선택)
   * @param authType 인증 유형
   * @param target 인증 대상 (이메일, 전화번호 등)
   * @param ipAddress IP 주소 (선택)
   * @param expiresInMinutes 만료 시간 (분, 기본값: 3분)
   * @returns 인증 검증 객체
   */
  static create(
    id: string,
    userId: string | null,
    authType: AuthType,
    target: string,
    ipAddress: string | null = null,
    expiresInMinutes: number = 3
  ): AuthVerification {
    // 6자리 난수 생성
    const verificationCode = this.generateRandomCode();
    
    // 만료 시간 계산
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
    
    // 인증 검증 객체 생성
    return new AuthVerification(
      id,
      userId,
      authType,
      target,
      verificationCode,
      expiresAt,
      false,
      null,
      0,
      ipAddress
    );
  }
}
