import { type UseMutationOptions } from "@tanstack/react-query"

import { onboardingKeys } from "./queryKey"

import type {
  BaekjoonVerificationResultResponseWrapper,
  BooleanResponse,
  MentorProfileResponse,
  OnboardingApiCompleteBaekjoonVerificationRequest,
  OnboardingApiCompleteOnboardingRequest,
  OnboardingApiCreateBasicProfileRequest,
  OnboardingApiCreateMentorProfileOnboardingRequest,
  OnboardingApiStartBaekjoonVerificationRequest,
  UserProfileResponse,
  VerificationStatusResponseWrapper,
} from "@repo/api-client"

import { ApiError } from "@/shared/api/core/types"
import { onboardingApiService } from "@/shared/api/services/onboarding-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"

// 기본 프로필 생성
export function useCreateBasicProfile(
  options?: UseMutationOptions<UserProfileResponse, ApiError, OnboardingApiCreateBasicProfileRequest>,
) {
  return useBaseMutation<UserProfileResponse, ApiError, OnboardingApiCreateBasicProfileRequest>({
    mutationFn: (data) => onboardingApiService.createBasicProfile({ ...data }),
    invalidateKeys: [onboardingKeys.profile().queryKey],
    successMessage: "기본 프로필이 생성되었습니다.",
    ...options,
  })
}

// 백준 인증 시작
export function useStartBaekjoonVerification(
  options?: UseMutationOptions<
    VerificationStatusResponseWrapper,
    ApiError,
    OnboardingApiStartBaekjoonVerificationRequest
  >,
) {
  return useBaseMutation<VerificationStatusResponseWrapper, ApiError, OnboardingApiStartBaekjoonVerificationRequest>({
    mutationFn: (data) => onboardingApiService.startBaekjoonVerification({ ...data }),
    invalidateKeys: [onboardingKeys.baekjoonVerification().queryKey],
    successMessage: "백준 인증이 시작되었습니다.",
    ...options,
  })
}

// 백준 인증 완료
export function useCompleteBaekjoonVerification(
  options?: UseMutationOptions<
    BaekjoonVerificationResultResponseWrapper,
    ApiError,
    OnboardingApiCompleteBaekjoonVerificationRequest
  >,
) {
  return useBaseMutation<
    BaekjoonVerificationResultResponseWrapper,
    ApiError,
    OnboardingApiCompleteBaekjoonVerificationRequest
  >({
    mutationFn: (data) => onboardingApiService.completeBaekjoonVerification({ ...data }),
    invalidateKeys: [onboardingKeys.baekjoonVerification().queryKey, onboardingKeys.skillAnalysis().queryKey],
    successMessage: "백준 인증이 완료되었습니다.",
    ...options,
  })
}

// 멘토 프로필 생성 (온보딩 과정)
export function useCreateMentorProfileOnboarding(
  options?: UseMutationOptions<MentorProfileResponse, ApiError, OnboardingApiCreateMentorProfileOnboardingRequest>,
) {
  return useBaseMutation<MentorProfileResponse, ApiError, OnboardingApiCreateMentorProfileOnboardingRequest>({
    mutationFn: (data) => onboardingApiService.createMentorProfileOnboarding({ ...data }),
    invalidateKeys: [onboardingKeys.profile().queryKey, onboardingKeys.mentorEligibility().queryKey],
    successMessage: "멘토 프로필이 생성되었습니다.",
    ...options,
  })
}

// 온보딩 완료
export function useCompleteOnboarding(
  options?: UseMutationOptions<BooleanResponse, ApiError, OnboardingApiCompleteOnboardingRequest>,
) {
  return useBaseMutation<BooleanResponse, ApiError, OnboardingApiCompleteOnboardingRequest>({
    mutationFn: (data) => onboardingApiService.completeOnboarding({ ...data }),
    invalidateKeys: [
      onboardingKeys.all.queryKey, // 모든 온보딩 쿼리 무효화
      ["users"], // 사용자 관련 쿼리도 무효화 (온보딩 완료 시 사용자 상태 변경)
      ["auth"],
    ],
    successMessage: "온보딩이 완료되었습니다! 코테피티에 오신 것을 환영합니다.",
    ...options,
  })
}
