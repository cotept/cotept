import { BadRequestException } from '@nestjs/common'

import { BaekjoonHandle, Tier, TierLevel } from '../../vo'
import { BaekjoonProfileVerificationStatus } from '../../vo/baekjoon-profile-verification-status.vo'
import { BaekjoonUser } from '../baekjoon-user.model'
import { VerificationSession } from '../verification-session.model'

describe('BaekjoonUser', () => {
  const validUserId = 'user123'
  const validHandle = 'test_user'
  const validTier = TierLevel.GOLD_III
  const validSolvedCount = 150

  describe('생성자', () => {
    it('유효한 매개변수로 BaekjoonUser를 생성해야 한다', () => {
      const user = new BaekjoonUser({
        userId: validUserId,
        handle: validHandle,
        currentTier: validTier,
        solvedCount: validSolvedCount,
        name: 'Test User',
      })

      expect(user.getUserId()).toBe(validUserId)
      expect(user.getHandleString()).toBe(validHandle)
      expect(user.getCurrentTier().getLevel()).toBe(validTier)
      expect(user.getSolvedCount()).toBe(validSolvedCount)
      expect(user.getName()).toBe('Test User')
      expect(user.getVerified()).toBe(undefined)
      expect(user.getVerificationStatus()).toBe(BaekjoonProfileVerificationStatus.PENDING)
    })

    it('BaekjoonHandle 객체로 핸들을 설정할 수 있어야 한다', () => {
      const handle = BaekjoonHandle.of(validHandle)
      const user = new BaekjoonUser({
        userId: validUserId,
        handle,
        currentTier: validTier,
        solvedCount: validSolvedCount,
      })

      expect(user.getHandle()).toBe(handle)
      expect(user.getHandleString()).toBe(validHandle)
    })

    it('Tier 객체로 티어를 설정할 수 있어야 한다', () => {
      const tier = Tier.ofLevel(validTier)
      const user = new BaekjoonUser({
        userId: validUserId,
        handle: validHandle,
        currentTier: tier,
        solvedCount: validSolvedCount,
      })

      expect(user.getCurrentTier()).toBe(tier)
    })

    it('선택적 매개변수들을 올바르게 설정해야 한다', () => {
      const verifiedAt = new Date('2023-01-01')
      const user = new BaekjoonUser({
        userId: validUserId,
        handle: validHandle,
        currentTier: validTier,
        solvedCount: validSolvedCount,
        verified: true,
        verifiedAt,
        name: 'Test User',
      })

      expect(user.getVerified()).toBe(true)
      expect(user.getVerifiedAt()).toBe(verifiedAt)
      expect(user.getName()).toBe('Test User')
    })
  })

  describe('fromSolvedAcApi', () => {
    it('solved.ac API 응답으로부터 BaekjoonUser를 생성해야 한다', () => {
      const apiResponse = {
        userId: validUserId,
        handle: validHandle,
        tier: 13, // GOLD_III
        solvedCount: validSolvedCount,
        name: 'API User',
      }

      const user = BaekjoonUser.fromSolvedAcApi(apiResponse)

      expect(user.getUserId()).toBe(validUserId)
      expect(user.getHandleString()).toBe(validHandle)
      expect(user.getCurrentTier().getLevel()).toBe(TierLevel.GOLD_III)
      expect(user.getSolvedCount()).toBe(validSolvedCount)
      expect(user.getName()).toBe('API User')
    })
  })

  describe('validateUserIdAndHandle', () => {
    it('유효한 userId와 handle에 대해 예외를 던지지 않아야 한다', () => {
      expect(() => {
        BaekjoonUser.validateUserIdAndHandle({
          userId: validUserId,
          handle: validHandle,
        })
      }).not.toThrow()
    })

    it('빈 userId에 대해 BadRequestException을 던져야 한다', () => {
      expect(() => {
        BaekjoonUser.validateUserIdAndHandle({
          userId: '',
          handle: validHandle,
        })
      }).toThrow(BadRequestException)
    })

    it('빈 handle에 대해 BadRequestException을 던져야 한다', () => {
      expect(() => {
        BaekjoonUser.validateUserIdAndHandle({
          userId: validUserId,
          handle: '',
        })
      }).toThrow(BadRequestException)
    })

    it('공백만 있는 userId에 대해 BadRequestException을 던져야 한다', () => {
      expect(() => {
        BaekjoonUser.validateUserIdAndHandle({
          userId: '   ',
          handle: validHandle,
        })
      }).toThrow(BadRequestException)
    })
  })

  describe('인증 상태 관리', () => {
    let user: BaekjoonUser

    beforeEach(() => {
      user = new BaekjoonUser({
        userId: validUserId,
        handle: validHandle,
        currentTier: validTier,
        solvedCount: validSolvedCount,
      })
    })

    it('초기 상태는 PENDING이어야 한다', () => {
      expect(user.getVerificationStatus()).toBe(BaekjoonProfileVerificationStatus.PENDING)
      expect(user.isPending()).toBe(true)
      expect(user.isVerified()).toBe(false)
      expect(user.isRejected()).toBe(false)
    })

    it('markAsVerified()를 호출하면 인증 완료 상태가 되어야 한다', () => {
      const result = user.markAsVerified()

      expect(result).toBe(user) // 체이닝 확인
      expect(user.getVerified()).toBe(true)
      expect(user.getVerifiedAt()).toBeInstanceOf(Date)
    })

    it('updateVerificationResult()로 상태를 변경할 수 있어야 한다', () => {
      user.updateVerificationResult(BaekjoonProfileVerificationStatus.VERIFIED)

      expect(user.getVerificationStatus()).toBe(BaekjoonProfileVerificationStatus.VERIFIED)
      expect(user.isVerified()).toBe(true)
      expect(user.getVerified()).toBe(true)
      expect(user.getVerifiedAt()).toBeInstanceOf(Date)
    })

    it('REJECTED 상태로 변경하면 verified가 false가 되어야 한다', () => {
      user.updateVerificationResult(BaekjoonProfileVerificationStatus.REJECTED)

      expect(user.getVerificationStatus()).toBe(BaekjoonProfileVerificationStatus.REJECTED)
      expect(user.isRejected()).toBe(true)
      expect(user.getVerified()).toBe(false)
      expect(user.getVerifiedAt()).toBeUndefined()
    })

    it('유효하지 않은 인증 상태에 대해 에러를 던져야 한다', () => {
      expect(() => {
        user.updateVerificationResult('INVALID_STATUS' as any)
      }).toThrow('Invalid verification status: INVALID_STATUS')
    })
  })

  describe('프로필 업데이트', () => {
    let user: BaekjoonUser

    beforeEach(() => {
      user = new BaekjoonUser({
        userId: validUserId,
        handle: validHandle,
        currentTier: validTier,
        solvedCount: validSolvedCount,
      })
    })

    it('updateProfile()로 프로필 정보를 업데이트할 수 있어야 한다', () => {
      const updateParams = {
        tier: 15, // GOLD_I
        solvedCount: 200,
        name: 'Updated Name',
        verified: true,
      }

      const result = user.updateProfile(updateParams)

      expect(result).toBe(user) // 체이닝 확인
      expect(user.getCurrentTier().getLevel()).toBe(TierLevel.GOLD_I)
      expect(user.getSolvedCount()).toBe(200)
      expect(user.getName()).toBe('Updated Name')
      expect(user.getVerified()).toBe(true)
      expect(user.getLastSyncedAt()).toBeInstanceOf(Date)
    })
  })

  describe('멘토 자격 확인', () => {
    it('Platinum III 이상 티어는 멘토 자격이 있어야 한다', () => {
      const user = new BaekjoonUser({
        userId: validUserId,
        handle: validHandle,
        currentTier: TierLevel.PLATINUM_III,
        solvedCount: validSolvedCount,
      })

      expect(user.isMentorEligible()).toBe(true)
    })

    it('Platinum III 미만 티어는 멘토 자격이 없어야 한다', () => {
      const user = new BaekjoonUser({
        userId: validUserId,
        handle: validHandle,
        currentTier: TierLevel.GOLD_I,
        solvedCount: validSolvedCount,
      })

      expect(user.isMentorEligible()).toBe(false)
    })
  })

  describe('동기화 관련', () => {
    it('possibleSync()는 45분 경과 후 true를 반환해야 한다', () => {
      const pastDate = new Date(Date.now() - 46 * 60 * 1000) // 46분 전
      const user = new BaekjoonUser({
        userId: validUserId,
        handle: validHandle,
        currentTier: validTier,
        solvedCount: validSolvedCount,
        lastSyncedAt: pastDate,
      })

      expect(user.possibleSync()).toBe(true)
    })

    it('possibleSync()는 45분 이내일 때 false를 반환해야 한다', () => {
      const recentDate = new Date(Date.now() - 30 * 60 * 1000) // 30분 전
      const user = new BaekjoonUser({
        userId: validUserId,
        handle: validHandle,
        currentTier: validTier,
        solvedCount: validSolvedCount,
        lastSyncedAt: recentDate,
      })

      expect(user.possibleSync()).toBe(false)
    })
  })

  describe('이름 확인', () => {
    it('hasname()은 정확한 이름 매칭 시 true를 반환해야 한다', () => {
      const user = new BaekjoonUser({
        userId: validUserId,
        handle: validHandle,
        currentTier: validTier,
        solvedCount: validSolvedCount,
        name: 'Test User',
      })

      expect(user.hasname('Test User')).toBe(true)
      expect(user.hasname('Different Name')).toBe(false)
    })
  })

  describe('동등성 비교', () => {
    it('같은 userId와 handle을 가진 사용자는 동일해야 한다', () => {
      const user1 = new BaekjoonUser({
        userId: validUserId,
        handle: validHandle,
        currentTier: validTier,
        solvedCount: validSolvedCount,
      })

      const user2 = new BaekjoonUser({
        userId: validUserId,
        handle: validHandle,
        currentTier: TierLevel.SILVER_I, // 다른 티어
        solvedCount: 50, // 다른 풀이 수
      })

      expect(user1.equals(user2)).toBe(true)
    })

    it('다른 userId나 handle을 가진 사용자는 다르다고 판단해야 한다', () => {
      const user1 = new BaekjoonUser({
        userId: validUserId,
        handle: validHandle,
        currentTier: validTier,
        solvedCount: validSolvedCount,
      })

      const user2 = new BaekjoonUser({
        userId: 'different_user',
        handle: validHandle,
        currentTier: validTier,
        solvedCount: validSolvedCount,
      })

      expect(user1.equals(user2)).toBe(false)
    })
  })

  describe('세션 기반 인증 업데이트', () => {
    let user: BaekjoonUser
    let session: VerificationSession

    beforeEach(() => {
      user = new BaekjoonUser({
        userId: validUserId,
        handle: validHandle,
        currentTier: validTier,
        solvedCount: validSolvedCount,
      })

      session = VerificationSession.start({
        userId: validUserId,
        handle: validHandle,
      })
    })

    it('완료된 세션으로부터 인증 상태를 업데이트해야 한다', () => {
      session.complete()
      
      const result = user.updateVerificationFromSession(session)

      expect(result).toBe(user) // 체이닝 확인
      expect(user.getVerificationStatus()).toBe(BaekjoonProfileVerificationStatus.VERIFIED)
      expect(user.getVerified()).toBe(true)
      expect(user.getVerifiedAt()).toBeInstanceOf(Date)
    })

    it('실패한 세션으로부터 거부 상태를 업데이트해야 한다', () => {
      session.fail('인증 실패')
      
      user.updateVerificationFromSession(session)

      expect(user.getVerificationStatus()).toBe(BaekjoonProfileVerificationStatus.REJECTED)
      expect(user.getVerified()).toBe(false)
      expect(user.getVerifiedAt()).toBeUndefined()
    })

    it('만료된 세션으로부터 거부 상태를 업데이트해야 한다', () => {
      // 세션을 과거 시간으로 만료시키기
      const expiredSession = new VerificationSession({
        userId: validUserId,
        handle: validHandle,
        verificationString: '귀여운고양이12345678',
        expiresAt: new Date(Date.now() - 1000), // 1초 전에 만료
      })
      
      user.updateVerificationFromSession(expiredSession)

      expect(user.getVerificationStatus()).toBe(BaekjoonProfileVerificationStatus.REJECTED)
      expect(user.getVerified()).toBe(false)
      expect(user.getVerifiedAt()).toBeUndefined()
    })
  })
})