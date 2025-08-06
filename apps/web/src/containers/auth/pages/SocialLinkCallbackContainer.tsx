"use client"

import { useRouter } from "next/navigation"

import { Button } from "@repo/shared/src/components/button"

import { useSocialLinkCallback } from "@/features/auth/hooks"
import { InlineLoading } from "@/shared/ui/loading"

export function SocialLinkCallbackContainer() {
  const router = useRouter()
  const { params, isLoading, error, isValidRequest, confirmLink } = useSocialLinkCallback()

  // 잘못된 요청인 경우
  if (!isValidRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-4 p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">잘못된 접근</h2>
          <p className="text-gray-600 mb-4">유효하지 않은 연결 요청입니다.</p>
          <Button onClick={() => router.push("/auth/signin")} className="w-full">
            로그인 페이지로 이동
          </Button>
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
              <strong>{params.email}</strong> 계정이 이미 존재합니다.
            </p>
            <p className="text-sm text-blue-700">
              이 이메일에 <strong>{params.provider}</strong> 계정을 연결하시겠습니까?
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => confirmLink(true)}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4">
              {isLoading ? (
                <div className="flex items-center">
                  <InlineLoading className="mr-2" />
                  처리 중...
                </div>
              ) : (
                "네, 연결합니다"
              )}
            </Button>

            <Button variant="outline" onClick={() => confirmLink(false)} disabled={isLoading} className="w-full">
              아니요, 취소합니다
            </Button>

            {error && (
              <Button variant="outline" onClick={() => router.push("/auth/signin")} className="w-full">
                로그인 페이지로 돌아가기
              </Button>
            )}
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>계정을 연결하면 {params.provider} 계정으로도 로그인할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}