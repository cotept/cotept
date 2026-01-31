import { NextResponse } from "next/server"

import { GuardContext, ProxyGuard } from "./guard.interface"

import { createRedirect, isProtectedRoute } from "@/proxy/lib/helpers"

export class OnboardingGuard implements ProxyGuard {
  isApplicable(context: GuardContext): boolean {
    // 세션이 있고 멤버 정보가 있는 경우에만 검사 (로그인 상태 전제)
    return !!context.session?.member
  }

  handle(context: GuardContext): NextResponse | null {
    const { request, session, pathName } = context
    const onBoardingCompleted = session?.member?.onboardingCompleted
    const isOnboardingRoute = pathName.startsWith("/onboarding")

    // Case A: 온보딩 완료 유저가 온보딩 페이지 접근 시 -> 메인으로 강제 이동
    if (onBoardingCompleted && isOnboardingRoute) {
      return createRedirect(request, "/main")
    }

    // Case B: 온보딩 미완료 유저가 Protected 경로 접근 시 -> 온보딩으로 납치
    // Public 라우트(/main, /landing 등)는 자유롭게 접근 가능 (둘러보기)
    if (!onBoardingCompleted && isProtectedRoute(pathName)) {
      return createRedirect(request, "/onboarding")
    }

    return null
  }
}
