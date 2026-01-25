import { createQueryKeys } from "@lukemorales/query-key-factory"
import { QueryClient } from "@tanstack/react-query"

// 온보딩 관련 쿼리 키
export const onboardingKeys = createQueryKeys("onboarding", {
  all: null,
  profile: () => ["profile"],
  baekjoonVerification: () => ["baekjoon", "verification"],
  baekjoonVerificationStatus: (userId: string) => ["baekjoon", "verification", "status", userId],
  skillAnalysis: () => ["skills", "analysis"],
  mentorEligibility: () => ["mentor", "eligibility"],
  mentorTags: () => ["mentor", "tags"],
  completion: () => ["completion"],
})

// 온보딩 도메인 쿼리 유틸리티
export const onboardingQueryUtils = {
  getKeys: () => onboardingKeys,

  // 모든 온보딩 쿼리 무효화
  invalidateAll: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: onboardingKeys.all.queryKey })
  },

  // 프로필 쿼리 무효화
  invalidateProfile: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: onboardingKeys.profile().queryKey })
  },

  // 백준 인증 쿼리 무효화
  invalidateBaekjoonVerification: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: onboardingKeys.baekjoonVerification().queryKey })
  },

  // 백준 인증 상태 쿼리 무효화
  invalidateBaekjoonVerificationStatus: (queryClient: QueryClient, userId?: string) => {
    if (userId) {
      return queryClient.invalidateQueries({
        queryKey: onboardingKeys.baekjoonVerificationStatus(userId).queryKey,
      })
    }
    return queryClient.invalidateQueries({ queryKey: onboardingKeys.baekjoonVerification().queryKey })
  },

  // 실력 분석 쿼리 무효화
  invalidateSkillAnalysis: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: onboardingKeys.skillAnalysis().queryKey })
  },

  // 멘토 자격 요건 쿼리 무효화
  invalidateMentorEligibility: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: onboardingKeys.mentorEligibility().queryKey })
  },

  // 멘토 태그 쿼리 무효화
  invalidateMentorTags: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: onboardingKeys.mentorTags().queryKey })
  },

  // 온보딩 완료 쿼리 무효화
  invalidateCompletion: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: onboardingKeys.completion().queryKey })
  },

  // 온보딩 과정 전체 무효화 (단계별 진행 후)
  invalidateOnboardingFlow: (queryClient: QueryClient, userId?: string) => {
    onboardingQueryUtils.invalidateProfile(queryClient)
    onboardingQueryUtils.invalidateSkillAnalysis(queryClient)
    if (userId) {
      onboardingQueryUtils.invalidateBaekjoonVerificationStatus(queryClient, userId)
    }
    onboardingQueryUtils.invalidateMentorEligibility(queryClient)
  },

  // 프로필 데이터 설정
  setProfileData: (queryClient: QueryClient, data: any) => {
    queryClient.setQueryData(onboardingKeys.profile().queryKey, { data, success: true })
  },

  // 백준 인증 상태 데이터 설정
  setBaekjoonVerificationStatus: (queryClient: QueryClient, userId: string, data: any) => {
    queryClient.setQueryData(onboardingKeys.baekjoonVerificationStatus(userId).queryKey, { data, success: true })
  },
}

// 타입 안전한 쿼리 키 접근
export type OnboardingQueryKeys = typeof onboardingKeys
