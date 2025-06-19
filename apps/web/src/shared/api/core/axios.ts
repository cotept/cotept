import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { ApiError } from "@/shared/api/core/types"
import { ErrorCode } from "./error-handler"
import { getSession, getCsrfToken } from "next-auth/react"

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
        // Next-auth 세션에서 토큰 가져오기
        const session = await getSession()
        const csrfToken = await getCsrfToken()

        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`
        }
        if (csrfToken) {
          config.headers["X-CSRF-Token"] = csrfToken // 헤더명은 서버 요구에 맞게 조정
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
        if (error.response?.status === 401) {
          // 토큰 만료 시 로그아웃 처리
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login"
          }
        }

        return Promise.reject(this.normalizeError(error))
      },
    )
  }

  private normalizeError(error: AxiosError): ApiError {
    if (error.response?.data) {
      // 서버에서 ApiError 형태로 응답이 온 경우
      return error.response.data as ApiError
    }

    // 네트워크 에러나 기타 에러의 경우 ApiError 형태로 변환
    return {
      ...error,
      timestamp: new Date().toISOString(),
    }
  }

  // 요청 취소
  cancelRequests() {
    this.abortController.abort()
    this.abortController = new AbortController()
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
