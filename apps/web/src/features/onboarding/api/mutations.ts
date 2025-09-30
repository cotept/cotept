import { type UseMutationOptions, useQueryClient } from "@tanstack/react-query"

import { onboardingKeys, onboardingQueryUtils } from "./queryKey"

import type {
  BooleanResponse,
  MentorProfileResponse,
  OnboardingApiCompleteBaekjoonVerificationRequest,
  OnboardingApiCompleteOnboardingRequest,
  OnboardingApiCreateBasicProfileRequest,
  OnboardingApiCreateMentorProfileOnboardingRequest,
  OnboardingApiStartBaekjoonVerificationRequest,
  UserProfileResponse,
  VerificationResultResponseWrapper,
  VerificationStatusResponseWrapper,
} from "@repo/api-client"

import { ApiError } from "@/shared/api/core/types"
import { onboardingApiService } from "@/shared/api/services/onboarding-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"

// 기본 프로필 생성
export function useCreateBasicProfile(
  options?: Pick<
    UseMutationOptions<UserProfileResponse, ApiError, OnboardingApiCreateBasicProfileRequest>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<UserProfileResponse, ApiError, OnboardingApiCreateBasicProfileRequest>({
    mutationFn: (data) => onboardingApiService.createBasicProfile({ ...data }),
    queryKey: onboardingKeys.profile().queryKey,
    successMessage: "기본 프로필이 생성되었습니다.",
    onSuccess: async (response, variables, context) => {
      // 프로필 쿼리 무효화
      onboardingQueryUtils.invalidateProfile(queryClient)

      // 사용자 호출 콜백 실행
      options?.onSuccess?.(response, variables, context)
    },
    ...options,
  })
}

// 백준 인증 시작
export function useStartBaekjoonVerification(
  options?: Pick<
    UseMutationOptions<VerificationStatusResponseWrapper, ApiError, OnboardingApiStartBaekjoonVerificationRequest>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<VerificationStatusResponseWrapper, ApiError, OnboardingApiStartBaekjoonVerificationRequest>({
    mutationFn: (data) => onboardingApiService.startBaekjoonVerification({ ...data }),
    queryKey: onboardingKeys.baekjoonVerification().queryKey,
    successMessage: "백준 인증이 시작되었습니다.",
    onSuccess: async (response, variables, context) => {
      // 백준 인증 관련 쿼리 무효화
      onboardingQueryUtils.invalidateBaekjoonVerification(queryClient)

      // 사용자 호출 콜백 실행
      options?.onSuccess?.(response, variables, context)
    },
    ...options,
  })
}

// 백준 인증 완료
export function useCompleteBaekjoonVerification(
  options?: Pick<
    UseMutationOptions<VerificationResultResponseWrapper, ApiError, OnboardingApiCompleteBaekjoonVerificationRequest>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<VerificationResultResponseWrapper, ApiError, OnboardingApiCompleteBaekjoonVerificationRequest>(
    {
      mutationFn: (data) => onboardingApiService.completeBaekjoonVerification({ ...data }),
      queryKey: onboardingKeys.baekjoonVerification().queryKey,
      successMessage: "백준 인증이 완료되었습니다.",
      onSuccess: async (response, variables, context) => {
        // 백준 인증 및 실력 분석 쿼리 무효화
        onboardingQueryUtils.invalidateBaekjoonVerification(queryClient)
        onboardingQueryUtils.invalidateSkillAnalysis(queryClient)

        // 사용자 호출 콜백 실행
        options?.onSuccess?.(response, variables, context)
      },
      ...options,
    },
  )
}

// 멘토 프로필 생성 (온보딩 과정)
export function useCreateMentorProfileOnboarding(
  options?: Pick<
    UseMutationOptions<MentorProfileResponse, ApiError, OnboardingApiCreateMentorProfileOnboardingRequest>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<MentorProfileResponse, ApiError, OnboardingApiCreateMentorProfileOnboardingRequest>({
    mutationFn: (data) => onboardingApiService.createMentorProfileOnboarding({ ...data }),
    queryKey: onboardingKeys.profile().queryKey,
    successMessage: "멘토 프로필이 생성되었습니다.",
    onSuccess: async (response, variables, context) => {
      // 온보딩 관련 쿼리들 무효화
      onboardingQueryUtils.invalidateProfile(queryClient)
      onboardingQueryUtils.invalidateMentorEligibility(queryClient)

      // 사용자 호출 콜백 실행
      options?.onSuccess?.(response, variables, context)
    },
    ...options,
  })
}

// 온보딩 완료
export function useCompleteOnboarding(
  options?: Pick<
    UseMutationOptions<BooleanResponse, ApiError, OnboardingApiCompleteOnboardingRequest>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<BooleanResponse, ApiError, OnboardingApiCompleteOnboardingRequest>({
    mutationFn: (data) => onboardingApiService.completeOnboarding({ ...data }),
    queryKey: onboardingKeys.completion().queryKey,
    successMessage: "온보딩이 완료되었습니다! 코테피티에 오신 것을 환영합니다.",
    onSuccess: async (response, variables, context) => {
      // 모든 온보딩 관련 쿼리 무효화
      onboardingQueryUtils.invalidateAll(queryClient)

      // 사용자 관련 쿼리도 무효화 (온보딩 완료 시 사용자 상태 변경)
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["auth"] })

      // 사용자 호출 콜백 실행
      options?.onSuccess?.(response, variables, context)
    },
    ...options,
  })
}
