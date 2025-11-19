import type { CotePtUser } from "@/shared/types/auth"
import type { NextAuthConfig } from "next-auth"

export const authCallbacks: NextAuthConfig["callbacks"] = {
  signIn: async ({ user, account }) => {
    // 로그인 성공 조건 검증
    if (
      user?.idx &&
      (account?.provider === "credentials" || account?.provider === "google" || account?.provider === "github")
    ) {
      return true
    }
    return false
  },
  jwt: async ({ token, trigger, user, session }) => {
    // 초기 로그인 시 user 정보를 token.user 객체로 저장
    if (user) {
      const { accessToken, refreshToken, ...member } = user as any
      token.member = member as CotePtUser
      token.accessToken = accessToken
      token.refreshToken = refreshToken
    }

    // session.update() 호출 시 사용자 정보 업데이트
    if (trigger === "update" && session?.user) {
      token.member = session.user as CotePtUser
    }

    return token
  },
  session: async ({ session, token }) => {
    // 토큰 정보를 세션에 복사
    session.accessToken = token.accessToken as string
    session.refreshToken = token.refreshToken as string

    // token.member를 session.member에 할당
    if (token.member) {
      session.member = token.member as CotePtUser
    }

    return session
  },
  redirect: async ({ url, baseUrl }) => {
    // 상대 경로인 경우 baseUrl에 추가
    if (url.startsWith("/")) {
      return `${baseUrl}${url}`
    }
    // 같은 도메인인 경우 허용
    if (url.startsWith(baseUrl)) {
      return url
    }
    // 기본적으로 baseUrl로 리다이렉트
    return baseUrl
  },
}
