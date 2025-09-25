import { Inject, Injectable, NotFoundException } from "@nestjs/common"

import { AnalyzeSkillsDto } from "../../dtos/analyze-skills.dto"
import { AnalyzeSkillsUseCase } from "../../ports/in/analyze-skills.usecase"
import { OnboardingStateRepositoryPort } from "../../ports/out/onboarding-state.repository.port"

import { TagStatisticsOutputDto } from "@/modules/baekjoon/application/dtos"
import { GetStatisticsUseCase } from "@/modules/baekjoon/application/ports/in"
import { BaekjoonProfileRepositoryPort } from "@/modules/baekjoon/application/ports/out"

@Injectable()
export class AnalyzeSkillsUseCaseImpl implements AnalyzeSkillsUseCase {
  constructor(
    @Inject(GetStatisticsUseCase)
    private readonly getStatisticsUseCase: GetStatisticsUseCase,
    private readonly baekjoonProfileRepository: BaekjoonProfileRepositoryPort,
    private readonly onboardingStateRepository: OnboardingStateRepositoryPort,
  ) {}

  async execute(dto: AnalyzeSkillsDto): Promise<TagStatisticsOutputDto> {
    // 1. 백준 프로필 조회하여 핸들(handle) 가져오기
    const baekjoonProfile = await this.baekjoonProfileRepository.findByUserId(dto.userId)
    if (!baekjoonProfile) {
      throw new NotFoundException(`사용자 ID ${dto.userId}에 대한 백준 프로필을 찾을 수 없습니다.`)
    }

    // 2. baekjoon 모듈을 사용해 통계 데이터 가져오기
    const statistics = await this.getStatisticsUseCase.execute({
      userId: dto.userId,
      handle: baekjoonProfile.getHandleString(),
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
