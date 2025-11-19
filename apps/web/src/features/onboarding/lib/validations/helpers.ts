import { extraEnums, VerificationStatusType as BaekjoonVerificationStatus } from "@repo/api-client/src"
import { ValidationCheck } from "@repo/shared/components/validation-indicator"
import { createValidationChecks, validateField } from "@repo/shared/src/rules/rule-helper"

import { BaekjoonVerifyStartFormRules } from "./onboarding-rules"

import { useBaekjoonStore } from "@/features/baekjoon/store"
import { useMentorStore } from "@/features/mentor/store"
import { useOnboardingFlowStore } from "@/features/onboarding/store"
import { useProfileStore } from "@/features/user-profile/store"
import { ONBOARDING_STEPS } from "@/shared/types/basic-types"

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

// ============================================================================
// 백준 인증 헬퍼 함수들
// ============================================================================

/**
 * 백준 ID 검증 체크 생성
 *
 * ★ Insight:
 * - ValidationIndicator 컴포넌트와 직접 연동
 * - Zod 스키마 기반 자동 검증
 * - 각 검증 규칙을 사용자 친화적으로 표시
 *
 * @param handle 백준 ID
 * @returns ValidationCheck[] - ValidationIndicator에 전달할 검증 배열
 *
 * @example
 * const checks = createBaekjoonValidationChecks("solved_user")
 * <ValidationIndicator checks={checks} />
 */
export function createBaekjoonValidationChecks(handle: string): ValidationCheck[] {
  const fieldValidation = validateField(BaekjoonVerifyStartFormRules.shape.baekjoonHandle, handle)

  return createValidationChecks(fieldValidation, [
    {
      id: "length",
      label: "3자 이상 20자 이하",
      isIssuePresent: (issues) => issues.some((i) => i.code === "too_small" || i.code === "too_big"),
    },
    {
      id: "chars",
      label: "영문, 숫자, 언더스코어(_)만 사용",
      isIssuePresent: (issues) => issues.some((i) => i.code === "invalid_string"),
    },
  ])
}

/**
 * solved.ac 프로필 설정 URL 생성
 *
 * ★ Insight:
 * - solved.ac 프로필 설정 페이지로 바로 이동
 * - 사용자가 프로필 이름에 인증 문자열을 입력하도록 안내
 *
 * @returns solved.ac 프로필 설정 URL
 *
 * @example
 * const url = getSolvedAcProfileUrl()
 * window.open(url, '_blank')
 */
export function getSolvedAcProfileUrl(): string {
  return "https://solved.ac/settings/profile"
}

/**
 * 백준 인증 상태별 메시지 반환
 *
 * ★ Insight:
 * - 인증 진행 상태에 따른 사용자 안내 메시지
 * - UI에서 상태 표시 시 활용
 * - API 응답의 VerificationStatusType enum 사용
 *
 * @param status 인증 상태 (BaekjoonVerificationStatus enum)
 * @returns 상태별 안내 메시지 객체
 *
 * @example
 * const message = getBaekjoonVerificationMessage(BaekjoonVerificationStatus.PENDING)
 * // => { title: "인증 대기 중", description: "...", variant: "default" }
 */
export function getBaekjoonVerificationMessage(status: BaekjoonVerificationStatus): {
  title: string
  description: string
  variant: "default" | "success" | "warning" | "error"
} {
  switch (status) {
    case BaekjoonVerificationStatus.PENDING:
      return {
        title: "인증 대기 중",
        description: "백준 아이디를 입력하고 인증을 시작해주세요.",
        variant: "default",
      }
    case BaekjoonVerificationStatus.IN_PROGRESS:
      return {
        title: "인증 진행 중",
        description: "solved.ac 프로필에 인증 문자열을 입력하고 '인증하기'를 눌러주세요.",
        variant: "warning",
      }
    case BaekjoonVerificationStatus.COMPLETED:
      return {
        title: "인증 완료",
        description: "백준 아이디 인증이 완료되었습니다!",
        variant: "success",
      }
    case BaekjoonVerificationStatus.FAILED:
      return {
        title: "인증 실패",
        description: "인증에 실패했습니다. 다시 시도해주세요.",
        variant: "error",
      }
    case BaekjoonVerificationStatus.EXPIRED:
      return {
        title: "인증 만료",
        description: "인증 시간이 만료되었습니다. 다시 시도해주세요.",
        variant: "error",
      }
    default:
      return {
        title: "알 수 없는 상태",
        description: "인증 상태를 확인할 수 없습니다.",
        variant: "default",
      }
  }
}

/**
 * 백준 ID 인증 건너뛰기 가능 여부 확인
 *
 * ★ Insight:
 * - 백준 인증은 선택 사항 (멘티는 건너뛰기 가능)
 * - 멘토는 반드시 인증 필요 (자격 조건 확인용)
 *
 * @returns 건너뛰기 가능 여부
 *
 * TODO: 멘토/멘티 구분 로직 추가 필요
 * - 현재는 모든 사용자가 건너뛰기 가능
 * - 향후 사용자 역할(role) 기반 판단 로직 추가
 */
export function canSkipBaekjoonVerification(): boolean {
  // TODO: 멘토/멘티 구분 로직 추가 필요
  // 현재는 모든 사용자가 건너뛰기 가능
  return true
}
