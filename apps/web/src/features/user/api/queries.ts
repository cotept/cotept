import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { userKeys } from "./queryKey"

import { userApiService } from "@/shared/api/services/user-api-service"

// "changePassword" | "createUser" | "deleteUser" | "getAllUsers" | "getUserById" | "updateUser"

// queryKey와 queryFn을 함께 관리하는 쿼리 객체
export const userQueries = {
  // 목록 쿼리
  list: (params: { page?: number; limit?: number; search?: string } = {}) => ({
    queryKey: userKeys.list(params).queryKey,
    queryFn: () => userApiService.getAllUsers(params),
  }),

  // 상세 쿼리
  detail: (id: string) => ({
    queryKey: userKeys.detail(id).queryKey,
    queryFn: () => userApiService.getUserById({ id }),
  }),
} as const

// 사용자 목록 조회 훅
export function useUsers(
  params?: { page?: number; limit?: number; search?: string },
  options?: UseQueryOptions<any, Error, any, any>,
) {
  const query = userQueries.list(params)
  return useQuery({ ...query, ...options })
}

// 사용자 상세 조회 훅
export function useUser(id: string, options?: UseQueryOptions<any, Error, any, any>) {
  const query = userQueries.detail(id)
  return useQuery({ ...query, ...options })
}

// Prefetch 헬퍼
export function prefetchUser(queryClient: any, id: string) {
  const query = userQueries.detail(id)
  return queryClient.prefetchQuery(query)
}
