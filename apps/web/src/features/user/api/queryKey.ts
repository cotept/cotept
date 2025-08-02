import { createQueryKeys } from "@lukemorales/query-key-factory"
import { QueryClient } from "@tanstack/react-query"

import { User } from "@/shared/api/core/types"

// 사용자 도메인 전용 쿼리 키 관리

// 사용자 관련 쿼리 키
export const userKeys = createQueryKeys("users", {
  all: null,
  lists: () => ["list"],
  list: (filters: { page?: number; limit?: number; search?: string }) => [filters],
  details: () => ["detail"],
  detail: (id: string) => [id],
  profile: (id: string) => ["profile", id],
})

// 사용자 도메인 쿼리 유틸리티
export const userQueryUtils = {
  getKeys: () => userKeys,

  // 모든 사용자 쿼리 무효화
  invalidateAll: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: userKeys.all.queryKey })
  },

  // 사용자 목록 쿼리만 무효화
  invalidateLists: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: userKeys.lists().queryKey })
  },

  // 특정 사용자 상세 쿼리 무효화
  invalidateDetail: (queryClient: QueryClient, id: string) => {
    return queryClient.invalidateQueries({ queryKey: userKeys.detail(id).queryKey })
  },

  // 특정 사용자의 캐시 데이터 설정
  setUserData: (queryClient: QueryClient, id: string, data: User) => {
    queryClient.setQueryData(userKeys.detail(id).queryKey, { data, success: true })
  },

  // 사용자 목록에서 특정 사용자 업데이트
  updateUserInList: (queryClient: QueryClient, id: string, updater: (user: User) => User) => {
    queryClient.setQueriesData({ queryKey: userKeys.lists().queryKey }, (oldData: any) => {
      if (!oldData?.data) return oldData

      return {
        ...oldData,
        data: oldData.data.map((user: User) => (user.id === id ? updater(user) : user)),
      }
    })
  },

  // 도메인간 협업을 위한 사용자 관련 무효화
  invalidateUserRelated: (queryClient: QueryClient, userId?: string) => {
    if (userId) {
      userQueryUtils.invalidateDetail(queryClient, userId)
    }
    userQueryUtils.invalidateLists(queryClient)
  },
}

// 타입 안전한 쿼리 키 접근
export type UserQueryKeys = typeof userKeys
