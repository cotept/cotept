import { Inject, Injectable, NotFoundException } from "@nestjs/common"

import { HardDeleteMentorProfileUseCase } from "@/modules/mentor/application/ports/in/hard-delete-mentor-profile.usecase"
import { MentorProfileRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-profile-repository.port"

@Injectable()
export class HardDeleteMentorProfileUseCaseImpl implements HardDeleteMentorProfileUseCase {
  constructor(
    @Inject("MentorProfileRepositoryPort")
    private readonly mentorProfileRepository: MentorProfileRepositoryPort,
  ) {}

  async execute(idx: number): Promise<void> {
    // 1. 기존 프로필 조회하여 존재하는지 확인
    const existingProfile = await this.mentorProfileRepository.findByIdx(idx)
    if (!existingProfile) {
      throw new NotFoundException(`Mentor profile with ID ${idx} not found.`)
    }

    // 2. 물리적 삭제 실행
    await this.mentorProfileRepository.hardDelete(idx)
  }
}
