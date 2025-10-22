import { ConflictException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import { CreateBasicProfileDto } from "@/modules/onboarding/application/dtos/create-basic-profile.dto"
import { OnboardingStateRepositoryPort } from "@/modules/onboarding/application/ports/out/onboarding-state.repository.port"
import { CreateBasicProfileUseCaseImpl } from "@/modules/onboarding/application/services/usecases/create-basic-profile.usecase.impl"
import OnboardingState, { OnboardingStep } from "@/modules/onboarding/domain/model/onboarding-state.model"
import { UserProfileDto } from "@/modules/user-profile/application/dtos"
import { CreateUserProfileUseCase } from "@/modules/user-profile/application/ports/in"

describe("CreateBasicProfileUseCaseImpl", () => {
  let useCase: CreateBasicProfileUseCaseImpl
  let mockCreateUserProfileUseCase: jest.Mocked<CreateUserProfileUseCase>
  let mockOnboardingStateRepository: jest.Mocked<OnboardingStateRepositoryPort>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBasicProfileUseCaseImpl,
        {
          provide: CreateUserProfileUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: OnboardingStateRepositoryPort,
          useValue: { findByUserId: jest.fn(), save: jest.fn() },
        },
      ],
    }).compile()

    useCase = module.get<CreateBasicProfileUseCaseImpl>(CreateBasicProfileUseCaseImpl)
    mockCreateUserProfileUseCase = module.get(CreateUserProfileUseCase)
    mockOnboardingStateRepository = module.get(OnboardingStateRepositoryPort)
  })

  const dto: CreateBasicProfileDto = {
    userId: "test-user-id",
    nickname: "test-nickname",
    profileImageUrl: "http://example.com/image.jpg",
  }

  const userProfileDto = new UserProfileDto()
  Object.assign(userProfileDto, { ...dto, idx: 1 })

  it("새로운 사용자의 온보딩 시, 프로필을 생성하고 온보딩 상태를 '다음 단계'로 업데이트해야 한다", async () => {
    // Given
    mockCreateUserProfileUseCase.execute.mockResolvedValue(userProfileDto)
    mockOnboardingStateRepository.findByUserId.mockResolvedValue(null)
    mockOnboardingStateRepository.save.mockImplementation(async (state) => state)

    // When
    const result = await useCase.execute(dto)

    // Then
    expect(result).toEqual(userProfileDto)
    expect(mockCreateUserProfileUseCase.execute).toHaveBeenCalledWith(dto)
    expect(mockOnboardingStateRepository.findByUserId).toHaveBeenCalledWith(dto.userId)
    expect(mockOnboardingStateRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: dto.userId,
        profileCreated: true,
        currentStep: OnboardingStep.BAEKJOON_VERIFY,
      }),
    )
  })

  it("기존에 온보딩을 시작했던 사용자의 경우, 상태를 찾아 업데이트해야 한다", async () => {
    // Given
    const existingState = OnboardingState.start(dto.userId)
    mockCreateUserProfileUseCase.execute.mockResolvedValue(userProfileDto)
    mockOnboardingStateRepository.findByUserId.mockResolvedValue(existingState)
    mockOnboardingStateRepository.save.mockImplementation(async (state) => state)

    // When
    await useCase.execute(dto)

    // Then
    expect(mockOnboardingStateRepository.findByUserId).toHaveBeenCalledWith(dto.userId)
    const savedState = mockOnboardingStateRepository.save.mock.calls[0][0]
    expect(savedState.profileCreated).toBe(true)
    expect(savedState.currentStep).toBe(OnboardingStep.BAEKJOON_VERIFY)
  })

  it("프로필 생성 실패 시(예: 닉네임 중복), 에러를 전파하고 온보딩 상태를 저장하지 않아야 한다", async () => {
    // Given
    const conflictError = new ConflictException("닉네임 중복")
    mockCreateUserProfileUseCase.execute.mockRejectedValue(conflictError)

    // When & Then
    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException)
    expect(mockCreateUserProfileUseCase.execute).toHaveBeenCalledWith(dto)
    expect(mockOnboardingStateRepository.save).not.toHaveBeenCalled()
  })
})
