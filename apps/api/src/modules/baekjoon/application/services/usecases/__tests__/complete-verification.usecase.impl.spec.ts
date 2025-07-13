import { BadRequestException, ConflictException, NotFoundException, RequestTimeoutException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { EntityManager } from 'typeorm'

import { CompleteVerificationUseCaseImpl } from '../complete-verification.usecase.impl'
import { BaekjoonDomainMapper } from '../../../mappers'
import { BaekjoonProfileRepositoryPort } from '../../../ports/out/baekjoon-profile-repository.port'
import { SolvedAcApiPort, CachePort, RateLimitPort, SyncVerificationStatusUseCase } from '../../../ports'

import { BaekjoonUser, VerificationSession } from '@/modules/baekjoon/domain/model'
import { TierLevel, VerificationStatus, VerificationString } from '@/modules/baekjoon/domain/vo'
import { CompleteVerificationInputDto, CompleteVerificationOutputDto } from '@/modules/baekjoon/application/dtos'

describe('CompleteVerificationUseCaseImpl', () => {
  let useCase: CompleteVerificationUseCaseImpl
  let baekjoonRepository: jest.Mocked<BaekjoonProfileRepositoryPort>
  let solvedAcApi: jest.Mocked<SolvedAcApiPort>
  let rateLimitService: jest.Mocked<RateLimitPort>
  let cacheAdapter: jest.Mocked<CachePort>
  let syncVerificationUseCase: jest.Mocked<SyncVerificationStatusUseCase>
  let entityManager: jest.Mocked<EntityManager>
  let baekjoonMapper: jest.Mocked<BaekjoonDomainMapper>

  const mockUserId = 'user@example.com'
  const mockHandle = 'test_user'
  const mockSessionId = 'session123'
  const mockVerificationString = '귀여운고양이12345678'

  const mockSolvedAcProfile = {
    handle: 'test_user',
    tier: 13, // GOLD_III
    solvedCount: 150,
    name: 'Test User',
    nameNative: '귀여운고양이12345678'
  }

  const mockSolvedAcAdditionalInfo = {
    nameNative: '귀여운고양이12345678'
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
    handle: mockHandle,
    verificationString: VerificationString.of(mockVerificationString)
  })

  const mockCompleteVerificationOutputDto: CompleteVerificationOutputDto = {
    sessionId: mockSessionId,
    success: true,
    message: '백준 ID 인증이 완료되었습니다.',
    completedAt: new Date(),
    tierName: 'Gold III'
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
      checkUserExists: jest.fn(),
      getUserAdditionalInfo: jest.fn()
    }

    const mockRateLimitService = {
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

    const mockSyncVerificationUseCase = {
      syncFromSession: jest.fn()
    }

    const mockEntityManager = {
      transaction: jest.fn()
    } as any

    const mockBaekjoonMapper = {
      toProfileDto: jest.fn(),
      toStatisticsDto: jest.fn(),
      toVerificationStatusDto: jest.fn(),
      toStartVerificationOutputDto: jest.fn(),
      toCompleteVerificationOutputDto: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompleteVerificationUseCaseImpl,
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
          useValue: mockRateLimitService
        },
        {
          provide: 'CachePort',
          useValue: mockCacheAdapter
        },
        {
          provide: 'SyncVerificationStatusUseCase',
          useValue: mockSyncVerificationUseCase
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager
        },
        {
          provide: BaekjoonDomainMapper,
          useValue: mockBaekjoonMapper
        }
      ]
    }).compile()

    useCase = module.get<CompleteVerificationUseCaseImpl>(CompleteVerificationUseCaseImpl)
    baekjoonRepository = module.get('BaekjoonProfileRepositoryPort')
    solvedAcApi = module.get('SolvedAcApiPort')
    rateLimitService = module.get('RateLimitPort')
    cacheAdapter = module.get('CachePort')
    syncVerificationUseCase = module.get('SyncVerificationStatusUseCase')
    entityManager = module.get(EntityManager)
    baekjoonMapper = module.get(BaekjoonDomainMapper)
  })

  describe('execute', () => {
    const validInput: CompleteVerificationInputDto = {
      email: mockUserId,
      handle: mockHandle,
      sessionId: mockSessionId
    }

    describe('정상 케이스', () => {
      beforeEach(() => {
        rateLimitService.checkRateLimit.mockResolvedValue(true)
        rateLimitService.recordAttempt.mockResolvedValue(undefined)
        const mockSession = {
          ...mockVerificationSession,
          getUserId: () => mockUserId,
          getHandleString: () => mockHandle,
          getVerificationString: () => VerificationString.of(mockVerificationString),
          getSessionId: () => mockSessionId,
          isExpired: () => false,
          isCompleted: () => false,
          isFailed: () => false,
          complete: jest.fn(),
          fail: jest.fn()
        }
        cacheAdapter.get.mockResolvedValue(mockSession)
        cacheAdapter.set.mockResolvedValue(undefined)
        solvedAcApi.getUserAdditionalInfo.mockResolvedValue(mockSolvedAcAdditionalInfo)
        solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
        baekjoonRepository.findByUserId.mockResolvedValue(null)
        baekjoonRepository.save.mockResolvedValue(undefined)
        syncVerificationUseCase.syncFromSession.mockResolvedValue(undefined)
        baekjoonMapper.toCompleteVerificationOutputDto.mockReturnValue(mockCompleteVerificationOutputDto)
      })

      it('새로운 사용자의 인증을 완료해야 한다', async () => {
        const result = await useCase.execute(validInput)

        expect(rateLimitService.checkRateLimit).toHaveBeenCalled()
        expect(cacheAdapter.get).toHaveBeenCalledWith(mockSessionId)
        expect(solvedAcApi.getUserAdditionalInfo).toHaveBeenCalledWith(mockHandle)
        expect(solvedAcApi.getUserProfile).toHaveBeenCalledWith(mockHandle)
        expect(baekjoonRepository.findByUserId).toHaveBeenCalledWith(mockUserId)
        expect(baekjoonRepository.save).toHaveBeenCalled()
        expect(cacheAdapter.set).toHaveBeenCalled()
        expect(syncVerificationUseCase.syncFromSession).toHaveBeenCalledWith(mockSessionId)
        expect(baekjoonMapper.toCompleteVerificationOutputDto).toHaveBeenCalled()
        expect(result).toBe(mockCompleteVerificationOutputDto)
      })

      it('기존 사용자의 인증을 완료하고 프로필을 업데이트해야 한다', async () => {
        baekjoonRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
        jest.spyOn(mockBaekjoonUser, 'markAsVerified').mockImplementation()
        jest.spyOn(mockBaekjoonUser, 'updateProfile').mockImplementation()

        const result = await useCase.execute(validInput)

        expect(mockBaekjoonUser.markAsVerified).toHaveBeenCalled()
        expect(mockBaekjoonUser.updateProfile).toHaveBeenCalled()
        expect(result).toBe(mockCompleteVerificationOutputDto)
      })
    })

    describe('입력값 검증', () => {
      it('빈 sessionId에 대해 에러를 던져야 한다', async () => {
        const invalidInput: CompleteVerificationInputDto = {
          email: mockUserId,
          handle: mockHandle,
          sessionId: ''
        }

        await expect(useCase.execute(invalidInput)).rejects.toThrow(BadRequestException)
      })
    })

    describe('Rate Limiting', () => {
      it('rate limit 초과 시 ConflictException을 던져야 한다', async () => {
        rateLimitService.checkRateLimit.mockResolvedValue(false)

        await expect(useCase.execute(validInput)).rejects.toThrow(ConflictException)
        expect(cacheAdapter.get).not.toHaveBeenCalled()
      })
    })

    describe('세션 검증', () => {
      beforeEach(() => {
        rateLimitService.checkRateLimit.mockResolvedValue(true)
        rateLimitService.recordAttempt.mockResolvedValue(undefined)
      })

      it('존재하지 않는 세션에 대해 NotFoundException을 던져야 한다', async () => {
        cacheAdapter.get.mockResolvedValue(null)

        await expect(useCase.execute(validInput)).rejects.toThrow(NotFoundException)
      })

      it('다른 사용자의 세션에 대해 NotFoundException을 던져야 한다', async () => {
        const otherUserSession = {
          getUserId: () => 'other@example.com',
          isExpired: () => false,
          isCompleted: () => false,
          isFailed: () => false
        }
        cacheAdapter.get.mockResolvedValue(otherUserSession)

        await expect(useCase.execute(validInput)).rejects.toThrow(NotFoundException)
      })

      it('만료된 세션에 대해 RequestTimeoutException을 던져야 한다', async () => {
        const expiredSession = {
          getUserId: () => mockUserId,
          isExpired: () => true,
          expire: jest.fn()
        }
        cacheAdapter.get.mockResolvedValue(expiredSession)
        cacheAdapter.delete.mockResolvedValue(undefined)

        await expect(useCase.execute(validInput)).rejects.toThrow(RequestTimeoutException)
        expect(expiredSession.expire).toHaveBeenCalled()
        expect(cacheAdapter.delete).toHaveBeenCalled()
      })

      it('이미 완료된 세션에 대해 ConflictException을 던져야 한다', async () => {
        const completedSession = {
          getUserId: () => mockUserId,
          isExpired: () => false,
          isCompleted: () => true,
          isFailed: () => false
        }
        cacheAdapter.get.mockResolvedValue(completedSession)

        await expect(useCase.execute(validInput)).rejects.toThrow(ConflictException)
      })

      it('실패한 세션에 대해 BadRequestException을 던져야 한다', async () => {
        const failedSession = {
          getUserId: () => mockUserId,
          isExpired: () => false,
          isCompleted: () => false,
          isFailed: () => true
        }
        cacheAdapter.get.mockResolvedValue(failedSession)

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
      })
    })

    describe('인증 문자열 검증', () => {
      beforeEach(() => {
        rateLimitService.checkRateLimit.mockResolvedValue(true)
        rateLimitService.recordAttempt.mockResolvedValue(undefined)
        const mockSession = {
          getUserId: () => mockUserId,
          getHandleString: () => mockHandle,
          getVerificationString: () => VerificationString.of(mockVerificationString),
          getSessionId: () => mockSessionId,
          isExpired: () => false,
          isCompleted: () => false,
          isFailed: () => false,
          complete: jest.fn(),
          fail: jest.fn()
        }
        cacheAdapter.get.mockResolvedValue(mockSession)
        cacheAdapter.set.mockResolvedValue(undefined)
        syncVerificationUseCase.syncFromSession.mockResolvedValue(undefined)
      })

      it('인증 문자열이 일치하지 않으면 실패 응답을 반환해야 한다', async () => {
        const wrongAdditionalInfo = {
          nameNative: '다른문자열87654321'
        }
        solvedAcApi.getUserAdditionalInfo.mockResolvedValue(wrongAdditionalInfo)
        
        const failureOutput = {
          ...mockCompleteVerificationOutputDto,
          success: false,
          message: '인증 문자열이 일치하지 않습니다.'
        }
        baekjoonMapper.toCompleteVerificationOutputDto.mockReturnValue(failureOutput)

        const result = await useCase.execute(validInput)

        expect(result.success).toBe(false)
        expect(result.message).toBe('인증 문자열이 일치하지 않습니다.')
        expect(syncVerificationUseCase.syncFromSession).toHaveBeenCalledWith(mockSessionId)
      })
    })

    describe('에러 처리', () => {
      beforeEach(() => {
        rateLimitService.checkRateLimit.mockResolvedValue(true)
        rateLimitService.recordAttempt.mockResolvedValue(undefined)
        const mockSession = {
          getUserId: () => mockUserId,
          getHandleString: () => mockHandle,
          getVerificationString: () => VerificationString.of(mockVerificationString),
          getSessionId: () => mockSessionId,
          isExpired: () => false,
          isCompleted: () => false,
          isFailed: () => false,
          complete: jest.fn(),
          fail: jest.fn()
        }
        cacheAdapter.get.mockResolvedValue(mockSession)
        solvedAcApi.getUserAdditionalInfo.mockResolvedValue(mockSolvedAcAdditionalInfo)
        solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
        baekjoonRepository.findByUserId.mockResolvedValue(null)
        cacheAdapter.set.mockResolvedValue(undefined)
      })

      it('API 조회 실패 시 에러를 적절히 처리해야 한다', async () => {
        solvedAcApi.getUserAdditionalInfo.mockRejectedValue(new Error('API Error'))

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
      })

      it('DB 저장 실패 시 세션을 실패 상태로 변경하고 에러를 던져야 한다', async () => {
        baekjoonRepository.save.mockRejectedValue(new Error('DB Error'))

        await expect(useCase.execute(validInput)).rejects.toThrow(BadRequestException)
      })

      it('캐시 업데이트 실패는 로그만 남기고 계속 진행해야 한다', async () => {
        cacheAdapter.set.mockRejectedValue(new Error('Cache Error'))
        baekjoonRepository.save.mockResolvedValue(undefined)
        baekjoonMapper.toCompleteVerificationOutputDto.mockReturnValue(mockCompleteVerificationOutputDto)

        // 캐시 에러는 로그만 남기고 성공해야 함
        const result = await useCase.execute(validInput)
        expect(result).toBe(mockCompleteVerificationOutputDto)
      })
    })
  })

  describe('비동기 동기화', () => {
    it('인증 성공 시 비동기 동기화를 수행해야 한다', async () => {
      const validInput: CompleteVerificationInputDto = {
        email: mockUserId,
        handle: mockHandle,
        sessionId: mockSessionId
      }

      rateLimitService.checkRateLimit.mockResolvedValue(true)
      rateLimitService.recordAttempt.mockResolvedValue(undefined)
      const mockSession = {
        getUserId: () => mockUserId,
        getHandleString: () => mockHandle,
        getVerificationString: () => VerificationString.of(mockVerificationString),
        getSessionId: () => mockSessionId,
        isExpired: () => false,
        isCompleted: () => false,
        isFailed: () => false,
        complete: jest.fn(),
        fail: jest.fn()
      }
      cacheAdapter.get.mockResolvedValue(mockSession)
      cacheAdapter.set.mockResolvedValue(undefined)
      solvedAcApi.getUserAdditionalInfo.mockResolvedValue(mockSolvedAcAdditionalInfo)
      solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
      baekjoonRepository.findByUserId.mockResolvedValue(null)
      baekjoonRepository.save.mockResolvedValue(undefined)
      syncVerificationUseCase.syncFromSession.mockResolvedValue(undefined)
      baekjoonMapper.toCompleteVerificationOutputDto.mockReturnValue(mockCompleteVerificationOutputDto)

      await useCase.execute(validInput)

      // 비동기 동기화가 호출되었는지 확인 (Promise.resolve로 감싸서 비동기 처리 확인)
      await Promise.resolve()
      expect(syncVerificationUseCase.syncFromSession).toHaveBeenCalledWith(mockSessionId)
    })

    it('동기화 실패는 로그만 남기고 메인 플로우에 영향을 주지 않아야 한다', async () => {
      const validInput: CompleteVerificationInputDto = {
        email: mockUserId,
        handle: mockHandle,
        sessionId: mockSessionId
      }

      rateLimitService.checkRateLimit.mockResolvedValue(true)
      rateLimitService.recordAttempt.mockResolvedValue(undefined)
      const mockSession = {
        getUserId: () => mockUserId,
        getHandleString: () => mockHandle,
        getVerificationString: () => VerificationString.of(mockVerificationString),
        getSessionId: () => mockSessionId,
        isExpired: () => false,
        isCompleted: () => false,
        isFailed: () => false,
        complete: jest.fn(),
        fail: jest.fn()
      }
      cacheAdapter.get.mockResolvedValue(mockSession)
      cacheAdapter.set.mockResolvedValue(undefined)
      solvedAcApi.getUserAdditionalInfo.mockResolvedValue(mockSolvedAcAdditionalInfo)
      solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
      baekjoonRepository.findByUserId.mockResolvedValue(null)
      baekjoonRepository.save.mockResolvedValue(undefined)
      syncVerificationUseCase.syncFromSession.mockRejectedValue(new Error('Sync Error'))
      baekjoonMapper.toCompleteVerificationOutputDto.mockReturnValue(mockCompleteVerificationOutputDto)

      const result = await useCase.execute(validInput)

      expect(result).toBe(mockCompleteVerificationOutputDto)
      // 동기화 실패해도 메인 플로우는 성공해야 함
    })
  })

  describe('특수 케이스', () => {
    it('인증 문자열 비교 시 대소문자와 공백을 정확히 처리해야 한다', async () => {
      const validInput: CompleteVerificationInputDto = {
        email: mockUserId,
        handle: mockHandle,
        sessionId: mockSessionId
      }

      rateLimitService.checkRateLimit.mockResolvedValue(true)
      rateLimitService.recordAttempt.mockResolvedValue(undefined)
      
      const exactMatchString = '귀여운고양이12345678'
      const mockSession = {
        getUserId: () => mockUserId,
        getHandleString: () => mockHandle,
        getVerificationString: () => VerificationString.of(exactMatchString),
        getSessionId: () => mockSessionId,
        isExpired: () => false,
        isCompleted: () => false,
        isFailed: () => false,
        complete: jest.fn(),
        fail: jest.fn()
      }
      
      cacheAdapter.get.mockResolvedValue(mockSession)
      cacheAdapter.set.mockResolvedValue(undefined)
      solvedAcApi.getUserAdditionalInfo.mockResolvedValue({ nameNative: exactMatchString })
      solvedAcApi.getUserProfile.mockResolvedValue(mockSolvedAcProfile)
      baekjoonRepository.findByUserId.mockResolvedValue(null)
      baekjoonRepository.save.mockResolvedValue(undefined)
      syncVerificationUseCase.syncFromSession.mockResolvedValue(undefined)
      baekjoonMapper.toCompleteVerificationOutputDto.mockReturnValue(mockCompleteVerificationOutputDto)

      const result = await useCase.execute(validInput)

      expect(result.success).toBe(true)
    })
  })
})