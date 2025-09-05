import { ErrorInfo } from "react"

import { Button } from "@repo/shared/components/button"

import { AuthErrorHandler } from "@/shared/auth/errors/handler"

// ErrorBoundary fallback 함수 - 3개의 개별 파라미터
export function AuthErrorFallback(error: Error, errorInfo: ErrorInfo, resetError: () => void) {
  // 인증 관련 에러 로깅
  const handledError = AuthErrorHandler.handle(error)
  AuthErrorHandler.logError(handledError, "Auth Error Boundary")

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-4 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M6 18h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h2 className="mb-4 text-2xl font-bold text-gray-900">인증 중 문제가 발생했습니다</h2>

        <p className="mb-4 text-gray-600">
          로그인 처리 중 예상치 못한 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해주세요.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left">
            <summary className="mb-2 cursor-pointer text-sm text-gray-500">에러 상세 정보 (개발 모드)</summary>
            <pre className="max-h-32 overflow-auto rounded bg-gray-100 p-3 text-xs">
              {error?.toString()}
              {errorInfo?.componentStack}
            </pre>
          </details>
        )}

        <div className="space-y-2">
          <Button onClick={resetError} className="w-full">
            다시 시도
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/auth/signin")} className="w-full">
            로그인 페이지로 이동
          </Button>
        </div>
      </div>
    </div>
  )
}
