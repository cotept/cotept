"use client"

import { useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import { AuthErrorHandler } from "@/shared/auth/errors/handler"
import authApi from "@/shared/auth/services/auth-api"

export default function SocialLinkCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const status = searchParams?.get("status")
  const token = searchParams?.get("token")
  const email = searchParams?.get("email")
  const provider = searchParams?.get("provider")

  const handleConfirmLink = async (confirm: boolean) => {
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await authApi.confirmSocialLink(token, confirm)

      if (response.success) {
        if (confirm && response.data?.code) {
          // 연결 확인 후 소셜 콜백 페이지로 리다이렉트 (코드와 함께)
          router.push(`/auth/social-callback?code=${response.data.code}&provider=${provider}`)
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
      AuthErrorHandler.logError(handledError, "Social Link Callback")

      const errorMessage = AuthErrorHandler.getErrorMessage("ACCOUNT_NOT_LINKED")
      setError(errorMessage.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (status !== "pending_link" || !token || !email || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-4 p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">잘못된 접근</h2>
          <p className="text-gray-600 mb-4">유효하지 않은 연결 요청입니다.</p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-4 p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">계정 연결 확인</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 mb-2">
              <strong>{email}</strong> 계정이 이미 존재합니다.
            </p>
            <p className="text-sm text-blue-700">
              이 이메일에 <strong>{provider}</strong> 계정을 연결하시겠습니까?
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => handleConfirmLink(true)}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  처리 중...
                </div>
              ) : (
                "네, 연결합니다"
              )}
            </button>

            <button
              onClick={() => handleConfirmLink(false)}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              아니요, 취소합니다
            </button>

            {error && (
              <button
                onClick={() => router.push("/auth/signin")}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                로그인 페이지로 돌아가기
              </button>
            )}
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>계정을 연결하면 {provider} 계정으로도 로그인할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
