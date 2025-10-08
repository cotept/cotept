import { NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import { DeleteMentorProfileUseCase } from "@/modules/mentor/application/ports/in/delete-mentor-profile.usecase"
import { MentorProfileRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-profile-repository.port"
import { DeleteMentorProfileUseCaseImpl } from "@/modules/mentor/application/services/usecases/delete-mentor-profile.usecase.impl"
import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"

describe("DeleteMentorProfileUseCaseImpl", () => {
  let usecase: DeleteMentorProfileUseCase
  let mentorProfileRepo: jest.Mocked<MentorProfileRepositoryPort>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteMentorProfileUseCaseImpl,
        {
          provide: "MentorProfileRepositoryPort",
          useValue: { findByIdx: jest.fn(), save: jest.fn() },
        },
      ],
    }).compile()

    usecase = module.get<DeleteMentorProfileUseCase>(DeleteMentorProfileUseCaseImpl)
    mentorProfileRepo = module.get("MentorProfileRepositoryPort")
  })

  const idx = 1

  it("멘토 프로필을 성공적으로 비활성화(논리적 삭제)해야 한다", async () => {
    // Given
    const existingProfile = new MentorProfile({ idx, userId: "test-user", isActive: true })
    mentorProfileRepo.findByIdx.mockResolvedValue(existingProfile)
    mentorProfileRepo.save.mockImplementation(async (profile) => profile)

    // When
    await usecase.execute(idx)

    // Then
    const savedProfile = mentorProfileRepo.save.mock.calls[0][0]
    expect(savedProfile.isActive).toBe(false)
  })

  it("삭제할 프로필이 없으면 NotFoundException을 던져야 한다", async () => {
    // Given
    mentorProfileRepo.findByIdx.mockResolvedValue(null)

    // When & Then
    await expect(usecase.execute(idx)).rejects.toThrow(NotFoundException)
  })
})
