"use client"

import { useEffect, useState } from "react"

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

import { AuthErrorHandler } from "@/shared/auth/errors/handler"
import { exchangeAuthCode } from "@/shared/auth/services/social-login"

export default function SocialCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams?.get("code")
      // const provider = searchParams?.get("provider")
      const error = searchParams?.get("error")

      if (error) {
        setStatus("error")
        const errorMessage = AuthErrorHandler.getErrorMessage(error)
        setMessage(searchParams?.get("errorMessage") || errorMessage.message)
        return
      }

      if (!code) {
        setStatus("error")
        setMessage("인증 코드가 없습니다.")
        return
      }

      try {
        // 백엔드에서 인증 코드를 토큰으로 교환
        const result = await exchangeAuthCode(code)

        if (!result) {
          setStatus("error")
          const errorMessage = AuthErrorHandler.getErrorMessage("OAUTH_CALLBACK")
          setMessage(errorMessage.message)
          return
        }

        // NextAuth 세션에 사용자 정보 저장
        const signInResult = await signIn("credentials", {
          email: result.user.email,
          password: "social-login", // 소셜 로그인 식별자
          redirect: false,
        })

        if (signInResult?.ok) {
          setStatus("success")
          setMessage("로그인 성공! 메인 페이지로 이동합니다.")

          // 잠시 후 메인 페이지로 리다이렉트
          setTimeout(() => {
            router.push("/")
          }, 1000)
        } else {
          setStatus("error")
          const errorMessage = AuthErrorHandler.getErrorMessage("CREDENTIALS_SIGNIN")
          setMessage(errorMessage.message)
        }
      } catch (error) {
        const handledError = AuthErrorHandler.handle(error)
        AuthErrorHandler.logError(handledError, "Social Callback")

        setStatus("error")
        const errorMessage = AuthErrorHandler.getErrorMessage("OAUTH_CALLBACK")
        setMessage(errorMessage.message)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-4 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">소셜 로그인 처리 중...</h2>

          {status === "loading" && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {status === "success" && (
            <div className="text-green-600">
              <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-red-600">
              <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p>{message}</p>
              <button
                onClick={() => router.push("/auth/signin")}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                로그인 페이지로 돌아가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
