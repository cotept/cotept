"use server"

import { AuthError } from "next-auth"

import { signIn } from "@/auth"

export async function signInAction(formData: FormData) {
  try {
    await signIn("credentials", {
      id: formData.get("id"),
      password: formData.get("password"),
      redirectTo: process.env.NEXT_SERVER_SIGNIN_REDIRECT_PATH, // 성공 시 리다이렉트할 경로
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "아이디 또는 비밀번호가 올바르지 않습니다." }
        default:
          return { error: "로그인 중 오류가 발생했습니다." }
      }
    }
    throw error
  }
}
