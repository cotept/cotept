import { type UseMutationOptions, useQueryClient } from "@tanstack/react-query"

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

import { ApiError } from "@/shared/api/core/types"
import { authApiService } from "@/shared/api/services/auth-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"

// 로그인
export function useLogin(
  options?: Pick<UseMutationOptions<LoginResponse, ApiError, LoginParams>, "onSuccess" | "onError">,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<LoginResponse, ApiError, LoginParams>({
    mutationFn: (data) => authApiService.login(...data),
    queryKey: authKeys.all.queryKey,
    successMessage: "로그인에 성공했습니다.",
    onSuccess: async (response, variables, context) => {
      // NextAuth 세션 업데이트
      if (response.data) {
        // 토큰 정보로 세션 업데이트 (구체적인 구현은 NextAuth 설정에 따라 다름)
        // const { signIn } = await import("next-auth/react")
      }

      // 인증 관련 쿼리 무효화
      authQueryUtils.invalidateAuthRelated(queryClient)
      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// 로그아웃
export function useLogout(options?: Pick<UseMutationOptions<LogoutResponse, ApiError, []>, "onSuccess" | "onError">) {
  const queryClient = useQueryClient()

  return useBaseMutation<LogoutResponse, ApiError, []>({
    mutationFn: () => authApiService.logout(),
    queryKey: authKeys.all.queryKey,
    successMessage: "로그아웃되었습니다.",
    onSuccess: async (response, variables, context) => {
      // NextAuth 세션 정리
      const { signOut } = await import("next-auth/react")
      await signOut({ redirect: false })

      // 모든 인증 쿼리 클리어
      authQueryUtils.clearAuthQueries(queryClient)
      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// 토큰 갱신
export function useRefreshToken(
  options?: Pick<UseMutationOptions<RefreshTokenResponse, ApiError, RefreshTokenParams>, "onSuccess" | "onError">,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<RefreshTokenResponse, ApiError, RefreshTokenParams>({
    mutationFn: (data) => authApiService.refreshToken(...data),
    queryKey: authKeys.all.queryKey,
    onSuccess: async (response, variables, context) => {
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
      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// 소셜 로그인 코드 교환
export function useExchangeAuthCode(
  options?: Pick<
    UseMutationOptions<ExchangeAuthCodeResponse, ApiError, ExchangeAuthCodeParams>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<ExchangeAuthCodeResponse, ApiError, ExchangeAuthCodeParams>({
    mutationFn: (data) => authApiService.exchangeAuthCode(...data),
    queryKey: authKeys.socialAuth().queryKey,
    successMessage: "소셜 로그인에 성공했습니다.",
    onSuccess: async (response, variables, context) => {
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
      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// 소셜 계정 연결 확인
export function useConfirmSocialLink(
  options?: Pick<
    UseMutationOptions<ConfirmSocialLinkResponse, ApiError, ConfirmSocialLinkParams>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<ConfirmSocialLinkResponse, ApiError, ConfirmSocialLinkParams>({
    mutationFn: (data) => authApiService.confirmSocialLink(...data),
    queryKey: authKeys.socialAuth().queryKey,
    successMessage: "소셜 계정 연결이 완료되었습니다.",
    onSuccess: async (response, variables, context) => {
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
      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// 인증 코드 발송
export function useSendVerificationCode(
  options?: Pick<
    UseMutationOptions<SendVerificationCodeResponse, ApiError, SendVerificationCodeParams>,
    "onSuccess" | "onError"
  >,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<SendVerificationCodeResponse, ApiError, SendVerificationCodeParams>({
    mutationFn: (data) => authApiService.sendVerificationCode(...data),
    queryKey: authKeys.verifications().queryKey,
    successMessage: "인증 코드가 발송되었습니다.",
    onSuccess: (response, variables, context) => {
      authQueryUtils.invalidateVerifications(queryClient)
      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// 인증 코드 확인
export function useVerifyCode(
  options?: Pick<UseMutationOptions<VerifyCodeResponse, ApiError, VerifyCodeParams>, "onSuccess" | "onError">,
) {
  const queryClient = useQueryClient()

  return useBaseMutation<VerifyCodeResponse, ApiError, VerifyCodeParams>({
    mutationFn: (data) => authApiService.verifyCode(...data),
    queryKey: authKeys.verifications().queryKey,
    successMessage: "인증이 완료되었습니다.",
    onSuccess: (response, variables, context) => {
      authQueryUtils.invalidateVerifications(queryClient)
      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// 아이디 찾기
export function useFindId(
  options?: Pick<UseMutationOptions<FindIdResponse, ApiError, FindIdParams>, "onSuccess" | "onError">,
) {
  return useBaseMutation<FindIdResponse, ApiError, FindIdParams>({
    mutationFn: (data) => authApiService.findId(...data),
    queryKey: authKeys.all.queryKey,
    successMessage: "아이디 찾기가 완료되었습니다.",
    onSuccess: (response, variables, context) => {
      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}

// 비밀번호 재설정
export function useResetPassword(
  options?: Pick<UseMutationOptions<ResetPasswordResponse, ApiError, ResetPasswordParams>, "onSuccess" | "onError">,
) {
  return useBaseMutation<ResetPasswordResponse, ApiError, ResetPasswordParams>({
    mutationFn: (data) => authApiService.resetPassword(...data),
    queryKey: authKeys.all.queryKey,
    successMessage: "비밀번호가 재설정되었습니다.",
    onSuccess: (response, variables, context) => {
      options?.onSuccess?.(response, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
  })
}
