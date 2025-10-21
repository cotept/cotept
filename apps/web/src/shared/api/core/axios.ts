import { getCsrfToken, getSession } from "next-auth/react"

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios"

import { defaultErrorHandlers } from "@/shared/api/core/errors/interceptors"

declare module "axios" {
  export interface AxiosRequestConfig {
    silent?: boolean
  }
}

class ApiClient {
  private instance: AxiosInstance
  private errorHandlers = defaultErrorHandlers

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || "/api") {
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
        if (typeof window !== "undefined") {
          try {
            const session = await getSession()
            const csrfToken = await getCsrfToken()

            if (session?.accessToken) {
              config.headers.Authorization = `Bearer ${session.accessToken}`
            }
            if (csrfToken) {
              config.headers["X-CSRF-Token"] = csrfToken
            }
          } catch (error) {
            console.warn("Failed to get session:", error)
          }
        }

        return config
      },
      (error) => Promise.reject(error),
    )

    // 응답 인터셉터 - 핸들러 체인만 실행
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean
          silent?: boolean
        }

        // 에러 핸들러 체인 실행
        for (const handler of this.errorHandlers) {
          try {
            const result = await handler(error, originalRequest, this.instance)
            if (result) return result
          } catch (handlerError) {
            return Promise.reject(handlerError)
          }
        }

        // 모든 핸들러 통과 시 에러 전파
        return Promise.reject(error)
      },
    )
  }

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
