"use client"

import { useEffect, useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import { authApiService } from "@/shared/api/services/auth-api-service"
import { AuthErrorHandler } from "@/shared/auth/errors/handler"

interface SocialLinkCallbackParams {
  status: string | null
  token: string | null
  email: string | null
  provider: string | null
}

interface UseSocialLinkCallbackResult {
  params: SocialLinkCallbackParams
  isLoading: boolean
  error: string | null
  isValidRequest: boolean
  confirmLink: (approved: boolean) => Promise<void>
}

export function useSocialLinkCallback(): UseSocialLinkCallbackResult {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // URL 파라미터 추출
  const params: SocialLinkCallbackParams = {
    status: searchParams?.get("status"),
    token: searchParams?.get("token"),
    email: searchParams?.get("email"),
    provider: searchParams?.get("provider"),
  }

  // 유효한 요청인지 검증
  const isValidRequest = params.status === "pending_link" && !!params.token && !!params.email && !!params.provider

  const confirmLink = async (approved: boolean) => {
    if (!params.token) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await authApiService.confirmSocialLink({
        confirmSocialLinkRequestDto: {
          token: params.token,
          approved,
        },
      })

      if (response.data) {
        if (approved) {
          // 연결 승인 시: TokenResponseDto가 반환되므로 토큰을 NextAuth 세션에 저장
          const { accessToken, refreshToken } = response.data
          const { update } = await import("@/auth")
          await update({
            user: {
              accessToken,
              refreshToken,
            },
          })
          // 메인 페이지로 이동
          router.push("/?message=소셜 계정이 성공적으로 연결되었습니다.")
        } else {
          // 연결 거부 시 로그인 페이지로
          router.push("/auth/signin?message=소셜 계정 연결이 취소되었습니다.")
        }
      } else {
        const errorMessage = AuthErrorHandler.getErrorMessage("ACCOUNT_NOT_LINKED")
        setError(errorMessage.message)
      }
    } catch (error) {
      const handledError = AuthErrorHandler.handle(error)
      AuthErrorHandler.logError(handledError, "Social Link Callback Hook")

      const errorMessage = AuthErrorHandler.getErrorMessage("ACCOUNT_NOT_LINKED")
      setError(errorMessage.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 잘못된 접근 시 자동 리다이렉트
  useEffect(() => {
    if (searchParams && !isValidRequest) {
      // 파라미터가 모두 로드된 후에 검증
      const hasAllParams = searchParams.toString().length > 0
      if (hasAllParams) {
        setTimeout(() => {
          router.push("/auth/signin?message=잘못된 접근입니다.")
        }, 1000)
      }
    }
  }, [searchParams, isValidRequest, router])

  return {
    params,
    isLoading,
    error,
    isValidRequest,
    confirmLink,
  }
}
