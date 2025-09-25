import { Inject, Injectable } from "@nestjs/common"

import { CreateBasicProfileDto } from "../../dtos/create-basic-profile.dto"

import { CreateBasicProfileUseCase } from "@/modules/onboarding/application/ports/in/create-basic-profile.usecase"
import { OnboardingStateRepositoryPort } from "@/modules/onboarding/application/ports/out/onboarding-state.repository.port"
import OnboardingState from "@/modules/onboarding/domain/model/onboarding-state.model"
import { UserProfileDto } from "@/modules/user-profile/application/dtos"
import { CreateUserProfileUseCase } from "@/modules/user-profile/application/ports/in"

@Injectable()
export class CreateBasicProfileUseCaseImpl implements CreateBasicProfileUseCase {
  constructor(
    @Inject(CreateUserProfileUseCase)
    private readonly createUserProfileUseCase: CreateUserProfileUseCase,
    private readonly onboardingStateRepository: OnboardingStateRepositoryPort,
  ) {}

  async execute(dto: CreateBasicProfileDto): Promise<UserProfileDto> {
    // 1. 기존 user-profile 모듈을 사용해 프로필 생성
    const userProfile = await this.createUserProfileUseCase.execute({
      userId: dto.userId,
      nickname: dto.nickname,
      profileImageUrl: dto.profileImageUrl,
    })

    // 2. 온보딩 상태 조회 또는 새로 생성
    let onboardingState = await this.onboardingStateRepository.findByUserId(dto.userId)
    if (!onboardingState) {
      onboardingState = OnboardingState.start(dto.userId)
    }

    // 3. 프로필 생성 단계 완료 및 다음 단계로 상태 업데이트
    onboardingState.completeProfileSetup()

    // 4. 온보딩 상태 저장
    await this.onboardingStateRepository.save(onboardingState)

    return userProfile
  }
}
