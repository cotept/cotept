"use client"

import { PropsWithChildren } from "react"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

import type { Session } from "next-auth"

interface SessionProviderProps extends PropsWithChildren {
  session: Session | null
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>
}
