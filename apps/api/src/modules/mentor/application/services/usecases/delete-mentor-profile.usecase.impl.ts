import { Inject, Injectable, NotFoundException } from "@nestjs/common"

import { DeleteMentorProfileUseCase } from "@/modules/mentor/application/ports/in/delete-mentor-profile.usecase"
import { MentorProfileRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-profile-repository.port"

@Injectable()
export class DeleteMentorProfileUseCaseImpl implements DeleteMentorProfileUseCase {
  constructor(
    @Inject(MentorProfileRepositoryPort)
    private readonly mentorProfileRepository: MentorProfileRepositoryPort,
  ) {}

  async execute(idx: number): Promise<void> {
    // 1. 기존 프로필 조회
    const existingProfile = await this.mentorProfileRepository.findByIdx(idx)
    if (!existingProfile) {
      throw new NotFoundException(`Mentor profile with ID ${idx} not found.`)
    }

    // 2. 도메인 객체의 상태를 비활성으로 변경
    existingProfile.updateActiveStatus(false)

    // 3. 업데이트된 프로필 저장
    await this.mentorProfileRepository.save(existingProfile)
  }
}
