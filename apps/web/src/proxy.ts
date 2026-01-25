import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { GuardContext, ProxyGuard } from "./proxy/guards/guard.interface"
import { OnboardingGuard } from "./proxy/guards/onboarding.guard"

import { auth } from "@/auth"
import { createRedirect, isAuthRoute, isProtectedRoute, isPublicRoute } from "@/proxy/lib/helpers"

// 가드 등록
const guards: ProxyGuard[] = [new OnboardingGuard()]

/**
 * Main Proxy (Middleware) Implementation
 * - Adheres to standard Next.js Middleware signature
 * - Wraps NextAuth logic internally
 */
export default async function proxy(request: NextRequest) {
  // 1. NextAuth 세션 확인 (auth 함수를 미들웨어처럼 호출)
  // auth() returns a Session or null/undefined, or acts as a middleware if passed args
  // V5 pattern: Standard middleware signature

  const session = await auth()
  const isLoggedIn = !!session?.user
  const pathName = request.nextUrl.pathname

  console.log({ session, isLoggedIn, pathName })

  // 2. Skip Public Routes & Static Files
  if (isPublicRoute(pathName)) {
    return NextResponse.next()
  }

  // 3. Handle Auth Routes
  if (isAuthRoute(pathName)) {
    if (isLoggedIn) {
      return createRedirect(request, "/main")
    }
    return NextResponse.next()
  }

  // 4. Handle Protected Routes
  if (isProtectedRoute(pathName)) {
    if (!isLoggedIn) {
      return createRedirect(request, "/auth/signin", {
        callbackUrl: pathName,
      })
    }

    // [Refactor] Guard Pattern 적용
    const context: GuardContext = { request, session, pathName }

    for (const guard of guards) {
      if (guard.isApplicable(context)) {
        const response = guard.handle(context)
        if (response) {
          return response
        }
      }
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

/**
 * Matcher Configuration
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
}
