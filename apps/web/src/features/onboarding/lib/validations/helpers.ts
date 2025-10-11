import { extraEnums } from "@repo/api-client/src"

import { useBaekjoonStore } from "@/features/baekjoon/store"
import { useMentorStore } from "@/features/mentor/store"
import { useOnboardingFlowStore } from "@/features/onboarding/store"
import { useProfileStore } from "@/features/user-profile/store"
import { ONBOARDING_STEPS } from "@/shared/constants/basic-types"

/**
 * 모든 온보딩 스토어 초기화
 *
 * ★ Insight:
 * - 온보딩 완료 후 또는 재시작 시 사용
 * - 각 스토어의 reset() 메서드 호출
 */
export function resetAllOnboardingStores() {
  useOnboardingFlowStore.getState().reset()
  useProfileStore.getState().reset()
  useBaekjoonStore.getState().reset()
  useMentorStore.getState().reset()
}

/**
 * 멘토 자격 조건 확인
 *
 * ★ Insight:
 * - 백준 티어 플래티넘 3 이상 (solved.ac tier 16+)
 * - 멘토 온보딩 진입 조건
 */
export function checkMentorEligibility(): boolean {
  const tier = useBaekjoonStore.getState().profile.tier
  if (!tier) return false

  // 플래티넘 3 이상인지 확인 (문자열 티어명 또는 숫자 티어 값)
  const platinumTiers = [
    extraEnums.TierName.PlatinumIII,
    extraEnums.TierName.PlatinumII,
    extraEnums.TierName.PlatinumI,
    extraEnums.TierName.RubyV,
    extraEnums.TierName.RubyIV,
    extraEnums.TierName.RubyIII,
    extraEnums.TierName.RubyII,
    extraEnums.TierName.RubyI,
    extraEnums.TierName.Master,
  ]

  // 문자열 티어명으로 확인
  if (platinumTiers.some((t) => tier.toString().includes(t))) {
    return true
  }

  // 숫자 티어 값으로 확인 (16+)
  const tierNum = typeof tier === "number" ? tier : parseInt(tier, 10)
  if (!isNaN(tierNum) && tierNum >= 16) {
    return true
  }

  return false
}

/**
 * 온보딩 완료 여부 확인
 */
export function isOnboardingComplete(): boolean {
  const flowState = useOnboardingFlowStore.getState()
  return flowState.currentStep === ONBOARDING_STEPS.COMPLETE
}
