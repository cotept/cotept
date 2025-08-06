import CredentialsProvider from "next-auth/providers/credentials"

import { z } from "zod"

import type { Provider } from "next-auth/providers"

import { authApiService } from "@/shared/api/services/auth-api-service"
import { AuthErrorHandler } from "@/shared/auth/errors/handler"

const signInSchema = z.object({
  id: z.string({ required_error: "ID is required" }).min(1, "ID is required"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
})

export const credentialsProvider: Provider = CredentialsProvider({
  id: "credentials",
  name: "credentials",
  credentials: {
    id: { label: "ID", type: "text" },
    password: { label: "Password", type: "password" },
  },
  authorize: async (credentials) => {
    try {
      const { id, password } = signInSchema.parse(credentials)

      const response = await authApiService.login({ 
        loginRequestDto: { id, password } 
      })

      if (response.data?.accessToken) {
        // TODO: 백엔드 API 응답 구조에 맞게 수정 필요
        const responseData = response.data as any
        return {
          id: responseData.userId || id,
          email: responseData.email || id,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          role: responseData.role,
        }
      }

      // 로그인 실패 시 null 반환 (NextAuth가 CredentialsSignin으로 처리)
      return null
    } catch (error) {
      const handledError = AuthErrorHandler.handle(error)
      AuthErrorHandler.logError(handledError, "Credentials Provider")

      // NextAuth는 null을 반환하면 CredentialsSignin 에러로 처리
      return null
    }
  },
})
