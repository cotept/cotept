import { NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import MentorProfile from "../../../../domain/model/mentor-profile"
import { MentorProfileRepositoryPort } from "../../../ports/out/mentor-profile-repository.port"
import { GetMentorProfileUseCaseImpl } from "../get-mentor-profile.usecase.impl"

import { GetMentorProfileUseCase } from "@/modules/mentor/application/ports/in/get-mentor-profile.usecase"

describe("GetMentorProfileUseCaseImpl", () => {
  let usecase: GetMentorProfileUseCase
  let repository: jest.Mocked<MentorProfileRepositoryPort>

  beforeEach(async () => {
    const mockRepository = {
      findByUserId: jest.fn(),
      findByIdx: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMentorProfileUseCaseImpl,
        {
          provide: "MentorProfileRepositoryPort",
          useValue: mockRepository,
        },
      ],
    }).compile()

    usecase = module.get<GetMentorProfileUseCase>(GetMentorProfileUseCaseImpl)
    repository = module.get("MentorProfileRepositoryPort")
  })

  describe("getByUserId", () => {
    it("사용자 ID로 멘토 프로필 도메인 객체를 성공적으로 조회해야 한다", async () => {
      // Given (준비)
      const userId = "test-user-id"
      const mockProfile = new MentorProfile({
        userId,
        introductionTitle: "Test Mentor",
      })
      repository.findByUserId.mockResolvedValue(mockProfile)

      // When (실행)
      const result = await usecase.getByUserId(userId)

      // Then (검증)
      expect(result).toBeInstanceOf(MentorProfile)
      expect(result.userId).toEqual(userId)
      expect(result).toEqual(mockProfile)
    })

    it("존재하지 않는 사용자 ID로 조회 시 NotFoundException을 던져야 한다", async () => {
      // Given (준비)
      const userId = "non-existent-user"
      repository.findByUserId.mockResolvedValue(null)

      // When & Then (실행 및 검증)
      await expect(usecase.getByUserId(userId)).rejects.toThrow(
        new NotFoundException(`User ID ${userId}에 해당하는 멘토 프로필을 찾을 수 없습니다.`),
      )
    })
  })

  describe("getByIdx", () => {
    it("IDX로 멘토 프로필 도메인 객체를 성공적으로 조회해야 한다", async () => {
      // Given (준비)
      const idx = 1
      const mockProfile = new MentorProfile({ idx, userId: "test-user" })
      repository.findByIdx.mockResolvedValue(mockProfile)

      // When (실행)
      const result = await usecase.getByIdx(idx)

      // Then (검증)
      expect(result).toBeInstanceOf(MentorProfile)
      expect(result.idx).toEqual(idx)
    })

    it("존재하지 않는 IDX로 조회 시 NotFoundException을 던져야 한다", async () => {
      // Given (준비)
      const idx = 999
      repository.findByIdx.mockResolvedValue(null)

      // When & Then (실행 및 검증)
      await expect(usecase.getByIdx(idx)).rejects.toThrow(
        new NotFoundException(`User IDX ${idx}에 해당하는 멘토 프로필을 찾을 수 없습니다.`),
      )
    })
  })
})
