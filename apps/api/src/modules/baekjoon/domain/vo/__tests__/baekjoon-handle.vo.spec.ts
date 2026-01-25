import { BaekjoonHandle } from '../baekjoon-handle.vo'

describe('BaekjoonHandle', () => {
  describe('생성자', () => {
    it('유효한 핸들로 생성해야 한다', () => {
      const handle = new BaekjoonHandle('test_user')
      expect(handle.value).toBe('test_user')
    })

    it('핸들 앞뒤 공백을 제거해야 한다', () => {
      const handle = new BaekjoonHandle('  test_user  ')
      expect(handle.value).toBe('test_user')
    })

    it('빈 문자열에 대해 에러를 던져야 한다', () => {
      expect(() => new BaekjoonHandle('')).toThrow('백준 핸들은 필수입니다')
    })

    it('공백만 있는 문자열에 대해 에러를 던져야 한다', () => {
      expect(() => new BaekjoonHandle('   ')).toThrow('백준 핸들은 필수입니다')
    })

    it('3자 미만의 핸들에 대해 에러를 던져야 한다', () => {
      expect(() => new BaekjoonHandle('ab')).toThrow('백준 핸들은 3-20자 사이여야 합니다')
    })

    it('20자 초과의 핸들에 대해 에러를 던져야 한다', () => {
      const longHandle = 'a'.repeat(21)
      expect(() => new BaekjoonHandle(longHandle)).toThrow('백준 핸들은 3-20자 사이여야 합니다')
    })

    it('대문자가 포함된 핸들에 대해 에러를 던져야 한다', () => {
      expect(() => new BaekjoonHandle('TestUser')).toThrow(
        '백준 핸들은 영문 소문자, 숫자, 언더스코어(_)만 사용 가능합니다'
      )
    })

    it('특수문자가 포함된 핸들에 대해 에러를 던져야 한다', () => {
      expect(() => new BaekjoonHandle('test-user')).toThrow(
        '백준 핸들은 영문 소문자, 숫자, 언더스코어(_)만 사용 가능합니다'
      )
    })

    it('한글이 포함된 핸들에 대해 에러를 던져야 한다', () => {
      expect(() => new BaekjoonHandle('테스트유저')).toThrow(
        '백준 핸들은 영문 소문자, 숫자, 언더스코어(_)만 사용 가능합니다'
      )
    })
  })

  describe('유효한 핸들 형식', () => {
    it('영문 소문자만으로 구성된 핸들을 허용해야 한다', () => {
      expect(() => new BaekjoonHandle('testuser')).not.toThrow()
    })

    it('숫자가 포함된 핸들을 허용해야 한다', () => {
      expect(() => new BaekjoonHandle('test123')).not.toThrow()
    })

    it('언더스코어가 포함된 핸들을 허용해야 한다', () => {
      expect(() => new BaekjoonHandle('test_user')).not.toThrow()
    })

    it('영문 소문자, 숫자, 언더스코어가 모두 포함된 핸들을 허용해야 한다', () => {
      expect(() => new BaekjoonHandle('test_user_123')).not.toThrow()
    })

    it('3자 정확히인 핸들을 허용해야 한다', () => {
      expect(() => new BaekjoonHandle('abc')).not.toThrow()
    })

    it('20자 정확히인 핸들을 허용해야 한다', () => {
      const handle = 'a'.repeat(20)
      expect(() => new BaekjoonHandle(handle)).not.toThrow()
    })
  })

  describe('of 팩토리 메서드', () => {
    it('유효한 핸들로 인스턴스를 생성해야 한다', () => {
      const handle = BaekjoonHandle.of('test_user')
      expect(handle).toBeInstanceOf(BaekjoonHandle)
      expect(handle.value).toBe('test_user')
    })

    it('생성자와 동일한 검증을 수행해야 한다', () => {
      expect(() => BaekjoonHandle.of('')).toThrow('백준 핸들은 필수입니다')
      expect(() => BaekjoonHandle.of('ab')).toThrow('백준 핸들은 3-20자 사이여야 합니다')
    })
  })

  describe('동등성 비교', () => {
    it('같은 값을 가진 핸들은 동등해야 한다', () => {
      const handle1 = BaekjoonHandle.of('test_user')
      const handle2 = BaekjoonHandle.of('test_user')
      
      expect(handle1.equals(handle2)).toBe(true)
    })

    it('다른 값을 가진 핸들은 동등하지 않아야 한다', () => {
      const handle1 = BaekjoonHandle.of('test_user')
      const handle2 = BaekjoonHandle.of('other_user')
      
      expect(handle1.equals(handle2)).toBe(false)
    })

    it('공백이 제거된 후 같은 값이면 동등해야 한다', () => {
      const handle1 = BaekjoonHandle.of('test_user')
      const handle2 = BaekjoonHandle.of('  test_user  ')
      
      expect(handle1.equals(handle2)).toBe(true)
    })
  })

  describe('toString', () => {
    it('핸들 값을 문자열로 반환해야 한다', () => {
      const handle = BaekjoonHandle.of('test_user')
      expect(handle.toString()).toBe('test_user')
    })

    it('공백이 제거된 값을 반환해야 한다', () => {
      const handle = BaekjoonHandle.of('  test_user  ')
      expect(handle.toString()).toBe('test_user')
    })
  })

  describe('실제 백준 사용자명 예시', () => {
    const validHandles = [
      'kimss',
      'user123',
      'test_user',
      'algorithm_master',
      'coder99',
      'newbie',
      'pro_gamer',
      'contest_winner',
      'study_hard',
      'dream_coder'
    ]

    validHandles.forEach(handle => {
      it(`실제 사용 가능한 핸들 "${handle}"을 허용해야 한다`, () => {
        expect(() => BaekjoonHandle.of(handle)).not.toThrow()
        const instance = BaekjoonHandle.of(handle)
        expect(instance.value).toBe(handle)
      })
    })
  })

  describe('엣지 케이스', () => {
    it('null에 대해 에러를 던져야 한다', () => {
      expect(() => new BaekjoonHandle(null as any)).toThrow('백준 핸들은 필수입니다')
    })

    it('undefined에 대해 에러를 던져야 한다', () => {
      expect(() => new BaekjoonHandle(undefined as any)).toThrow('백준 핸들은 필수입니다')
    })

    it('숫자로만 구성된 핸들을 허용해야 한다', () => {
      expect(() => BaekjoonHandle.of('123')).not.toThrow()
    })

    it('언더스코어로만 구성된 핸들을 허용해야 한다', () => {
      expect(() => BaekjoonHandle.of('___')).not.toThrow()
    })

    it('언더스코어로 시작하는 핸들을 허용해야 한다', () => {
      expect(() => BaekjoonHandle.of('_test')).not.toThrow()
    })

    it('언더스코어로 끝나는 핸들을 허용해야 한다', () => {
      expect(() => BaekjoonHandle.of('test_')).not.toThrow()
    })

    it('연속된 언더스코어가 있는 핸들을 허용해야 한다', () => {
      expect(() => BaekjoonHandle.of('test__user')).not.toThrow()
    })
  })
})