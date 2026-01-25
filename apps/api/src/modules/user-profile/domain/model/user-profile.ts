import { Name } from "@/modules/user/domain/vo/name.vo"
import { Nickname } from "@/modules/user-profile/domain/vo/nickname.vo"

/**
 * UserProfile 도메인 모델
 * User의 확장 프로필 정보를 관리
 */
export default class UserProfile {
  // 식별자 및 연결 정보
  idx?: number // BaseEntity의 자동증가 ID
  userId: string // User 엔티티의 userId와 연결

  // 필수 프로필 정보
  private _nickname: Nickname // 닉네임 (회원가입 ProfileStep에서 필수 수집)

  // 선택적 프로필 정보
  private _fullName?: Name // 실명 (선택사항)
  introduce?: string // 자기소개 (트위터 스타일 280자 제한)
  profileImageUrl?: string // 프로필 이미지 URL

  // 시간 관련 정보
  createdAt: Date
  updatedAt: Date

  constructor(params: {
    idx?: number
    userId: string
    nickname: Nickname | string
    fullName?: Name | string
    introduce?: string
    profileImageUrl?: string
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.idx = params.idx
    this.userId = params.userId

    // 닉네임 설정 (값 객체 또는 문자열)
    this._nickname = params.nickname instanceof Nickname ? params.nickname : Nickname.of(params.nickname)

    // 실명 설정 (값 객체, 문자열 또는 undefined)
    if (params.fullName) {
      this._fullName = params.fullName instanceof Name ? params.fullName : Name.of(params.fullName)
    }

    this.introduce = params.introduce
    this.profileImageUrl = params.profileImageUrl
    this.createdAt = params.createdAt || new Date()
    this.updatedAt = params.updatedAt || new Date()
  }

  /**
   * 닉네임 getter - 문자열로 반환
   */
  get nickname(): string {
    return this._nickname.toString()
  }

  /**
   * 닉네임 setter - 문자열로 받아서 값 객체로 변환
   */
  set nickname(value: string) {
    this._nickname = Nickname.of(value)
    this.updatedAt = new Date()
  }

  /**
   * 실명 getter - 문자열로 반환
   */
  get fullName(): string | undefined {
    return this._fullName?.toString()
  }

  /**
   * 실명 setter - 문자열로 받아서 값 객체로 변환
   */
  set fullName(value: string | undefined) {
    if (value) {
      this._fullName = Name.of(value)
    } else {
      this._fullName = undefined
    }
    this.updatedAt = new Date()
  }

  /**
   * 프로필 정보를 업데이트합니다.
   */
  updateProfile(params: {
    nickname?: string | Nickname
    fullName?: string | Name
    introduce?: string
    profileImageUrl?: string
  }): UserProfile {
    if (params.nickname !== undefined) {
      this._nickname = params.nickname instanceof Nickname ? params.nickname : Nickname.of(params.nickname)
    }

    if (params.fullName !== undefined) {
      this._fullName = params.fullName
        ? params.fullName instanceof Name
          ? params.fullName
          : Name.of(params.fullName)
        : undefined
    }

    if (params.introduce !== undefined) {
      this.introduce = params.introduce
    }

    if (params.profileImageUrl !== undefined) {
      this.profileImageUrl = params.profileImageUrl
    }

    this.updatedAt = new Date()
    return this
  }

  /**
   * 자기소개 글자 수 제한 검증 (280자)
   */
  validateIntroduceLength(): boolean {
    if (!this.introduce) return true
    return this.introduce.length <= 280
  }

  /**
   * 자기소개를 설정합니다. (트위터 스타일 280자 제한)
   */
  setIntroduce(introduce: string | undefined): UserProfile {
    if (introduce && introduce.length > 280) {
      throw new Error("자기소개는 280자 이하여야 합니다.")
    }
    this.introduce = introduce
    this.updatedAt = new Date()
    return this
  }

  /**
   * 프로필 이미지를 설정합니다.
   */
  setProfileImage(imageUrl: string | undefined): UserProfile {
    this.profileImageUrl = imageUrl
    this.updatedAt = new Date()
    return this
  }

  /**
   * 프로필이 기본 정보(닉네임)를 가지고 있는지 확인
   */
  hasBasicInfo(): boolean {
    return !!this._nickname
  }

  /**
   * 프로필이 완전한 정보를 가지고 있는지 확인
   */
  isComplete(): boolean {
    return this.hasBasicInfo() && !!this._fullName
  }

  /**
   * 정적 팩토리 메서드: 기본 프로필 생성
   */
  static createBasicProfile(params: { userId: string; nickname: string; introduce?: string }): UserProfile {
    return new UserProfile({
      userId: params.userId,
      nickname: params.nickname,
      introduce: params.introduce,
    })
  }

  /**
   * 정적 팩토리 메서드: 완전한 프로필 생성
   */
  static createCompleteProfile(params: {
    userId: string
    nickname: string
    fullName: string
    introduce?: string
    profileImageUrl?: string
  }): UserProfile {
    return new UserProfile({
      userId: params.userId,
      nickname: params.nickname,
      fullName: params.fullName,
      introduce: params.introduce,
      profileImageUrl: params.profileImageUrl,
    })
  }

  /**
   * 닉네임 값을 문자열로 반환
   */
  getNicknameString(): string {
    return this._nickname.toString()
  }

  /**
   * 실명 값을 문자열로 반환
   */
  getFullNameString(): string | undefined {
    return this._fullName?.toString()
  }

  /**
   * 표시용 이름 반환 (실명이 있으면 실명, 없으면 닉네임)
   */
  getDisplayName(): string {
    return this._fullName?.toString() || this._nickname.toString()
  }
}
