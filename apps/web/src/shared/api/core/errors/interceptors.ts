import { getSession } from "next-auth/react"

import { sleep } from "@repo/shared/src/lib/utils"

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { toast } from "sonner"

import { ApiErrorHandler } from "@/shared/api/core/errors/handlers"
import { ErrorType } from "@/shared/api/core/types"

// 에러 핸들러 타입
export type ErrorHandler = (
  error: AxiosError,
  originalRequest: InternalAxiosRequestConfig & { _retry?: boolean; silent?: boolean },
  axiosInstance: any,
) => Promise<AxiosResponse | null>

// 공통 유틸리티
function showErrorToast(message: string, originalRequest: any) {
  const isSilent = originalRequest?.silent === true
  if (typeof window !== "undefined" && !isSilent) {
    toast.error(message)
  }
}

function isErrorType(error: AxiosError, expectedType: ErrorType) {
  const processedError = ApiErrorHandler.process(error)
  return processedError.type === expectedType ? processedError : null
}

// 네트워크 에러 핸들러
// 💡 전략: 네트워크 에러는 사용자가 어쩔 수 없는 시스템 레벨의 문제이므로,
// 글로벌에서 강제로 알림을 띄워 인지시킵니다.
export const handleNetworkError: ErrorHandler = async (error, originalRequest) => {
  const processedError = isErrorType(error, ErrorType.NETWORK_ERROR)
  if (!processedError) return null

  showErrorToast(processedError.message, originalRequest)
  throw error
}

// 401 인증 에러 핸들러
export const handleUnauthorizedError: ErrorHandler = async (error, originalRequest, axiosInstance) => {
  const processedError = isErrorType(error, ErrorType.AUTHENTICATION_ERROR)
  if (!processedError) return null

  if (typeof window === "undefined" || originalRequest._retry) {
    return null
  }

  originalRequest._retry = true

  try {
    const session = await getSession()
    if (!session?.refreshToken) {
      throw new Error("No refresh token available")
    }

    const refreshResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || "/api"}/auth/refresh-token`,
      { refreshToken: session.refreshToken },
      { headers: { "Content-Type": "application/json" } },
    )

    const newTokens = refreshResponse.data
    if (!newTokens?.accessToken) {
      throw new Error("Token refresh failed")
    }

    const { update } = await import("@/auth")
    await update({
      trigger: "TOKEN_REFRESH",
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    })

    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
    }

    return axiosInstance(originalRequest)
  } catch (refreshError) {
    if (typeof window !== "undefined") {
      toast.error("세션이 만료되었습니다.")
      setTimeout(() => {
        window.location.href = "/auth/signin"
      }, 1000)
    }
    throw refreshError
  }
}

// 5xx 서버 에러 핸들러
export const handleServerError: ErrorHandler = async (error, originalRequest, axiosInstance) => {
  const processedError = isErrorType(error, ErrorType.SERVER_ERROR)
  if (!processedError) return null

  const retryCount = (originalRequest as any).__retryCount || 0

  if (ApiErrorHandler.shouldRetry(processedError, retryCount)) {
    ;(originalRequest as any).__retryCount = retryCount + 1
    const delay = ApiErrorHandler.getRetryDelay(retryCount)

    await sleep(delay)
    return axiosInstance(originalRequest)
  }

  // 재시도 실패 시 글로벌 토스트 표시 (시스템 에러)
  showErrorToast(processedError.message, originalRequest)
  throw error
}

// 403 권한 에러 핸들러
export const handleForbiddenError: ErrorHandler = async (error, originalRequest) => {
  const processedError = isErrorType(error, ErrorType.AUTHORIZATION_ERROR)
  if (!processedError) return null

  showErrorToast(processedError.message, originalRequest)
  throw error
}

// 4xx 클라이언트 에러 핸들러
// 💡 전략: 4xx 에러는 '비즈니스 로직'과 밀접하므로, 글로벌에서 처리하지 않고
// hook이나 component 레벨에서 구체적인 메시지로 처리하도록 넘겨줍니다.
export const handleClientError: ErrorHandler = async (error) => {
  const processedError = ApiErrorHandler.process(error)

  if (processedError.type !== ErrorType.VALIDATION_ERROR && processedError.type !== ErrorType.CLIENT_ERROR) {
    return null
  }

  throw error
}

// Interceptor에서 사용할 핸들러 체인
export const defaultErrorHandlers: ErrorHandler[] = [
  handleNetworkError,
  handleUnauthorizedError,
  handleServerError,
  handleForbiddenError,
  handleClientError,
]
