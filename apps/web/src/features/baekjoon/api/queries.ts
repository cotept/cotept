import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

import { baekjoonKeys } from "./queryKey"

import type {
  BaekjoonProfileResponseWrapper,
  TagStatisticsResponseWrapper,
  VerificationStatusResponseWrapper,
} from "@repo/api-client"

import { ApiError } from "@/shared/api/core/types"
import { baekjoonApiService } from "@/shared/api/services/baekjoon-api-service"

// 백준 프로필 조회
export function useGetBaekjoonProfile(
  email: string,
  handle: string,
  options?: UseQueryOptions<BaekjoonProfileResponseWrapper, ApiError, BaekjoonProfileResponseWrapper>,
) {
  return useQuery({
    queryKey: baekjoonKeys.profile(handle).queryKey,
    queryFn: () => baekjoonApiService.getProfile({ email, handle }),
    staleTime: 10 * 60 * 1000, // 10분 (백준 프로필은 자주 변경되지 않음)
    gcTime: 30 * 60 * 1000, // 30분
    enabled: !!handle,
    ...options,
  })
}

// 백준 통계 조회
export function useGetBaekjoonStatistics(
  email: string,
  handle: string,
  options?: UseQueryOptions<TagStatisticsResponseWrapper, ApiError, TagStatisticsResponseWrapper>,
) {
  return useQuery({
    queryKey: baekjoonKeys.statisticsById(handle).queryKey,
    queryFn: () => baekjoonApiService.getStatistics({ email, handle }),
    staleTime: 5 * 60 * 1000, // 5분 (통계는 프로필보다 자주 업데이트)
    gcTime: 15 * 60 * 1000, // 15분
    enabled: !!handle,
    ...options,
  })
}

// 백준 인증 상태 조회
export function useGetBaekjoonVerificationStatus(
  userId: string,
  options?: UseQueryOptions<VerificationStatusResponseWrapper, ApiError, VerificationStatusResponseWrapper>,
) {
  return useQuery({
    queryKey: baekjoonKeys.verificationStatus(userId).queryKey,
    queryFn: () => baekjoonApiService.getVerificationStatus({ userId }),
    staleTime: 2 * 60 * 1000, // 2분 (인증 상태는 실시간성이 중요)
    gcTime: 5 * 60 * 1000, // 5분
    ...options,
  })
}
