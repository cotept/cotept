import { isAxiosError } from "axios"

import { getAuthErrorMessage } from "./messages"

export class AuthErrorHandler {
  static handle(error: unknown): Error {
    // Axios 에러인 경우
    if (isAxiosError(error)) {
      return this.handleAxiosError(error)
    }

    // 일반 Error인 경우
    if (error instanceof Error) {
      return error
    }

    // 알 수 없는 에러인 경우
    return this.handleUnknownError(error)
  }

  private static handleAxiosError(error: any): Error {
    const message = error.response?.data?.message || error.message || "네트워크 오류가 발생했습니다."
    return new Error(message)
  }

  private static handleUnknownError(_error: unknown): Error {
    console.error("AuthErrorHandler.handleUnknownError", _error)
    return new Error("예상치 못한 오류가 발생했습니다.")
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
