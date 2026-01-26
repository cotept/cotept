import { Session } from "next-auth"
import { getSession } from "next-auth/react"

import { UserRole } from "@repo/api-client"

import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { handleUnauthorizedError } from "../interceptors"

import { update } from "@/auth"
import { ApiErrorHandler } from "@/shared/api/core/errors/handlers"
import { ErrorType, ProcessedError } from "@/shared/api/core/types"
import { CotePtUser } from "@/shared/types/auth"

// 모킹
vi.mock("next-auth/react", () => ({
  getSession: vi.fn(),
}))

vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>()
  return {
    ...actual,
    default: {
      ...actual.default,
      post: vi.fn(),
    },
  }
})

vi.mock("@/auth", () => ({
  update: vi.fn(),
}))

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}))

vi.mock("@/shared/api/core/errors/handlers", () => ({
  ApiErrorHandler: {
    process: vi.fn(),
  },
}))

describe("handleUnauthorizedError", () => {
  const mockAxiosInstance = vi.fn()

  // 테스트용 mock member 객체
  const mockMember: CotePtUser = {
    idx: 1,
    userId: "test-user",
    email: "test@example.com",
    role: UserRole.MENTEE,
    tokenType: "Bearer",
    expiresIn: 3600,
  }

  // 테스트용 mock session 생성 헬퍼
  const createMockSession = (overrides?: Partial<Session>): Session => ({
    expires: "2025-01-01",
    member: mockMember,
    ...overrides,
  })

  // 테스트용 mock ProcessedError 생성 헬퍼
  const createMockProcessedError = (overrides?: Partial<ProcessedError>): ProcessedError => ({
    type: ErrorType.AUTHENTICATION_ERROR,
    message: "인증이 필요합니다",
    originalError: new Error("Unauthorized"),
    retryable: false,
    statusCode: 401,
    ...overrides,
  })

  const createMockError = (status: number = 401): AxiosError => {
    const error = new Error("Unauthorized") as AxiosError
    error.response = {
      status,
      data: { message: "Unauthorized" },
      headers: {},
      statusText: "Unauthorized",
      config: {} as InternalAxiosRequestConfig,
    }
    error.config = {
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig
    error.isAxiosError = true
    return error
  }

  const createMockRequest = (options?: {
    _retry?: boolean
    silent?: boolean
  }): InternalAxiosRequestConfig & {
    _retry?: boolean
    silent?: boolean
  } => ({
    headers: new AxiosHeaders(),
    ...options,
  })

  beforeEach(() => {
    vi.clearAllMocks()

    // 브라우저 환경 시뮬레이션
    vi.stubGlobal("window", {
      location: { href: "" },
    })

    // 기본 모킹 설정
    vi.mocked(ApiErrorHandler.process).mockReturnValue(createMockProcessedError())
  })

  describe("기본 기능 (Right)", () => {
    it("401 에러가 아닐 때 null을 반환한다", async () => {
      // Given
      vi.mocked(ApiErrorHandler.process).mockReturnValue(
        createMockProcessedError({
          type: ErrorType.CLIENT_ERROR,
          message: "Bad Request",
          statusCode: 400,
        }),
      )
      const error = createMockError(400)
      const request = createMockRequest()

      // When
      const result = await handleUnauthorizedError(error, request, mockAxiosInstance)

      // Then
      expect(result).toBeNull()
    })

    it("토큰 갱신 성공 시 원래 요청을 재시도한다", async () => {
      // Given
      const error = createMockError()
      const request = createMockRequest()
      const newTokens = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      }

      vi.mocked(getSession).mockResolvedValue(
        createMockSession({
          refreshToken: "old-refresh-token",
        }),
      )
      vi.mocked(axios.post).mockResolvedValue({ data: newTokens })
      vi.mocked(update).mockResolvedValue(null)
      mockAxiosInstance.mockResolvedValue({ data: "success" })

      // When
      const result = await handleUnauthorizedError(error, request, mockAxiosInstance)

      // Then
      expect(result).toEqual({ data: "success" })
      expect(request.headers?.get("Authorization")).toBe(`Bearer ${newTokens.accessToken}`)
    })

    it("토큰 갱신 후 update 함수를 올바른 페이로드로 호출한다", async () => {
      // Given
      const error = createMockError()
      const request = createMockRequest()
      const newTokens = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      }

      vi.mocked(getSession).mockResolvedValue(
        createMockSession({
          refreshToken: "old-refresh-token",
        }),
      )
      vi.mocked(axios.post).mockResolvedValue({ data: newTokens })
      vi.mocked(update).mockResolvedValue(null)
      mockAxiosInstance.mockResolvedValue({ data: "success" })

      // When
      await handleUnauthorizedError(error, request, mockAxiosInstance)

      // Then
      expect(update).toHaveBeenCalledWith({
        trigger: "TOKEN_REFRESH",
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      })
    })
  })

  describe("경계 조건 (Boundary)", () => {
    it("이미 재시도한 요청(_retry=true)은 null을 반환한다", async () => {
      // Given
      const error = createMockError()
      const request = createMockRequest({ _retry: true })

      // When
      const result = await handleUnauthorizedError(error, request, mockAxiosInstance)

      // Then
      expect(result).toBeNull()
      expect(getSession).not.toHaveBeenCalled()
    })

    it("서버 환경(window undefined)에서는 null을 반환한다", async () => {
      // Given
      vi.stubGlobal("window", undefined)
      const error = createMockError()
      const request = createMockRequest()

      // When
      const result = await handleUnauthorizedError(error, request, mockAxiosInstance)

      // Then
      expect(result).toBeNull()
    })
  })

  describe("에러 조건 (Error)", () => {
    it("세션에 refreshToken이 없으면 에러를 throw한다", async () => {
      // Given
      const error = createMockError()
      const request = createMockRequest()

      vi.mocked(getSession).mockResolvedValue(
        createMockSession({
          refreshToken: undefined,
        }),
      )

      // When & Then
      await expect(handleUnauthorizedError(error, request, mockAxiosInstance)).rejects.toThrow(
        "No refresh token available",
      )
    })

    it("토큰 갱신 API가 accessToken을 반환하지 않으면 에러를 throw한다", async () => {
      // Given
      const error = createMockError()
      const request = createMockRequest()

      vi.mocked(getSession).mockResolvedValue(
        createMockSession({
          refreshToken: "old-refresh-token",
        }),
      )
      vi.mocked(axios.post).mockResolvedValue({ data: {} }) // accessToken 없음

      // When & Then
      await expect(handleUnauthorizedError(error, request, mockAxiosInstance)).rejects.toThrow("Token refresh failed")
    })

    it("토큰 갱신 API 호출이 실패하면 에러를 throw한다", async () => {
      // Given
      const error = createMockError()
      const request = createMockRequest()
      const apiError = new Error("Network Error")

      vi.mocked(getSession).mockResolvedValue(
        createMockSession({
          refreshToken: "old-refresh-token",
        }),
      )
      vi.mocked(axios.post).mockRejectedValue(apiError)

      // When & Then
      await expect(handleUnauthorizedError(error, request, mockAxiosInstance)).rejects.toThrow("Network Error")
    })
  })
})
