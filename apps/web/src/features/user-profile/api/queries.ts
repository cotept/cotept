import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query"

import { userProfileKeys } from "./queryKey"

import type {
  CheckProfileCompletenessResponse,
  GetUserProfileByIdxResponse,
  GetUserProfileResponse,
} from "@/shared/types/user-profile.type"

import { userProfileApiService } from "@/shared/api/services/user-profile-api-service"

// queryKey와 queryFn을 함께 관리하는 쿼리 객체
export const userProfileQueries = {
  // 사용자 ID로 프로필 조회
  profile: (userId: string) => ({
    queryKey: userProfileKeys.profile(userId).queryKey,
    queryFn: () => userProfileApiService.getUserProfile({ userId }),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  }),

  // 인덱스로 프로필 조회
  profileByIdx: (idx: number) => ({
    queryKey: userProfileKeys.profileByIdx(idx).queryKey,
    queryFn: () => userProfileApiService.getUserProfileByIdx({ idx }),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  }),

  // 프로필 완성도 확인
  completeness: (userId: string) => ({
    queryKey: userProfileKeys.completeness(userId).queryKey,
    queryFn: () => userProfileApiService.checkProfileCompleteness({ userId }),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  }),
} as const

// 사용자 ID로 프로필 조회 훅
export function useGetUserProfile(
  userId: string,
  options?: Omit<
    UseQueryOptions<
      GetUserProfileResponse,
      Error,
      GetUserProfileResponse,
      ReturnType<typeof userProfileQueries.profile>["queryKey"]
    >,
    "queryKey" | "queryFn"
  >,
) {
  const query = userProfileQueries.profile(userId)
  return useQuery({
    ...query,
    enabled: !!userId && (options?.enabled ?? true),
    ...options,
  })
}

// 인덱스로 프로필 조회 훅
export function useGetUserProfileByIdx(
  idx: number,
  options?: Omit<
    UseQueryOptions<
      GetUserProfileByIdxResponse,
      Error,
      GetUserProfileByIdxResponse,
      ReturnType<typeof userProfileQueries.profileByIdx>["queryKey"]
    >,
    "queryKey" | "queryFn"
  >,
) {
  const query = userProfileQueries.profileByIdx(idx)
  return useQuery({
    ...query,
    enabled: !!idx && idx > 0 && (options?.enabled ?? true),
    ...options,
  })
}

// 프로필 완성도 확인 훅
export function useCheckProfileCompleteness(
  userId: string,
  options?: Omit<
    UseQueryOptions<
      CheckProfileCompletenessResponse,
      Error,
      CheckProfileCompletenessResponse,
      ReturnType<typeof userProfileQueries.completeness>["queryKey"]
    >,
    "queryKey" | "queryFn"
  >,
) {
  const query = userProfileQueries.completeness(userId)
  return useQuery({
    ...query,
    enabled: !!userId && (options?.enabled ?? true),
    ...options,
  })
}

// Prefetch 헬퍼 함수들
export function prefetchUserProfile(queryClient: QueryClient, userId: string) {
  const query = userProfileQueries.profile(userId)
  return queryClient.prefetchQuery(query)
}

export function prefetchUserProfileByIdx(queryClient: QueryClient, idx: number) {
  const query = userProfileQueries.profileByIdx(idx)
  return queryClient.prefetchQuery(query)
}

export function prefetchProfileCompleteness(queryClient: QueryClient, userId: string) {
  const query = userProfileQueries.completeness(userId)
  return queryClient.prefetchQuery(query)
}
