import type { NextAuthConfig } from "next-auth"

export const authCallbacks: NextAuthConfig["callbacks"] = {
  signIn: async ({}) => {
    // signIn: async ({ user, account, profile }) => {
    return true
  },
  jwt: async ({ token, user }) => {
    if (user) {
      token.accessToken = user.accessToken
      token.refreshToken = user.refreshToken
      token.role = (user as any).role
    }
    return token
  },
  session: async ({ session, token }) => {
    session.accessToken = token.accessToken as string
    if (session.user) {
      session.user.id = token.sub as string
      session.user.role = token.role as string
    }
    return session
  },
  redirect: async ({ url, baseUrl }) => {
    if (url.startsWith(baseUrl)) {
      return url
    }
    return baseUrl
  },
}
