import {
  GetOnboardingStateDto,
  OnboardingStateResponseDto,
} from "@/modules/onboarding/application/dtos/get-onboarding-state.dto"

/**
 * 온보딩 상태 조회 유스케이스 인터페이스
 */
export abstract class GetOnboardingStateUseCase {
  abstract execute(dto: GetOnboardingStateDto): Promise<OnboardingStateResponseDto>
}
