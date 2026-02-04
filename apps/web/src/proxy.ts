import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { GuardContext, ProxyGuard } from "./proxy/guards/guard.interface"
import { OnboardingGuard } from "./proxy/guards/onboarding.guard"
import { RoleGuard } from "./proxy/guards/role.guard"

import { auth } from "@/auth"
import { createRedirect, isAuthRoute, isProtectedRoute, isPublicRoute } from "@/proxy/lib/helpers"

// 가드 등록
const guards: ProxyGuard[] = [new RoleGuard(), new OnboardingGuard()]

/**
 * Main Proxy (Middleware) Implementation
 * - Adheres to standard Next.js Middleware signature
 * - Wraps NextAuth logic internally
 */
export default async function proxy(request: NextRequest) {
  // 1. NextAuth 세션 확인
  const session = await auth()
  const isLoggedIn = !!session?.user
  const pathName = request.nextUrl.pathname

  console.log({ session, isLoggedIn, pathName })

  // 2. [Priority 1] 로그인된 사용자 가드 체크 (가장 강력한 제약)
  // 로그인 상태라면 Public/Protected 구분 없이 우선적으로 가드(예: 온보딩)를 적용합니다.
  if (isLoggedIn) {
    const context: GuardContext = { request, session, pathName }
    for (const guard of guards) {
      if (guard.isApplicable(context)) {
        const response = guard.handle(context)
        if (response) {
          return response
        }
      }
    }
  }

  // 3. [Priority 2] Public 라우트 & 정적 파일 패스
  // 위의 가드를 통과한 요청 중 Public 라우트는 접근 허용
  if (isPublicRoute(pathName)) {
    return NextResponse.next()
  }

  // 4. Handle Auth Routes (로그인 상태에서 접근 시 메인으로)
  if (isAuthRoute(pathName)) {
    if (isLoggedIn) {
      return createRedirect(request, "/main")
    }
    return NextResponse.next()
  }

  // 5. Handle Protected Routes (비로그인 상태 접근 차단)
  if (isProtectedRoute(pathName)) {
    if (!isLoggedIn) {
      return createRedirect(request, "/auth/signin", {
        callbackUrl: pathName,
      })
    }
    // 로그인 상태일 때의 가드 체크는 이미 2번 단계에서 수행됨
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
