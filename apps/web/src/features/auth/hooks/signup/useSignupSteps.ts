import type { SignupData } from "@/features/auth/lib/validations/auth-rules"

import { useFormStepFlow } from "@/shared/hooks/useFormStepFlow"
import { SIGNUP_STEP_ORDER, SignupStep } from "@/shared/types/basic-types"

export function useSignupSteps() {
  const {
    currentStep,
    currentStepIndex,
    flowData: signupData,
    setFlowData: setSignupData,
    goToStep,
    updateAndGoNext,
    goBack,
    goNext,
    isStepCompleted,
    totalSteps,
  } = useFormStepFlow<SignupData, SignupStep>({
    path: "/auth/signup",
    stepOrder: SIGNUP_STEP_ORDER,
  })

  return {
    currentStep,
    currentStepIndex,
    signupData,
    setSignupData,
    goToStep,
    updateAndGoNext,
    goBack,
    goNext,
    isStepCompleted,
    totalSteps,
  }
}
