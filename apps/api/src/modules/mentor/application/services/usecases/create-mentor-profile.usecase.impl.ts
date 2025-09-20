import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common"

import { CreateMentorProfileDto } from "@/modules/mentor/application/dtos/create-mentor-profile.dto"
import { CreateMentorProfileUseCase } from "@/modules/mentor/application/ports/in/create-mentor-profile.usecase"
import { MentorProfileRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-profile-repository.port"
import { MentorTagRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-tag-repository.port"
import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"
import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"

@Injectable()
export class CreateMentorProfileUseCaseImpl implements CreateMentorProfileUseCase {
  constructor(
    @Inject("UserRepositoryPort")
    private readonly userRepository: UserRepositoryPort,
    @Inject("MentorProfileRepositoryPort")
    private readonly mentorProfileRepository: MentorProfileRepositoryPort,
    @Inject("MentorTagRepositoryPort")
    private readonly mentorTagRepository: MentorTagRepositoryPort,
  ) {}

  async execute(dto: CreateMentorProfileDto): Promise<MentorProfile> {
    // 1. 사용자 존재 여부 확인
    const user = await this.userRepository.findByUserId(dto.userId)
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found.`)
    }

    // 2. 이미 멘토 프로필이 있는지 확인
    const existingProfile = await this.mentorProfileRepository.findByUserId(dto.userId)
    if (existingProfile) {
      throw new ConflictException(`Mentor profile for user ID ${dto.userId} already exists.`)
    }

    // 3. 태그 정보 조회
    const tags = await this.mentorTagRepository.findByIds(dto.tagIds)
    if (tags.length !== dto.tagIds.length) {
      throw new NotFoundException("Some of the provided tags do not exist.")
    }

    // 4. 멘토 프로필 도메인 객체 생성
    const newProfile = MentorProfile.create({
      userId: dto.userId,
      introductionTitle: dto.introductionTitle,
      introductionContent: dto.introductionContent,
    })

    // 5. 태그 추가
    newProfile.updateTags(tags)

    // 6. 저장
    return this.mentorProfileRepository.save(newProfile)
  }
}
