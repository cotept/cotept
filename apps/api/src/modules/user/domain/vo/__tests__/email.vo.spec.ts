import { Email } from "@/modules/user/domain/vo/email.vo"

describe("Email Value Object", () => {
  // Given-When-Then 패턴을 사용한 테스트

  describe("생성 검증", () => {
    it("유효한 이메일로 생성할 수 있다", () => {
      // Given
      const validEmail = "test@example.com"

      // When
      const email = Email.of(validEmail)

      // Then
      expect(email).toBeDefined()
      expect(email.toString()).toBe(validEmail.toLowerCase())
    })

    it("대문자 이메일은 소문자로 정규화된다", () => {
      // Given
      const emailWithUppercase = "Test@Example.com"

      // When
      const email = Email.of(emailWithUppercase)

      // Then
      expect(email.toString()).toBe("test@example.com")
    })

    it("앞뒤 공백은 제거된다", () => {
      // Given
      const emailWithSpaces = "  test@example.com  "

      // When
      const email = Email.of(emailWithSpaces)

      // Then
      expect(email.toString()).toBe("test@example.com")
    })
  })

  describe("유효성 검증", () => {
    it("이메일이 없으면 예외가 발생한다", () => {
      // Given
      const emptyEmail = ""

      // When & Then
      expect(() => Email.of(emptyEmail)).toThrow(Error)
      expect(() => Email.of(emptyEmail)).toThrow("이메일은 필수 값입니다.")
    })

    it("유효하지 않은 이메일 형식이면 예외가 발생한다", () => {
      // Given
      const invalidEmails = [
        "plainaddress", // @ 없음
        "@domain.com", // 로컬 파트 없음
        "user@", // 도메인 없음
        "user@domain", // 톱 레벨 도메인 없음
        "user@.com", // 도메인 이름 없음
        "user@domain..com", // 연속된 점
      ]

      // When & Then
      invalidEmails.forEach((email) => {
        expect(() => Email.of(email)).toThrow(Error)
        expect(() => Email.of(email)).toThrow("유효한 이메일 형식이 아닙니다.")
      })
    })
  })

  describe("기능 검증", () => {
    it("두 이메일 객체가 같은 값을 가지면 동등하다", () => {
      // Given
      const email1 = Email.of("test@example.com")
      const email2 = Email.of("test@example.com")
      const email3 = Email.of("other@example.com")

      // When & Then
      expect(email1.equals(email2)).toBe(true)
      expect(email1.equals(email3)).toBe(false)
    })

    it("이메일에서 도메인 부분을 추출할 수 있다", () => {
      // Given
      const email = Email.of("test@example.com")

      // When
      const domain = email.getDomain()

      // Then
      expect(domain).toBe("example.com")
    })

    it("이메일에서 로컬 부분을 추출할 수 있다", () => {
      // Given
      const email = Email.of("test@example.com")

      // When
      const localPart = email.getLocalPart()

      // Then
      expect(localPart).toBe("test")
    })

    it("이메일을 마스킹 처리할 수 있다", () => {
      // Given
      const email1 = Email.of("test@example.com")
      const email2 = Email.of("a@example.com")
      const email3 = Email.of("ab@example.com")

      // When
      const masked1 = email1.getMasked()
      const masked2 = email2.getMasked()
      const masked3 = email3.getMasked()

      // Then
      expect(masked1).toBe("t**t@example.com")
      expect(masked2).toBe("a*@example.com")
      expect(masked3).toBe("a*@example.com")
    })
  })
})
