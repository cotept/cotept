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
      user: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      },
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
export const handleClientError: ErrorHandler = async (error, originalRequest) => {
  const processedError = ApiErrorHandler.process(error)

  if (processedError.type !== ErrorType.VALIDATION_ERROR && processedError.type !== ErrorType.CLIENT_ERROR) {
    return null
  }

  showErrorToast(processedError.message, originalRequest)
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
