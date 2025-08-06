"use client"

import { useRouter } from "next/navigation"

import { Button } from "@repo/shared/src/components/button"

import { useSocialCallback } from "@/features/auth/hooks"

export function SocialCallbackContainer() {
  const router = useRouter()
  const { status, message, retry } = useSocialCallback()

  if (status === "loading") {
    // Suspense로 처리되므로 여기서는 렌더링되지 않음
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-4 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">소셜 로그인 처리 중...</h2>

          {status === "success" && (
            <div className="text-green-600">
              <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-lg font-medium">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-red-600">
              <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-lg font-medium mb-4">{message}</p>

              <div className="space-y-2">
                <Button onClick={retry} className="w-full">
                  다시 시도
                </Button>
                <Button variant="outline" onClick={() => router.push("/auth/signin")} className="w-full">
                  로그인 페이지로 돌아가기
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}