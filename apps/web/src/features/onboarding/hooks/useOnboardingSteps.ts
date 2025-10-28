import type { OnboardingData } from "@/features/onboarding/lib/validations/onboarding-rules"

import { ONBOARDING_STEP_ORDER, OnboardingStep } from "@/shared/constants/basic-types"
import { useFormStepFlow } from "@/shared/hooks/useFormStepFlow"

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
  }
}
