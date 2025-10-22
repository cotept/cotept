import {
  type MentorEligibilityResponse,
  type MentorTagsResponseWrapper,
  type OnboardingApiAnalyzeSkillsRequest,
  type OnboardingApiCheckMentorEligibilityRequest,
  type TagStatisticsOutputResponse,
} from "@repo/api-client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

import { onboardingKeys } from "./queryKey"

import { ApiError } from "@/shared/api/core/types"
import { onboardingApiService } from "@/shared/api/services/onboarding-api-service"

// 실력 분석 조회
export function useAnalyzeSkills(
  request: OnboardingApiAnalyzeSkillsRequest,
  options?: UseQueryOptions<TagStatisticsOutputResponse, ApiError>,
) {
  return useQuery({
    queryKey: onboardingKeys.skillAnalysis().queryKey,
    queryFn: () => onboardingApiService.analyzeSkills(request),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  })
}

// 멘토 자격 요건 확인
export function useCheckMentorEligibility(
  request: OnboardingApiCheckMentorEligibilityRequest,
  options?: UseQueryOptions<MentorEligibilityResponse, ApiError>,
) {
  return useQuery({
    queryKey: onboardingKeys.mentorEligibility().queryKey,
    queryFn: () => onboardingApiService.checkMentorEligibility(request),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
    ...options,
  })
}

// 멘토 태그 조회
export function useGetMentorTags(options?: UseQueryOptions<MentorTagsResponseWrapper, ApiError>) {
  return useQuery({
    queryKey: onboardingKeys.mentorTags().queryKey,
    queryFn: () => onboardingApiService.getMentorTags(),
    staleTime: 10 * 60 * 1000, // 10분 (태그는 자주 변경되지 않음)
    gcTime: 30 * 60 * 1000, // 30분
    ...options,
  })
}
