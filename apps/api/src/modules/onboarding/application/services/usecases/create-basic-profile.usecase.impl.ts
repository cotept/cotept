import { Injectable, Logger } from "@nestjs/common"

import { CreateBasicProfileDto } from "../../dtos/create-basic-profile.dto"

import { CreateBasicProfileUseCase } from "@/modules/onboarding/application/ports/in/create-basic-profile.usecase"
import { OnboardingStateRepositoryPort } from "@/modules/onboarding/application/ports/out/onboarding-state.repository.port"
import OnboardingState from "@/modules/onboarding/domain/model/onboarding-state.model"
import { UserProfileFacadeService } from "@/modules/user-profile/application"
import { UserProfileDto } from "@/modules/user-profile/application/dtos"

@Injectable()
export class CreateBasicProfileUseCaseImpl implements CreateBasicProfileUseCase {
  private readonly logger = new Logger(CreateBasicProfileUseCaseImpl.name)
  constructor(
    private readonly userProfileService: UserProfileFacadeService,
    private readonly onboardingStateRepository: OnboardingStateRepositoryPort,
  ) {}

  async execute(dto: CreateBasicProfileDto): Promise<UserProfileDto> {
    this.logger.debug(`CreateBasicProfileUseCaseImpl.dto: ${JSON.stringify(dto)}`)

    // 1. 프로필 생성 또는 업데이트 (Upsert)
    // 기존 로직: createProfile -> 수정: upsertProfile
    // 사용자가 뒤로가기 등으로 프로필을 수정할 수 있으므로, 이미 존재하면 업데이트합니다.
    const { profile: userProfile } = await this.userProfileService.upsertProfile(dto.userId, {
      userIdx: dto.userIdx,
      nickname: dto.nickname,
      profileImageUrl: dto.profileImageUrl,
    })

    // 2. 온보딩 상태 조회 또는 새로 생성
    let onboardingState = await this.onboardingStateRepository.findByUserId(dto.userId)
    if (!onboardingState) {
      onboardingState = OnboardingState.start(dto.userId)
    }

    // 3. 프로필 생성 단계 완료 및 다음 단계로 상태 업데이트
    // 이미 완료된 상태라도 다시 호출되면 안전하게 처리되어야 함 (OnboardingState 내부 로직 확인 필요)
    onboardingState.completeProfileSetup()

    // 4. 온보딩 상태 저장
    await this.onboardingStateRepository.save(onboardingState)

    return userProfile
  }
}
