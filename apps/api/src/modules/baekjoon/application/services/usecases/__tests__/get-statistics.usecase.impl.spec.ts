import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { GetStatisticsUseCaseImpl } from '../get-statistics.usecase.impl'
import { BaekjoonDomainMapper } from '../../../mappers'
import { BaekjoonProfileRepositoryPort } from '../../../ports/out/baekjoon-profile-repository.port'
import { BaekjoonStatisticsRepositoryPort } from '../../../ports/out/baekjoon-statistics-repository.port'
import { SolvedAcApiPort, CachePort, RateLimitPort } from '../../../ports'

import { BaekjoonUser } from '@/modules/baekjoon/domain/model'
import { TierLevel } from '@/modules/baekjoon/domain/vo'
import { GetStatisticsInputDto, TagStatisticsOutputDto } from '@/modules/baekjoon/application/dtos'

describe('GetStatisticsUseCaseImpl', () => {
  let useCase: GetStatisticsUseCaseImpl
  let profileRepository: jest.Mocked<BaekjoonProfileRepositoryPort>
  let statisticsRepository: jest.Mocked<BaekjoonStatisticsRepositoryPort>
  let solvedAcApi: jest.Mocked<SolvedAcApiPort>
  let cacheService: jest.Mocked<CachePort>
  let rateLimitAdapter: jest.Mocked<RateLimitPort>
  let baekjoonMapper: jest.Mocked<BaekjoonDomainMapper>

  const mockUserId = 'user@example.com'
  const mockHandle = 'test_user'

  const mockBaekjoonUser = new BaekjoonUser({
    userId: mockUserId,
    handle: mockHandle,
    currentTier: TierLevel.GOLD_III,
    solvedCount: 150,
    name: 'Test User'
  })

  const mockSolvedAcProfile = {
    handle: 'test_user',
    tier: 13, // GOLD_III
    solvedCount: 150,
    rating: 1800,
    maxStreak: 15
  }

  const mockTagRatingInfo = [
    {
      tag: {
        key: 'implementation',
        displayNames: [{ name: '구현' }]
      },
      solvedCount: 50,
      rating: 1200
    },
    {
      tag: {
        key: 'math',
        displayNames: [{ name: '수학' }]
      },
      solvedCount: 30,
      rating: 1100
    },
    {
      tag: {
        key: 'greedy',
        displayNames: [{ name: '그리디 알고리즘' }]
      },
      solvedCount: 20,
      rating: 1000
    }
  ]

  const mockTagStatisticsOutputDto: TagStatisticsOutputDto = {
    totalCount: 150,
    tierStats: {
      currentTier: 13,
      currentRating: 1800,
      maxTier: 15,
      solvedCount: 150
    },
    topTags: [
      {
        tag: { key: 'implementation', name: '구현' },
        solvedCount: 50,
        rating: 1200
      },
      {
        tag: { key: 'math', name: '수학' },
        solvedCount: 30,
        rating: 1100
      },
      {
        tag: { key: 'greedy', name: '그리디 알고리즘' },
        solvedCount: 20,
        rating: 1000
      }
    ],
    lastSynced: new Date()
  }

  const mockBojTags = [
    {
      tag: {
        key: 'implementation',
        displayNames: [{ name: '구현' }]
      },
      solvedCount: 50,
      rating: 1200
    },
    {
      tag: {
        key: 'math',
        displayNames: [{ name: '수학' }]
      },
      solvedCount: 30,
      rating: 1100
    }
  ]

  beforeEach(async () => {
    const mockProfileRepository = {
      findByUserId: jest.fn(),
      findByBaekjoonId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }

    const mockStatisticsRepository = {
      findTagStatisticsByHandle: jest.fn(),
      saveTagStatistics: jest.fn(),
      deleteTagStatistics: jest.fn()
    }

    const mockSolvedAcApi = {
      getUserProfile: jest.fn(),
      getUserStatistics: jest.fn(),
      checkUserExists: jest.fn(),
      getUserAdditionalInfo: jest.fn(),
      getUserTagRatings: jest.fn()
    }

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn()
    }

    const mockRateLimitAdapter = {
      checkRateLimit: jest.fn(),
      recordAttempt: jest.fn(),
      resetCounter: jest.fn()
    }

    const mockBaekjoonMapper = {
      toProfileDto: jest.fn(),
      toStatisticsDto: jest.fn(),
      toVerificationStatusDto: jest.fn(),
      toStartVerificationOutputDto: jest.fn(),
      toCompleteVerificationOutputDto: jest.fn(),
      toTagStatisticsOutputDto: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStatisticsUseCaseImpl,
        {
          provide: 'BaekjoonProfileRepositoryPort',
          useValue: mockProfileRepository
        },
        {
          provide: 'BaekjoonStatisticsRepositoryPort',
          useValue: mockStatisticsRepository
        },
        {
          provide: 'SolvedAcApiPort',
          useValue: mockSolvedAcApi
        },
        {
          provide: 'CachePort',
          useValue: mockCacheService
        },
        {
          provide: 'RateLimitPort',
          useValue: mockRateLimitAdapter
        },
        {
          provide: BaekjoonDomainMapper,
          useValue: mockBaekjoonMapper
        }
      ]
    }).compile()

    useCase = module.get<GetStatisticsUseCaseImpl>(GetStatisticsUseCaseImpl)
    profileRepository = module.get('BaekjoonProfileRepositoryPort')
    statisticsRepository = module.get('BaekjoonStatisticsRepositoryPort')
    solvedAcApi = module.get('SolvedAcApiPort')
    cacheService = module.get('CachePort')
    rateLimitAdapter = module.get('RateLimitPort')
    baekjoonMapper = module.get(BaekjoonDomainMapper)
  })

  describe('execute', () => {
    const validInput: GetStatisticsInputDto = {
      userId: mockUserId,
      handle: mockHandle
    }

    describe('정상 케이스', () => {
      beforeEach(() => {
        profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
        jest.spyOn(mockBaekjoonUser, 'possibleSync').mockReturnValue(true)
        solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
        solvedAcApi.getUserTagRatings.mockResolvedValue(mockTagRatingInfo)
        profileRepository.save.mockResolvedValue(undefined)
        statisticsRepository.saveTagStatistics.mockResolvedValue(undefined)
        baekjoonMapper.toTagStatisticsOutputDto.mockReturnValue(mockTagStatisticsOutputDto)
      })

      it('사용자가 존재하고 동기화가 필요한 경우 API에서 조회해야 한다', async () => {
        const result = await useCase.execute(validInput)

        expect(profileRepository.findByUserId).toHaveBeenCalledWith(mockUserId)
        expect(mockBaekjoonUser.possibleSync).toHaveBeenCalled()
        expect(solvedAcApi.getUserProfile).toHaveBeenCalledWith(mockHandle)
        expect(solvedAcApi.getUserTagRatings).toHaveBeenCalledWith(mockHandle)
        expect(profileRepository.save).toHaveBeenCalled()
        expect(statisticsRepository.saveTagStatistics).toHaveBeenCalled()
        expect(baekjoonMapper.toTagStatisticsOutputDto).toHaveBeenCalled()
        expect(result).toBe(mockTagStatisticsOutputDto)
      })

      it('동기화가 필요하지 않은 경우 캐시된 데이터를 반환해야 한다', async () => {
        jest.spyOn(mockBaekjoonUser, 'possibleSync').mockReturnValue(false)
        statisticsRepository.findTagStatisticsByHandle.mockResolvedValue(mockBojTags)
        baekjoonMapper.toTagStatisticsOutputDto.mockReturnValue(mockTagStatisticsOutputDto)

        const result = await useCase.execute(validInput)

        expect(statisticsRepository.findTagStatisticsByHandle).toHaveBeenCalledWith(mockHandle)
        expect(solvedAcApi.getUserProfile).not.toHaveBeenCalled()
        expect(result).toBe(mockTagStatisticsOutputDto)
      })

      it('캐시된 데이터가 없으면 API에서 조회해야 한다', async () => {
        jest.spyOn(mockBaekjoonUser, 'possibleSync').mockReturnValue(false)
        statisticsRepository.findTagStatisticsByHandle.mockResolvedValue(null)

        const result = await useCase.execute(validInput)

        expect(statisticsRepository.findTagStatisticsByHandle).toHaveBeenCalledWith(mockHandle)
        expect(solvedAcApi.getUserProfile).toHaveBeenCalledWith(mockHandle)
        expect(solvedAcApi.getUserTagRatings).toHaveBeenCalledWith(mockHandle)
        expect(result).toBe(mockTagStatisticsOutputDto)
      })
    })

    describe('입력값 검증', () => {
      it('빈 userId에 대해 에러를 던져야 한다', async () => {
        const invalidInput: GetStatisticsInputDto = {
          userId: '',
          handle: mockHandle
        }

        await expect(useCase.execute(invalidInput)).rejects.toThrow(BadRequestException)
        expect(profileRepository.findByUserId).not.toHaveBeenCalled()
      })

      it('빈 handle에 대해 에러를 던져야 한다', async () => {
        const invalidInput: GetStatisticsInputDto = {
          userId: mockUserId,
          handle: ''
        }

        await expect(useCase.execute(invalidInput)).rejects.toThrow(BadRequestException)
        expect(profileRepository.findByUserId).not.toHaveBeenCalled()
      })
    })

    describe('사용자 검증', () => {
      it('존재하지 않는 사용자에 대해 NotFoundException을 던져야 한다', async () => {
        profileRepository.findByUserId.mockResolvedValue(null)

        await expect(useCase.execute(validInput)).rejects.toThrow(NotFoundException)
        expect(solvedAcApi.getUserProfile).not.toHaveBeenCalled()
      })
    })

    describe('API 조회 에러 처리', () => {
      beforeEach(() => {
        profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
        jest.spyOn(mockBaekjoonUser, 'possibleSync').mockReturnValue(true)
      })

      it('getUserProfile API 실패 시 에러를 적절히 처리해야 한다', async () => {
        solvedAcApi.getUserProfile.mockRejectedValue(new Error('API Error'))

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
        expect(profileRepository.save).not.toHaveBeenCalled()
      })

      it('getUserTagRatings API 실패 시 에러를 적절히 처리해야 한다', async () => {
        solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
        solvedAcApi.getUserTagRatings.mockRejectedValue(new Error('API Error'))

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
        expect(profileRepository.save).not.toHaveBeenCalled()
      })
    })

    describe('저장소 에러 처리', () => {
      beforeEach(() => {
        profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
        jest.spyOn(mockBaekjoonUser, 'possibleSync').mockReturnValue(true)
        solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
        solvedAcApi.getUserTagRatings.mockResolvedValue(mockTagRatingInfo)
        baekjoonMapper.toTagStatisticsOutputDto.mockReturnValue(mockTagStatisticsOutputDto)
      })

      it('프로필 저장 실패 시 에러를 적절히 처리해야 한다', async () => {
        profileRepository.save.mockRejectedValue(new Error('DB Error'))

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
      })

      it('통계 저장 실패 시 에러를 적절히 처리해야 한다', async () => {
        profileRepository.save.mockResolvedValue(undefined)
        statisticsRepository.saveTagStatistics.mockRejectedValue(new Error('DB Error'))

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
      })
    })

    describe('매퍼 에러 처리', () => {
      beforeEach(() => {
        profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
        jest.spyOn(mockBaekjoonUser, 'possibleSync').mockReturnValue(true)
        solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
        solvedAcApi.getUserTagRatings.mockResolvedValue(mockTagRatingInfo)
        profileRepository.save.mockResolvedValue(undefined)
        statisticsRepository.saveTagStatistics.mockResolvedValue(undefined)
      })

      it('toTagStatisticsOutputDto 실패 시 에러를 적절히 처리해야 한다', async () => {
        baekjoonMapper.toTagStatisticsOutputDto.mockImplementation(() => {
          throw new Error('Mapper Error')
        })

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
      })
    })
  })

  describe('executeByHandle', () => {
    beforeEach(() => {
      solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
      solvedAcApi.getUserTagRatings.mockResolvedValue(mockTagRatingInfo)
      profileRepository.save.mockResolvedValue(undefined)
      statisticsRepository.saveTagStatistics.mockResolvedValue(undefined)
      baekjoonMapper.toTagStatisticsOutputDto.mockReturnValue(mockTagStatisticsOutputDto)
    })

    it('핸들로 공개 통계를 조회해야 한다', async () => {
      const result = await useCase.executeByHandle(mockHandle)

      expect(solvedAcApi.getUserProfile).toHaveBeenCalledWith(mockHandle)
      expect(solvedAcApi.getUserTagRatings).toHaveBeenCalledWith(mockHandle)
      expect(baekjoonMapper.toTagStatisticsOutputDto).toHaveBeenCalled()
      expect(result).toBe(mockTagStatisticsOutputDto)
    })

    it('빈 handle에 대해 에러를 던져야 한다', async () => {
      await expect(useCase.executeByHandle('')).rejects.toThrow(BadRequestException)
      expect(solvedAcApi.getUserProfile).not.toHaveBeenCalled()
    })

    it('API 실패 시 에러를 전파해야 한다', async () => {
      solvedAcApi.getUserProfile.mockRejectedValue(new Error('API Error'))

      await expect(useCase.executeByHandle(mockHandle)).rejects.toThrow(Error)
    })
  })

  describe('데이터 변환 로직', () => {
    beforeEach(() => {
      profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
      jest.spyOn(mockBaekjoonUser, 'possibleSync').mockReturnValue(true)
    })

    it('태그 정보를 올바르게 정렬하고 변환해야 한다', async () => {
      const unsortedTags = [
        {
          tag: { key: 'math', displayNames: [{ name: '수학' }] },
          solvedCount: 30,
          rating: 1100
        },
        {
          tag: { key: 'implementation', displayNames: [{ name: '구현' }] },
          solvedCount: 50,
          rating: 1200
        },
        {
          tag: { key: 'dp', displayNames: [{ name: '다이나믹 프로그래밍' }] },
          solvedCount: 0, // 0개 해결한 태그는 필터링되어야 함
          rating: 900
        }
      ]

      solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
      solvedAcApi.getUserTagRatings.mockResolvedValue(unsortedTags)
      profileRepository.save.mockResolvedValue(undefined)
      statisticsRepository.saveTagStatistics.mockResolvedValue(undefined)

      // 매퍼가 호출될 때 전달되는 인자를 캡처
      let capturedApiResponse: any
      baekjoonMapper.toTagStatisticsOutputDto.mockImplementation((apiResponse) => {
        capturedApiResponse = apiResponse
        return mockTagStatisticsOutputDto
      })

      await useCase.execute(validInput)

      expect(capturedApiResponse.topTags).toHaveLength(2) // 0개 해결한 태그는 필터링
      expect(capturedApiResponse.topTags[0].solvedCount).toBe(50) // implementation이 첫 번째
      expect(capturedApiResponse.topTags[1].solvedCount).toBe(30) // math가 두 번째
    })

    it('tier 통계 정보를 올바르게 생성해야 한다', async () => {
      solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
      solvedAcApi.getUserTagRatings.mockResolvedValue(mockTagRatingInfo)
      profileRepository.save.mockResolvedValue(undefined)
      statisticsRepository.saveTagStatistics.mockResolvedValue(undefined)

      let capturedApiResponse: any
      baekjoonMapper.toTagStatisticsOutputDto.mockImplementation((apiResponse) => {
        capturedApiResponse = apiResponse
        return mockTagStatisticsOutputDto
      })

      await useCase.execute(validInput)

      expect(capturedApiResponse.tierStats).toEqual({
        currentTier: 13,
        currentRating: 1800,
        maxTier: 15,
        solvedCount: 150
      })
    })
  })

  describe('캐시 데이터 변환', () => {
    it('BojTag 배열을 TagStatisticsOutputDto로 올바르게 변환해야 한다', async () => {
      profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
      jest.spyOn(mockBaekjoonUser, 'possibleSync').mockReturnValue(false)
      statisticsRepository.findTagStatisticsByHandle.mockResolvedValue(mockBojTags)
      baekjoonMapper.toTagStatisticsOutputDto.mockReturnValue(mockTagStatisticsOutputDto)

      const result = await useCase.execute(validInput)

      expect(result).toBe(mockTagStatisticsOutputDto)
      expect(statisticsRepository.findTagStatisticsByHandle).toHaveBeenCalledWith(mockHandle)
    })
  })

  describe('특수 케이스', () => {
    it('핸들 앞뒤 공백을 제거하여 처리해야 한다', async () => {
      const inputWithSpaces: GetStatisticsInputDto = {
        userId: mockUserId,
        handle: '  test_user  '
      }

      profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
      jest.spyOn(mockBaekjoonUser, 'possibleSync').mockReturnValue(true)
      solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
      solvedAcApi.getUserTagRatings.mockResolvedValue(mockTagRatingInfo)
      profileRepository.save.mockResolvedValue(undefined)
      statisticsRepository.saveTagStatistics.mockResolvedValue(undefined)
      baekjoonMapper.toTagStatisticsOutputDto.mockReturnValue(mockTagStatisticsOutputDto)

      await useCase.execute(inputWithSpaces)

      expect(solvedAcApi.getUserProfile).toHaveBeenCalledWith('test_user')
      expect(solvedAcApi.getUserTagRatings).toHaveBeenCalledWith('test_user')
    })

    it('유효하지 않은 핸들 형식에 대해 에러를 던져야 한다', async () => {
      const invalidInput: GetStatisticsInputDto = {
        userId: mockUserId,
        handle: 'Invalid-Handle'
      }

      await expect(useCase.execute(invalidInput)).rejects.toThrow()
    })

    it('전체 플로우가 올바른 순서로 실행되어야 한다', async () => {
      profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
      jest.spyOn(mockBaekjoonUser, 'possibleSync').mockReturnValue(true)
      solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
      solvedAcApi.getUserTagRatings.mockResolvedValue(mockTagRatingInfo)
      profileRepository.save.mockResolvedValue(undefined)
      statisticsRepository.saveTagStatistics.mockResolvedValue(undefined)
      baekjoonMapper.toTagStatisticsOutputDto.mockReturnValue(mockTagStatisticsOutputDto)

      await useCase.execute(validInput)

      // 호출 순서 확인
      expect(profileRepository.findByUserId).toHaveBeenCalledBefore(solvedAcApi.getUserProfile as jest.Mock)
      expect(solvedAcApi.getUserProfile).toHaveBeenCalledBefore(profileRepository.save as jest.Mock)
    })
  })
})