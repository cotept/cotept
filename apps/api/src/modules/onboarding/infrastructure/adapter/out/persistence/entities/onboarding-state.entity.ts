import { Column, Entity, PrimaryColumn } from "typeorm"

import { OnboardingStep } from "@/modules/onboarding/domain/model/onboarding-state.model"
import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"

@Entity("ONBOARDING_STATES")
export class OnboardingStateEntity extends BaseEntity<OnboardingStateEntity> {
  @PrimaryColumn({ type: "varchar2", length: 36 })
  userId: string

  @Column({ type: "number", default: OnboardingStep.PROFILE_SETUP })
  currentStep: number

  @Column({ type: "number", default: 0 })
  profileCreated: number

  @Column({ type: "number", default: 0 })
  baekjoonVerified: number

  @Column({ type: "number", default: 0 })
  skillAnalysisCompleted: number

  @Column({ type: "number", default: 0 })
  mentorProfileCreated: number

  @Column({ type: "timestamp", nullable: true })
  completedAt?: Date
}
