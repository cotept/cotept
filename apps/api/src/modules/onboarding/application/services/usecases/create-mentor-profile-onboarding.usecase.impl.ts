import { Injectable, NotFoundException } from "@nestjs/common"

import { CreateMentorProfileDto } from "../../dtos/create-mentor-profile.dto"
import { CreateMentorProfileOnboardingUseCase } from "../../ports/in/create-mentor-profile-onboarding.usecase"
import { OnboardingStateRepositoryPort } from "../../ports/out/onboarding-state.repository.port"

import { MentorProfileDto } from "@/modules/mentor/application/dtos/mentor-profile.dto"
import { MentorFacadeService } from "@/modules/mentor/application/services/facade/mentor-facade.service"
import { UserFacadeService } from "@/modules/user/application/services"

@Injectable()
export class CreateMentorProfileOnboardingUseCaseImpl implements CreateMentorProfileOnboardingUseCase {
  constructor(
    private readonly onboardingStateRepository: OnboardingStateRepositoryPort,

    private readonly userService: UserFacadeService,
    private readonly mentorService: MentorFacadeService,
  ) {}

  async execute(dto: CreateMentorProfileDto): Promise<MentorProfileDto> {
    // 1. 사용자 및 태그 유효성 검증
    await this.validateUserAndTags(dto.userId, dto.tagIds)

    // 2. 멘토 프로필 조회 또는 생성 (Upsert 로직)
    let mentorProfile = await this.mentorService.getMentorProfileByUserId(dto.userId)
    if (!mentorProfile) {
      mentorProfile = await this.mentorService.createMentorProfile(dto)
    }

    // 4. 온보딩 상태 업데이트
    await this.updateOnboardingState(dto.userId)

    return mentorProfile
  }

  private async validateUserAndTags(userId: string, tagIds: number[]): Promise<void> {
    const user = await this.userService.getUserByUserId(userId)
    if (!user) {
      throw new NotFoundException(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`)
    }

    if (tagIds.length > 0) {
      const tags = await this.mentorService.getMentorTagsByIdx(tagIds)
      if (tags.length !== tagIds.length) {
        throw new NotFoundException("제공된 태그 중 일부가 존재하지 않습니다.")
      }
    }
  }

  private async updateOnboardingState(userId: string): Promise<void> {
    const onboardingState = await this.onboardingStateRepository.findByUserId(userId)
    if (onboardingState) {
      onboardingState.completeMentorSetup()
      await this.onboardingStateRepository.save(onboardingState)
    }
  }
}
