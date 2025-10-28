// hooks/useOnboardingSteps.ts
import { useCallback, useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import type { OnboardingData } from "@/features/onboarding/lib/validations/onboarding-rules"

import { ONBOARDING_STEP_ORDER, ONBOARDING_STEPS, type OnboardingStep } from "@/shared/constants/basic-types"

export function useOnboardingSteps(initialStep: OnboardingStep = ONBOARDING_STEPS.PROFILE_SETUP) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL에서 현재 step 읽기
  const currentStep = (searchParams.get("step") as OnboardingStep) || initialStep

  // 전체 onboarding 데이터 상태
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})

  /**
   * step을 변경하는 공통 함수
   */
  const goToStep = useCallback(
    (step: OnboardingStep) => {
      router.push(`/onboarding?step=${step}`)
    },
    [router],
  )

  /**
   * 데이터를 업데이트하고 다음 step으로 이동
   */
  const updateAndGoNext = useCallback(
    <T extends keyof OnboardingData>(key: T, data: OnboardingData[T], nextStep: OnboardingStep) => {
      setOnboardingData((prev) => ({ ...prev, [key]: data }))
      goToStep(nextStep)
    },
    [goToStep],
  )

  /**
   * 현재 step의 인덱스
   */
  const currentStepIndex = ONBOARDING_STEP_ORDER.indexOf(currentStep)

  /**
   * 이전 step으로 이동
   */
  const goBack = useCallback(() => {
    const prevStepIndex = currentStepIndex - 1
    if (prevStepIndex >= 0) {
      const prevStep = ONBOARDING_STEP_ORDER[prevStepIndex]
      goToStep(prevStep)
    }
  }, [currentStepIndex, goToStep])

  /**
   * 다음 step으로 이동
   */
  const goNext = useCallback(() => {
    const nextStepIndex = currentStepIndex + 1
    if (nextStepIndex < ONBOARDING_STEP_ORDER.length) {
      const nextStep = ONBOARDING_STEP_ORDER[nextStepIndex]
      goToStep(nextStep)
    }
  }, [currentStepIndex, goToStep])

  /**
   * 특정 step 완료 여부 확인
   */
  const isStepCompleted = useCallback(
    (step: OnboardingStep) => {
      const stepIndex = ONBOARDING_STEP_ORDER.indexOf(step)
      return currentStepIndex > stepIndex
    },
    [currentStepIndex],
  )

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
    totalSteps: ONBOARDING_STEP_ORDER.length,
  }
}
