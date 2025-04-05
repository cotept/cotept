import { PhoneNumber } from "@/modules/user/domain/vo/phone-number.vo"

describe("PhoneNumber Value Object", () => {
  // Given-When-Then 패턴을 사용한 테스트

  describe("생성 검증", () => {
    it("유효한 전화번호로 생성할 수 있다", () => {
      // Given
      const validPhoneNumbers = ["01012345678", "010-1234-5678", "010 1234 5678", "0101234567"]

      // When & Then
      validPhoneNumbers.forEach((phoneNumber) => {
        const phone = PhoneNumber.of(phoneNumber)
        expect(phone).toBeDefined()
        // 숫자만 포함된 형태로 정규화되어야 함
        expect(phone.toString()).toMatch(/^01[0-9]{8,9}$/)
      })
    })

    it("인증된 전화번호로 생성할 수 있다", () => {
      // Given
      const phoneNumber = "01012345678"

      // When
      const phone = PhoneNumber.ofVerified(phoneNumber)

      // Then
      expect(phone).toBeDefined()
      expect(phone.isVerified()).toBe(true)
    })
  })

  describe("유효성 검증", () => {
    it("전화번호가 없으면 예외가 발생한다", () => {
      // Given
      const emptyPhoneNumber = ""

      // When & Then
      expect(() => PhoneNumber.of(emptyPhoneNumber)).toThrow(Error)
      expect(() => PhoneNumber.of(emptyPhoneNumber)).toThrow("전화번호는 필수 값입니다.")
    })

    it("유효하지 않은 전화번호 형식이면 예외가 발생한다", () => {
      // Given
      const invalidPhoneNumbers = [
        "02-123-4567", // 서울 지역번호
        "031-123-4567", // 경기 지역번호
        "00012345678", // 01로 시작하지 않음
        "0101234", // 너무 짧음
        "01012345678901", // 너무 김
        "abcdefghijk", // 숫자가 아님
      ]

      // When & Then
      invalidPhoneNumbers.forEach((phoneNumber) => {
        expect(() => PhoneNumber.of(phoneNumber)).toThrow(Error)
        expect(() => PhoneNumber.of(phoneNumber)).toThrow("유효한 한국 휴대폰 번호 형식이 아닙니다.")
      })
    })
  })

  describe("기능 검증", () => {
    it("두 전화번호 객체가 같은 값을 가지면 동등하다", () => {
      // Given
      const phone1 = PhoneNumber.of("01012345678")
      const phone2 = PhoneNumber.of("010-1234-5678") // 하이픈이 있어도 정규화 후 비교
      const phone3 = PhoneNumber.of("01098765432")

      // When & Then
      expect(phone1.equals(phone2)).toBe(true)
      expect(phone1.equals(phone3)).toBe(false)
    })

    it("전화번호를 포맷된 형태로 반환할 수 있다", () => {
      // Given
      const phone1 = PhoneNumber.of("01012345678") // 11자리
      const phone2 = PhoneNumber.of("0101234567") // 10자리

      // When
      const formatted1 = phone1.toFormattedString()
      const formatted2 = phone2.toFormattedString()

      // Then
      expect(formatted1).toBe("010-1234-5678")
      expect(formatted2).toBe("010-123-4567")
    })

    it("전화번호를 마스킹 처리할 수 있다", () => {
      // Given
      const phone1 = PhoneNumber.of("01012345678") // 11자리
      const phone2 = PhoneNumber.of("0101234567") // 10자리

      // When
      const masked1 = phone1.getMasked()
      const masked2 = phone2.getMasked()

      // Then
      expect(masked1).toBe("010****5678")
      expect(masked2).toBe("010***4567")
    })

    it("인증 상태를 변경한 새 객체를 생성할 수 있다", () => {
      // Given
      const phone = PhoneNumber.of("01012345678", false)

      // When
      const verifiedPhone = phone.withVerified(true)

      // Then
      expect(phone.isVerified()).toBe(false)
      expect(verifiedPhone.isVerified()).toBe(true)
      expect(verifiedPhone.toString()).toBe(phone.toString()) // 값은 동일
    })
  })
})
