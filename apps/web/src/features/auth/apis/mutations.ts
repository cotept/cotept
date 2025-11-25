import { useMutation, type UseMutationOptions, useQueryClient } from "@tanstack/react-query"
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

// 로그인
// export function useLogin(options?: UseMutationOptions<TokenResponseWrapper, ApiError, AuthApiLoginRequest>) {
//   return useBaseMutation<TokenResponseWrapper, ApiError, AuthApiLoginRequest>({
//     mutationFn: (data) => authApiService.login(data),
//     invalidateKeys: [authKeys.all.queryKey],
//     successMessage: "로그인에 성공했습니다.",
//     onSuccess: async (response) => {
//       // NextAuth 세션 업데이트
//       if (response.data) {
//         // 토큰 정보로 세션 업데이트 (구체적인 구현은 NextAuth 설정에 따라 다름)
//         // const { signIn } = await import("next-auth/react")
//       }
//     },
//     ...options, // Fat Hook의 onSuccess도 실행됨
//   })
// }

// 로그아웃
export function useLogout(options?: UseMutationOptions<LogoutResponseWrapper, ApiError, void>) {
  const queryClient = useQueryClient()

  return useBaseMutation<LogoutResponseWrapper, ApiError, void>({
    mutationFn: () => authApiService.logout(),
    invalidateKeys: [authKeys.all.queryKey],
    successMessage: "로그아웃되었습니다.",
    onSuccess: async () => {
      // NextAuth 세션 정리
      const { signOut } = await import("next-auth/react")
      await signOut({ redirect: false })

      // 모든 인증 쿼리 클리어
      queryClient.clear()
    },
    ...options,
  })
}

// 토큰 갱신
export function useRefreshToken(
  options?: UseMutationOptions<TokenResponseWrapper, ApiError, AuthApiRefreshTokenRequest>,
) {
  return useBaseMutation<TokenResponseWrapper, ApiError, AuthApiRefreshTokenRequest>({
    mutationFn: (data) => authApiService.refreshToken(data),
    invalidateKeys: [authKeys.all.queryKey],
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
    },
    ...options,
  })
}

// 소셜 로그인 코드 교환
export function useExchangeAuthCode(
  options?: UseMutationOptions<TokenResponseWrapper, ApiError, AuthApiExchangeAuthCodeRequest>,
) {
  return useBaseMutation<TokenResponseWrapper, ApiError, AuthApiExchangeAuthCodeRequest>({
    mutationFn: (data) => authApiService.exchangeAuthCode(data),
    invalidateKeys: [authKeys.all.queryKey, authKeys.socialAuth().queryKey],
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
    },
    ...options,
  })
}

// 소셜 계정 연결 확인
export function useConfirmSocialLink(
  options?: UseMutationOptions<TokenResponseWrapper, ApiError, AuthApiConfirmSocialLinkRequest>,
) {
  return useBaseMutation<TokenResponseWrapper, ApiError, AuthApiConfirmSocialLinkRequest>({
    mutationFn: (data) => authApiService.confirmSocialLink(data),
    invalidateKeys: [authKeys.profile().queryKey, authKeys.socialAuth().queryKey],
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
    },
    ...options,
  })
}

// 인증 코드 발송
export function useSendVerificationCode(
  options?: UseMutationOptions<VerificationCodeResponseWrapper, ApiError, AuthApiSendVerificationCodeRequest>,
) {
  return useBaseMutation<VerificationCodeResponseWrapper, ApiError, AuthApiSendVerificationCodeRequest>({
    mutationFn: (data) => authApiService.sendVerificationCode(data),
    invalidateKeys: [authKeys.verifications().queryKey],
    successMessage: "인증 코드가 발송되었습니다.",
    ...options,
  })
}

// 인증 코드 확인 (토스트 메시지 없음 - 사용자가 직접 처리)
export function useVerifyCode(
  options?: UseMutationOptions<EmailVerificationResultResponseWrapper, ApiError, AuthApiVerifyCodeRequest>,
) {
  return useBaseMutation<EmailVerificationResultResponseWrapper, ApiError, AuthApiVerifyCodeRequest>({
    mutationFn: (data) => authApiService.verifyCode(data),
    invalidateKeys: [authKeys.verifications().queryKey],
    // successMessage 없음 - Fat Hook에서 성공/실패 메시지 처리
    ...options,
  })
}

// 아이디 찾기
export function useFindId(options?: UseMutationOptions<FindIdResponseWrapper, ApiError, AuthApiFindIdRequest>) {
  return useBaseMutation<FindIdResponseWrapper, ApiError, AuthApiFindIdRequest>({
    mutationFn: (data) => authApiService.findId(data),
    invalidateKeys: [authKeys.all.queryKey],
    successMessage: "아이디 찾기가 완료되었습니다.",
    ...options,
  })
}

// 비밀번호 재설정
export function useResetPassword(
  options?: UseMutationOptions<ResetPasswordResponseWrapper, ApiError, AuthApiResetPasswordRequest>,
) {
  return useBaseMutation<ResetPasswordResponseWrapper, ApiError, AuthApiResetPasswordRequest>({
    mutationFn: (data) => authApiService.resetPassword(data),
    invalidateKeys: [authKeys.all.queryKey],
    successMessage: "비밀번호가 재설정되었습니다.",
    ...options,
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
      console.log("🚨 [UserId Check] Error:", error)
      toast.error(error?.message || "중복 확인 중 오류가 발생했습니다")
    },
  })
}
