import { createQueryKeys } from "@lukemorales/query-key-factory"
import { QueryClient } from "@tanstack/react-query"

// 인증 관련 쿼리 키
export const authKeys = createQueryKeys("auth", {
  all: null,
  profile: () => ["profile"],
  validation: (token: string) => ["validation", token],
  verifications: () => ["verifications"],
  verification: (type: string, target: string) => ["verification", type, target],
  socialAuth: () => ["social"],
  socialAuthCode: (code: string) => ["social", "code", code],
  checkEmailAvailability: (email: string) => ["check", "email", email],
  checkUserIdAvailability: (id: string) => ["check", "user", id],
})

// 인증 도메인 쿼리 유틸리티
export const authQueryUtils = {
  getKeys: () => authKeys,

  // 모든 인증 쿼리 무효화
  invalidateAll: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: authKeys.all.queryKey })
  },

  // 프로필 쿼리 무효화
  invalidateProfile: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: authKeys.profile().queryKey })
  },

  // 토큰 검증 쿼리 무효화
  invalidateValidation: (queryClient: QueryClient, token?: string) => {
    if (token) {
      return queryClient.invalidateQueries({ queryKey: authKeys.validation(token).queryKey })
    }
    return queryClient.invalidateQueries({ queryKey: authKeys.all.queryKey })
  },

  // 인증 코드 관련 쿼리 무효화
  invalidateVerifications: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: authKeys.verifications().queryKey })
  },

  // 소셜 인증 관련 쿼리 무효화
  invalidateSocialAuth: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: authKeys.socialAuth().queryKey })
  },

  // 인증 상태 변경 시 관련 쿼리들 무효화
  invalidateAuthRelated: (queryClient: QueryClient) => {
    authQueryUtils.invalidateProfile(queryClient)
    authQueryUtils.invalidateValidation(queryClient)
    // 다른 도메인의 사용자 관련 쿼리도 무효화할 수 있음
  },

  // 로그아웃 시 모든 인증 관련 쿼리 클리어
  clearAuthQueries: (queryClient: QueryClient) => {
    queryClient.removeQueries({ queryKey: authKeys.all.queryKey })
  },

  // 프로필 데이터 설정
  setProfileData: (queryClient: QueryClient, data: any) => {
    queryClient.setQueryData(authKeys.profile().queryKey, { data, success: true })
  },
}

// 타입 안전한 쿼리 키 접근
export type AuthQueryKeys = typeof authKeys
