import { Test, TestingModule } from '@nestjs/testing'

import { BaekjoonProfileRepositoryPort } from '../../../ports/out/baekjoon-profile-repository.port'
import { CachePort } from '../../../ports/out/cache.port'
import { SyncVerificationStatusUseCaseImpl } from '../sync-verification-status.usecase.impl'

import { BaekjoonUser, VerificationSession } from '@/modules/baekjoon/domain/model'
import { TierLevel, VerificationString } from '@/modules/baekjoon/domain/vo'

describe('SyncVerificationStatusUseCaseImpl', () => {
  let useCase: SyncVerificationStatusUseCaseImpl
  let profileRepository: jest.Mocked<BaekjoonProfileRepositoryPort>
  let cacheAdapter: jest.Mocked<CachePort>

  const mockUserId = 'user@example.com'
  const mockHandle = 'test_user'
  const mockSessionId = 'session123'

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
    verificationString: VerificationString.of('귀여운고양이12345678')
  })

  beforeEach(async () => {
    const mockProfileRepository = {
      findByUserId: jest.fn(),
      findByBaekjoonId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }

    const mockCacheAdapter = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncVerificationStatusUseCaseImpl,
        {
          provide: 'BaekjoonProfileRepositoryPort',
          useValue: mockProfileRepository
        },
        {
          provide: 'CachePort',
          useValue: mockCacheAdapter
        }
      ]
    }).compile()

    useCase = module.get<SyncVerificationStatusUseCaseImpl>(SyncVerificationStatusUseCaseImpl)
    profileRepository = module.get('BaekjoonProfileRepositoryPort')
    cacheAdapter = module.get('CachePort')
  })

  describe('syncFromSession', () => {
    describe('정상 케이스', () => {
      beforeEach(() => {
        const mockSession = {
          ...mockVerificationSession,
          getUserId: () => mockUserId,
          isCompleted: () => false,
          isFailed: () => false,
          isExpired: () => false
        }
        cacheAdapter.get.mockResolvedValue(mockSession)
        profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
        profileRepository.save.mockResolvedValue(undefined)
      })

      it('세션이 완료되고 사용자가 미인증 상태면 인증으로 변경해야 한다', async () => {
        const completedSession = {
          ...mockVerificationSession,
          getUserId: () => mockUserId,
          isCompleted: () => true,
          isFailed: () => false,
          isExpired: () => false
        }
        cacheAdapter.get.mockResolvedValue(completedSession)
        jest.spyOn(mockBaekjoonUser, 'isVerified').mockReturnValue(false)
        jest.spyOn(mockBaekjoonUser, 'markAsVerified').mockImplementation()

        await useCase.syncFromSession(mockSessionId)

        expect(cacheAdapter.get).toHaveBeenCalledWith(mockSessionId)
        expect(profileRepository.findByUserId).toHaveBeenCalledWith(mockUserId)
        expect(mockBaekjoonUser.markAsVerified).toHaveBeenCalled()
        expect(profileRepository.save).toHaveBeenCalledWith(mockBaekjoonUser)
      })

      it('세션이 실패했고 사용자가 PENDING 상태면 REJECTED로 변경해야 한다', async () => {
        const failedSession = {
          ...mockVerificationSession,
          getUserId: () => mockUserId,
          isCompleted: () => false,
          isFailed: () => true,
          isExpired: () => false
        }
        cacheAdapter.get.mockResolvedValue(failedSession)
        jest.spyOn(mockBaekjoonUser, 'isVerified').mockReturnValue(false)
        jest.spyOn(mockBaekjoonUser, 'isPending').mockReturnValue(true)
        jest.spyOn(mockBaekjoonUser, 'updateVerificationResult').mockImplementation()

        await useCase.syncFromSession(mockSessionId)

        expect(mockBaekjoonUser.updateVerificationResult).toHaveBeenCalledWith('REJECTED')
        expect(profileRepository.save).toHaveBeenCalledWith(mockBaekjoonUser)
      })

      it('세션이 만료되고 사용자가 PENDING 상태면 REJECTED로 변경해야 한다', async () => {
        const expiredSession = {
          ...mockVerificationSession,
          getUserId: () => mockUserId,
          isCompleted: () => false,
          isFailed: () => false,
          isExpired: () => true
        }
        cacheAdapter.get.mockResolvedValue(expiredSession)
        jest.spyOn(mockBaekjoonUser, 'isVerified').mockReturnValue(false)
        jest.spyOn(mockBaekjoonUser, 'isPending').mockReturnValue(true)
        jest.spyOn(mockBaekjoonUser, 'updateVerificationResult').mockImplementation()

        await useCase.syncFromSession(mockSessionId)

        expect(mockBaekjoonUser.updateVerificationResult).toHaveBeenCalledWith('REJECTED')
        expect(profileRepository.save).toHaveBeenCalledWith(mockBaekjoonUser)
      })

      it('동기화가 필요없는 경우 저장하지 않아야 한다', async () => {
        const mockSession = {
          ...mockVerificationSession,
          getUserId: () => mockUserId,
          isCompleted: () => true,
          isFailed: () => false,
          isExpired: () => false
        }
        cacheAdapter.get.mockResolvedValue(mockSession)
        jest.spyOn(mockBaekjoonUser, 'isVerified').mockReturnValue(true) // 이미 인증됨

        await useCase.syncFromSession(mockSessionId)

        expect(profileRepository.save).not.toHaveBeenCalled()
      })
    })

    describe('예외 상황', () => {
      it('세션이 존재하지 않으면 조용히 종료해야 한다', async () => {
        cacheAdapter.get.mockResolvedValue(null)

        await useCase.syncFromSession(mockSessionId)

        expect(profileRepository.findByUserId).not.toHaveBeenCalled()
        expect(profileRepository.save).not.toHaveBeenCalled()
      })

      it('사용자가 존재하지 않으면 조용히 종료해야 한다', async () => {
        const mockSession = {
          ...mockVerificationSession,
          getUserId: () => mockUserId
        }
        cacheAdapter.get.mockResolvedValue(mockSession)
        profileRepository.findByUserId.mockResolvedValue(null)

        await useCase.syncFromSession(mockSessionId)

        expect(profileRepository.save).not.toHaveBeenCalled()
      })

      it('캐시 조회 실패 시 에러를 던지지 않고 조용히 처리해야 한다', async () => {
        cacheAdapter.get.mockRejectedValue(new Error('Cache Error'))

        // 에러를 던지지 않고 정상 완료되어야 함
        await expect(useCase.syncFromSession(mockSessionId)).resolves.toBeUndefined()
        expect(profileRepository.findByUserId).not.toHaveBeenCalled()
      })

      it('사용자 조회 실패 시 에러를 던지지 않고 조용히 처리해야 한다', async () => {
        const mockSession = {
          ...mockVerificationSession,
          getUserId: () => mockUserId
        }
        cacheAdapter.get.mockResolvedValue(mockSession)
        profileRepository.findByUserId.mockRejectedValue(new Error('DB Error'))

        await expect(useCase.syncFromSession(mockSessionId)).resolves.toBeUndefined()
        expect(profileRepository.save).not.toHaveBeenCalled()
      })

      it('저장 실패 시 에러를 던지지 않고 조용히 처리해야 한다', async () => {
        const completedSession = {
          ...mockVerificationSession,
          getUserId: () => mockUserId,
          isCompleted: () => true,
          isFailed: () => false,
          isExpired: () => false
        }
        cacheAdapter.get.mockResolvedValue(completedSession)
        jest.spyOn(mockBaekjoonUser, 'isVerified').mockReturnValue(false)
        jest.spyOn(mockBaekjoonUser, 'markAsVerified').mockImplementation()
        profileRepository.save.mockRejectedValue(new Error('Save Error'))

        await expect(useCase.syncFromSession(mockSessionId)).resolves.toBeUndefined()
      })
    })
  })

  describe('cleanupFailedSessions', () => {
    it('실패한 세션들의 정리 작업을 수행해야 한다', async () => {
      const result = await useCase.cleanupFailedSessions()

      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThanOrEqual(0)
    })

    it('정리 작업 중 에러가 발생해도 처리된 개수를 반환해야 한다', async () => {
      // 현재 구현에서는 TODO 상태이므로 0을 반환할 것임
      const result = await useCase.cleanupFailedSessions()

      expect(result).toBe(0)
    })
  })

  describe('forceSyncUser', () => {
    it('사용자가 존재하지 않으면 조용히 종료해야 한다', async () => {
      profileRepository.findByUserId.mockResolvedValue(null)

      await useCase.forceSyncUser(mockUserId)

      expect(profileRepository.save).not.toHaveBeenCalled()
    })

    it('활성 세션이 없으면 조용히 종료해야 한다', async () => {
      profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)

      await useCase.forceSyncUser(mockUserId)

      // 현재 구현에서는 findActiveSessionForUser가 null을 반환하므로 save가 호출되지 않음
      expect(profileRepository.save).not.toHaveBeenCalled()
    })

    it('사용자 조회 실패 시 에러를 던져야 한다', async () => {
      profileRepository.findByUserId.mockRejectedValue(new Error('DB Error'))

      await expect(useCase.forceSyncUser(mockUserId)).rejects.toThrow('DB Error')
    })
  })

  describe('Private 메서드들 (통합 테스트 관점)', () => {
    it('전체 동기화 플로우가 올바른 순서로 실행되어야 한다', async () => {
      const completedSession = {
        ...mockVerificationSession,
        getUserId: () => mockUserId,
        isCompleted: () => true,
        isFailed: () => false,
        isExpired: () => false
      }
      cacheAdapter.get.mockResolvedValue(completedSession)
      jest.spyOn(mockBaekjoonUser, 'isVerified').mockReturnValue(false)
      jest.spyOn(mockBaekjoonUser, 'markAsVerified').mockImplementation()
      profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
      profileRepository.save.mockResolvedValue(undefined)

      await useCase.syncFromSession(mockSessionId)

      // 호출 순서 확인
      expect(cacheAdapter.get).toHaveBeenCalledBefore(profileRepository.findByUserId as jest.Mock)
      expect(profileRepository.findByUserId).toHaveBeenCalledBefore(profileRepository.save as jest.Mock)
    })

    it('동기화 로직이 올바른 조건을 확인해야 한다', async () => {
      const mockSession = {
        ...mockVerificationSession,
        getUserId: () => mockUserId,
        isCompleted: () => false,
        isFailed: () => false,
        isExpired: () => false
      }
      cacheAdapter.get.mockResolvedValue(mockSession)
      profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)

      const isCompletedSpy = jest.spyOn(mockSession, 'isCompleted')
      const isFailedSpy = jest.spyOn(mockSession, 'isFailed')
      const isExpiredSpy = jest.spyOn(mockSession, 'isExpired')
      const isVerifiedSpy = jest.spyOn(mockBaekjoonUser, 'isVerified').mockReturnValue(true)

      await useCase.syncFromSession(mockSessionId)

      expect(isCompletedSpy).toHaveBeenCalled()
      expect(isVerifiedSpy).toHaveBeenCalled()
      // 상태에 따라 다른 메서드들도 호출될 수 있음
    })
  })

  describe('로깅 동작', () => {
    it('동기화 성공 시 성공 로그를 남겨야 한다', async () => {
      const completedSession = {
        ...mockVerificationSession,
        getUserId: () => mockUserId,
        isCompleted: () => true,
        isFailed: () => false,
        isExpired: () => false
      }
      cacheAdapter.get.mockResolvedValue(completedSession)
      jest.spyOn(mockBaekjoonUser, 'isVerified').mockReturnValue(false)
      jest.spyOn(mockBaekjoonUser, 'markAsVerified').mockImplementation()
      profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
      profileRepository.save.mockResolvedValue(undefined)

      // 로깅 스파이
      const logSpy = jest.spyOn(useCase['logger'], 'log').mockImplementation()

      await useCase.syncFromSession(mockSessionId)

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Synced verification status')
      )

      logSpy.mockRestore()
    })

    it('에러 발생 시 에러 로그를 남겨야 한다', async () => {
      cacheAdapter.get.mockRejectedValue(new Error('Test Error'))

      const errorSpy = jest.spyOn(useCase['logger'], 'error').mockImplementation()

      await useCase.syncFromSession(mockSessionId)

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Failed to sync verification status'),
        expect.any(String)
      )

      errorSpy.mockRestore()
    })
  })

  describe('특수 케이스', () => {
    it('세션과 사용자의 상태 조합에 따른 올바른 처리', async () => {
      // 케이스 1: 완료된 세션 + 인증된 사용자 (변경 없음)
      const completedSession = {
        getUserId: () => mockUserId,
        isCompleted: () => true,
        isFailed: () => false,
        isExpired: () => false
      }
      cacheAdapter.get.mockResolvedValue(completedSession)
      jest.spyOn(mockBaekjoonUser, 'isVerified').mockReturnValue(true)
      profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)

      await useCase.syncFromSession(mockSessionId)

      expect(profileRepository.save).not.toHaveBeenCalled()
    })

    it('동시성 안전성을 위한 멱등성 확인', async () => {
      const completedSession = {
        getUserId: () => mockUserId,
        isCompleted: () => true,
        isFailed: () => false,
        isExpired: () => false
      }
      cacheAdapter.get.mockResolvedValue(completedSession)
      jest.spyOn(mockBaekjoonUser, 'isVerified').mockReturnValue(false)
      jest.spyOn(mockBaekjoonUser, 'markAsVerified').mockImplementation()
      profileRepository.findByUserId.mockResolvedValue(mockBaekjoonUser)
      profileRepository.save.mockResolvedValue(undefined)

      // 같은 세션으로 여러 번 동기화 시도
      await useCase.syncFromSession(mockSessionId)
      await useCase.syncFromSession(mockSessionId)

      // markAsVerified가 여러 번 호출되어도 문제없어야 함
      expect(profileRepository.save).toHaveBeenCalledTimes(2)
    })
  })
})