import { Injectable } from "@nestjs/common"

import OnboardingState from "@/modules/onboarding/domain/model/onboarding-state.model"
import { OnboardingStateEntity } from "@/modules/onboarding/infrastructure/adapter/out/persistence/entities/onboarding-state.entity"
import { EntityMapper } from "@/shared/infrastructure/mappers/entity.mapper"

@Injectable()
export class OnboardingStateMapper extends EntityMapper<OnboardingState, OnboardingStateEntity> {
  toDomain(entity: OnboardingStateEntity): OnboardingState {
    return new OnboardingState({
      userId: entity.userId,
      currentStep: entity.currentStep,
      profileCreated: EntityMapper.numberToBoolean(entity.profileCreated),
      baekjoonVerified: EntityMapper.numberToBoolean(entity.baekjoonVerified),
      skillAnalysisCompleted: EntityMapper.numberToBoolean(entity.skillAnalysisCompleted),
      mentorProfileCreated: EntityMapper.numberToBoolean(entity.mentorProfileCreated),
      completedAt: entity.completedAt,
    })
  }

  toEntity(domain: OnboardingState): OnboardingStateEntity {
    const entity = new OnboardingStateEntity()
    entity.userId = domain.userId
    entity.currentStep = domain.currentStep
    entity.profileCreated = EntityMapper.booleanToNumber(domain.profileCreated)
    entity.baekjoonVerified = EntityMapper.booleanToNumber(domain.baekjoonVerified)
    entity.skillAnalysisCompleted = EntityMapper.booleanToNumber(domain.skillAnalysisCompleted)
    entity.mentorProfileCreated = EntityMapper.booleanToNumber(domain.mentorProfileCreated)
    entity.completedAt = domain.completedAt
    return entity
  }
}
