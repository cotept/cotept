import { Injectable, NotFoundException } from "@nestjs/common"

import {
  GetOnboardingStateDto,
  OnboardingStateResponseDto,
} from "../../dtos/get-onboarding-state.dto"
import { OnboardingMapper } from "../../mappers/onboarding.mapper"
import { GetOnboardingStateUseCase } from "../../ports/in/get-onboarding-state.usecase"
import { OnboardingStateRepositoryPort } from "../../ports/out/onboarding-state.repository.port"

@Injectable()
export class GetOnboardingStateUseCaseImpl implements GetOnboardingStateUseCase {
  constructor(
    private readonly onboardingStateRepository: OnboardingStateRepositoryPort,
    private readonly onboardingMapper: OnboardingMapper,
  ) {}

  async execute(dto: GetOnboardingStateDto): Promise<OnboardingStateResponseDto> {
    const onboardingState = await this.onboardingStateRepository.findByUserId(dto.userId)

    if (!onboardingState) {
      throw new NotFoundException(`사용자 ID ${dto.userId}에 대한 온보딩 상태를 찾을 수 없습니다.`)
    }

    return this.onboardingMapper.toOnboardingStateResponseDto(onboardingState)
  }
}
