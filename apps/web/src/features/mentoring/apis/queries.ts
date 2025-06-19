import { QueryConfig, User } from "@/shared/api/core/types"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "./queryKeyFactory"
import { userService } from "./client/service"

// 사용자 목록 조회
export function useUsers(params?: { page?: number; limit?: number; search?: string }, config?: QueryConfig) {
  return useQuery({
    queryKey: queryKeys.users.list(params || {}).queryKey,
    queryFn: () => userService.getUsers(params),
    enabled: config?.enabled ?? true,
    staleTime: config?.staleTime ?? 2 * 60 * 1000, // 2분
    gcTime: config?.gcTime ?? 5 * 60 * 1000, // 5분
    ...config,
  })
}

// 사용자 상세 조회
export function useUser(id: string, config?: QueryConfig) {
  return useQuery({
    queryKey: queryKeys.users.detail(id).queryKey,
    queryFn: () => userService.getUser(id),
    enabled: (config?.enabled ?? true) && !!id,
    staleTime: config?.staleTime ?? 5 * 60 * 1000, // 5분
    gcTime: config?.gcTime ?? 10 * 60 * 1000, // 10분
    select: (data) => data.data, // data.data만 반환
    ...config,
  })
}

// 현재 사용자 프로필 조회
export function useProfile(config?: QueryConfig) {
  return useQuery({
    queryKey: queryKeys.users.profile("me").queryKey,
    queryFn: () => userService.getProfile(),
    enabled: config?.enabled ?? true,
    staleTime: config?.staleTime ?? 5 * 60 * 1000,
    gcTime: config?.gcTime ?? 10 * 60 * 1000,
    select: (data) => data.data,
    ...config,
  })
}

// SSR용 사용자 프로필 조회
export function useProfileSSR(initialData?: User, config?: QueryConfig) {
  return useQuery({
    queryKey: queryKeys.users.profile("me").queryKey,
    queryFn: () => userService.getProfile(),
    initialData: initialData ? { data: initialData, success: true } : undefined,
    enabled: config?.enabled ?? true,
    staleTime: config?.staleTime ?? 5 * 60 * 1000,
    gcTime: config?.gcTime ?? 10 * 60 * 1000,
    select: (data) => data.data,
    ...config,
  })
}

// Prefetch 헬퍼
export function prefetchUser(queryClient: any, id: string) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.users.detail(id).queryKey,
    queryFn: () => userService.getUser(id),
    staleTime: 5 * 60 * 1000,
  })
}
