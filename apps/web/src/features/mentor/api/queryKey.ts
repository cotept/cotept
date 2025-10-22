import { createQueryKeys } from "@lukemorales/query-key-factory"
import { QueryClient } from "@tanstack/react-query"

// 멘토 관련 쿼리 키
export const mentorKeys = createQueryKeys("mentor", {
  all: null,
  profiles: () => ["profile"],
  profile: (userId: string) => ["profile", userId],
  myProfile: () => ["profile", "me"],
})

// 멘토 도메인 쿼리 유틸리티
export const mentorQueryUtils = {
  getKeys: () => mentorKeys,

  // 모든 멘토 쿼리 무효화
  invalidateAll: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: mentorKeys.all.queryKey })
  },

  // 모든 멘토 프로필 쿼리 무효화
  invalidateProfiles: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: mentorKeys.profiles().queryKey })
  },

  // 특정 멘토 프로필 쿼리 무효화
  invalidateProfile: (queryClient: QueryClient, userId: string) => {
    return queryClient.invalidateQueries({ queryKey: mentorKeys.profile(userId).queryKey })
  },

  // 내 멘토 프로필 쿼리 무효화
  invalidateMyProfile: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: mentorKeys.myProfile().queryKey })
  },

  // 멘토 프로필 관련 모든 쿼리 무효화 (생성/수정/삭제 후)
  invalidateMentorRelated: (queryClient: QueryClient, userId?: string) => {
    mentorQueryUtils.invalidateProfiles(queryClient)
    mentorQueryUtils.invalidateMyProfile(queryClient)
    if (userId) {
      mentorQueryUtils.invalidateProfile(queryClient, userId)
    }
  },

  // 멘토 프로필 데이터 설정
  setProfileData: (queryClient: QueryClient, userId: string, data: any) => {
    queryClient.setQueryData(mentorKeys.profile(userId).queryKey, { data, success: true })
  },

  // 내 멘토 프로필 데이터 설정
  setMyProfileData: (queryClient: QueryClient, data: any) => {
    queryClient.setQueryData(mentorKeys.myProfile().queryKey, { data, success: true })
  },

  // 멘토 프로필 삭제 후 캐시에서 제거
  removeProfileFromCache: (queryClient: QueryClient, userId: string) => {
    queryClient.removeQueries({ queryKey: mentorKeys.profile(userId).queryKey })
  },
}

// 타입 안전한 쿼리 키 접근
export type MentorQueryKeys = typeof mentorKeys
