import { createQueryKeys } from "@lukemorales/query-key-factory"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { userService } from "./client/service"

import { User } from "@/shared/api/core/types"

// query-key-factory를 사용한 키 관리
export const userKeys = createQueryKeys("users", {
  all: null,
  lists: () => ["list"],
  list: (filters: { page?: number; limit?: number; search?: string }) => [filters],
  details: () => ["detail"],
  detail: (id: string) => [id],
  profile: (id: string) => ["profile", id],
})

// queryKey와 queryFn을 함께 관리하는 쿼리 객체
export const userQueries = {
  // 목록 쿼리
  list: (params: { page?: number; limit?: number; search?: string } = {}) => ({
    queryKey: userKeys.list(params).queryKey,
    queryFn: () => userService.getUsers(params),
  }),

  // 상세 쿼리
  detail: (id: string) => ({
    queryKey: userKeys.detail(id).queryKey,
    queryFn: () => userService.getUser(id),
  }),

  // 프로필 쿼리
  profile: () => ({
    queryKey: userKeys.profile("me").queryKey,
    queryFn: () => userService.getProfile(),
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

// 현재 사용자 프로필 조회 훅
export function useProfile(options?: UseQueryOptions<any, Error, any, any>) {
  const query = userQueries.profile()
  return useQuery({ ...query, ...options })
}

// SSR용 사용자 프로필 조회 훅
export function useProfileSSR(initialData?: User, options?: UseQueryOptions<any, Error, any, any>) {
  const query = userQueries.profile()
  return useQuery({ ...query, ...options, initialData: initialData ? { data: initialData, success: true } : undefined })
}

// Prefetch 헬퍼
export function prefetchUser(queryClient: any, id: string) {
  const query = userQueries.detail(id)
  return queryClient.prefetchQuery(query)
}

// 캐시 무효화 헬퍼들 - query-key-factory 방식 사용
export const userQueryUtils = {
  // 모든 사용자 쿼리 무효화
  invalidateAll: (queryClient: any) => {
    return queryClient.invalidateQueries({ queryKey: userKeys.all.queryKey })
  },

  // 사용자 목록 쿼리만 무효화
  invalidateLists: (queryClient: any) => {
    return queryClient.invalidateQueries({ queryKey: userKeys.lists().queryKey })
  },

  // 특정 사용자 상세 쿼리 무효화
  invalidateDetail: (queryClient: any, id: string) => {
    return queryClient.invalidateQueries({ queryKey: userKeys.detail(id).queryKey })
  },

  // 프로필 쿼리 무효화
  invalidateProfile: (queryClient: any) => {
    return queryClient.invalidateQueries({ queryKey: userKeys.profile("me").queryKey })
  },

  // 특정 사용자의 캐시 데이터 설정
  setUserData: (queryClient: any, id: string, data: User) => {
    queryClient.setQueryData(userKeys.detail(id).queryKey, { data, success: true })
  },

  // 사용자 목록에서 특정 사용자 업데이트
  updateUserInList: (queryClient: any, id: string, updater: (user: User) => User) => {
    queryClient.setQueriesData({ queryKey: userKeys.lists().queryKey }, (oldData: any) => {
      if (!oldData?.data) return oldData

      return {
        ...oldData,
        data: oldData.data.map((user: User) => (user.id === id ? updater(user) : user)),
      }
    })
  },
}
