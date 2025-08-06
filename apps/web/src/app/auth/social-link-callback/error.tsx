"use client"

import { useEffect } from "react"

import { useRouter } from "next/navigation"

import { Button } from "@repo/shared/components/button"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function SocialLinkCallbackError({ error, reset }: ErrorPageProps) {
  const router = useRouter()

  useEffect(() => {
    // 에러 로깅
    console.error("Social link callback error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-4 p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M6 18h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">계정 연결 오류</h2>

        <p className="text-gray-600 mb-4">
          계정 연결 처리 중 문제가 발생했습니다.
          <br />
          잠시 후 다시 시도해주세요.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 mb-2">에러 상세 정보 (개발 모드)</summary>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">{error.message}</pre>
          </details>
        )}

        <div className="space-y-2">
          <Button onClick={reset} className="w-full">
            다시 시도
          </Button>

          <Button variant="outline" onClick={() => router.push("/auth/signin")} className="w-full">
            로그인 페이지로 이동
          </Button>
        </div>
      </div>
    </div>
  )
}
