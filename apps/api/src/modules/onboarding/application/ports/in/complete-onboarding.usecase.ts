import { CompleteOnboardingDto } from "@/modules/onboarding/application/dtos/complete-onboarding.dto"

/**
 * 온보딩 완료 유스케이스 인터페이스
 */
export abstract class CompleteOnboardingUseCase {
  abstract execute(dto: CompleteOnboardingDto): Promise<boolean>
}
