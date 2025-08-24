import { BadRequestException, ConflictException, RequestTimeoutException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { BaekjoonDomainMapper } from '../../../mappers'
import { CachePort, RateLimitPort,SolvedAcApiPort } from '../../../ports'
import { BaekjoonProfileRepositoryPort } from '../../../ports/out/baekjoon-profile-repository.port'
import { StartVerificationUseCaseImpl } from '../start-verification.usecase.impl'

import { StartVerificationInputDto, StartVerificationOutputDto } from '@/modules/baekjoon/application/dtos'
import { BaekjoonUser, VerificationSession } from '@/modules/baekjoon/domain/model'
import { TierLevel } from '@/modules/baekjoon/domain/vo'

describe('StartVerificationUseCaseImpl', () => {
  let useCase: StartVerificationUseCaseImpl
  let baekjoonRepository: jest.Mocked<BaekjoonProfileRepositoryPort>
  let solvedAcApi: jest.Mocked<SolvedAcApiPort>
  let rateLimitAdapter: jest.Mocked<RateLimitPort>
  let cacheAdapter: jest.Mocked<CachePort>
  let baekjoonMapper: jest.Mocked<BaekjoonDomainMapper>

  const mockUserId = 'user@example.com'
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

  const mockVerificationSession = VerificationSession.start({
    userId: mockUserId,
    handle: mockHandle
  })

  const mockStartVerificationOutputDto: StartVerificationOutputDto = {
    sessionId: 'session123',
    verificationString: '귀여운고양이12345678',
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    instruction: '백준 프로필의 이름을 다음 문자열로 변경해주세요: 귀여운고양이12345678'
  }

  beforeEach(async () => {
    const mockBaekjoonRepository = {
      findByUserId: jest.fn(),
      findByBaekjoonId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }

    const mockSolvedAcApi = {
      getUserProfile: jest.fn(),
      getUserStatistics: jest.fn(),
      checkUserExists: jest.fn()
    }

    const mockRateLimitAdapter = {
      checkRateLimit: jest.fn(),
      recordAttempt: jest.fn(),
      resetCounter: jest.fn()
    }

    const mockCacheAdapter = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn()
    }

    const mockBaekjoonMapper = {
      toProfileDto: jest.fn(),
      toStatisticsDto: jest.fn(),
      toVerificationStatusDto: jest.fn(),
      toStartVerificationOutputDto: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartVerificationUseCaseImpl,
        {
          provide: 'BaekjoonProfileRepositoryPort',
          useValue: mockBaekjoonRepository
        },
        {
          provide: 'SolvedAcApiPort',
          useValue: mockSolvedAcApi
        },
        {
          provide: 'RateLimitPort',
          useValue: mockRateLimitAdapter
        },
        {
          provide: 'CachePort',
          useValue: mockCacheAdapter
        },
        {
          provide: BaekjoonDomainMapper,
          useValue: mockBaekjoonMapper
        }
      ]
    }).compile()

    useCase = module.get<StartVerificationUseCaseImpl>(StartVerificationUseCaseImpl)
    baekjoonRepository = module.get('BaekjoonProfileRepositoryPort')
    solvedAcApi = module.get('SolvedAcApiPort')
    rateLimitAdapter = module.get('RateLimitPort')
    cacheAdapter = module.get('CachePort')
    baekjoonMapper = module.get(BaekjoonDomainMapper)
  })

  describe('execute', () => {
    const validInput: StartVerificationInputDto = {
      email: mockUserId,
      handle: mockHandle
    }

    describe('정상 케이스', () => {
      beforeEach(() => {
        rateLimitAdapter.checkRateLimit.mockResolvedValue(true)
        solvedAcApi.checkUserExists.mockResolvedValue(true)
        baekjoonRepository.findByUserId.mockResolvedValue(null)
        baekjoonRepository.findByBaekjoonId.mockResolvedValue(null)
        cacheAdapter.get.mockResolvedValue(null)
        cacheAdapter.set.mockResolvedValue(undefined)
        baekjoonMapper.toStartVerificationOutputDto.mockReturnValue(mockStartVerificationOutputDto)
      })

      it('새로운 사용자의 인증을 시작해야 한다', async () => {
        const result = await useCase.execute(validInput)

        expect(rateLimitAdapter.checkRateLimit).toHaveBeenCalled()
        expect(solvedAcApi.checkUserExists).toHaveBeenCalledWith(mockHandle)
        expect(baekjoonRepository.findByUserId).toHaveBeenCalledWith(mockUserId)
        expect(baekjoonRepository.findByBaekjoonId).toHaveBeenCalledWith(mockHandle)
        expect(cacheAdapter.set).toHaveBeenCalled()
        expect(baekjoonMapper.toStartVerificationOutputDto).toHaveBeenCalled()
        expect(result).toBe(mockStartVerificationOutputDto)
      })

      it('기존 사용자가 다른 핸들로 인증을 시작할 수 있어야 한다', async () => {
        baekjoonRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)

        const result = await useCase.execute(validInput)

        expect(result).toBe(mockStartVerificationOutputDto)
      })
    })

    describe('입력값 검증', () => {
      it('빈 email에 대해 에러를 던져야 한다', async () => {
        const invalidInput: StartVerificationInputDto = {
          email: '',
          handle: mockHandle
        }

        await expect(useCase.execute(invalidInput)).rejects.toThrow(BadRequestException)
      })

      it('빈 handle에 대해 에러를 던져야 한다', async () => {
        const invalidInput: StartVerificationInputDto = {
          email: mockUserId,
          handle: ''
        }

        await expect(useCase.execute(invalidInput)).rejects.toThrow(BadRequestException)
      })

      it('유효하지 않은 핸들 형식에 대해 에러를 던져야 한다', async () => {
        const invalidInput: StartVerificationInputDto = {
          email: mockUserId,
          handle: 'Invalid-Handle'
        }

        await expect(useCase.execute(invalidInput)).rejects.toThrow()
      })
    })

    describe('Rate Limiting', () => {
      it('rate limit 초과 시 ConflictException을 던져야 한다', async () => {
        rateLimitAdapter.checkRateLimit.mockResolvedValue(false)

        await expect(useCase.execute(validInput)).rejects.toThrow(ConflictException)
        expect(solvedAcApi.checkUserExists).not.toHaveBeenCalled()
      })
    })

    describe('존재하지 않는 사용자 처리', () => {
      beforeEach(() => {
        rateLimitAdapter.checkRateLimit.mockResolvedValue(true)
      })

      it('존재하지 않는 백준 ID에 대해 BadRequestException을 던져야 한다', async () => {
        solvedAcApi.checkUserExists.mockResolvedValue(false)

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
        expect(baekjoonRepository.findByUserId).not.toHaveBeenCalled()
      })
    })

    describe('중복 핸들 처리', () => {
      beforeEach(() => {
        rateLimitAdapter.checkRateLimit.mockResolvedValue(true)
        solvedAcApi.checkUserExists.mockResolvedValue(true)
        baekjoonRepository.findByUserId.mockResolvedValue(null)
      })

      it('다른 사용자가 이미 사용 중인 핸들에 대해 ConflictException을 던져야 한다', async () => {
        const otherUser = new BaekjoonUser({
          userId: 'other@example.com',
          handle: mockHandle,
          currentTier: TierLevel.SILVER_I,
          solvedCount: 50
        })
        // Mock isVerified to return true for conflict scenario
        jest.spyOn(otherUser, 'isVerified').mockReturnValue(true)
        baekjoonRepository.findByBaekjoonId.mockResolvedValue(otherUser)

        await expect(useCase.execute(validInput)).rejects.toThrow(ConflictException)
      })
    })

    describe('진행 중인 세션 처리', () => {
      beforeEach(() => {
        rateLimitAdapter.checkRateLimit.mockResolvedValue(true)
        solvedAcApi.checkUserExists.mockResolvedValue(true)
        baekjoonRepository.findByUserId.mockResolvedValue(null)
        baekjoonRepository.findByBaekjoonId.mockResolvedValue(null)
      })

      it('진행 중인 세션이 있으면 ConflictException을 던져야 한다', async () => {
        const mockSession = {
          isExpired: () => false,
          expire: jest.fn()
        }
        cacheAdapter.get.mockResolvedValue(mockSession)

        await expect(useCase.execute(validInput)).rejects.toThrow(ConflictException)
      })

      it('만료된 세션이 있으면 RequestTimeoutException을 던져야 한다', async () => {
        const mockExpiredSession = {
          isExpired: () => true,
          expire: jest.fn()
        }
        cacheAdapter.get.mockResolvedValue(mockExpiredSession)
        cacheAdapter.delete.mockResolvedValue(undefined)

        await expect(useCase.execute(validInput)).rejects.toThrow(RequestTimeoutException)
        expect(mockExpiredSession.expire).toHaveBeenCalled()
        expect(cacheAdapter.delete).toHaveBeenCalled()
      })
    })

    describe('에러 처리', () => {
      beforeEach(() => {
        rateLimitAdapter.checkRateLimit.mockResolvedValue(true)
        solvedAcApi.checkUserExists.mockResolvedValue(true)
        baekjoonRepository.findByUserId.mockResolvedValue(null)
        baekjoonRepository.findByBaekjoonId.mockResolvedValue(null)
        cacheAdapter.get.mockResolvedValue(null)
      })

      it('API 조회 실패 시 에러를 적절히 처리해야 한다', async () => {
        solvedAcApi.checkUserExists.mockRejectedValue(new Error('API Error'))

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
      })

      it('캐시 설정 실패 시 에러를 적절히 처리해야 한다', async () => {
        cacheAdapter.set.mockRejectedValue(new Error('Cache Error'))

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
      })

      it('매퍼 실패 시 에러를 적절히 처리해야 한다', async () => {
        cacheAdapter.set.mockResolvedValue(undefined)
        baekjoonMapper.toStartVerificationOutputDto.mockImplementation(() => {
          throw new Error('Mapper Error')
        })

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
      })
    })
  })

  describe('특수 케이스', () => {
    it('핸들 앞뒤 공백을 제거하여 처리해야 한다', async () => {
      const inputWithSpaces: StartVerificationInputDto = {
        email: mockUserId,
        handle: '  test_user  '
      }

      rateLimitAdapter.checkRateLimit.mockResolvedValue(true)
      solvedAcApi.checkUserExists.mockResolvedValue(true)
      baekjoonRepository.findByUserId.mockResolvedValue(null)
      baekjoonRepository.findByBaekjoonId.mockResolvedValue(null)
      cacheAdapter.get.mockResolvedValue(null)
      cacheAdapter.set.mockResolvedValue(undefined)
      baekjoonMapper.toStartVerificationOutputDto.mockReturnValue(mockStartVerificationOutputDto)

      await useCase.execute(inputWithSpaces)

      expect(solvedAcApi.checkUserExists).toHaveBeenCalledWith('test_user')
    })

    it('이메일 대소문자를 구분하지 않아야 한다', async () => {
      const inputWithUpperCaseEmail: StartVerificationInputDto = {
        email: 'USER@EXAMPLE.COM',
        handle: mockHandle
      }

      rateLimitAdapter.checkRateLimit.mockResolvedValue(true)
      solvedAcApi.checkUserExists.mockResolvedValue(true)
      baekjoonRepository.findByUserId.mockResolvedValue(null)
      baekjoonRepository.findByBaekjoonId.mockResolvedValue(null)
      cacheAdapter.get.mockResolvedValue(null)
      cacheAdapter.set.mockResolvedValue(undefined)
      baekjoonMapper.toStartVerificationOutputDto.mockReturnValue(mockStartVerificationOutputDto)

      await useCase.execute(inputWithUpperCaseEmail)

      expect(rateLimitAdapter.checkRateLimit).toHaveBeenCalled()
    })
  })
})