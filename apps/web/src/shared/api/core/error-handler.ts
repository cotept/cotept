import { QueryCache, QueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"

import { ApiError } from "./types"

// 에러 타입 정의
export enum ErrorCode {
  NETWORK_ERROR = "NETWORK_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
}

// 글로벌 에러 핸들러
export class GlobalErrorHandler {
  static handle(error: ApiError) {
    switch (error.code) {
      case ErrorCode.UNAUTHORIZED:
        this.handleUnauthorized(error)
        break
      case ErrorCode.FORBIDDEN:
        this.handleForbidden(error)
        break
      case ErrorCode.NOT_FOUND:
        this.handleNotFound(error)
        break
      case ErrorCode.VALIDATION_ERROR:
        this.handleValidationError(error)
        break
      case ErrorCode.NETWORK_ERROR:
        this.handleNetworkError(error)
        break
      default:
        this.handleGenericError(error)
    }
  }

  private static handleUnauthorized(error: ApiError) {
    toast.error(error.message || "로그인이 필요합니다.")
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login"
    }
  }

  private static handleForbidden(error: ApiError) {
    toast.error(error.message || "접근 권한이 없습니다.")
  }

  private static handleNotFound(error: ApiError) {
    toast.error(error.message || "요청한 리소스를 찾을 수 없습니다.")
  }

  private static handleValidationError(error: ApiError) {
    const message = error.message || "입력값을 확인해주세요."
    toast.error(message)
  }

  private static handleNetworkError(error: ApiError) {
    toast.error(error.message || "네트워크 연결을 확인해주세요.")
  }

  private static handleGenericError(error: ApiError) {
    toast.error(error.message || "오류가 발생했습니다.")
  }
}

// React Query 전역 에러 핸들러 설정
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // 네트워크 에러는 재시도, 인증 에러는 재시도 안함
        if (error?.code === ErrorCode.UNAUTHORIZED) return false
        return failureCount < 2
      },
    },
    mutations: {
      onError(error) {
        return isAxiosError(error)
          ? GlobalErrorHandler.handle(error as unknown as ApiError)
          : toast.error("알 수 없는 오류가 발생했습니다.")
      },
      retry: false, // 뮤테이션은 재시도 안함
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      return isAxiosError(error)
        ? GlobalErrorHandler.handle(error as unknown as ApiError)
        : toast.error("알 수 없는 오류가 발생했습니다.")
    },
  }),
})
