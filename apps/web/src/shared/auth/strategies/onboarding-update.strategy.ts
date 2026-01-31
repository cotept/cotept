import type { CotePtUser } from "@/shared/types/auth"

import { fetchOnboardingState } from "@/shared/api/services/onboarding-api-service"
import { SessionUpdateContext, UpdateStrategy } from "@/shared/auth/strategies/update-strategy.interface"

export class OnboardingUpdateStrategy implements UpdateStrategy {
  isApplicable(context: SessionUpdateContext): boolean {
    return context.trigger === "update" && context.session?.trigger === "ONBOARDING_UPDATE"
  }

  async execute(context: SessionUpdateContext): Promise<any> {
    const { token } = context
    if (!token.member || !token.accessToken) return token

    const updatedMember = await OnboardingUpdateStrategy.syncOnboardingState(
      token.member as CotePtUser,
      token.accessToken as string,
    )

    if (updatedMember) {
      token.member = updatedMember
    }

    return token
  }

  /**
   * 온보딩 상태를 조회하여 멤버 정보에 병합하는 순수 함수형 로직
   * @param member 현재 멤버 객체
   * @param accessToken API 호출용 토큰
   * @returns 업데이트된 멤버 객체 (실패 시 null)
   */
  static async syncOnboardingState(member: CotePtUser, accessToken: string): Promise<CotePtUser | null> {
    try {
      const newState = await fetchOnboardingState(accessToken)

      if (!newState) return null

      return {
        ...member,
        onboardingCompleted: newState.isCompleted,
        currentOnboardingStep: newState.currentStep,
      }
    } catch (error) {
      console.warn("Failed to sync onboarding state:", error)
      return null
    }
  }
}
