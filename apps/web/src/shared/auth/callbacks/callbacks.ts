import type { NextAuthConfig } from "next-auth"

export const authCallbacks: NextAuthConfig["callbacks"] = {
  signIn: async ({ user, account }) => {
    // 로그인 성공 조건 검증
    if (
      user?.id &&
      (account?.provider === "credentials" || account?.provider === "google" || account?.provider === "github")
    ) {
      return true
    }
    return false
  },
  jwt: async ({ token, user }) => {
    if (user) {
      // 새로 로그인한 경우, user 객체에서 토큰 정보 복사
      token.accessToken = (user as any).accessToken
      token.refreshToken = (user as any).refreshToken
      token.role = (user as any).role
      token.id = (user as any).id
    }
    return token
  },
  session: async ({ session, token }) => {
    // 세션에 토큰 정보 추가
    session.accessToken = token.accessToken as string
    session.refreshToken = token.refreshToken as string
    if (session.user) {
      session.user.id = token.id as string
      session.user.role = token.role as string
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
