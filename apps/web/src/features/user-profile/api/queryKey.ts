import { createQueryKeys } from "@lukemorales/query-key-factory"
import { QueryClient } from "@tanstack/react-query"

// 사용자 프로필 관련 쿼리 키
export const userProfileKeys = createQueryKeys("userProfile", {
  all: null,
  profile: (userId: string) => ["profile", userId],
  profileByIdx: (idx: number) => ["profile", "idx", idx],
  completeness: (userId: string) => ["completeness", userId],
  basicProfile: () => ["basic-profile"],
  upsert: (userId: string) => ["upsert", userId],
})

// 사용자 프로필 도메인 쿼리 유틸리티
export const userProfileQueryUtils = {
  getKeys: () => userProfileKeys,

  // 모든 사용자 프로필 쿼리 무효화
  invalidateAll: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: userProfileKeys.all.queryKey })
  },

  // 특정 사용자 프로필 쿼리 무효화
  invalidateProfile: (queryClient: QueryClient, userId?: string) => {
    if (userId) {
      return queryClient.invalidateQueries({ queryKey: userProfileKeys.profile(userId).queryKey })
    }
    return queryClient.invalidateQueries({ queryKey: userProfileKeys.all.queryKey })
  },

  // idx로 프로필 쿼리 무효화
  invalidateProfileByIdx: (queryClient: QueryClient, idx?: number) => {
    if (idx) {
      return queryClient.invalidateQueries({ queryKey: userProfileKeys.profileByIdx(idx).queryKey })
    }
    return queryClient.invalidateQueries({ queryKey: userProfileKeys.all.queryKey })
  },

  // 프로필 완성도 쿼리 무효화
  invalidateCompleteness: (queryClient: QueryClient, userId?: string) => {
    if (userId) {
      return queryClient.invalidateQueries({ queryKey: userProfileKeys.completeness(userId).queryKey })
    }
    return queryClient.invalidateQueries({ queryKey: userProfileKeys.all.queryKey })
  },

  // 기본 프로필 쿼리 무효화
  invalidateBasicProfile: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: userProfileKeys.basicProfile().queryKey })
  },

  // 프로필 생성/수정/삭제 시 관련 쿼리들 무효화
  invalidateProfileRelated: (queryClient: QueryClient, userId?: string) => {
    userProfileQueryUtils.invalidateProfile(queryClient, userId)
    userProfileQueryUtils.invalidateCompleteness(queryClient, userId)
    // Auth 프로필과 연관된 쿼리도 무효화할 수 있음
    // authQueryUtils.invalidateProfile(queryClient)
  },

  // 사용자별 프로필 관련 쿼리 클리어
  clearUserProfileQueries: (queryClient: QueryClient, userId: string) => {
    queryClient.removeQueries({ queryKey: userProfileKeys.profile(userId).queryKey })
    queryClient.removeQueries({ queryKey: userProfileKeys.completeness(userId).queryKey })
  },

  // 프로필 데이터 설정
  setProfileData: (queryClient: QueryClient, userId: string, data: any) => {
    queryClient.setQueryData(userProfileKeys.profile(userId).queryKey, { data, success: true })
  },

  // 완성도 데이터 설정
  setCompletenessData: (queryClient: QueryClient, userId: string, data: any) => {
    queryClient.setQueryData(userProfileKeys.completeness(userId).queryKey, { data, success: true })
  },
}

// 타입 안전한 쿼리 키 접근
export type UserProfileQueryKeys = typeof userProfileKeys