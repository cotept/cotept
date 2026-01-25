import { useEffect } from "react"

import type { OnboardingData } from "@/features/onboarding/lib/validations/onboarding-rules"

import { ONBOARDING_STEPS, type OnboardingStep } from "@/shared/types/basic-types"

interface StepGuardOptions {
  currentStep: OnboardingStep
  onboardingData: OnboardingData
  goToStep: (step: OnboardingStep) => void
}

/**
 * 온보딩 스텝 진행 순서 가드
 *
 * 각 스텝 진입 시 필요한 데이터가 없으면 자동으로 이전 스텝으로 이동시킵니다.
 */
export function useOnboardingStepGuard({ currentStep, onboardingData, goToStep }: StepGuardOptions) {
  useEffect(() => {
    if (currentStep === ONBOARDING_STEPS.BAEKJOON_VERIFY && !onboardingData.profile) {
      goToStep(ONBOARDING_STEPS.PROFILE_SETUP)
    }

    if (currentStep === ONBOARDING_STEPS.MENTOR_SETUP) {
      if (!onboardingData.profile) {
        goToStep(ONBOARDING_STEPS.PROFILE_SETUP)
        return
      }

      if (!onboardingData.baekjoonVerification) {
        goToStep(ONBOARDING_STEPS.BAEKJOON_VERIFY)
      }
    }
  }, [currentStep, onboardingData, goToStep])
}
