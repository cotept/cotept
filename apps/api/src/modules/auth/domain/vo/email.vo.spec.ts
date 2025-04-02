import { Email } from "./email.vo"

describe("Email Value Object", () => {
  describe("create", () => {
    it("유효한 이메일 주소로 Email 객체를 생성할 수 있어야 한다", () => {
      // Given
      const validEmail = "test@example.com"

      // When
      const email = Email.create(validEmail)

      // Then
      expect(email).toBeInstanceOf(Email)
      expect(email.getValue()).toBe(validEmail)
    })

    it("대문자 이메일 주소를 소문자로 정규화해야 한다", () => {
      // Given
      const mixedCaseEmail = "Test@Example.com"
      const lowerCaseEmail = "test@example.com"

      // When
      const email = Email.create(mixedCaseEmail)

      // Then
      expect(email.getValue()).toBe(lowerCaseEmail)
    })

    it("이메일이 빈 문자열이면 에러를 발생시켜야 한다", () => {
      // Given & When & Then
      expect(() => {
        Email.create("")
      }).toThrow("이메일은 필수 값입니다.")
    })

    it("이메일이 null이면 에러를 발생시켜야 한다", () => {
      // Given & When & Then
      expect(() => {
        const testValue = null as unknown as string
        Email.create(testValue)
      }).toThrow("이메일은 필수 값입니다.")
    })

    it("유효하지 않은 이메일 형식이면 에러를 발생시켜야 한다", () => {
      // Given & When & Then
      expect(() => {
        Email.create("invalid-email")
      }).toThrow("유효하지 않은 이메일 형식입니다.")

      expect(() => {
        Email.create("invalid@")
      }).toThrow("유효하지 않은 이메일 형식입니다.")

      expect(() => {
        Email.create("@example.com")
      }).toThrow("유효하지 않은 이메일 형식입니다.")
    })
  })

  describe("equals", () => {
    it("같은 이메일 주소를 가진 두 객체는 동등해야 한다", () => {
      // Given
      const email1 = Email.create("test@example.com")
      const email2 = Email.create("test@example.com")

      // When & Then
      expect(email1.equals(email2)).toBe(true)
    })

    it("다른 이메일 주소를 가진 두 객체는 동등하지 않아야 한다", () => {
      // Given
      const email1 = Email.create("test1@example.com")
      const email2 = Email.create("test2@example.com")

      // When & Then
      expect(email1.equals(email2)).toBe(false)
    })

    it("대소문자가 다른 같은 이메일 주소는 동등해야 한다", () => {
      // Given
      const email1 = Email.create("test@example.com")
      const email2 = Email.create("TEST@EXAMPLE.COM")

      // When & Then
      expect(email1.equals(email2)).toBe(true)
    })
  })

  describe("toString", () => {
    it("이메일 주소를 문자열로 반환해야 한다", () => {
      // Given
      const emailStr = "test@example.com"
      const email = Email.create(emailStr)

      // When & Then
      expect(email.toString()).toBe(emailStr)
    })
  })
})
