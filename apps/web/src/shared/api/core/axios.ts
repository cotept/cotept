import { getCsrfToken, getSession } from "next-auth/react"

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  isAxiosError,
} from "axios"

import { ApiError } from "@/shared/api/core/types"

class ApiClient {
  private instance: AxiosInstance
  private abortController: AbortController

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || "/api") {
    this.abortController = new AbortController()

    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 요청 인터셉터
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // 서버 사이드에서는 세션 정보를 가져오지 않음 (NextAuth v5)
        if (typeof window !== "undefined") {
          try {
            // 클라이언트에서만 Next-auth 세션 정보 가져오기
            const session = await getSession()
            const csrfToken = await getCsrfToken()

            if (session?.accessToken) {
              config.headers.Authorization = `Bearer ${session.accessToken}`
            }
            if (csrfToken) {
              config.headers["X-CSRF-Token"] = csrfToken // 헤더명은 서버 요구에 맞게 조정
            }
          } catch (error) {
            // 세션 가져오기 실패 시 무시 (로그인하지 않은 상태일 수 있음)
            console.warn("Failed to get session:", error)
          }
        }

        // Abort controller 추가
        config.signal = this.abortController.signal

        return config
      },
      (error) => Promise.reject(error),
    )

    // 응답 인터셉터
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // 401 에러이고, 재시도한 요청이 아닐 경우, 그리고 클라이언트 사이드일 경우
        if (typeof window !== "undefined" && error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true // 재시도 플래그 설정
          try {
            // 현재 세션에서 refreshToken 가져오기
            const session = await getSession()
            if (!session?.refreshToken) {
              throw new Error("No refresh token available")
            }

            // 1. 토큰 갱신 시도 (독립적인 axios 인스턴스 사용)
            const refreshResponse = await axios.post(
              // authApiService의 basePath가 /auth이므로, 전체 경로는 /api/auth/refresh-token이 됩니다.
              `${process.env.NEXT_PUBLIC_API_URL || "/api"}/auth/refresh-token`,
              { refreshToken: session.refreshToken },
              {
                headers: { "Content-Type": "application/json" },
              },
            )

            const newTokens = refreshResponse.data

            if (!newTokens || !newTokens.accessToken) {
              throw new Error("Token refresh failed - no new access token received")
            }

            // 2. NextAuth 세션 업데이트
            const { update } = await import("@/auth")
            await update({
              user: {
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken,
              },
            })

            // 3. 새로운 토큰으로 헤더 설정 후 원래 요청 재시도
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
            }
            return this.instance(originalRequest)
          } catch (refreshError) {
            if (typeof window !== "undefined") {
              window.location.href = "/auth/signin?message=세션이 만료되었습니다. 다시 로그인해주세요."
              return Promise.reject(refreshError)
            }
          }
        }

        return Promise.reject(this.normalizeError(error))
      },
    )
  }

  private normalizeError(error: unknown): ApiError {
    if (isAxiosError(error)) {
      // 서버에서 내려준 에러 데이터가 있다면 그대로 사용
      return {
        ...error,
        message: error.response?.data?.message || error.message,
        timestamp: new Date().toISOString(),
        ...error.response?.data, // 서버에서 보낸 추가 필드(code, details 등)를 포함
      }
    }

    if (error instanceof Error) {
      // 일반 Error 객체인 경우
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      } as ApiError
    }

    // 그 외 알 수 없는 에러
    return {
      message: "An unknown error occurred",
      timestamp: new Date().toISOString(),
    } as ApiError
  }

  // 요청 취소
  cancelRequests() {
    this.abortController.abort()
    this.abortController = new AbortController()
  }

  // OpenAPI 클라이언트를 위한 axios 인스턴스 접근자
  get axiosInstance(): AxiosInstance {
    return this.instance
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.get(url, config)
    return res.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.post(url, data, config)
    return res.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.put(url, data, config)
    return res.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.instance.delete(url, config)
    return res.data
  }
}

export const apiClient = new ApiClient()
