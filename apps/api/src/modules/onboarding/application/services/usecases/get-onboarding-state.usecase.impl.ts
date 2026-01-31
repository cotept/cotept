import { Injectable } from "@nestjs/common"

import OnboardingState from "../../../domain/model/onboarding-state.model"
import { GetOnboardingStateDto, OnboardingStateResponseDto } from "../../dtos/get-onboarding-state.dto"
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
    let onboardingState = await this.onboardingStateRepository.findByUserId(dto.userId)

    if (!onboardingState) {
      // 404를 반환하는 대신, 초기 상태를 생성하여 반환합니다.
      // 이렇게 하면 클라이언트는 에러 대신 '온보딩 미완료' 상태를 정상적으로 처리할 수 있습니다.
      onboardingState = OnboardingState.start(dto.userId)
    }

    return this.onboardingMapper.toOnboardingStateResponseDto(onboardingState)
  }
}
