import { Inject, Injectable } from "@nestjs/common"

import {
  BaekjoonVerificationResultResponseDto,
  TagStatisticsResponseDto,
  VerificationStatusResponseDto,
} from "@/modules/baekjoon/infrastructure/dtos/response"
import { CreateMentorProfileDto } from "@/modules/mentor/application/dtos/create-mentor-profile.dto"
import { MentorProfileDto } from "@/modules/mentor/application/dtos/mentor-profile.dto"
import { MentorTagsResponseDto } from "@/modules/mentor/application/dtos/mentor-tags.dto"
import { AnalyzeSkillsDto } from "@/modules/onboarding/application/dtos/analyze-skills.dto"
import { CheckMentorEligibilityDto } from "@/modules/onboarding/application/dtos/check-mentor-eligibility.dto"
import { CompleteBaekjoonVerificationDto } from "@/modules/onboarding/application/dtos/complete-baekjoon-verification.dto"
import { CompleteOnboardingDto } from "@/modules/onboarding/application/dtos/complete-onboarding.dto"
import { CreateBasicProfileDto } from "@/modules/onboarding/application/dtos/create-basic-profile.dto"
import { GetOnboardingStateDto } from "@/modules/onboarding/application/dtos/get-onboarding-state.dto"
import { MentorEligibilityDto } from "@/modules/onboarding/application/dtos/mentor-eligibility.dto"
import { SkipBaekjoonDto, SkipBaekjoonResponseDto } from "@/modules/onboarding/application/dtos/skip-baekjoon.dto"
import { StartBaekjoonVerificationDto } from "@/modules/onboarding/application/dtos/start-baekjoon-verification.dto"
import { AnalyzeSkillsUseCase } from "@/modules/onboarding/application/ports/in/analyze-skills.usecase"
import { CheckMentorEligibilityUseCase } from "@/modules/onboarding/application/ports/in/check-mentor-eligibility.usecase"
import { CompleteBaekjoonVerificationUseCase } from "@/modules/onboarding/application/ports/in/complete-baekjoon-verification.usecase"
import { CompleteOnboardingUseCase } from "@/modules/onboarding/application/ports/in/complete-onboarding.usecase"
import { CreateBasicProfileUseCase } from "@/modules/onboarding/application/ports/in/create-basic-profile.usecase"
import { CreateMentorProfileOnboardingUseCase } from "@/modules/onboarding/application/ports/in/create-mentor-profile-onboarding.usecase"
import { GetMentorTagsUseCase } from "@/modules/onboarding/application/ports/in/get-mentor-tags.usecase"
import { GetOnboardingStateUseCase } from "@/modules/onboarding/application/ports/in/get-onboarding-state.usecase"
import { SkipBaekjoonUseCase } from "@/modules/onboarding/application/ports/in/skip-baekjoon.usecase"
import { StartBaekjoonVerificationUseCase } from "@/modules/onboarding/application/ports/in/start-baekjoon-verification.usecase"
import { UserProfileDto } from "@/modules/user-profile/application/dtos"

@Injectable()
export class OnboardingFacadeService {
  constructor(
    @Inject(CreateBasicProfileUseCase)
    private readonly createBasicProfileUseCase: CreateBasicProfileUseCase,
    @Inject(StartBaekjoonVerificationUseCase)
    private readonly startBaekjoonVerificationUseCase: StartBaekjoonVerificationUseCase,
    @Inject(CompleteBaekjoonVerificationUseCase)
    private readonly completeBaekjoonVerificationUseCase: CompleteBaekjoonVerificationUseCase,
    @Inject(AnalyzeSkillsUseCase)
    private readonly analyzeSkillsUseCase: AnalyzeSkillsUseCase,
    @Inject(CheckMentorEligibilityUseCase)
    private readonly checkMentorEligibilityUseCase: CheckMentorEligibilityUseCase,
    @Inject(GetMentorTagsUseCase)
    private readonly getMentorTagsUseCase: GetMentorTagsUseCase,
    @Inject(CreateMentorProfileOnboardingUseCase)
    private readonly createMentorProfileOnboardingUseCase: CreateMentorProfileOnboardingUseCase,
    @Inject(CompleteOnboardingUseCase)
    private readonly completeOnboardingUseCase: CompleteOnboardingUseCase,
    @Inject(GetOnboardingStateUseCase)
    private readonly getOnboardingStateUseCase: GetOnboardingStateUseCase,
    @Inject(SkipBaekjoonUseCase)
    private readonly skipBaekjoonUseCase: SkipBaekjoonUseCase,
  ) {}

  async createBasicProfile(dto: CreateBasicProfileDto): Promise<UserProfileDto> {
    return this.createBasicProfileUseCase.execute(dto)
  }

  async startBaekjoonVerification(dto: StartBaekjoonVerificationDto): Promise<VerificationStatusResponseDto> {
    return await this.startBaekjoonVerificationUseCase.execute(dto)
  }

  async skipBaekjoon(dto: SkipBaekjoonDto): Promise<SkipBaekjoonResponseDto> {
    return this.skipBaekjoonUseCase.execute(dto)
  }

  async completeBaekjoonVerification(
    dto: CompleteBaekjoonVerificationDto,
  ): Promise<BaekjoonVerificationResultResponseDto> {
    return await this.completeBaekjoonVerificationUseCase.execute(dto)
  }

  async analyzeSkills(dto: AnalyzeSkillsDto): Promise<TagStatisticsResponseDto> {
    return this.analyzeSkillsUseCase.execute(dto)
  }

  async checkMentorEligibility(dto: CheckMentorEligibilityDto): Promise<MentorEligibilityDto> {
    return this.checkMentorEligibilityUseCase.execute(dto)
  }

  async getMentorTags(): Promise<MentorTagsResponseDto> {
    return this.getMentorTagsUseCase.execute()
  }

  async createMentorProfile(dto: CreateMentorProfileDto): Promise<MentorProfileDto> {
    return this.createMentorProfileOnboardingUseCase.execute(dto)
  }

  async completeOnboarding(dto: CompleteOnboardingDto): Promise<boolean> {
    return this.completeOnboardingUseCase.execute(dto)
  }

  async getOnboardingState(dto: GetOnboardingStateDto) {
    return this.getOnboardingStateUseCase.execute(dto)
  }
}
