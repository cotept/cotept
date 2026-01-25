import { type AxiosError, isAxiosError } from "axios"

import { getAuthErrorMessage } from "./messages"

/**
 * API 에러 응답 구조
 */
interface ApiErrorResponse {
  type?: string
  message?: string
  statusCode?: number
  retryable?: boolean
  error?: string
  errors?: string[]
}

/**
 * 확장된 Error 타입 (API 에러 정보 포함)
 */
export interface EnhancedError extends Error {
  type?: string
  statusCode?: number
  retryable?: boolean
  originalError?: unknown
}

export class AuthErrorHandler {
  static handle(error: unknown): EnhancedError {
    // Axios 에러인 경우
    if (isAxiosError(error)) {
      return this.handleAxiosError(error)
    }

    // 일반 Error인 경우
    if (error instanceof Error) {
      return error as EnhancedError
    }

    // 알 수 없는 에러인 경우
    return this.handleUnknownError(error)
  }

  /**
   * Axios 에러 처리
   *
   * ★ Insight:
   * - 백엔드 API 에러 응답 구조를 정확히 파싱
   * - 에러 타입, 상태 코드, 재시도 가능 여부 정보 보존
   * - 사용자 친화적인 메시지 제공
   */
  private static handleAxiosError(error: AxiosError<ApiErrorResponse>): EnhancedError {
    const response = error.response?.data

    // 백엔드 API 에러 응답이 있는 경우
    if (response) {
      const enhancedError = new Error(
        response.message || response.error || error.message || "서버 오류가 발생했습니다.",
      ) as EnhancedError

      enhancedError.type = response.type
      enhancedError.statusCode = response.statusCode || error.response?.status
      enhancedError.retryable = response.retryable
      enhancedError.originalError = error

      return enhancedError
    }

    // 네트워크 에러 또는 응답 없음
    const networkError = new Error(
      error.message || "네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.",
    ) as EnhancedError

    networkError.type = "NETWORK_ERROR"
    networkError.retryable = true
    networkError.originalError = error

    return networkError
  }

  private static handleUnknownError(_error: unknown): EnhancedError {
    // console.error("AuthErrorHandler.handleUnknownError", _error)
    console.error("AuthErrorHandler.handleUnknownError", JSON.stringify(_error))

    const unknownError = new Error("예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.") as EnhancedError

    unknownError.type = "UNKNOWN_ERROR"
    unknownError.retryable = true
    unknownError.originalError = _error

    return unknownError
  }

  static getErrorMessage(errorType?: string) {
    return getAuthErrorMessage(errorType)
  }

  static logError(error: Error, context?: string) {
    console.error(`[AuthError${context ? ` - ${context}` : ""}]:`, {
      message: error.message,
      stack: error.stack,
    })
  }
}
