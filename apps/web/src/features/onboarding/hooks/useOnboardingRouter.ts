import { useRouter } from "next/navigation"

import { OnboardingStateResponseDto } from "@repo/api-client/src"

import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { onboardingApiService } from "@/shared/api/services/onboarding-api-service"
import { ONBOARDING_STEPS } from "@/shared/types/basic-types"

// 액션 타입 정의
export type OnboardingAction = "BECOME_MENTOR" | "VERIFY_BAEKJOON" | "CONTINUE_ONBOARDING"

// [Pure Function] 상태와 목적에 따른 다음 경로 계산
export const getNextOnboardingRoute = (
  state: OnboardingStateResponseDto | undefined,
  action: OnboardingAction,
): string | null => {
  if (!state) return null

  // 기본 경로 prefix
  const basePath = "/onboarding"

  switch (action) {
    case "BECOME_MENTOR":
      // 이미 멘토 프로필이 있으면 이동 불필요
      if (state.mentorProfileCreated) return null

      // 백준 인증이 안 되어 있으면 -> 백준 인증 단계로
      if (!state.baekjoonVerified) {
        return `${basePath}?step=${ONBOARDING_STEPS.BAEKJOON_VERIFY}`
      }
      // 백준 인증은 됐는데 멘토 프로필이 없으면 -> 멘토 설정 단계로
      return `${basePath}?step=${ONBOARDING_STEPS.MENTOR_SETUP}`

    case "VERIFY_BAEKJOON":
      if (state.baekjoonVerified) return null
      return `${basePath}?step=${ONBOARDING_STEPS.BAEKJOON_VERIFY}`

    case "CONTINUE_ONBOARDING":
      if (state.isCompleted) return null
      // 현재 진행 중인 단계로 이동 (서버가 알려주는 currentStep 활용)
      // * currentStep이 number 타입이므로 매핑 필요할 수 있음
      return `${basePath}?step=${state.currentStep}`

    default:
      return null
  }
}

/**
 * 온보딩 라우팅 훅
 * - 상태 조회와 라우팅 로직을 결합한 Smart Hook
 */
export const useOnboardingRouter = () => {
  const router = useRouter()

  const { data: onboardingState, isLoading } = useQuery({
    queryKey: ["onboarding", "state"],
    queryFn: async () => {
      const response = await onboardingApiService.getOnboardingState()
      return response.data
    },
    staleTime: 1000 * 60 * 5, // 5분 캐시
  })

  /**
   * 액션 수행 함수
   * @param action 수행할 액션 (예: 'BECOME_MENTOR')
   */
  const routeToAction = (action: OnboardingAction) => {
    if (isLoading) {
      toast.info("정보를 불러오는 중입니다...")
      return
    }

    if (!onboardingState) {
      toast.error("온보딩 정보를 불러올 수 없습니다.")
      return
    }

    const nextPath = getNextOnboardingRoute(onboardingState, action)

    if (nextPath) {
      router.push(nextPath)
    } else {
      // 경로가 null이면 이미 완료된 상태 등임
      handleAlreadyCompleted(action)
    }
  }

  const handleAlreadyCompleted = (action: OnboardingAction) => {
    switch (action) {
      case "BECOME_MENTOR":
        toast.info("이미 멘토 등록이 완료되었습니다.")
        break
      case "VERIFY_BAEKJOON":
        toast.info("이미 백준 인증이 완료되었습니다.")
        break
      case "CONTINUE_ONBOARDING":
        toast.info("이미 온보딩이 완료되었습니다.")
        break
    }
  }

  return {
    routeToAction,
    isLoading,
    onboardingState,
  }
}
