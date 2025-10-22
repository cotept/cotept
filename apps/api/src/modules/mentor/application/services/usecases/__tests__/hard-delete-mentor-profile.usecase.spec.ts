import { NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import { HardDeleteMentorProfileUseCase } from "@/modules/mentor/application/ports/in/hard-delete-mentor-profile.usecase"
import { MentorProfileRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-profile-repository.port"
import { HardDeleteMentorProfileUseCaseImpl } from "@/modules/mentor/application/services/usecases/hard-delete-mentor-profile.usecase.impl"
import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"

describe("HardDeleteMentorProfileUseCaseImpl", () => {
  let usecase: HardDeleteMentorProfileUseCase
  let mentorProfileRepo: jest.Mocked<MentorProfileRepositoryPort>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HardDeleteMentorProfileUseCaseImpl,
        {
          provide: "MentorProfileRepositoryPort",
          useValue: { findByIdx: jest.fn(), hardDelete: jest.fn() },
        },
      ],
    }).compile()

    usecase = module.get<HardDeleteMentorProfileUseCase>(HardDeleteMentorProfileUseCaseImpl)
    mentorProfileRepo = module.get("MentorProfileRepositoryPort")
  })

  const idx = 1

  it("멘토 프로필을 성공적으로 물리적 삭제해야 한다", async () => {
    // Given
    const existingProfile = new MentorProfile({ idx, userId: "test-user" })
    mentorProfileRepo.findByIdx.mockResolvedValue(existingProfile)
    mentorProfileRepo.hardDelete.mockResolvedValue(true)

    // When & Then
    await expect(usecase.execute(idx)).resolves.not.toThrow()
  })

  it("삭제할 프로필이 없으면 NotFoundException을 던져야 한다", async () => {
    // Given
    mentorProfileRepo.findByIdx.mockResolvedValue(null)

    // When & Then
    await expect(usecase.execute(idx)).rejects.toThrow(NotFoundException)
  })
})
