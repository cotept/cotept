import { Inject, Injectable, NotFoundException } from "@nestjs/common"

import { UpdateMentorProfileDto } from "@/modules/mentor/application/dtos/update-mentor-profile.dto"
import { UpdateMentorProfileUseCase } from "@/modules/mentor/application/ports/in/update-mentor-profile.usecase"
import { MentorProfileRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-profile-repository.port"
import { MentorTagRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-tag-repository.port"
import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"

@Injectable()
export class UpdateMentorProfileUseCaseImpl implements UpdateMentorProfileUseCase {
  constructor(
    @Inject("MentorProfileRepositoryPort")
    private readonly mentorProfileRepository: MentorProfileRepositoryPort,
    @Inject("MentorTagRepositoryPort")
    private readonly mentorTagRepository: MentorTagRepositoryPort,
  ) {}

  async execute(idx: number, dto: UpdateMentorProfileDto): Promise<MentorProfile> {
    // 1. 기존 프로필 조회
    const existingProfile = await this.mentorProfileRepository.findByIdx(idx)
    if (!existingProfile) {
      throw new NotFoundException(`Mentor profile with ID ${idx} not found.`)
    }

    // 2. 태그 정보 조회
    const tags = await this.mentorTagRepository.findByIds(dto.tagIds)
    if (tags.length !== dto.tagIds.length) {
      throw new NotFoundException("Some of the provided tags do not exist.")
    }

    // 3. PUT 시맨틱에 따라 도메인 객체 상태를 DTO의 내용으로 교체
    existingProfile.updateIntroduction(dto.introductionTitle, dto.introductionContent)
    existingProfile.updateBaekjoonTierDisplay(dto.baekjoonTierDisplay)
    existingProfile.updateTags(tags)

    // 4. 업데이트된 프로필 저장
    return this.mentorProfileRepository.save(existingProfile)
  }
}
