import { fetchOnboardingState } from "@/shared/api/services/onboarding-api-service"
import { SessionUpdateContext, UpdateStrategy } from "@/shared/auth/strategies/update-strategy.interface"

export class OnboardingUpdateStrategy implements UpdateStrategy {
  isApplicable(context: SessionUpdateContext): boolean {
    return context.trigger === "update" && context.session?.trigger === "ONBOARDING_UPDATE"
  }

  async execute(context: SessionUpdateContext): Promise<any> {
    const { token } = context

    // Onboarding API 호출
    const newState = await fetchOnboardingState()

    if (newState && token.member) {
      token.member = {
        ...token.member,
        onboardingCompleted: newState.isCompleted,
        currentOnboardingStep: newState.currentStep,
      }
    }

    return token
  }
}
