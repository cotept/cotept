import { Inject, Injectable } from "@nestjs/common"

import { AnalyzeSkillsDto } from "../../dtos/analyze-skills.dto"
import { AnalyzeSkillsUseCase } from "../../ports/in/analyze-skills.usecase"
import { OnboardingStateRepositoryPort } from "../../ports/out/onboarding-state.repository.port"

import { GetStatisticsUseCase } from "@/modules/baekjoon/application/ports/in"
import { BaekjoonProfileRepositoryPort } from "@/modules/baekjoon/application/ports/out"
import { BaekjoonFacadeService } from "@/modules/baekjoon/application/services"
import { TagStatisticsResponseDto } from "@/modules/baekjoon/infrastructure/dtos/response"
import { UserFacadeService } from "@/modules/user/application/services"
import { UserProfileFacadeService } from "@/modules/user-profile/application"

@Injectable()
export class AnalyzeSkillsUseCaseImpl implements AnalyzeSkillsUseCase {
  constructor(
    @Inject(GetStatisticsUseCase)
    private readonly getStatisticsUseCase: GetStatisticsUseCase,
    private readonly baekjoonProfileRepository: BaekjoonProfileRepositoryPort,
    private readonly onboardingStateRepository: OnboardingStateRepositoryPort,

    private readonly baekjoonService: BaekjoonFacadeService,
    private readonly userService: UserFacadeService,
    private readonly userProfileService: UserProfileFacadeService,
  ) {}

  async execute(dto: AnalyzeSkillsDto): Promise<TagStatisticsResponseDto> {
    // 1. 백준 프로필 조회하여 핸들(handle) 가져오기
    const baekjoonProfile = await this.baekjoonService.getProfileByUserId(dto.userId)

    // 2. baekjoon 모듈을 사용해 통계 데이터 가져오기
    const statistics = await this.baekjoonService.getStatistics({
      userId: dto.userId,
      handle: baekjoonProfile.handle,
    })

    // 3. 온보딩 상태 업데이트
    const onboardingState = await this.onboardingStateRepository.findByUserId(dto.userId)
    if (onboardingState) {
      onboardingState.completeSkillAnalysis()
      await this.onboardingStateRepository.save(onboardingState)
    }

    return statistics
  }
}
