import { NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import { UpdateMentorProfileDto } from "@/modules/mentor/application/dtos/update-mentor-profile.dto"
import { UpdateMentorProfileUseCase } from "@/modules/mentor/application/ports/in/update-mentor-profile.usecase"
import { MentorProfileRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-profile-repository.port"
import { MentorTagRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-tag-repository.port"
import { UpdateMentorProfileUseCaseImpl } from "@/modules/mentor/application/services/usecases/update-mentor-profile.usecase.impl"
import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"
import MentorTag, { MentorTagCategory } from "@/modules/mentor/domain/model/mentor-tag"

describe("UpdateMentorProfileUseCaseImpl", () => {
  let usecase: UpdateMentorProfileUseCase
  let mentorProfileRepo: jest.Mocked<MentorProfileRepositoryPort>
  let mentorTagRepo: jest.Mocked<MentorTagRepositoryPort>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateMentorProfileUseCaseImpl,
        {
          provide: "MentorProfileRepositoryPort",
          useValue: { findByIdx: jest.fn(), save: jest.fn() },
        },
        { provide: "MentorTagRepositoryPort", useValue: { findByIds: jest.fn() } },
      ],
    }).compile()

    usecase = module.get<UpdateMentorProfileUseCase>(UpdateMentorProfileUseCaseImpl)
    mentorProfileRepo = module.get("MentorProfileRepositoryPort")
    mentorTagRepo = module.get("MentorTagRepositoryPort")
  })

  const idx = 1
  const dto: UpdateMentorProfileDto = {
    introductionTitle: "Updated Title",
    introductionContent: "Updated Content",
    baekjoonTierDisplay: false,
    tagIds: [3],
  }

  it("멘토 프로필을 성공적으로 수정해야 한다", async () => {
    // Given
    const existingProfile = new MentorProfile({ idx, userId: "test-user" })
    const mockTags = [new MentorTag({ idx: 3, name: "Tag3", category: MentorTagCategory.COMPANY })]

    mentorProfileRepo.findByIdx.mockResolvedValue(existingProfile)
    mentorTagRepo.findByIds.mockResolvedValue(mockTags)
    mentorProfileRepo.save.mockImplementation(async (profile) => profile)

    // When
    const result = await usecase.execute(idx, dto)

    // Then
    expect(result.introductionTitle).toBe(dto.introductionTitle)
    expect(result.introductionContent).toBe(dto.introductionContent)
    expect(result.baekjoonTierDisplay).toBe(dto.baekjoonTierDisplay)
    expect(result.tags).toHaveLength(1)
    expect(result.tags[0].idx).toBe(3)
  })

  it("수정할 프로필이 없으면 NotFoundException을 던져야 한다", async () => {
    // Given
    mentorProfileRepo.findByIdx.mockResolvedValue(null)

    // When & Then
    await expect(usecase.execute(idx, dto)).rejects.toThrow(NotFoundException)
  })

  it("요청한 tagId의 태그가 없으면 NotFoundException을 던져야 한다", async () => {
    // Given
    const existingProfile = new MentorProfile({ idx, userId: "test-user" })
    mentorProfileRepo.findByIdx.mockResolvedValue(existingProfile)
    mentorTagRepo.findByIds.mockResolvedValue([]) // 태그를 찾을 수 없는 상황

    // When & Then
    await expect(usecase.execute(idx, dto)).rejects.toThrow(NotFoundException)
  })
})
