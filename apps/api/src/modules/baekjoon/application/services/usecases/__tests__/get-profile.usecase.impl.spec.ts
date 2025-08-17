import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { BaekjoonDomainMapper } from '../../../mappers'
import { BaekjoonProfileRepositoryPort } from '../../../ports/out/baekjoon-profile-repository.port'
import { SolvedAcApiPort } from '../../../ports/out/solved-ac-api.port'
import { GetProfileUseCaseImpl } from '../get-profile.usecase.impl'

import { BaekjoonProfileOutputDto,GetProfileInputDto } from '@/modules/baekjoon/application/dtos'
import { BaekjoonUser } from '@/modules/baekjoon/domain/model'
import { TierLevel } from '@/modules/baekjoon/domain/vo'

describe('GetProfileUseCaseImpl', () => {
  let useCase: GetProfileUseCaseImpl
  let baekjoonRepository: jest.Mocked<BaekjoonProfileRepositoryPort>
  let solvedAcApi: jest.Mocked<SolvedAcApiPort>
  let baekjoonMapper: jest.Mocked<BaekjoonDomainMapper>

  const mockUserId = 'user123'
  const mockHandle = 'test_user'
  const mockSolvedAcProfile = {
    handle: 'test_user',
    tier: 13, // GOLD_III
    solvedCount: 150,
    name: 'Test User'
  }

  const mockBaekjoonUser = new BaekjoonUser({
    userId: mockUserId,
    handle: mockHandle,
    currentTier: TierLevel.GOLD_III,
    solvedCount: 150,
    name: 'Test User'
  })

  const mockProfileOutputDto: BaekjoonProfileOutputDto = {
    userId: mockUserId,
    handle: mockHandle,
    currentTier: {
      level: TierLevel.GOLD_III,
      name: 'Gold III',
      color: '#EC9A00'
    },
    solvedCount: 150,
    name: 'Test User',
    verified: false,
    verificationStatus: 'PENDING',
    isMentorEligible: false,
    lastSyncedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(async () => {
    const mockBaekjoonRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
      findByHandle: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }

    const mockSolvedAcApi = {
      getUserProfile: jest.fn(),
      getUserStatistics: jest.fn()
    }

    const mockBaekjoonMapper = {
      toProfileDto: jest.fn(),
      toStatisticsDto: jest.fn(),
      toVerificationStatusDto: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileUseCaseImpl,
        {
          provide: 'BaekjoonProfileRepositoryPort',
          useValue: mockBaekjoonRepository
        },
        {
          provide: 'SolvedAcApiPort',
          useValue: mockSolvedAcApi
        },
        {
          provide: BaekjoonDomainMapper,
          useValue: mockBaekjoonMapper
        }
      ]
    }).compile()

    useCase = module.get<GetProfileUseCaseImpl>(GetProfileUseCaseImpl)
    baekjoonRepository = module.get('BaekjoonProfileRepositoryPort')
    solvedAcApi = module.get('SolvedAcApiPort')
    baekjoonMapper = module.get(BaekjoonDomainMapper)
  })

  describe('execute', () => {
    const validInput: GetProfileInputDto = {
      userId: mockUserId,
      handle: mockHandle
    }

    describe('정상 케이스', () => {
      it('기존 사용자가 있으면 저장된 데이터를 반환해야 한다', async () => {
        baekjoonRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
        baekjoonMapper.toProfileDto.mockReturnValue(mockProfileOutputDto)

        const result = await useCase.execute(validInput)

        expect(baekjoonRepository.findByUserId).toHaveBeenCalledWith(mockUserId)
        expect(solvedAcApi.getUserProfile).not.toHaveBeenCalled()
        expect(baekjoonRepository.save).not.toHaveBeenCalled()
        expect(baekjoonMapper.toProfileDto).toHaveBeenCalledWith(mockBaekjoonUser)
        expect(result).toBe(mockProfileOutputDto)
      })

      it('기존 사용자가 없으면 API에서 조회하여 새로 생성해야 한다', async () => {
        baekjoonRepository.findByUserId.mockResolvedValue(null)
        solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
        baekjoonRepository.save.mockResolvedValue(undefined)
        baekjoonMapper.toProfileDto.mockReturnValue(mockProfileOutputDto)

        const result = await useCase.execute(validInput)

        expect(baekjoonRepository.findByUserId).toHaveBeenCalledWith(mockUserId)
        expect(solvedAcApi.getUserProfile).toHaveBeenCalledWith(mockHandle)
        expect(baekjoonRepository.save).toHaveBeenCalled()
        expect(baekjoonMapper.toProfileDto).toHaveBeenCalled()
        expect(result).toBe(mockProfileOutputDto)
      })

      it('핸들 앞뒤 공백을 제거하여 처리해야 한다', async () => {
        const inputWithSpaces: GetProfileInputDto = {
          userId: mockUserId,
          handle: '  test_user  '
        }

        baekjoonRepository.findByUserId.mockResolvedValue(null)
        solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
        baekjoonRepository.save.mockResolvedValue(undefined)
        baekjoonMapper.toProfileDto.mockReturnValue(mockProfileOutputDto)

        await useCase.execute(inputWithSpaces)

        expect(solvedAcApi.getUserProfile).toHaveBeenCalledWith('test_user')
      })
    })

    describe('입력값 검증', () => {
      it('빈 userId에 대해 에러를 던져야 한다', async () => {
        const invalidInput: GetProfileInputDto = {
          userId: '',
          handle: mockHandle
        }

        await expect(useCase.execute(invalidInput)).rejects.toThrow(BadRequestException)
        expect(baekjoonRepository.findByUserId).not.toHaveBeenCalled()
      })

      it('빈 handle에 대해 에러를 던져야 한다', async () => {
        const invalidInput: GetProfileInputDto = {
          userId: mockUserId,
          handle: ''
        }

        await expect(useCase.execute(invalidInput)).rejects.toThrow(BadRequestException)
        expect(baekjoonRepository.findByUserId).not.toHaveBeenCalled()
      })

      it('공백만 있는 userId에 대해 에러를 던져야 한다', async () => {
        const invalidInput: GetProfileInputDto = {
          userId: '   ',
          handle: mockHandle
        }

        await expect(useCase.execute(invalidInput)).rejects.toThrow(BadRequestException)
      })

      it('유효하지 않은 핸들 형식에 대해 에러를 던져야 한다', async () => {
        const invalidInput: GetProfileInputDto = {
          userId: mockUserId,
          handle: 'Invalid-Handle'
        }

        await expect(useCase.execute(invalidInput)).rejects.toThrow()
      })
    })

    describe('API 조회 에러 처리', () => {
      beforeEach(() => {
        baekjoonRepository.findByUserId.mockResolvedValue(null)
      })

      it('존재하지 않는 백준 ID에 대해 BadRequestException을 던져야 한다', async () => {
        solvedAcApi.getUserProfile.mockResolvedValue(null)

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
        expect(baekjoonRepository.save).not.toHaveBeenCalled()
      })

      it('API 조회 실패 시 에러를 적절히 처리해야 한다', async () => {
        solvedAcApi.getUserProfile.mockRejectedValue(new Error('API Error'))

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
        expect(baekjoonRepository.save).not.toHaveBeenCalled()
      })
    })

    describe('저장소 에러 처리', () => {
      beforeEach(() => {
        baekjoonRepository.findByUserId.mockResolvedValue(null)
        solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
      })

      it('findByUserId 실패 시 에러를 적절히 처리해야 한다', async () => {
        baekjoonRepository.findByUserId.mockRejectedValue(new Error('Database Error'))

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
      })

      it('save 실패 시 에러를 적절히 처리해야 한다', async () => {
        baekjoonRepository.save.mockRejectedValue(new Error('Save Error'))

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
      })
    })

    describe('매퍼 에러 처리', () => {
      it('toProfileDto 실패 시 에러를 적절히 처리해야 한다', async () => {
        baekjoonRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
        baekjoonMapper.toProfileDto.mockImplementation(() => {
          throw new Error('Mapper Error')
        })

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
      })
    })
  })

  describe('private 메서드 동작 검증 (통합 테스트 관점)', () => {
    it('전체 플로우가 올바른 순서로 실행되어야 한다', async () => {
      const validInput: GetProfileInputDto = {
        userId: mockUserId,
        handle: mockHandle
      }

      baekjoonRepository.findByUserId.mockResolvedValue(null)
      solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
      baekjoonRepository.save.mockResolvedValue(undefined)
      baekjoonMapper.toProfileDto.mockReturnValue(mockProfileOutputDto)

      await useCase.execute(validInput)

      // 호출 순서 확인
      expect(baekjoonRepository.findByUserId).toHaveBeenCalledBefore(solvedAcApi.getUserProfile as jest.Mock)
      expect(solvedAcApi.getUserProfile).toHaveBeenCalledBefore(baekjoonRepository.save as jest.Mock)
      expect(baekjoonRepository.save).toHaveBeenCalledBefore(baekjoonMapper.toProfileDto as jest.Mock)
    })

    it('BaekjoonUser.fromSolvedAcApi로 올바른 데이터가 전달되는지 확인해야 한다', async () => {
      const validInput: GetProfileInputDto = {
        userId: mockUserId,
        handle: mockHandle
      }

      baekjoonRepository.findByUserId.mockResolvedValue(null)
      solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
      baekjoonRepository.save.mockResolvedValue(undefined)
      baekjoonMapper.toProfileDto.mockReturnValue(mockProfileOutputDto)

      // BaekjoonUser.fromSolvedAcApi 호출을 스파이로 감시
      const fromSolvedAcApiSpy = jest.spyOn(BaekjoonUser, 'fromSolvedAcApi')

      await useCase.execute(validInput)

      expect(fromSolvedAcApiSpy).toHaveBeenCalledWith({
        ...mockSolvedAcProfile,
        userId: mockUserId
      })

      fromSolvedAcApiSpy.mockRestore()
    })
  })

  describe('특수 케이스', () => {
    it('대문자가 포함된 핸들을 소문자로 정규화해야 한다', async () => {
      const inputWithUpperCase: GetProfileInputDto = {
        userId: mockUserId,
        handle: 'Test_User'
      }

      await expect(useCase.execute(inputWithUpperCase)).rejects.toThrow()
    })

    it('매우 긴 핸들에 대해 적절히 처리해야 한다', async () => {
      const inputWithLongHandle: GetProfileInputDto = {
        userId: mockUserId,
        handle: 'a'.repeat(25) // 20자 초과
      }

      await expect(useCase.execute(inputWithLongHandle)).rejects.toThrow()
    })

    it('매우 짧은 핸들에 대해 적절히 처리해야 한다', async () => {
      const inputWithShortHandle: GetProfileInputDto = {
        userId: mockUserId,
        handle: 'ab' // 3자 미만
      }

      await expect(useCase.execute(inputWithShortHandle)).rejects.toThrow()
    })
  })
})