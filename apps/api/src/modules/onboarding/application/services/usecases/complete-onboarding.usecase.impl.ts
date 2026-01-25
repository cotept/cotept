import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"

import { CompleteOnboardingDto } from "../../dtos/complete-onboarding.dto"
import { CompleteOnboardingUseCase } from "../../ports/in/complete-onboarding.usecase"
import { OnboardingStateRepositoryPort } from "../../ports/out/onboarding-state.repository.port"

@Injectable()
export class CompleteOnboardingUseCaseImpl implements CompleteOnboardingUseCase {
  constructor(private readonly onboardingStateRepository: OnboardingStateRepositoryPort) {}

  async execute(dto: CompleteOnboardingDto): Promise<boolean> {
    // 1. 온보딩 상태 조회
    const onboardingState = await this.onboardingStateRepository.findByUserId(dto.userId)
    if (!onboardingState) {
      throw new NotFoundException(`사용자 ID ${dto.userId}에 대한 온보딩 상태를 찾을 수 없습니다.`)
    }

    // 2. 온보딩이 모든 필수 단계를 완료했는지 확인
    if (!onboardingState.isCompleted()) {
      throw new BadRequestException("온보딩이 아직 완료되지 않았습니다. 모든 필수 단계를 완료해주세요.")
    }

    // 3. 온보딩 상태를 최종 완료로 표시 (이미 isCompleted()에서 completedAt이 설정됨)
    // 추가적인 상태 변경 로직이 필요하다면 여기에 구현
    // 예: onboardingState.currentStep = OnboardingStep.COMPLETED; (이미 completeMentorSetup에서 처리됨)

    // 4. 업데이트된 온보딩 상태 저장
    await this.onboardingStateRepository.save(onboardingState)

    return true
  }
}
