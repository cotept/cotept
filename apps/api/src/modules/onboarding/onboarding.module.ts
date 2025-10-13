import { Module } from "@nestjs/common"

import { AnalyzeSkillsUseCase } from "./application/ports/in/analyze-skills.usecase"
import { CheckMentorEligibilityUseCase } from "./application/ports/in/check-mentor-eligibility.usecase"
import { CompleteBaekjoonVerificationUseCase } from "./application/ports/in/complete-baekjoon-verification.usecase"
import { CompleteOnboardingUseCase } from "./application/ports/in/complete-onboarding.usecase"
import { CreateBasicProfileUseCase } from "./application/ports/in/create-basic-profile.usecase"
import { CreateMentorProfileOnboardingUseCase } from "./application/ports/in/create-mentor-profile-onboarding.usecase"
import { GetMentorTagsUseCase } from "./application/ports/in/get-mentor-tags.usecase"
import { GetOnboardingStateUseCase } from "./application/ports/in/get-onboarding-state.usecase"
import { SkipBaekjoonUseCase } from "./application/ports/in/skip-baekjoon.usecase"
import { StartBaekjoonVerificationUseCase } from "./application/ports/in/start-baekjoon-verification.usecase"
import { OnboardingStateRepositoryPort } from "./application/ports/out/onboarding-state.repository.port"
import { OnboardingFacadeService } from "./application/services/facade/onboarding-facade.service"
import { AnalyzeSkillsUseCaseImpl } from "./application/services/usecases/analyze-skills.usecase.impl"
import { CheckMentorEligibilityUseCaseImpl } from "./application/services/usecases/check-mentor-eligibility.usecase.impl"
import { CompleteBaekjoonVerificationUseCaseImpl } from "./application/services/usecases/complete-baekjoon-verification.usecase.impl"
import { CompleteOnboardingUseCaseImpl } from "./application/services/usecases/complete-onboarding.usecase.impl"
import { CreateBasicProfileUseCaseImpl } from "./application/services/usecases/create-basic-profile.usecase.impl"
import { GetMentorTagsUseCaseImpl } from "./application/services/usecases/get-mentor-tags.usecase.impl"
import { GetOnboardingStateUseCaseImpl } from "./application/services/usecases/get-onboarding-state.usecase.impl"
import { SkipBaekjoonUseCaseImpl } from "./application/services/usecases/skip-baekjoon.usecase.impl"
import { StartBaekjoonVerificationUseCaseImpl } from "./application/services/usecases/start-baekjoon-verification.usecase.impl"
import { OnboardingController } from "./infrastructure/adapter/in/controllers/onboarding.controller"
import { OnboardingStateEntity } from "./infrastructure/adapter/out/persistence/entities/onboarding-state.entity"
import { OnboardingStateMapper } from "./infrastructure/adapter/out/persistence/mappers/onboarding-state.mapper"
import { TypeOrmOnboardingStateRepository } from "./infrastructure/adapter/out/persistence/repositories/typeorm-onboarding-state.repository"

import { BaekjoonModule } from "@/modules/baekjoon/baekjoon.module"
import { MentorModule } from "@/modules/mentor/mentor.module"
import { OnboardingMapper } from "@/modules/onboarding/application/mappers/onboarding.mapper"
import { CreateMentorProfileOnboardingUseCaseImpl } from "@/modules/onboarding/application/services/usecases/create-mentor-profile-onboarding.usecase.impl"
import { UserModule } from "@/modules/user/user.module"
import { UserProfileModule } from "@/modules/user-profile/user-profile.module"
import { DatabaseModule } from "@/shared/infrastructure/persistence/database.module"

@Module({
  imports: [
    DatabaseModule.forFeature([OnboardingStateEntity]),
    UserProfileModule,
    BaekjoonModule,
    MentorModule,
    UserModule,
  ],
  controllers: [OnboardingController],
  providers: [
    OnboardingMapper,
    OnboardingStateMapper,
    OnboardingFacadeService,
    {
      provide: CreateBasicProfileUseCase,
      useClass: CreateBasicProfileUseCaseImpl,
    },
    {
      provide: StartBaekjoonVerificationUseCase,
      useClass: StartBaekjoonVerificationUseCaseImpl,
    },
    {
      provide: CompleteBaekjoonVerificationUseCase,
      useClass: CompleteBaekjoonVerificationUseCaseImpl,
    },
    {
      provide: AnalyzeSkillsUseCase,
      useClass: AnalyzeSkillsUseCaseImpl,
    },
    {
      provide: CheckMentorEligibilityUseCase,
      useClass: CheckMentorEligibilityUseCaseImpl,
    },
    {
      provide: GetMentorTagsUseCase,
      useClass: GetMentorTagsUseCaseImpl,
    },
    {
      provide: CreateMentorProfileOnboardingUseCase,
      useClass: CreateMentorProfileOnboardingUseCaseImpl,
    },
    {
      provide: CompleteOnboardingUseCase,
      useClass: CompleteOnboardingUseCaseImpl,
    },
    {
      provide: GetOnboardingStateUseCase,
      useClass: GetOnboardingStateUseCaseImpl,
    },
    {
      provide: SkipBaekjoonUseCase,
      useClass: SkipBaekjoonUseCaseImpl,
    },
    {
      provide: OnboardingStateRepositoryPort,
      useClass: TypeOrmOnboardingStateRepository,
    },
  ],
})
export class OnboardingModule {}
