import MentorTag, { MentorTagCategory } from "./mentor-tag"

/**
 * 멘토 프로필 도메인 모델
 * 멘토의 상세 프로필 정보와 비즈니스 로직을 포함하는 Rich Domain Model
 */
export default class MentorProfile {
  idx?: number
  userId: string // User Entity의 idx가 아닌 cotept_user_id
  introductionTitle?: string
  introductionContent?: string
  baekjoonTierDisplay: boolean
  mentoringCount: number
  totalReviewCount: number
  averageRating: number
  isVerified: boolean
  isActive: boolean
  profileCompletion: number // 0-100%
  tags: MentorTag[]
  createdAt: Date
  updatedAt: Date

  constructor(params: {
    idx?: number
    userId: string
    introductionTitle?: string
    introductionContent?: string
    baekjoonTierDisplay?: boolean
    mentoringCount?: number
    totalReviewCount?: number
    averageRating?: number
    isVerified?: boolean
    isActive?: boolean
    profileCompletion?: number
    tags?: MentorTag[]
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.idx = params.idx
    this.userId = params.userId
    this.introductionTitle = params.introductionTitle
    this.introductionContent = params.introductionContent
    this.baekjoonTierDisplay = params.baekjoonTierDisplay ?? true
    this.mentoringCount = params.mentoringCount ?? 0
    this.totalReviewCount = params.totalReviewCount ?? 0
    this.averageRating = params.averageRating ?? 0.0
    this.isVerified = params.isVerified ?? false
    this.isActive = params.isActive ?? true
    this.profileCompletion = params.profileCompletion ?? 0
    this.tags = params.tags ?? []
    this.createdAt = params.createdAt || new Date()
    this.updatedAt = params.updatedAt || new Date()
  }

  /**
   * 멘토링 소개를 업데이트합니다.
   */
  updateIntroduction(title?: string, content?: string): MentorProfile {
    if (title !== undefined) {
      this.introductionTitle = title.trim() || undefined
    }
    if (content !== undefined) {
      this.introductionContent = content.trim() || undefined
    }
    this.updatedAt = new Date()
    this.calculateProfileCompletion()
    return this
  }

  /**
   * 백준 티어 표시 설정을 변경합니다.
   */
  updateBaekjoonTierDisplay(display: boolean): MentorProfile {
    this.baekjoonTierDisplay = display
    this.updatedAt = new Date()
    return this
  }

  /**
   * 멘토 태그를 추가합니다.
   */
  addTag(tag: MentorTag): MentorProfile {
    // 중복 태그 확인
    const exists = this.tags.some((t) => {
      // 두 태그 모두 idx가 정의되어 있다면 idx로 비교
      if (t.idx !== undefined && tag.idx !== undefined) {
        return t.idx === tag.idx
      }
      // 그렇지 않다면 name과 category로 비교
      return t.name === tag.name && t.category === tag.category
    })

    if (!exists) {
      this.tags.push(tag)
      this.updatedAt = new Date()
      this.calculateProfileCompletion()
    }
    return this
  }

  /**
   * 멘토 태그를 제거합니다.
   */
  removeTag(tagIdx: number): MentorProfile {
    this.tags = this.tags.filter((tag) => tag.idx !== tagIdx)
    this.updatedAt = new Date()
    this.calculateProfileCompletion()
    return this
  }

  /**
   * 모든 태그를 교체합니다.
   */
  updateTags(newTags: MentorTag[]): MentorProfile {
    this.tags = [...newTags]
    this.updatedAt = new Date()
    this.calculateProfileCompletion()
    return this
  }

  /**
   * 멘토링 완료 후 통계를 업데이트합니다.
   */
  updateMentoringStats(newRating?: number): MentorProfile {
    this.mentoringCount++

    if (newRating !== undefined && newRating >= 0 && newRating <= 5) {
      // 평균 평점 재계산
      const totalRating = this.averageRating * this.totalReviewCount + newRating
      this.totalReviewCount++
      this.averageRating = Number((totalRating / this.totalReviewCount).toFixed(2))
    }

    this.updatedAt = new Date()
    return this
  }

  /**
   * 멘토 인증 상태를 변경합니다.
   */
  updateVerificationStatus(verified: boolean): MentorProfile {
    this.isVerified = verified
    this.updatedAt = new Date()
    return this
  }

  /**
   * 멘토 활동 상태를 변경합니다.
   */
  updateActiveStatus(active: boolean): MentorProfile {
    this.isActive = active
    this.updatedAt = new Date()
    return this
  }

  /**
   * 프로필 완성도를 계산합니다.
   */
  private calculateProfileCompletion(): void {
    let completion = 0

    // 기본 정보 완성도 (40%)
    if (this.introductionTitle?.trim()) completion += 20

    if (this.introductionContent?.trim()) completion += 20

    // 태그 완성도 (60%)
    const hasJobTag = this.tags.some((tag) => tag.category === MentorTagCategory.JOB)
    const hasExperienceTag = this.tags.some((tag) => tag.category === MentorTagCategory.EXPERIENCE)
    const hasCompanyTag = this.tags.some((tag) => tag.category === MentorTagCategory.COMPANY)

    if (hasJobTag) completion += 20
    if (hasExperienceTag) completion += 20
    if (hasCompanyTag) completion += 20

    this.profileCompletion = Math.min(completion, 100)
  }

  /**
   * 프로필이 완성되었는지 확인합니다.
   */
  isProfileComplete(): boolean {
    return this.profileCompletion >= 100
  }

  /**
   * 멘토가 활성 상태인지 확인합니다.
   */
  isActiveMentor(): boolean {
    return this.isActive
  }

  /**
   * 멘토가 인증된 상태인지 확인합니다.
   */
  isVerifiedMentor(): boolean {
    return this.isVerified
  }

  /**
   * 특정 카테고리의 태그들을 가져옵니다.
   */
  getTagsByCategory(category: MentorTagCategory): MentorTag[] {
    return this.tags.filter((tag) => tag.category === category && tag.isActiveTag())
  }

  /**
   * 정적 팩토리 메서드: 새 멘토 프로필을 생성합니다.
   */
  static create(params: {
    userId: string
    introductionTitle?: string
    introductionContent?: string
    baekjoonTierDisplay?: boolean
  }): MentorProfile {
    const profile = new MentorProfile({
      userId: params.userId,
      introductionTitle: params.introductionTitle,
      introductionContent: params.introductionContent,
      baekjoonTierDisplay: params.baekjoonTierDisplay,
      isActive: true,
      isVerified: false,
    })

    profile.calculateProfileCompletion()
    return profile
  }
}
