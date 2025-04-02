import { Password } from "./password.vo"

describe("Password Value Object", () => {
  describe("create", () => {
    it("유효한 비밀번호로 Password 객체를 생성할 수 있어야 한다", () => {
      // Given
      const validPassword = "Valid1Password!"

      // When
      const password = Password.create(validPassword)

      // Then
      expect(password).toBeInstanceOf(Password)
      expect(password.getValue()).toBe(validPassword)
    })

    it("비밀번호가 빈 문자열이면 에러를 발생시켜야 한다", () => {
      // Given & When & Then
      expect(() => {
        Password.create("")
      }).toThrow("비밀번호는 필수 값입니다.")
    })

    it("비밀번호가 null이면 에러를 발생시켜야 한다", () => {
      // Given & When & Then
      expect(() => {
        Password.create(null as unknown as string)
      }).toThrow("비밀번호는 필수 값입니다.")
    })

    it("최소 길이보다 짧은 비밀번호는 에러를 발생시켜야 한다", () => {
      // Given & When & Then
      expect(() => {
        Password.create("Short1!")
      }).toThrow("비밀번호는 최소 8자 이상이어야 합니다.")
    })

    it("최대 길이보다 긴 비밀번호는 에러를 발생시켜야 한다", () => {
      // Given
      const longPassword = "A1!".padEnd(101, "a")

      // When & Then
      expect(() => {
        Password.create(longPassword)
      }).toThrow("비밀번호는 최대 16자 이하여야 합니다.")
    })

    it("소문자가 없는 비밀번호는 에러를 발생시켜야 한다", () => {
      // Given & When & Then
      expect(() => {
        Password.create("PASSWORD123!")
      }).toThrow("비밀번호는 소문자를 포함해야 합니다 조건을 충족해야 합니다.")
    })

    it("대문자가 없는 비밀번호는 에러를 발생시켜야 한다", () => {
      // Given & When & Then
      expect(() => {
        Password.create("password123!")
      }).toThrow("비밀번호는 대문자를 포함해야 합니다 조건을 충족해야 합니다.")
    })

    it("숫자가 없는 비밀번호는 에러를 발생시켜야 한다", () => {
      // Given & When & Then
      expect(() => {
        Password.create("Passwordabc!")
      }).toThrow("비밀번호는 숫자를 포함해야 합니다 조건을 충족해야 합니다.")
    })

    it("특수문자가 없는 비밀번호는 에러를 발생시켜야 한다", () => {
      // Given & When & Then
      expect(() => {
        Password.create("Password123")
      }).toThrow("비밀번호는 특수문자를 포함해야 합니다 조건을 충족해야 합니다.")
    })

    it("4번 이상 연속된 동일 문자가 있는 비밀번호는 에러를 발생시켜야 한다", () => {
      // Given & When & Then
      expect(() => {
        Password.create("Passw1111ord!")
      }).toThrow("비밀번호에 4번 이상 연속된 동일 문자를 포함할 수 없습니다.")
    })

    it("여러 복잡성 조건을 충족하지 않는 비밀번호는 모든 오류를 표시해야 한다", () => {
      // Given & When & Then
      expect(() => {
        Password.create("password")
      }).toThrow(
        /비밀번호는 대문자를 포함해야 합니다, 숫자를 포함해야 합니다, 특수문자를 포함해야 합니다 조건을 충족해야 합니다./,
      )
    })
  })
})
