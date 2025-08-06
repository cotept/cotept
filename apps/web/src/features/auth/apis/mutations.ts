import { useQueryClient } from "@tanstack/react-query"

import { authKeys, authQueryUtils } from "./queryKey"

import type {
  ConfirmSocialLinkParams,
  ConfirmSocialLinkResponse,
  ExchangeAuthCodeParams,
  ExchangeAuthCodeResponse,
  FindIdParams,
  FindIdResponse,
  LoginParams,
  LoginResponse,
  LogoutResponse,
  RefreshTokenParams,
  RefreshTokenResponse,
  ResetPasswordParams,
  ResetPasswordResponse,
  SendVerificationCodeParams,
  SendVerificationCodeResponse,
  VerifyCodeParams,
  VerifyCodeResponse,
} from "@/shared/types/auth.type"

import { ApiError, MutationConfig } from "@/shared/api/core/types"
import { authApiService } from "@/shared/api/services/auth-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"

// 로그인
export function useLogin(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<LoginResponse, ApiError, LoginParams>({
    mutationFn: (data) => authApiService.login(...data),
    queryKey: authKeys.all.queryKey,
    successMessage: "로그인에 성공했습니다.",
    onSuccess: async (response) => {
      // NextAuth 세션 업데이트
      if (response.data) {
        // 토큰 정보로 세션 업데이트 (구체적인 구현은 NextAuth 설정에 따라 다름)
        // const { signIn } = await import("next-auth/react")
      }

      // 인증 관련 쿼리 무효화
      authQueryUtils.invalidateAuthRelated(queryClient)
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}

// 로그아웃
export function useLogout(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<LogoutResponse, ApiError, []>({
    mutationFn: () => authApiService.logout(),
    queryKey: authKeys.all.queryKey,
    successMessage: "로그아웃되었습니다.",
    onSuccess: async (response) => {
      // NextAuth 세션 정리
      const { signOut } = await import("next-auth/react")
      await signOut({ redirect: false })

      // 모든 인증 쿼리 클리어
      authQueryUtils.clearAuthQueries(queryClient)
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}

// 토큰 갱신
export function useRefreshToken(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<RefreshTokenResponse, ApiError, RefreshTokenParams>({
    mutationFn: (data) => authApiService.refreshToken(...data),
    queryKey: authKeys.all.queryKey,
    onSuccess: async (response) => {
      // NextAuth 세션 업데이트
      if (response.data) {
        const { update } = await import("@/auth")
        await update({
          user: {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          },
        })
      }

      authQueryUtils.invalidateAuthRelated(queryClient)
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}

// 소셜 로그인 코드 교환
export function useExchangeAuthCode(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<ExchangeAuthCodeResponse, ApiError, ExchangeAuthCodeParams>({
    mutationFn: (data) => authApiService.exchangeAuthCode(...data),
    queryKey: authKeys.socialAuth().queryKey,
    successMessage: "소셜 로그인에 성공했습니다.",
    onSuccess: async (response) => {
      // NextAuth 세션에 토큰 저장
      if (response.data) {
        const { update } = await import("@/auth")
        await update({
          user: {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          },
        })
      }

      authQueryUtils.invalidateAuthRelated(queryClient)
      authQueryUtils.invalidateSocialAuth(queryClient)
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}

// 소셜 계정 연결 확인
export function useConfirmSocialLink(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<ConfirmSocialLinkResponse, ApiError, ConfirmSocialLinkParams>({
    mutationFn: (data) => authApiService.confirmSocialLink(...data),
    queryKey: authKeys.socialAuth().queryKey,
    successMessage: "소셜 계정 연결이 완료되었습니다.",
    onSuccess: async (response) => {
      // NextAuth 세션에 토큰 저장 (연결 승인 시)
      if (response.data) {
        const { update } = await import("@/auth")
        await update({
          user: {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          },
        })
      }

      authQueryUtils.invalidateProfile(queryClient)
      authQueryUtils.invalidateSocialAuth(queryClient)
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}

// 인증 코드 발송
export function useSendVerificationCode(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<SendVerificationCodeResponse, ApiError, SendVerificationCodeParams>({
    mutationFn: (data) => authApiService.sendVerificationCode(...data),
    queryKey: authKeys.verifications().queryKey,
    successMessage: "인증 코드가 발송되었습니다.",
    onSuccess: (response) => {
      authQueryUtils.invalidateVerifications(queryClient)
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}

// 인증 코드 확인
export function useVerifyCode(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<VerifyCodeResponse, ApiError, VerifyCodeParams>({
    mutationFn: (data) => authApiService.verifyCode(...data),
    queryKey: authKeys.verifications().queryKey,
    successMessage: "인증이 완료되었습니다.",
    onSuccess: (response) => {
      authQueryUtils.invalidateVerifications(queryClient)
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}

// 아이디 찾기
export function useFindId(config?: MutationConfig) {
  return useBaseMutation<FindIdResponse, ApiError, FindIdParams>({
    mutationFn: (data) => authApiService.findId(...data),
    queryKey: authKeys.all.queryKey,
    successMessage: "아이디 찾기가 완료되었습니다.",
    onSuccess: (response) => {
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}

// 비밀번호 재설정
export function useResetPassword(config?: MutationConfig) {
  return useBaseMutation<ResetPasswordResponse, ApiError, ResetPasswordParams>({
    mutationFn: (data) => authApiService.resetPassword(...data),
    queryKey: authKeys.all.queryKey,
    successMessage: "비밀번호가 재설정되었습니다.",
    onSuccess: (response) => {
      config?.onSuccess?.(response.data)
    },
    onError: (error) => {
      config?.onError?.(error)
    },
  })
}
