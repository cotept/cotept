import type { CotePtUser } from "@/shared/types/auth"
import type { NextAuthConfig } from "next-auth"

import { OnboardingUpdateStrategy } from "@/shared/auth/strategies/onboarding-update.strategy"
import { TokenRefreshStrategy } from "@/shared/auth/strategies/token-refresh.strategy"
import { UpdateStrategy } from "@/shared/auth/strategies/update-strategy.interface"

// 전략 등록
const updateStrategies: Record<string, UpdateStrategy> = {
  ONBOARDING_UPDATE: new OnboardingUpdateStrategy(),
  TOKEN_REFRESH: new TokenRefreshStrategy(),
}

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
  // jwt: async ({ token, trigger, user, session }) => {
  //   // 초기 로그인 시 user 정보를 token.user 객체로 저장
  //   if (user) {
  //     const { accessToken, refreshToken, ...member } = user as any
  //     token.member = member as CotePtUser
  //     token.accessToken = accessToken
  //     token.refreshToken = refreshToken
  //   }

  //   // [Refactor] Strategy Pattern 적용 (O(1) Lookup)
  //   if (trigger === "update" && session) {
  //     if (session?.user) {
  //       // 기본 업데이트 (Session.update({ user: ... }))
  //       token.member = session.user as CotePtUser
  //     }

  //     const strategyTrigger = session.trigger as string | undefined
  //     if (strategyTrigger && updateStrategies[strategyTrigger]) {
  //       const strategy = updateStrategies[strategyTrigger]
  //       if (strategy.isApplicable({ token, trigger, session })) {
  //         await strategy.execute({ token, trigger, session })
  //       }
  //     }
  //   }

  //   return token
  // },
  jwt: async ({ token, trigger, user, session }) => {
    // 1. 초기 로그인 처리
    if (user) {
      const { accessToken, refreshToken, ...member } = user as any
      token.member = member as CotePtUser
      token.accessToken = accessToken
      token.refreshToken = refreshToken

      // 로그인 시점에 온보딩 상태 조회 및 병합 (함수형 리팩토링 적용)
      if (accessToken) {
        const updatedMember = await OnboardingUpdateStrategy.syncOnboardingState(token.member, accessToken)
        if (updatedMember) {
          token.member = updatedMember
        }
      }
    }

    // 2. 세션 업데이트 처리
    if (trigger === "update" && session) {
      // 기본 유저 정보 업데이트
      if (session.user) {
        token.member = session.user as CotePtUser
      }

      // 전략 패턴 실행 (특수 트리거 처리)
      const strategyKey = session.trigger as string | undefined
      const strategy = strategyKey ? updateStrategies[strategyKey] : null
      const context = { token, trigger, session }

      if (strategy?.isApplicable(context)) {
        await strategy.execute(context)
      }
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
