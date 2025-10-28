// hooks/useSignupSteps.ts
import { useCallback, useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import type { SignupData } from "@/features/auth/lib/validations/auth-rules"

import { SIGNUP_STEPS, type SignupStep } from "@/shared/constants/basic-types"

export function useSignupSteps(initialStep: SignupStep = SIGNUP_STEPS.TERMS_AGREEMENT) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL에서 현재 step 읽기
  const currentStep = (searchParams.get("step") as SignupStep) || initialStep

  // 전체 signup 데이터 상태
  const [signupData, setSignupData] = useState<SignupData>({})

  /**
   * step을 변경하는 공통 함수
   */
  const goToStep = useCallback(
    (step: SignupStep) => {
      router.push(`/auth/signup?step=${step}`)
    },
    [router],
  )

  /**
   * 데이터를 업데이트하고 다음 step으로 이동
   */
  const updateAndGoNext = useCallback(
    <T extends keyof SignupData>(key: T, data: SignupData[T], nextStep: SignupStep) => {
      setSignupData((prev) => ({ ...prev, [key]: data }))
      goToStep(nextStep)
    },
    [goToStep],
  )

  /**
   * 현재 step의 인덱스
   */
  const currentStepIndex = Object.values(SIGNUP_STEPS).indexOf(currentStep)

  /**
   * 이전 step으로 이동
   */
  const goBack = useCallback(() => {
    const prevStepIndex = currentStepIndex - 1
    if (prevStepIndex >= 0) {
      const prevStep = Object.values(SIGNUP_STEPS)[prevStepIndex]
      goToStep(prevStep)
    }
  }, [currentStepIndex, goToStep])

  /**
   * 다음 step으로 이동
   */
  const goNext = useCallback(() => {
    const nextStepIndex = currentStepIndex + 1
    if (nextStepIndex < Object.values(SIGNUP_STEPS).length) {
      const nextStep = Object.values(SIGNUP_STEPS)[nextStepIndex]
      goToStep(nextStep)
    }
  }, [currentStepIndex, goToStep])

  /**
   * 특정 step 완료 여부 확인
   */
  const isStepCompleted = useCallback(
    (step: SignupStep) => {
      const stepIndex = Object.values(SIGNUP_STEPS).indexOf(step)
      return currentStepIndex > stepIndex
    },
    [currentStepIndex],
  )

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
    totalSteps: Object.values(SIGNUP_STEPS).length,
  }
}
