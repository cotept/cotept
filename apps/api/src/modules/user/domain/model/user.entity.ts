import { Email } from "@/modules/user/domain/vo/email.vo"
import { Name } from "@/modules/user/domain/vo/name.vo"
import { PhoneNumber } from "@/modules/user/domain/vo/phone-number.vo"

export enum UserRole {
  MENTEE = "MENTEE",
  MENTOR = "MENTOR",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export default class User {
  // 식별자 및 기본 정보
  id: string
  email: Email // 값 객체로 변경
  passwordHash: string
  salt: string
  role: UserRole
  status: UserStatus

  // 개인 정보
  private _name?: Name // 내부적으로 Name VO 사용, 테스트를 위해 getter/setter 제공
  phoneNumber?: PhoneNumber // 값 객체로 변경

  // PASS 인증 관련 정보 (미래 확장용)
  ciHash?: string
  diHash?: string
  birthDate?: string
  gender?: string

  // 시간 관련 정보
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date

  constructor(params: {
    id?: string
    email: Email | string // Email 값 객체 또는 문자열 허용
    passwordHash: string
    salt: string
    role: UserRole
    status?: UserStatus
    name?: Name | string // Name 값 객체 또는 문자열 허용
    phoneNumber?: PhoneNumber | string // PhoneNumber 값 객체 또는 문자열 허용
    phoneVerified?: boolean
    ciHash?: string
    diHash?: string
    birthDate?: string
    gender?: string
    createdAt?: Date
    updatedAt?: Date
    lastLoginAt?: Date
  }) {
    this.id = params.id || crypto.randomUUID() // UUID v4 생성

    // 이메일 설정 (값 객체 또는 문자열)
    this.email = params.email instanceof Email ? params.email : Email.of(params.email)

    this.passwordHash = params.passwordHash
    this.salt = params.salt
    this.role = params.role
    this.status = params.status || UserStatus.ACTIVE

    // 이름 설정 (값 객체, 문자열 또는 undefined)
    if (params.name) {
      this._name = params.name instanceof Name ? params.name : Name.of(params.name)
    }

    // 전화번호 설정 (값 객체, 문자열 또는 undefined)
    if (params.phoneNumber) {
      this.phoneNumber =
        params.phoneNumber instanceof PhoneNumber
          ? params.phoneNumber
          : PhoneNumber.of(params.phoneNumber, params.phoneVerified || false)
    }

    this.ciHash = params.ciHash
    this.diHash = params.diHash
    this.birthDate = params.birthDate
    this.gender = params.gender
    this.createdAt = params.createdAt || new Date()
    this.updatedAt = params.updatedAt || new Date()
    this.lastLoginAt = params.lastLoginAt
  }

  /**
   * 테스트용 name getter
   * 원래는 엔티티 내부에서만 VO를 사용하고, 외부로는 primitive 값만 노출하는 것이 좋지만,
   * 기존 테스트를 통과시키기 위해 예외적으로 구현
   */
  get name(): string | undefined {
    return this._name?.toString()
  }

  /**
   * 테스트용 name setter
   */
  set name(value: string | undefined) {
    if (value) {
      this._name = Name.of(value)
    } else {
      this._name = undefined
    }
  }

  /**
   * 사용자 로그인 시간을 업데이트합니다.
   */
  updateLastLogin(): User {
    this.lastLoginAt = new Date()
    this.updatedAt = new Date()
    return this
  }

  /**
   * 사용자 상태를 변경합니다.
   */
  updateStatus(newStatus: UserStatus): User {
    this.status = newStatus
    this.updatedAt = new Date()
    return this
  }

  /**
   * 사용자 계정이 활성 상태인지 확인합니다.
   */
  isActive(): boolean {
    return this.status === UserStatus.ACTIVE
  }

  /**
   * 기본 정보를 업데이트합니다.
   */
  updateBasicInfo(params: { name?: Name | string; phoneNumber?: PhoneNumber | string }): User {
    if (params.name !== undefined) {
      this._name = params.name instanceof Name ? params.name : Name.of(params.name)
    }

    if (params.phoneNumber !== undefined) {
      this.phoneNumber =
        params.phoneNumber instanceof PhoneNumber ? params.phoneNumber : PhoneNumber.of(params.phoneNumber)
    }

    this.updatedAt = new Date()
    return this
  }

  /**
   * 전화번호 인증 상태를 설정합니다.
   */
  setPhoneVerified(verified: boolean): User {
    if (this.phoneNumber) {
      this.phoneNumber = this.phoneNumber.withVerified(verified)
    }
    this.updatedAt = new Date()
    return this
  }

  /**
   * 정적 팩토리 메서드: 기본 인증으로 새 사용자를 생성합니다.
   */
  static createWithBasicAuth(params: {
    email: string | Email
    passwordHash: string
    salt: string
    role: UserRole
    name?: string | Name
    phoneNumber?: string | PhoneNumber
  }): User {
    return new User({
      email: params.email,
      passwordHash: params.passwordHash,
      salt: params.salt,
      role: params.role,
      name: params.name,
      phoneNumber: params.phoneNumber,
      status: UserStatus.ACTIVE,
    })
  }

  /**
   * 정적 팩토리 메서드: PASS 인증으로 새 사용자를 생성합니다. (미래 확장용)
   */
  static createWithPassAuth(params: {
    email: string | Email
    passwordHash: string
    salt: string
    role: UserRole
    name: string | Name
    phoneNumber: string | PhoneNumber
    ciHash: string
    diHash: string
    birthDate: string
    gender: string
  }): User {
    // PhoneNumber를 문자열로 받았을 경우 값 객체로 변환하면서 인증 상태를 true로 설정
    const phoneNumber =
      params.phoneNumber instanceof PhoneNumber
        ? params.phoneNumber.withVerified(true)
        : PhoneNumber.ofVerified(params.phoneNumber)

    return new User({
      email: params.email,
      passwordHash: params.passwordHash,
      salt: params.salt,
      role: params.role,
      name: params.name,
      phoneNumber: phoneNumber,
      ciHash: params.ciHash,
      diHash: params.diHash,
      birthDate: params.birthDate,
      gender: params.gender,
      status: UserStatus.ACTIVE,
    })
  }

  /**
   * 이메일 값을 문자열로 반환
   */
  getEmailString(): string {
    return this.email.toString()
  }

  /**
   * 이름 값을 문자열로 반환
   */
  getNameString(): string | undefined {
    return this._name?.toString()
  }

  /**
   * 전화번호 값을 문자열로 반환
   */
  getPhoneNumberString(): string | undefined {
    return this.phoneNumber?.toString()
  }

  /**
   * 전화번호 인증 상태 반환
   */
  isPhoneVerified(): boolean {
    return this.phoneNumber?.isVerified() || false
  }
}
