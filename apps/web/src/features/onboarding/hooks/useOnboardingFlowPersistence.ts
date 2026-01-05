import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from "react"

import type { OnboardingData } from "@/features/onboarding/lib/validations/onboarding-rules"

const STORAGE_KEY = "cotept:onboarding-flow"

interface PersistenceOptions {
  onboardingData: OnboardingData
  setOnboardingData: Dispatch<SetStateAction<OnboardingData>>
}

/**
 * 온보딩 플로우 상태를 로컬 스토리지에 저장/복구하는 훅
 */
export function useOnboardingFlowPersistence({ onboardingData, setOnboardingData }: PersistenceOptions) {
  const isHydratedRef = useRef(false)

  // 최초 한 번 저장된 데이터 복구
  useEffect(() => {
    if (typeof window === "undefined" || isHydratedRef.current) return

    try {
      const cached = window.localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached) as OnboardingData
        setOnboardingData((prev) => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.warn("온보딩 진행 상태 복구 실패:", error)
    } finally {
      isHydratedRef.current = true
    }
  }, [setOnboardingData])

  // 진행 상태 변경 시 저장
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(onboardingData ?? {}))
    } catch (error) {
      console.warn("온보딩 진행 상태 저장 실패:", error)
    }
  }, [onboardingData])

  const clearPersistedFlow = useCallback(() => {
    if (typeof window === "undefined") return
    window.localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { clearPersistedFlow }
}
