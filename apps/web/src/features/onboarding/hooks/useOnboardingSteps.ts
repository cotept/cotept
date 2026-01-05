import { useCallback } from "react"

import type { OnboardingData } from "@/features/onboarding/lib/validations/onboarding-rules"

import { useFormStepFlow } from "@/shared/hooks/useFormStepFlow"
import { ONBOARDING_STEP_ORDER, ONBOARDING_STEPS, OnboardingStep } from "@/shared/types/basic-types"

/**
 * 온보딩 스텝 관리 훅
 *
 * ★ Insight:
 * - 멘토 전환 제안 로직 포함
 * - isMentorEligible: Platinum III+ 여부
 * - wantsToBeMentor: 사용자의 멘토 전환 수락 여부
 * - handleMentorProposal: 멘토 전환 제안에 대한 사용자 응답 처리
 */
export function useOnboardingSteps() {
  const {
    currentStep,
    currentStepIndex,
    flowData: onboardingData,
    setFlowData: setOnboardingData,
    goToStep,
    updateAndGoNext,
    goBack,
    goNext,
    isStepCompleted,
    totalSteps,
  } = useFormStepFlow<OnboardingData, OnboardingStep>({
    path: "/onboarding",
    stepOrder: ONBOARDING_STEP_ORDER,
  })

  /**
   * 멘토 자격 여부 설정
   */
  const setMentorEligible = useCallback(
    (eligible: boolean) => {
      setOnboardingData((prev) => ({
        ...prev,
        isMentorEligible: eligible,
      }))
    },
    [setOnboardingData],
  )

  /**
   * 멘토 전환 제안 응답 처리
   *
   * @param accept - true: 멘토로 전환, false: 멘티로 유지
   */
  const handleMentorProposal = useCallback(
    (accept: boolean) => {
      setOnboardingData((prev) => ({
        ...prev,
        wantsToBeMentor: accept,
      }))

      if (accept) {
        // 멘토 전환 수락 → MENTOR_SETUP 단계로 이동
        goToStep(ONBOARDING_STEPS.MENTOR_SETUP)
      } else {
        // 멘토 전환 거부 → 온보딩 완료
        goToStep(ONBOARDING_STEPS.COMPLETE)
      }
    },
    [setOnboardingData, goToStep],
  )

  /**
   * 멘토 온보딩 완료 후 처리
   */
  const completeMentorSetup = useCallback(() => {
    goToStep(ONBOARDING_STEPS.COMPLETE)
  }, [goToStep])

  return {
    currentStep,
    currentStepIndex,
    onboardingData,
    setOnboardingData,
    goToStep,
    updateAndGoNext,
    goBack,
    goNext,
    isStepCompleted,
    totalSteps,
    // 멘토 전환 관련
    isMentorEligible: onboardingData.isMentorEligible,
    wantsToBeMentor: onboardingData.wantsToBeMentor,
    setMentorEligible,
    handleMentorProposal,
    completeMentorSetup,
  }
}
