import OnboardingState, { OnboardingStep } from "@/modules/onboarding/domain/model/onboarding-state.model"

describe("OnboardingState 도메인 모델 테스트", () => {
  const userId = "test-user-id"

  it("start 팩토리 메서드로 생성 시 기본값이 올바르게 설정되어야 한다", () => {
    // Given & When
    const state = OnboardingState.start(userId)

    // Then
    expect(state.userId).toBe(userId)
    expect(state.currentStep).toBe(OnboardingStep.PROFILE_SETUP)
    expect(state.profileCreated).toBe(false)
    expect(state.baekjoonVerified).toBe(false)
    expect(state.skillAnalysisCompleted).toBe(false)
    expect(state.mentorProfileCreated).toBe(false)
    expect(state.completedAt).toBeUndefined()
  })

  it("completeProfileSetup 호출 시 profileCreated가 true가 되고 다음 단계로 이동해야 한다", () => {
    // Given
    const state = OnboardingState.start(userId)

    // When
    state.completeProfileSetup()

    // Then
    expect(state.profileCreated).toBe(true)
    expect(state.currentStep).toBe(OnboardingStep.BAEKJOON_VERIFY)
  })

  it("completeBaekjoonVerification 호출 시 baekjoonVerified가 true가 되고 다음 단계로 이동해야 한다", () => {
    // Given
    const state = OnboardingState.start(userId)
    state.completeProfileSetup() // 이전 단계 완료

    // When
    state.completeBaekjoonVerification()

    // Then
    expect(state.baekjoonVerified).toBe(true)
    expect(state.currentStep).toBe(OnboardingStep.SKILL_ANALYSIS)
  })

  it("모든 필수 단계 완료 시 isCompleted가 true를 반환해야 한다", () => {
    // Given
    const state = OnboardingState.start(userId)
    state.profileCreated = true
    state.baekjoonVerified = true
    state.skillAnalysisCompleted = true

    // When & Then
    expect(state.isCompleted()).toBe(true)
  })

  it("필수 단계 중 하나라도 미완료 시 isCompleted가 false를 반환해야 한다", () => {
    // Given
    const state = OnboardingState.start(userId)
    state.profileCreated = true
    state.baekjoonVerified = true
    state.skillAnalysisCompleted = false // 한 단계 미완료

    // When & Then
    expect(state.isCompleted()).toBe(false)
  })

  it("온보딩 완료 시 completedAt 날짜가 설정되어야 한다", () => {
    // Given
    const state = OnboardingState.start(userId)
    state.profileCreated = true
    state.baekjoonVerified = true

    // When
    // 마지막 필수 단계를 완료하면 isCompleted()가 true가 되고, completedAt이 설정되어야 함
    state["skillAnalysisCompleted"] = true // 내부 상태 직접 조작
    state["moveToStep"](OnboardingStep.COMPLETED) // 내부 메서드 호출

    // Then
    expect(state.isCompleted()).toBe(true)
    expect(state.completedAt).toBeInstanceOf(Date)
  })
})
