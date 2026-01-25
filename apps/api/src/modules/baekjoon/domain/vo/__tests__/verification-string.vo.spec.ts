import { VerificationString } from '../verification-string.vo'

describe('VerificationString', () => {
  describe('of 팩토리 메서드', () => {
    it('유효한 인증 문자열로 인스턴스를 생성해야 한다', () => {
      const verificationString = VerificationString.of('귀여운고양이12345678')
      expect(verificationString.toString()).toBe('귀여운고양이12345678')
    })

    it('빈 문자열에 대해 에러를 던져야 한다', () => {
      expect(() => VerificationString.of('')).toThrow('인증 문자열은 필수 값입니다.')
    })

    it('null에 대해 에러를 던져야 한다', () => {
      expect(() => VerificationString.of(null as any)).toThrow('인증 문자열은 필수 값입니다.')
    })

    it('undefined에 대해 에러를 던져야 한다', () => {
      expect(() => VerificationString.of(undefined as any)).toThrow('인증 문자열은 필수 값입니다.')
    })

    it('잘못된 형식의 문자열에 대해 에러를 던져야 한다', () => {
      expect(() => VerificationString.of('invalid_format')).toThrow(
        "인증 문자열은 '형용사+동물+숫자' 형식이어야 합니다."
      )
    })
  })

  describe('generate 팩토리 메서드', () => {
    it('유효한 인증 문자열을 생성해야 한다', () => {
      const verificationString = VerificationString.generate()
      expect(verificationString).toBeInstanceOf(VerificationString)
      expect(verificationString.toString()).toBeDefined()
      expect(verificationString.toString().length).toBeGreaterThan(0)
    })

    it('매번 다른 인증 문자열을 생성해야 한다', () => {
      const string1 = VerificationString.generate()
      const string2 = VerificationString.generate()
      
      expect(string1.toString()).not.toBe(string2.toString())
    })

    it('생성된 문자열이 한글 형식이어야 한다', () => {
      const verificationString = VerificationString.generate()
      const value = verificationString.toString()
      
      // 한글 형용사 + 한글 동물 + 숫자 패턴인지 확인
      expect(value).toMatch(/^[가-힣]+[가-힣]+\d+$/)
    })
  })

  describe('generateUnique 팩토리 메서드', () => {
    it('유니크한 인증 문자열을 생성해야 한다', () => {
      const verificationString = VerificationString.generateUnique()
      expect(verificationString).toBeInstanceOf(VerificationString)
      expect(verificationString.toString()).toBeDefined()
    })

    it('매번 다른 유니크한 문자열을 생성해야 한다', () => {
      const string1 = VerificationString.generateUnique()
      const string2 = VerificationString.generateUnique()
      
      expect(string1.toString()).not.toBe(string2.toString())
    })
  })

  describe('동등성 비교', () => {
    it('같은 값을 가진 인증 문자열은 동등해야 한다', () => {
      const string1 = VerificationString.of('귀여운고양이12345678')
      const string2 = VerificationString.of('귀여운고양이12345678')
      
      expect(string1.equals(string2)).toBe(true)
    })

    it('다른 값을 가진 인증 문자열은 동등하지 않아야 한다', () => {
      const string1 = VerificationString.of('귀여운고양이12345678')
      const string2 = VerificationString.of('똑똑한강아지87654321')
      
      expect(string1.equals(string2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('인증 문자열 값을 반환해야 한다', () => {
      const verificationString = VerificationString.of('귀여운고양이12345678')
      expect(verificationString.toString()).toBe('귀여운고양이12345678')
    })
  })

  describe('유효한 인증 문자열 형식', () => {
    const validStrings = [
      '귀여운고양이12345678',
      '똑똑한강아지87654321',
      '용감한사자11111111',
      '재빠른토끼22222222',
      '착한햄스터33333333',
      '밝은다람쥐44444444',
      '순수한곰55555555',
      '활발한여우66666666',
      '차분한늑대77777777',
      '친근한펭귄88888888'
    ]

    validStrings.forEach(str => {
      it(`유효한 형식 "${str}"을 허용해야 한다`, () => {
        expect(() => VerificationString.of(str)).not.toThrow()
        const instance = VerificationString.of(str)
        expect(instance.toString()).toBe(str)
      })
    })
  })

  describe('형식 검증', () => {
    it('10자 미만의 문자열을 거부해야 한다', () => {
      expect(() => VerificationString.of('짧은문자1')).toThrow(
        "인증 문자열은 '형용사+동물+숫자' 형식이어야 합니다."
      )
    })

    it('30자 초과의 문자열을 거부해야 한다', () => {
      const longString = '아주긴형용사동물이름' + '12345678'.repeat(4)
      expect(() => VerificationString.of(longString)).toThrow(
        "인증 문자열은 '형용사+동물+숫자' 형식이어야 합니다."
      )
    })

    it('마지막 8자리가 숫자가 아닌 문자열을 거부해야 한다', () => {
      expect(() => VerificationString.of('귀여운고양이1234567a')).toThrow(
        "인증 문자열은 '형용사+동물+숫자' 형식이어야 합니다."
      )
    })

    it('숫자가 8자리가 아닌 문자열을 거부해야 한다', () => {
      expect(() => VerificationString.of('귀여운고양이123456789')).toThrow(
        "인증 문자열은 '형용사+동물+숫자' 형식이어야 합니다."
      )
      expect(() => VerificationString.of('귀여운고양이1234567')).toThrow(
        "인증 문자열은 '형용사+동물+숫자' 형식이어야 합니다."
      )
    })

    it('앞부분에 영어가 포함된 문자열을 거부해야 한다', () => {
      expect(() => VerificationString.of('cute고양이12345678')).toThrow(
        "인증 문자열은 '형용사+동물+숫자' 형식이어야 합니다."
      )
    })

    it('앞부분에 숫자가 포함된 문자열을 거부해야 한다', () => {
      expect(() => VerificationString.of('귀여운1고양이12345678')).toThrow(
        "인증 문자열은 '형용사+동물+숫자' 형식이어야 합니다."
      )
    })

    it('앞부분에 특수문자가 포함된 문자열을 거부해야 한다', () => {
      expect(() => VerificationString.of('귀여운-고양이12345678')).toThrow(
        "인증 문자열은 '형용사+동물+숫자' 형식이어야 합니다."
      )
    })
  })
})