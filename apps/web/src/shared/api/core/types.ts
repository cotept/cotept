import { AxiosError } from "axios"

// 기본 API 응답 타입
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 에러 응답
export interface ApiError extends AxiosError {
  timestamp: string
}

// HTTP 메서드별 제네릭 타입
export interface GetRequest {
  params?: Record<string, any>
  query?: Record<string, any>
}

export interface PostRequest<T = any> {
  body: T
  params?: Record<string, any>
}

export interface PutRequest<T = any> {
  body: T
  params: Record<string, any>
}

export interface DeleteRequest {
  params: Record<string, any>
}

// 베이스 엔티티 타입
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// 쿼리 옵션 타입
export interface QueryConfig {
  enabled?: boolean
  staleTime?: number
  gcTime?: number
}


// 사용자 타입 (예시)
export interface User extends BaseEntity {
  email: string
  name: string
  role: "MENTEE" | "MENTOR" | "ADMIN"
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED"
}

export interface CreateUserRequest {
  email: string
  password: string
  name: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
}
