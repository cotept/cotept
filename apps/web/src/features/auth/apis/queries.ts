import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query"

import { authKeys } from "./queryKey"

import type { ValidationResultResponseWrapper } from "@repo/api-client"

import { authApiService } from "@/shared/api/services/auth-api-service"

// queryKey와 queryFn을 함께 관리하는 쿼리 객체
export const authQueries = {
  // 토큰 검증 쿼리
  validateToken: (token: string) => ({
    queryKey: authKeys.validation(token).queryKey,
    queryFn: () => authApiService.validateToken({ validateTokenRequestDto: { token } }),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  }),

  // 현재 사용자 프로필 (세션 기반)
  profile: () => ({
    queryKey: authKeys.profile().queryKey,
    queryFn: async () => {
      // NextAuth 세션에서 사용자 정보를 가져오는 로직
      const { getSession } = await import("next-auth/react")
      const session = await getSession()
      return session?.user || null
    },
    staleTime: 5 * 60 * 1000, // 5분
  }),

  checkEmailAvailability: (email: string) => ({
    queryKey: authKeys.checkEmailAvailability(email).queryKey,
    queryFn: () => authApiService.checkEmailAvailability({ checkEmailAvailabilityRequestDto: { email } }),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 2 * 60 * 1000, // 2분
  }),

  checkUserIdAvailability: (userId: string) => ({
    queryKey: authKeys.checkUserIdAvailability(userId).queryKey,
    queryFn: () => authApiService.checkUserIdAvailability({ checkUserIdAvailabilityRequestDto: { userId } }),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 2 * 60 * 1000, // 2분
  }),
} as const

// 토큰 검증 훅
export function useValidateToken(
  token: string,
  options?: UseQueryOptions<ValidationResultResponseWrapper, Error, ValidationResultResponseWrapper, any>,
) {
  const query = authQueries.validateToken(token)
  return useQuery({
    ...query,
    enabled: !!token && (options?.enabled ?? true),
    ...options,
  })
}

// 현재 사용자 프로필 훅
export function useAuthProfile(options?: UseQueryOptions<any, Error, any, any>) {
  const query = authQueries.profile()
  return useQuery({ ...query, ...options })
}

// Prefetch 헬퍼
export function prefetchValidateToken(queryClient: QueryClient, token: string) {
  const query = authQueries.validateToken(token)
  return queryClient.prefetchQuery(query)
}

export function prefetchAuthProfile(queryClient: QueryClient) {
  const query = authQueries.profile()
  return queryClient.prefetchQuery(query)
}
