import CredentialsProvider from "next-auth/providers/credentials"

import { z } from "zod"

import type { Provider } from "next-auth/providers"

import { AuthErrorHandler } from "@/shared/auth/errors/handler"
import authApi from "@/shared/auth/services/auth-api"

const signInSchema = z.object({
  email: z.string({ required_error: "Email is required" }).min(1, "Email is required").email("Invalid email"),
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
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  authorize: async (credentials) => {
    try {
      const { email, password } = signInSchema.parse(credentials)

      const response = await authApi.login({ email, password })

      if (response.success && response.data?.accessToken) {
        return {
          id: response.data.userId || email,
          email,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          role: response.data.role,
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
