import { BaekjoonHandle, VerificationStatus,VerificationString } from '../../vo'
import { VerificationSession } from '../verification-session.model'

describe('VerificationSession', () => {
  const validUserId = 'user123'
  const validHandle = 'test_user'
  const validVerificationString = '귀여운고양이12345678'

  describe('생성자', () => {
    it('유효한 매개변수로 VerificationSession을 생성해야 한다', () => {
      const session = new VerificationSession({
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
      })

      expect(session.getUserId()).toBe(validUserId)
      expect(session.getHandle().toString()).toBe(validHandle)
      expect(session.getVerificationString().toString()).toBe(validVerificationString)
      expect(session.isInProgress()).toBe(true)
      expect(session.getAttemptCount()).toBe(0)
    })

    it('BaekjoonHandle 객체로 핸들을 설정할 수 있어야 한다', () => {
      const handle = BaekjoonHandle.of(validHandle)
      const session = new VerificationSession({
        userId: validUserId,
        handle,
        verificationString: validVerificationString,
      })

      expect(session.getHandle()).toBe(handle)
    })

    it('VerificationString 객체로 인증 문자열을 설정할 수 있어야 한다', () => {
      const verificationString = VerificationString.of(validVerificationString)
      const session = new VerificationSession({
        userId: validUserId,
        handle: validHandle,
        verificationString,
      })

      expect(session.getVerificationString()).toBe(verificationString)
    })

    it('VerificationStatus 객체로 상태를 설정할 수 있어야 한다', () => {
      const status = VerificationStatus.completed()
      const session = new VerificationSession({
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
        status,
      })

      expect(session.getStatus()).toBe(status)
      expect(session.isCompleted()).toBe(true)
    })

    it('선택적 매개변수들을 올바르게 설정해야 한다', () => {
      const expiresAt = new Date(Date.now() + 3600000) // 1시간 후
      const session = new VerificationSession({
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
        attemptCount: 2,
        expiresAt,
      })

      expect(session.getAttemptCount()).toBe(2)
      expect(session.getExpiresAt()).toBe(expiresAt)
    })

    it('sessionId가 제공되지 않으면 자동으로 생성해야 한다', () => {
      const session = new VerificationSession({
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
      })

      expect(session.getSessionId()).toBeDefined()
      expect(typeof session.getSessionId()).toBe('string')
      expect(session.getSessionId().length).toBeGreaterThan(0)
    })
  })

  describe('start 팩토리 메서드', () => {
    it('새로운 인증 세션을 시작해야 한다', () => {
      const session = VerificationSession.start({
        userId: validUserId,
        handle: validHandle,
      })

      expect(session.getUserId()).toBe(validUserId)
      expect(session.getHandle().toString()).toBe(validHandle)
      expect(session.isInProgress()).toBe(true)
      expect(session.getAttemptCount()).toBe(0)
      expect(session.getVerificationString()).toBeDefined()
      expect(session.getSessionId()).toBeDefined()
    })

    it('매번 다른 인증 문자열을 생성해야 한다', () => {
      const session1 = VerificationSession.start({
        userId: validUserId,
        handle: validHandle,
      })

      const session2 = VerificationSession.start({
        userId: validUserId,
        handle: validHandle,
      })

      expect(session1.getVerificationString().toString()).not.toBe(
        session2.getVerificationString().toString()
      )
    })
  })

  describe('상태 관리', () => {
    let session: VerificationSession

    beforeEach(() => {
      session = new VerificationSession({
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
      })
    })

    it('초기 상태는 IN_PROGRESS여야 한다', () => {
      expect(session.isInProgress()).toBe(true)
      expect(session.isCompleted()).toBe(false)
      expect(session.isFailed()).toBe(false)
      expect(session.isExpired()).toBe(false)
    })

    it('complete()를 호출하면 COMPLETED 상태가 되어야 한다', () => {
      const result = session.complete()

      expect(result).toBe(session) // 체이닝 확인
      expect(session.isCompleted()).toBe(true)
      expect(session.isInProgress()).toBe(false)
    })

    it('fail()를 호출하면 FAILED 상태가 되어야 한다', () => {
      const failureReason = '인증 실패'
      const result = session.fail(failureReason)

      expect(result).toBe(session) // 체이닝 확인
      expect(session.isFailed()).toBe(true)
      expect(session.isInProgress()).toBe(false)
    })

    it('expire()를 호출하면 EXPIRED 상태가 되어야 한다', () => {
      const result = session.expire()

      expect(result).toBe(session) // 체이닝 확인
      expect(session.isExpired()).toBe(true)
      expect(session.isInProgress()).toBe(false)
    })
  })

  describe('시도 횟수 관리', () => {
    let session: VerificationSession

    beforeEach(() => {
      session = new VerificationSession({
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
      })
    })

    it('attempt()를 호출하면 시도 횟수가 증가해야 한다', () => {
      expect(session.getAttemptCount()).toBe(0)

      session.attempt()
      expect(session.getAttemptCount()).toBe(1)
      expect(session.getLastAttemptAt()).toBeInstanceOf(Date)

      session.attempt()
      expect(session.getAttemptCount()).toBe(2)
    })

    it('최대 시도 횟수 확인이 가능해야 한다', () => {
      expect(session.isMaxAttemptsExceeded()).toBe(false)

      // 최대 시도 횟수(5)까지 증가
      for (let i = 0; i < 5; i++) {
        session.attempt()
      }

      expect(session.isMaxAttemptsExceeded()).toBe(true)
    })

    it('최대 시도 횟수 도달 시 확인할 수 있어야 한다', () => {
      // 최대 시도 횟수(5)까지 증가
      for (let i = 0; i < 5; i++) {
        session.attempt()
      }

      expect(session.isMaxAttemptsExceeded()).toBe(true)
    })
  })

  describe('만료 관리', () => {
    it('기본 만료 시간은 5분이어야 한다', () => {
      const session = new VerificationSession({
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
      })

      const now = Date.now()
      const expiresAt = session.getExpiresAt().getTime()
      const fiveMinutes = 5 * 60 * 1000

      expect(expiresAt - now).toBeCloseTo(fiveMinutes, -3) // 3자리 정밀도
    })

    it('현재 시간이 만료 시간을 초과하면 만료된 것으로 판단해야 한다', () => {
      const pastDate = new Date(Date.now() - 1000) // 1초 전
      const session = new VerificationSession({
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
        expiresAt: pastDate,
      })

      expect(session.isExpired()).toBe(true)
    })

    it('현재 시간이 만료 시간 이전이면 만료되지 않은 것으로 판단해야 한다', () => {
      const futureDate = new Date(Date.now() + 60000) // 1분 후
      const session = new VerificationSession({
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
        expiresAt: futureDate,
      })

      expect(session.isExpired()).toBe(false)
    })
  })

  describe('재시도 가능성 확인', () => {
    let session: VerificationSession

    beforeEach(() => {
      session = new VerificationSession({
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
      })
    })

    it('진행 중인 세션은 재시도가 불가능해야 한다', () => {
      expect(session.canRetry()).toBe(false)
    })

    it('만료된 세션은 재시도가 불가능해야 한다 (만료 시간 고려)', () => {
      session.expire()
      expect(session.canRetry()).toBe(false)
    })

    it('완료된 세션은 재시도가 불가능해야 한다', () => {
      session.complete()
      expect(session.canRetry()).toBe(false)
    })

    it('실패한 세션은 재시도가 가능해야 한다', () => {
      session.fail('테스트 실패')
      expect(session.canRetry()).toBe(true)
    })
  })

  describe('인증 문자열 갱신', () => {
    let session: VerificationSession

    beforeEach(() => {
      session = new VerificationSession({
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
      })
    })

    it('regenerateVerificationString()으로 새로운 인증 문자열을 생성할 수 있어야 한다', () => {
      const originalString = session.getVerificationString().toString()
      
      const result = session.regenerateVerificationString()
      
      expect(result).toBe(session) // 체이닝 확인
      expect(session.getVerificationString().toString()).not.toBe(originalString)
    })
  })

  describe('동등성 비교', () => {
    it('같은 sessionId를 가진 세션은 동일해야 한다', () => {
      const sessionId = 'test-session-id'
      const session1 = new VerificationSession({
        sessionId,
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
      })

      const session2 = new VerificationSession({
        sessionId,
        userId: 'different-user',
        handle: 'different_handle',
        verificationString: '다른문자열12345678',
      })

      expect(session1.equals(session2)).toBe(true)
    })

    it('다른 sessionId를 가진 세션은 다르다고 판단해야 한다', () => {
      const session1 = new VerificationSession({
        sessionId: 'session1',
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
      })

      const session2 = new VerificationSession({
        sessionId: 'session2',
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
      })

      expect(session1.equals(session2)).toBe(false)
    })
  })

  describe('세션 요약 정보', () => {
    it('getSummary()로 세션 요약 정보를 얻을 수 있어야 한다', () => {
      const session = new VerificationSession({
        sessionId: 'test-session-id-12345',
        userId: validUserId,
        handle: validHandle,
        verificationString: validVerificationString,
      })

      const summary = session.getSummary()
      
      expect(summary).toContain('test-ses') // sessionId 일부
      expect(summary).toContain(validHandle)
      expect(summary).toContain('IN_PROGRESS')
    })
  })
})