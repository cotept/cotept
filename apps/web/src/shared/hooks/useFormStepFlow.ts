import { useCallback, useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"

/**
 * @fileoverview useFormStepFlow - 여러 단계로 구성된 폼 플로우를 위한 제네릭 훅
 * @description 회원가입, 온보딩 등 URL 검색 파라미터로 제어되는 다단계 플로우의 공통 로직을 추상화합니다.
 */

/**
 * 스텝 플로우를 위한 설정 객체
 * @template TStep - 가능한 모든 스텝 식별자 문자열의 유니온 타입
 */
interface StepFlowConfig<TStep extends string> {
  /** 플로우의 기본 경로 (예: '/signup') */
  path: string
  /** 스텝의 순서를 정의하는 배열 */
  stepOrder: readonly TStep[]
}

/**
 * URL 검색 파라미터로 제어되는 다단계 플로우를 관리하는 제네릭 훅
 *
 * @template TData - 여러 스텝에 걸쳐 누적되는 데이터 객체의 타입
 * @template TStep - 가능한 모든 스텝 식별자의 유니온 타입
 * @param {StepFlowConfig<TStep>} config - 스텝 플로우를 위한 설정 객체
 * @returns 플로우 관리를 위한 상태와 핸들러가 포함된 객체
 */
export function useFormStepFlow<TData extends object, TStep extends string>(config: StepFlowConfig<TStep>) {
  const { path, stepOrder } = config
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL에서 현재 스텝을 읽어오고, 없으면 stepOrder의 첫 번째 스텝으로 기본 설정
  const currentStep = (searchParams.get("step") as TStep) || stepOrder[0]

  // 모든 스텝에서 누적된 데이터를 보관하는 상태
  const [flowData, setFlowData] = useState<TData>({} as TData)

  /**
   * URL을 업데이트하여 특정 스텝으로 이동하는 함수
   */
  const goToStep = useCallback(
    (step: TStep) => {
      router.push(`${path}?step=${step}`)
    },
    [router, path],
  )

  /**
   * 완료된 스텝의 데이터로 상태를 업데이트하고 다음 스텝으로 이동하는 함수
   */
  const updateAndGoNext = useCallback(
    <T extends keyof TData>(key: T, data: TData[T], nextStep: TStep) => {
      setFlowData((prev) => ({ ...prev, [key]: data }))
      goToStep(nextStep)
    },
    [goToStep],
  )

  // 정의된 순서에서 현재 스텝의 인덱스를 찾음
  const currentStepIndex = stepOrder.indexOf(currentStep)

  /**
   * 순서상 이전 스텝으로 이동하는 함수
   */
  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevStep = stepOrder[currentStepIndex - 1]
      goToStep(prevStep)
    }
  }, [currentStepIndex, goToStep, stepOrder])

  /**
   * 순서상 다음 스텝으로 이동하는 함수
   */
  const goNext = useCallback(() => {
    if (currentStepIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentStepIndex + 1]
      goToStep(nextStep)
    }
  }, [currentStepIndex, goToStep, stepOrder])

  /**
   * 특정 스텝이 완료되었는지 (즉, 현재 스텝보다 이전에 있는지) 확인하는 함수
   */
  const isStepCompleted = useCallback(
    (step: TStep) => {
      const stepIndex = stepOrder.indexOf(step)
      return currentStepIndex > stepIndex
    },
    [currentStepIndex, stepOrder],
  )

  return {
    currentStep,
    currentStepIndex,
    flowData,
    setFlowData,
    goToStep,
    updateAndGoNext,
    goBack,
    goNext,
    isStepCompleted,
    totalSteps: stepOrder.length,
  }
}
