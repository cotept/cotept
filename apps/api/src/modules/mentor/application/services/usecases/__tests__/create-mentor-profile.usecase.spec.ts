import { ConflictException, NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import { CreateMentorProfileDto } from "@/modules/mentor/application/dtos/create-mentor-profile.dto"
import { CreateMentorProfileUseCase } from "@/modules/mentor/application/ports/in/create-mentor-profile.usecase"
import { MentorProfileRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-profile-repository.port"
import { MentorTagRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-tag-repository.port"
import { CreateMentorProfileUseCaseImpl } from "@/modules/mentor/application/services/usecases/create-mentor-profile.usecase.impl"
import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"
import MentorTag, { MentorTagCategory } from "@/modules/mentor/domain/model/mentor-tag"
import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"
import User, { UserRole } from "@/modules/user/domain/model/user"

describe("CreateMentorProfileUseCaseImpl", () => {
  let usecase: CreateMentorProfileUseCase
  let userRepo: jest.Mocked<UserRepositoryPort>
  let mentorProfileRepo: jest.Mocked<MentorProfileRepositoryPort>
  let mentorTagRepo: jest.Mocked<MentorTagRepositoryPort>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMentorProfileUseCaseImpl,
        { provide: "UserRepositoryPort", useValue: { findByUserId: jest.fn() } },
        {
          provide: "MentorProfileRepositoryPort",
          useValue: { findByUserId: jest.fn(), save: jest.fn() },
        },
        { provide: "MentorTagRepositoryPort", useValue: { findByIds: jest.fn() } },
      ],
    }).compile()

    usecase = module.get<CreateMentorProfileUseCase>(CreateMentorProfileUseCaseImpl)
    userRepo = module.get("UserRepositoryPort")
    mentorProfileRepo = module.get("MentorProfileRepositoryPort")
    mentorTagRepo = module.get("MentorTagRepositoryPort")
  })

  const dto: CreateMentorProfileDto = {
    userId: "test-user-id",
    introductionTitle: "Test Title",
    introductionContent: "Test Content",
    tagIds: [1, 2],
  }

  it("새로운 멘토 프로필을 성공적으로 생성해야 한다", async () => {
    // Given
    const mockUser = new User({
      userId: dto.userId,
      email: "test@test.com",
      passwordHash: "dummy_hash",
      salt: "dummy_salt",
      role: UserRole.MENTOR,
    })
    const mockTags = [
      new MentorTag({ idx: 1, name: "Tag1", category: MentorTagCategory.JOB }),
      new MentorTag({ idx: 2, name: "Tag2", category: MentorTagCategory.EXPERIENCE }),
    ]

    userRepo.findByUserId.mockResolvedValue(mockUser)
    mentorProfileRepo.findByUserId.mockResolvedValue(null)
    mentorTagRepo.findByIds.mockResolvedValue(mockTags)
    mentorProfileRepo.save.mockImplementation(async (profile) => profile) // 받은 그대로 반환

    // When
    const result = await usecase.execute(dto)

    // Then
    expect(result).toBeInstanceOf(MentorProfile)
    expect(result.userId).toBe(dto.userId)
    expect(result.introductionTitle).toBe(dto.introductionTitle)
    expect(result.tags).toHaveLength(2)
    expect(result.tags[0].name).toBe("Tag1")
  })

  it("요청한 userId의 사용자가 없으면 NotFoundException을 던져야 한다", async () => {
    // Given
    userRepo.findByUserId.mockResolvedValue(null)

    // When & Then
    await expect(usecase.execute(dto)).rejects.toThrow(NotFoundException)
  })

  it("이미 멘토 프로필이 존재하면 ConflictException을 던져야 한다", async () => {
    // Given
    const mockUser = new User({
      userId: dto.userId,
      email: "test@test.com",
      passwordHash: "dummy_hash",
      salt: "dummy_salt",
      role: UserRole.MENTOR,
    })
    const existingProfile = new MentorProfile({ userId: dto.userId })
    userRepo.findByUserId.mockResolvedValue(mockUser)
    mentorProfileRepo.findByUserId.mockResolvedValue(existingProfile)

    // When & Then
    await expect(usecase.execute(dto)).rejects.toThrow(ConflictException)
  })

  it("요청한 tagId의 태그가 없으면 NotFoundException을 던져야 한다", async () => {
    // Given

    const mockUser = new User({
      userId: dto.userId,
      email: "test@test.com",
      passwordHash: "dummy_hash",
      salt: "dummy_salt",
      role: UserRole.MENTOR,
    })
    userRepo.findByUserId.mockResolvedValue(mockUser)
    mentorProfileRepo.findByUserId.mockResolvedValue(null)
    mentorTagRepo.findByIds.mockResolvedValue([]) // 일부 태그만 반환된 상황 흉내

    // When & Then
    await expect(usecase.execute(dto)).rejects.toThrow(NotFoundException)
  })
})
