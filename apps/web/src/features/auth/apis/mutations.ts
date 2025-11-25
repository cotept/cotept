import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { authKeys } from "./queryKey"

import type {
  AuthApiConfirmSocialLinkRequest,
  AuthApiExchangeAuthCodeRequest,
  AuthApiFindIdRequest,
  AuthApiRefreshTokenRequest,
  AuthApiResetPasswordRequest,
  AuthApiSendVerificationCodeRequest,
  AuthApiVerifyCodeRequest,
  AvailabilityResponseWrapper,
  EmailVerificationResultResponseWrapper,
  FindIdResponseWrapper,
  LogoutResponseWrapper,
  ResetPasswordResponseWrapper,
  TokenResponseWrapper,
  VerificationCodeResponseWrapper,
} from "@repo/api-client"

import { ApiError } from "@/shared/api/core/types"
import { authApiService } from "@/shared/api/services/auth-api-service"
import { useBaseMutation } from "@/shared/hooks/useBaseMutation"
import { MutationOptions } from "@/shared/types/basic-types"
import { createChainedCallbacks } from "@/shared/utils"

// 로그아웃
export function useLogout({ onSuccess, onError, ...mutationOptions }: MutationOptions<LogoutResponseWrapper, void>) {
  const queryClient = useQueryClient()

  return useBaseMutation<LogoutResponseWrapper, ApiError, void>({
    ...mutationOptions,
    mutationFn: () => authApiService.logout(),
    invalidateKeys: [authKeys.all.queryKey],
    ...createChainedCallbacks({
      domainLogic: async () => {
        // NextAuth 세션 정리
        const { signOut } = await import("next-auth/react")
        await signOut({ redirect: false })

        // 모든 인증 쿼리 클리어
        queryClient.clear()
      },
      callbacks: { onSuccess, onError },
    }),
  })
}

// 토큰 갱신
export function useRefreshToken({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<TokenResponseWrapper, AuthApiRefreshTokenRequest>) {
  return useBaseMutation<TokenResponseWrapper, ApiError, AuthApiRefreshTokenRequest>({
    ...mutationOptions,
    mutationFn: (data) => authApiService.refreshToken(data),
    invalidateKeys: [authKeys.all.queryKey],
    ...createChainedCallbacks({
      domainLogic: async (response, variables, context) => {
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
      },
      callbacks: { onSuccess, onError },
    }),
  })
}

// 소셜 로그인 코드 교환
export function useExchangeAuthCode({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<TokenResponseWrapper, AuthApiExchangeAuthCodeRequest>) {
  return useBaseMutation<TokenResponseWrapper, ApiError, AuthApiExchangeAuthCodeRequest>({
    ...mutationOptions,
    mutationFn: (data) => authApiService.exchangeAuthCode(data),
    invalidateKeys: [authKeys.all.queryKey, authKeys.socialAuth().queryKey],
    ...createChainedCallbacks({
      domainLogic: async (response, variables, context) => {
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
      },
      callbacks: { onSuccess, onError },
    }),
  })
}

// 소셜 계정 연결 확인
export function useConfirmSocialLink({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<TokenResponseWrapper, AuthApiConfirmSocialLinkRequest>) {
  return useBaseMutation<TokenResponseWrapper, ApiError, AuthApiConfirmSocialLinkRequest>({
    ...mutationOptions,
    mutationFn: (data) => authApiService.confirmSocialLink(data),
    invalidateKeys: [authKeys.profile().queryKey, authKeys.socialAuth().queryKey],
    ...createChainedCallbacks({
      domainLogic: async (response, variables, context) => {
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
      },
      callbacks: { onSuccess, onError },
    }),
  })
}

// 인증 코드 발송
export function useSendVerificationCode({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<VerificationCodeResponseWrapper, AuthApiSendVerificationCodeRequest>) {
  return useBaseMutation<VerificationCodeResponseWrapper, ApiError, AuthApiSendVerificationCodeRequest>({
    ...mutationOptions,
    mutationFn: (data) => authApiService.sendVerificationCode(data),
    invalidateKeys: [authKeys.verifications().queryKey],
    ...createChainedCallbacks({ callbacks: { onSuccess, onError } }),
  })
}

// 인증 코드 확인 (토스트 메시지 없음 - 사용자가 직접 처리)
export function useVerifyCode({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<EmailVerificationResultResponseWrapper, AuthApiVerifyCodeRequest>) {
  return useBaseMutation<EmailVerificationResultResponseWrapper, ApiError, AuthApiVerifyCodeRequest>({
    ...mutationOptions,
    mutationFn: (data) => authApiService.verifyCode(data),
    invalidateKeys: [authKeys.verifications().queryKey],
    ...createChainedCallbacks({ callbacks: { onSuccess, onError } }),
  })
}

// 아이디 찾기
export function useFindId({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<FindIdResponseWrapper, AuthApiFindIdRequest>) {
  return useBaseMutation<FindIdResponseWrapper, ApiError, AuthApiFindIdRequest>({
    ...mutationOptions,
    mutationFn: (data) => authApiService.findId(data),
    invalidateKeys: [authKeys.all.queryKey],
    ...createChainedCallbacks({ callbacks: { onSuccess, onError } }),
  })
}

// 비밀번호 재설정
export function useResetPassword({
  onSuccess,
  onError,
  ...mutationOptions
}: MutationOptions<ResetPasswordResponseWrapper, AuthApiResetPasswordRequest>) {
  return useBaseMutation<ResetPasswordResponseWrapper, ApiError, AuthApiResetPasswordRequest>({
    ...mutationOptions,
    mutationFn: (data) => authApiService.resetPassword(data),
    invalidateKeys: [authKeys.all.queryKey],
    ...createChainedCallbacks({ callbacks: { onSuccess, onError } }),
  })
}

// 이메일 중복 확인
export function useCheckEmailAvailabilityMutation() {
  return useMutation<
    AvailabilityResponseWrapper, // TData: API 응답 타입
    ApiError, // TError: 에러 타입
    string // TVariables: 입력 파라미터 타입 (email: string)
  >({
    mutationFn: (email: string) =>
      authApiService.checkEmailAvailability({ checkEmailAvailabilityRequestDto: { email } }),
    onError: (error: ApiError) => {
      toast.error(error?.message || "중복 확인 중 오류가 발생했습니다")
    },
  })
}

// 사용자 ID 중복 확인
export function useCheckUserIdAvailabilityMutation() {
  return useMutation<
    AvailabilityResponseWrapper, // TData: API 응답 타입
    ApiError, // TError: 에러 타입
    string // TVariables: 입력 파라미터 타입 (userId: string)
  >({
    mutationFn: (userId: string) =>
      authApiService.checkUserIdAvailability({ checkUserIdAvailabilityRequestDto: { userId } }),
    onError: (error: ApiError) => {
      toast.error(error?.message || "중복 확인 중 오류가 발생했습니다")
    },
  })
}
