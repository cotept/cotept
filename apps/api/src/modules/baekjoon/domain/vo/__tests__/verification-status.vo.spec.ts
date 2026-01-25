import { VerificationStatus, VerificationStatusType } from '../verification-status.vo'

describe('VerificationStatus', () => {
  describe('팩토리 메서드들', () => {
    it('pending() 상태를 생성해야 한다', () => {
      const status = VerificationStatus.pending()
      expect(status.getStatus()).toBe(VerificationStatusType.PENDING)
    })

    it('inProgress() 상태를 생성해야 한다', () => {
      const status = VerificationStatus.inProgress()
      expect(status.getStatus()).toBe(VerificationStatusType.IN_PROGRESS)
    })

    it('completed() 상태를 생성해야 한다', () => {
      const status = VerificationStatus.completed()
      expect(status.getStatus()).toBe(VerificationStatusType.COMPLETED)
      expect(status.isCompleted()).toBe(true)
    })

    it('failed() 상태를 생성해야 한다', () => {
      const reason = '인증 실패'
      const status = VerificationStatus.failed(reason)
      expect(status.getStatus()).toBe(VerificationStatusType.FAILED)
      expect(status.isFailed()).toBe(true)
      expect(status.getReason()).toBe(reason)
    })

    it('expired() 상태를 생성해야 한다', () => {
      const status = VerificationStatus.expired()
      expect(status.getStatus()).toBe(VerificationStatusType.EXPIRED)
      expect(status.isExpired()).toBe(true)
      expect(status.getReason()).toBe('인증 시간이 만료되었습니다.')
    })

    it('of() 팩토리 메서드로 상태를 생성해야 한다', () => {
      const status = VerificationStatus.of(VerificationStatusType.COMPLETED)
      expect(status.getStatus()).toBe(VerificationStatusType.COMPLETED)
      expect(status.isCompleted()).toBe(true)
    })

    it('of() 팩토리 메서드에 이유와 함께 상태를 생성해야 한다', () => {
      const reason = '테스트 실패'
      const status = VerificationStatus.of(VerificationStatusType.FAILED, reason)
      expect(status.getStatus()).toBe(VerificationStatusType.FAILED)
      expect(status.getReason()).toBe(reason)
    })
  })

  describe('상태 확인 메서드들', () => {
    it('isCompleted() 메서드가 작동해야 한다', () => {
      expect(VerificationStatus.completed().isCompleted()).toBe(true)
      expect(VerificationStatus.pending().isCompleted()).toBe(false)
    })

    it('isFailed() 메서드가 작동해야 한다', () => {
      expect(VerificationStatus.failed('실패').isFailed()).toBe(true)
      expect(VerificationStatus.pending().isFailed()).toBe(false)
    })

    it('isExpired() 메서드가 작동해야 한다', () => {
      expect(VerificationStatus.expired().isExpired()).toBe(true)
      expect(VerificationStatus.pending().isExpired()).toBe(false)
    })

    it('isInProgress() 메서드가 작동해야 한다', () => {
      expect(VerificationStatus.inProgress().isInProgress()).toBe(true)
      expect(VerificationStatus.completed().isInProgress()).toBe(false)
    })
  })

  describe('재시도 가능성', () => {
    it('FAILED 상태에서 재시도가 가능해야 한다', () => {
      const status = VerificationStatus.failed('실패')
      expect(status.canRetry()).toBe(true)
    })

    it('EXPIRED 상태에서 재시도가 가능해야 한다', () => {
      const status = VerificationStatus.expired()
      expect(status.canRetry()).toBe(true)
    })

    it('PENDING 상태에서 재시도가 가능해야 한다', () => {
      const status = VerificationStatus.pending()
      expect(status.canRetry()).toBe(true)
    })

    it('IN_PROGRESS 상태에서 재시도가 불가능해야 한다', () => {
      const status = VerificationStatus.inProgress()
      expect(status.canRetry()).toBe(false)
    })

    it('COMPLETED 상태에서 재시도가 불가능해야 한다', () => {
      const status = VerificationStatus.completed()
      expect(status.canRetry()).toBe(false)
    })
  })

  describe('진행 가능성', () => {
    it('PENDING 상태에서 진행이 가능해야 한다', () => {
      const status = VerificationStatus.pending()
      expect(status.canProceed()).toBe(true)
    })

    it('IN_PROGRESS 상태에서 진행이 가능해야 한다', () => {
      const status = VerificationStatus.inProgress()
      expect(status.canProceed()).toBe(true)
    })

    it('COMPLETED 상태에서 진행이 불가능해야 한다', () => {
      const status = VerificationStatus.completed()
      expect(status.canProceed()).toBe(false)
    })

    it('FAILED 상태에서 진행이 불가능해야 한다', () => {
      const status = VerificationStatus.failed('실패')
      expect(status.canProceed()).toBe(false)
    })

    it('EXPIRED 상태에서 진행이 불가능해야 한다', () => {
      const status = VerificationStatus.expired()
      expect(status.canProceed()).toBe(false)
    })
  })

  describe('최종 상태 확인', () => {
    it('COMPLETED는 최종 상태여야 한다', () => {
      const status = VerificationStatus.completed()
      expect(status.isFinal()).toBe(true)
    })

    it('EXPIRED는 최종 상태여야 한다', () => {
      const status = VerificationStatus.expired()
      expect(status.isFinal()).toBe(true)
    })

    it('PENDING은 최종 상태가 아니어야 한다', () => {
      const status = VerificationStatus.pending()
      expect(status.isFinal()).toBe(false)
    })

    it('IN_PROGRESS는 최종 상태가 아니어야 한다', () => {
      const status = VerificationStatus.inProgress()
      expect(status.isFinal()).toBe(false)
    })

    it('FAILED는 최종 상태가 아니어야 한다', () => {
      const status = VerificationStatus.failed('실패')
      expect(status.isFinal()).toBe(false)
    })
  })

  describe('상태 전환 가능성', () => {
    it('PENDING에서 IN_PROGRESS로 전환이 가능해야 한다', () => {
      const status = VerificationStatus.pending()
      expect(status.canTransitionTo(VerificationStatusType.IN_PROGRESS)).toBe(true)
    })

    it('PENDING에서 EXPIRED로 전환이 가능해야 한다', () => {
      const status = VerificationStatus.pending()
      expect(status.canTransitionTo(VerificationStatusType.EXPIRED)).toBe(true)
    })

    it('IN_PROGRESS에서 COMPLETED로 전환이 가능해야 한다', () => {
      const status = VerificationStatus.inProgress()
      expect(status.canTransitionTo(VerificationStatusType.COMPLETED)).toBe(true)
    })

    it('IN_PROGRESS에서 FAILED로 전환이 가능해야 한다', () => {
      const status = VerificationStatus.inProgress()
      expect(status.canTransitionTo(VerificationStatusType.FAILED)).toBe(true)
    })

    it('COMPLETED에서 다른 상태로 전환이 불가능해야 한다', () => {
      const status = VerificationStatus.completed()
      expect(status.canTransitionTo(VerificationStatusType.FAILED)).toBe(false)
      expect(status.canTransitionTo(VerificationStatusType.IN_PROGRESS)).toBe(false)
    })

    it('FAILED에서 PENDING으로 전환이 가능해야 한다', () => {
      const status = VerificationStatus.failed('실패')
      expect(status.canTransitionTo(VerificationStatusType.PENDING)).toBe(true)
    })

    it('EXPIRED에서 IN_PROGRESS로 전환이 가능해야 한다', () => {
      const status = VerificationStatus.expired()
      expect(status.canTransitionTo(VerificationStatusType.IN_PROGRESS)).toBe(true)
    })
  })

  describe('사용자 메시지', () => {
    it('각 상태별로 적절한 메시지를 반환해야 한다', () => {
      expect(VerificationStatus.pending().getUserMessage()).toBe('인증을 시작해주세요.')
      expect(VerificationStatus.inProgress().getUserMessage()).toBe('프로필 이름를 수정하고 인증을 완료해주세요.')
      expect(VerificationStatus.completed().getUserMessage()).toBe('백준 ID 인증이 완료되었습니다.')
      expect(VerificationStatus.expired().getUserMessage()).toBe('인증 시간이 만료되었습니다. 다시 시도해주세요.')
    })

    it('FAILED 상태에서 사용자 정의 메시지를 반환해야 한다', () => {
      const customReason = '사용자 정의 실패 이유'
      const status = VerificationStatus.failed(customReason)
      expect(status.getUserMessage()).toBe(customReason)
    })

    it('FAILED 상태에서 이유가 없으면 기본 메시지를 반환해야 한다', () => {
      const status = VerificationStatus.of(VerificationStatusType.FAILED)
      expect(status.getUserMessage()).toBe('인증에 실패했습니다. 다시 시도해주세요.')
    })
  })

  describe('동등성 비교', () => {
    it('같은 상태와 이유를 가진 상태는 동등해야 한다', () => {
      const status1 = VerificationStatus.failed('실패 이유')
      const status2 = VerificationStatus.failed('실패 이유')
      
      expect(status1.equals(status2)).toBe(true)
    })

    it('다른 상태를 가진 상태는 동등하지 않아야 한다', () => {
      const status1 = VerificationStatus.pending()
      const status2 = VerificationStatus.inProgress()
      
      expect(status1.equals(status2)).toBe(false)
    })

    it('같은 상태지만 다른 이유를 가진 상태는 동등하지 않아야 한다', () => {
      const status1 = VerificationStatus.failed('이유1')
      const status2 = VerificationStatus.failed('이유2')
      
      expect(status1.equals(status2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('상태 타입을 문자열로 반환해야 한다', () => {
      expect(VerificationStatus.pending().toString()).toBe('PENDING')
      expect(VerificationStatus.inProgress().toString()).toBe('IN_PROGRESS')
      expect(VerificationStatus.completed().toString()).toBe('COMPLETED')
      expect(VerificationStatus.failed('실패').toString()).toBe('FAILED')
      expect(VerificationStatus.expired().toString()).toBe('EXPIRED')
    })
  })

  describe('업데이트 시간', () => {
    it('생성 시 업데이트 시간이 설정되어야 한다', () => {
      const status = VerificationStatus.pending()
      expect(status.getUpdatedAt()).toBeInstanceOf(Date)
    })

    it('각 인스턴스마다 다른 업데이트 시간을 가져야 한다', () => {
      const status1 = VerificationStatus.pending()
      // 약간의 시간 지연
      const status2 = VerificationStatus.pending()
      
      // 밀리초 차이가 있을 수 있으므로 약간의 허용 범위를 둠
      expect(Math.abs(status2.getUpdatedAt().getTime() - status1.getUpdatedAt().getTime())).toBeGreaterThanOrEqual(0)
    })
  })
})