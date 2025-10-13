import { Injectable } from "@nestjs/common"

import OnboardingState from "../../domain/model/onboarding-state.model"
import { OnboardingStateResponseDto } from "../dtos/get-onboarding-state.dto"

@Injectable()
export class OnboardingMapper {
  toOnboardingStateResponseDto(onboardingState: OnboardingState): OnboardingStateResponseDto {
    return {
      userId: onboardingState.userId,
      currentStep: onboardingState.currentStep,
      profileCreated: onboardingState.profileCreated,
      baekjoonVerified: onboardingState.baekjoonVerified,
      skillAnalysisCompleted: onboardingState.skillAnalysisCompleted,
      mentorProfileCreated: onboardingState.mentorProfileCreated,
      isCompleted: onboardingState.isCompleted(),
      hasBaekjoonLinked: onboardingState.hasBaekjoonLinked(),
      completedAt: onboardingState.completedAt,
    }
  }
}
