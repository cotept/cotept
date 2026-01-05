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
import { MutationOptions } from "@/shared/types/basic-types"
import { createChainedCallbacks } from "@/shared/utils"

// 기본 프로필 생성
export function useCreateBasicProfile({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<UserProfileResponse, OnboardingApiCreateBasicProfileRequest>) {
  return useBaseMutation<UserProfileResponse, ApiError, OnboardingApiCreateBasicProfileRequest>({
    ...mutationOptions,
    mutationFn: (data) => onboardingApiService.createBasicProfile({ ...data }),
    invalidateKeys: [onboardingKeys.profile().queryKey],
    ...createChainedCallbacks({ callbacks: { onSuccess, onError } }),
  })
}

// 백준 인증 시작
export function useStartBaekjoonVerification({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<VerificationStatusResponseWrapper, OnboardingApiStartBaekjoonVerificationRequest>) {
  return useBaseMutation<VerificationStatusResponseWrapper, ApiError, OnboardingApiStartBaekjoonVerificationRequest>({
    ...mutationOptions,
    mutationFn: (data) => onboardingApiService.startBaekjoonVerification({ ...data }),
    invalidateKeys: [onboardingKeys.baekjoonVerification().queryKey],
    ...createChainedCallbacks({ callbacks: { onSuccess, onError } }),
  })
}

// 백준 인증 완료
export function useCompleteBaekjoonVerification({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<BaekjoonVerificationResultResponseWrapper, OnboardingApiCompleteBaekjoonVerificationRequest>) {
  return useBaseMutation<
    BaekjoonVerificationResultResponseWrapper,
    ApiError,
    OnboardingApiCompleteBaekjoonVerificationRequest
  >({
    ...mutationOptions,
    mutationFn: (data) => onboardingApiService.completeBaekjoonVerification({ ...data }),
    invalidateKeys: [onboardingKeys.baekjoonVerification().queryKey, onboardingKeys.skillAnalysis().queryKey],
    ...createChainedCallbacks({ callbacks: { onSuccess, onError } }),
  })
}

// 멘토 프로필 생성 (온보딩 과정)
export function useCreateMentorProfileOnboarding({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<MentorProfileResponse, OnboardingApiCreateMentorProfileOnboardingRequest>) {
  return useBaseMutation<MentorProfileResponse, ApiError, OnboardingApiCreateMentorProfileOnboardingRequest>({
    ...mutationOptions,
    mutationFn: (data) => onboardingApiService.createMentorProfileOnboarding({ ...data }),
    invalidateKeys: [onboardingKeys.profile().queryKey, onboardingKeys.mentorEligibility().queryKey],
    ...createChainedCallbacks({ callbacks: { onSuccess, onError } }),
  })
}

// 온보딩 완료
export function useCompleteOnboarding({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<BooleanResponse, OnboardingApiCompleteOnboardingRequest>) {
  return useBaseMutation<BooleanResponse, ApiError, OnboardingApiCompleteOnboardingRequest>({
    ...mutationOptions,
    mutationFn: (data) => onboardingApiService.completeOnboarding({ ...data }),
    invalidateKeys: [
      onboardingKeys.all.queryKey, // 모든 온보딩 쿼리 무효화
      ["users"], // 사용자 관련 쿼리도 무효화 (온보딩 완료 시 사용자 상태 변경)
      ["auth"],
    ],
    ...createChainedCallbacks({ callbacks: { onSuccess, onError } }),
  })
}
