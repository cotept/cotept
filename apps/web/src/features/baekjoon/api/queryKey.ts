import { createQueryKeys } from "@lukemorales/query-key-factory"
import { QueryClient } from "@tanstack/react-query"

// 백준 관련 쿼리 키
export const baekjoonKeys = createQueryKeys("baekjoon", {
  all: null,
  profiles: () => ["profile"],
  profile: (handle: string) => ["profile", handle],
  statistics: () => ["statistics"],
  statisticsById: (handle: string) => ["statistics", handle],
  verification: () => ["verification"],
  verificationStatus: (userId: string) => ["verification", "status", userId],
})

// 백준 도메인 쿼리 유틸리티
export const baekjoonQueryUtils = {
  getKeys: () => baekjoonKeys,

  // 모든 백준 쿼리 무효화
  invalidateAll: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: baekjoonKeys.all.queryKey })
  },

  // 모든 백준 프로필 쿼리 무효화
  invalidateProfiles: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: baekjoonKeys.profiles().queryKey })
  },

  // 특정 백준 프로필 쿼리 무효화
  invalidateProfile: (queryClient: QueryClient, handle: string) => {
    return queryClient.invalidateQueries({ queryKey: baekjoonKeys.profile(handle).queryKey })
  },

  // 모든 백준 통계 쿼리 무효화
  invalidateStatistics: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: baekjoonKeys.statistics().queryKey })
  },

  // 특정 백준 통계 쿼리 무효화
  invalidateStatisticsById: (queryClient: QueryClient, handle: string) => {
    return queryClient.invalidateQueries({ queryKey: baekjoonKeys.statisticsById(handle).queryKey })
  },

  // 백준 인증 쿼리 무효화
  invalidateVerification: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: baekjoonKeys.verification().queryKey })
  },

  // 백준 인증 상태 쿼리 무효화
  invalidateVerificationStatus: (queryClient: QueryClient, userId: string) => {
    return queryClient.invalidateQueries({ queryKey: baekjoonKeys.verificationStatus(userId).queryKey })
  },

  // 백준 인증 관련 모든 쿼리 무효화
  invalidateVerificationRelated: (queryClient: QueryClient, userId: string) => {
    baekjoonQueryUtils.invalidateVerification(queryClient)
    baekjoonQueryUtils.invalidateVerificationStatus(queryClient, userId)
  },

  // 특정 사용자의 백준 관련 데이터 무효화
  invalidateBaekjoonRelated: (queryClient: QueryClient, handle?: string) => {
    baekjoonQueryUtils.invalidateProfiles(queryClient)
    baekjoonQueryUtils.invalidateStatistics(queryClient)
    if (handle) {
      baekjoonQueryUtils.invalidateProfile(queryClient, handle)
      baekjoonQueryUtils.invalidateStatisticsById(queryClient, handle)
    }
  },

  // 백준 프로필 데이터 설정
  setProfileData: (queryClient: QueryClient, handle: string, data: any) => {
    queryClient.setQueryData(baekjoonKeys.profile(handle).queryKey, { data, success: true })
  },

  // 백준 통계 데이터 설정
  setStatisticsData: (queryClient: QueryClient, handle: string, data: any) => {
    queryClient.setQueryData(baekjoonKeys.statisticsById(handle).queryKey, { data, success: true })
  },

  // 백준 인증 상태 데이터 설정
  setVerificationStatusData: (queryClient: QueryClient, userId: string, data: any) => {
    queryClient.setQueryData(baekjoonKeys.verificationStatus(userId).queryKey, { data, success: true })
  },
}

// 타입 안전한 쿼리 키 접근
export type BaekjoonQueryKeys = typeof baekjoonKeys
