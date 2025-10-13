export enum OnboardingStep {
  PROFILE_SETUP = 1,
  BAEKJOON_VERIFY = 2,
  SKILL_ANALYSIS = 3,
  MENTOR_QUALIFICATION = 4,
  COMPLETED = 5,
}

/**
 * 온보딩 진행 상태 도메인 모델
 * 사용자의 온보딩 플로우 진행 상태를 관리합니다.
 */
export default class OnboardingState {
  userId: string
  currentStep: OnboardingStep
  profileCreated: boolean
  baekjoonVerified: boolean
  skillAnalysisCompleted: boolean
  mentorProfileCreated: boolean
  completedAt?: Date

  constructor(params: {
    userId: string
    currentStep?: OnboardingStep
    profileCreated?: boolean
    baekjoonVerified?: boolean
    skillAnalysisCompleted?: boolean
    mentorProfileCreated?: boolean
    completedAt?: Date
  }) {
    this.userId = params.userId
    this.currentStep = params.currentStep ?? OnboardingStep.PROFILE_SETUP
    this.profileCreated = params.profileCreated ?? false
    this.baekjoonVerified = params.baekjoonVerified ?? false
    this.skillAnalysisCompleted = params.skillAnalysisCompleted ?? false
    this.mentorProfileCreated = params.mentorProfileCreated ?? false
    this.completedAt = params.completedAt
  }

  /**
   * 프로필 생성 단계를 완료로 표시합니다.
   */
  completeProfileSetup(): void {
    this.profileCreated = true
    this.moveToStep(OnboardingStep.BAEKJOON_VERIFY)
  }

  /**
   * 백준 인증 단계를 완료로 표시합니다.
   */
  completeBaekjoonVerification(): void {
    this.baekjoonVerified = true
    this.moveToStep(OnboardingStep.SKILL_ANALYSIS)
  }

  /**
   * 실력 분석 단계를 완료로 표시합니다.
   */
  completeSkillAnalysis(): void {
    this.skillAnalysisCompleted = true
    this.moveToStep(OnboardingStep.MENTOR_QUALIFICATION)
  }

  /**
   * 멘토 프로필 생성을 완료로 표시합니다.
   */
  completeMentorSetup(): void {
    this.mentorProfileCreated = true
    this.moveToStep(OnboardingStep.COMPLETED)
  }

  /**
   * 다음 단계로 이동합니다.
   */
  private moveToStep(step: OnboardingStep): void {
    if (step > this.currentStep) {
      this.currentStep = step
    }
    if (this.isCompleted()) {
      this.completedAt = new Date()
    }
  }

  /**
   * 온보딩 프로세스가 완료되었는지 확인합니다.
   * 프로필 생성만 필수이며, 백준 연동은 선택 사항입니다.
   */
  isCompleted(): boolean {
    return this.profileCreated
    // 백준 인증 및 멘토 프로필 생성은 선택적이므로 완료 조건에서 제외
  }

  /**
   * 백준 연동을 건너뛸 수 있는지 확인합니다.
   * 프로필 생성이 완료되어야 백준 단계를 건너뛸 수 있습니다.
   */
  canSkipBaekjoon(): boolean {
    return this.profileCreated && !this.baekjoonVerified
  }

  /**
   * 백준 연동이 완료되었는지 확인합니다.
   */
  hasBaekjoonLinked(): boolean {
    return this.baekjoonVerified && this.skillAnalysisCompleted
  }

  /**
   * 백준 연동 단계를 건너뜁니다.
   * 프로필 생성이 완료된 경우에만 가능합니다.
   */
  skipBaekjoon(): void {
    if (!this.canSkipBaekjoon()) {
      throw new Error("Cannot skip Baekjoon verification: profile setup not completed")
    }
    this.moveToStep(OnboardingStep.COMPLETED)
  }

  /**
   * 정적 팩토리 메서드: 새 사용자를 위한 온보딩 상태를 생성합니다.
   */
  static start(userId: string): OnboardingState {
    return new OnboardingState({ userId })
  }
}
