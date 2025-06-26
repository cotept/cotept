import NextAuth from "next-auth"

import type { NextAuthConfig } from "next-auth"

import { authCallbacks } from "@/shared/auth/callbacks/callbacks"
import { credentialsProvider } from "@/shared/auth/providers/credentials"

export const authConfig: NextAuthConfig = {
  providers: [credentialsProvider],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: authCallbacks,
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig

const nextAuth = NextAuth(authConfig)

export const { handlers, signIn, signOut, unstable_update: update } = nextAuth
export const auth = nextAuth.auth as typeof nextAuth.auth
// export const { handlers, signIn, signOut, auth, unstable_update: update } = NextAuth(authConfig)
