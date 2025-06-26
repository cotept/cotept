// 소셜 로그인을 위한 백엔드 리다이렉트 함수들
import { isAxiosError } from "axios"

import authApi from "@/shared/auth/services/auth-api"

export const redirectToGoogleAuth = () => {
  const redirectUrl = encodeURIComponent(`${window.location.origin}/auth/social-callback`)
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?redirectUrl=${redirectUrl}`
}

export const redirectToGithubAuth = () => {
  const redirectUrl = encodeURIComponent(`${window.location.origin}/auth/social-callback`)
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github?redirectUrl=${redirectUrl}`
}

// 인증 코드를 실제 토큰으로 교환하는 함수
export const exchangeAuthCode = async (
  code: string,
): Promise<{
  accessToken: string
  refreshToken?: string
  user: any
} | null> => {
  try {
    const response = await authApi.exchangeAuthCode(code)

    if (response.success && response.data?.accessToken) {
      return {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: {
          id: response.data.userId,
          email: response.data.email,
          name: response.data.name,
          role: response.data.role,
        },
      }
    }

    return null
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(`소셜 로그인 토큰 교환 실패: ${error.response?.data?.message || error.message}`)
    }
    return null
  }
}
