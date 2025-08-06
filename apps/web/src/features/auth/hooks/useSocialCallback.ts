"use client"

import { useEffect, useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import { update } from "@/auth"
import { AuthErrorHandler } from "@/shared/auth/errors/handler"
import { exchangeAuthCode } from "@/shared/auth/services/social-login"

type CallbackStatus = "loading" | "success" | "error"

interface UseSocialCallbackResult {
  status: CallbackStatus
  message: string
  error: string | null
  isLoading: boolean
  retry: () => void
}

export function useSocialCallback(): UseSocialCallbackResult {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<CallbackStatus>("loading")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleCallback = async () => {
    setStatus("loading")
    setMessage("")
    setError(null)

    try {
      const code = searchParams?.get("code")
      const errorParam = searchParams?.get("error")

      // 에러 파라미터가 있는 경우
      if (errorParam) {
        setStatus("error")
        const errorMessage = AuthErrorHandler.getErrorMessage(errorParam)
        const customMessage = searchParams?.get("errorMessage") || errorMessage.message
        setMessage(customMessage)
        setError(customMessage)
        return
      }

      // 인증 코드가 없는 경우
      if (!code) {
        setStatus("error")
        const errorMessage = "인증 코드가 없습니다."
        setMessage(errorMessage)
        setError(errorMessage)
        return
      }

      // 백엔드에서 인증 코드를 토큰으로 교환
      const result = await exchangeAuthCode(code)

      if (!result) {
        setStatus("error")
        const errorMessage = AuthErrorHandler.getErrorMessage("OAUTH_CALLBACK")
        setMessage(errorMessage.message)
        setError(errorMessage.message)
        return
      }

      // NextAuth 세션에 토큰 정보 저장
      await update({
        user: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      })

      setStatus("success")
      setMessage("로그인 성공! 메인 페이지로 이동합니다.")

      // 잠시 후 메인 페이지로 리다이렉트
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch (error) {
      const handledError = AuthErrorHandler.handle(error)
      AuthErrorHandler.logError(handledError, "Social Callback Hook")

      setStatus("error")
      const errorMessage = AuthErrorHandler.getErrorMessage("OAUTH_CALLBACK")
      setMessage(errorMessage.message)
      setError(errorMessage.message)
    }
  }

  const retry = () => {
    handleCallback()
  }

  useEffect(() => {
    if (searchParams) {
      handleCallback()
    }
  }, [searchParams])

  return {
    status,
    message,
    error,
    isLoading: status === "loading",
    retry,
  }
}
