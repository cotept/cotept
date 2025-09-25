import { Injectable, NotFoundException } from "@nestjs/common"

import { CreateMentorProfileDto } from "../../dtos/create-mentor-profile.dto"
import { CreateMentorProfileOnboardingUseCase } from "../../ports/in/create-mentor-profile-onboarding.usecase"
import { OnboardingStateRepositoryPort } from "../../ports/out/onboarding-state.repository.port"

import { MentorProfileDto } from "@/modules/mentor/application/dtos/mentor-profile.dto"
import { MentorProfileMapper } from "@/modules/mentor/application/mappers/mentor-profile.mapper"
import { MentorProfileRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-profile-repository.port"
import { MentorTagRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-tag-repository.port"
import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"
import { UserRepositoryPort } from "@/modules/user/application/ports/out"

@Injectable()
export class CreateMentorProfileOnboardingUseCaseImpl implements CreateMentorProfileOnboardingUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly mentorProfileRepository: MentorProfileRepositoryPort,
    private readonly mentorTagRepository: MentorTagRepositoryPort,
    private readonly onboardingStateRepository: OnboardingStateRepositoryPort,
    private readonly mentorProfileMapper: MentorProfileMapper,
  ) {}

  async execute(dto: CreateMentorProfileDto): Promise<MentorProfileDto> {
    // 1. 사용자 및 태그 유효성 검증
    await this.validateUserAndTags(dto.userId, dto.tagIds)

    // 2. 멘토 프로필 조회 또는 생성 (Upsert 로직)
    let mentorProfile = await this.mentorProfileRepository.findByUserId(dto.userId)
    if (!mentorProfile) {
      mentorProfile = MentorProfile.create({ userId: dto.userId })
    }

    // 3. 프로필 정보 업데이트 (소개글, 태그)
    const tags = await this.mentorTagRepository.findByIds(dto.tagIds)
    mentorProfile.updateIntroduction(dto.introductionTitle, dto.introductionContent)
    mentorProfile.updateTags(tags)

    // 4. 프로필 저장
    const savedProfile = await this.mentorProfileRepository.save(mentorProfile)

    // 5. 온보딩 상태 업데이트
    await this.updateOnboardingState(dto.userId)

    return this.mentorProfileMapper.toDto(savedProfile)
  }

  private async validateUserAndTags(userId: string, tagIds: number[]): Promise<void> {
    const user = await this.userRepository.findByUserId(userId)
    if (!user) {
      throw new NotFoundException(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`)
    }

    if (tagIds.length > 0) {
      const tags = await this.mentorTagRepository.findByIds(tagIds)
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
