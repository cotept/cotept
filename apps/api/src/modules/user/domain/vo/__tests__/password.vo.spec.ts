import { Password } from "@/modules/user/domain/vo/password.vo"

describe("Password 값 객체", () => {
  // 올바른 케이스
  describe("유효한 케이스", () => {
    it("유효한 형식의 비밀번호로 객체를 생성할 수 있다", () => {
      // Given
      const passwordStr = "ValidP@ss7"

      // When
      const password = Password.of(passwordStr)

      // Then
      expect(password.toString()).toBe(passwordStr)
      expect(password.isAlreadyHashed()).toBe(false)
    })

    it("해시된 비밀번호는 검증 없이 객체를 생성할 수 있다", () => {
      // Given
      const hashedPasswordStr = "$2b$10$X9vHMlVCRwWnx6QKfkzrxeIK5G8JgWVJsi1EWyU0wy59UPX0M5wuS"

      // When
      const password = Password.ofHashed(hashedPasswordStr)

      // Then
      expect(password.toString()).toBe(hashedPasswordStr)
      expect(password.isAlreadyHashed()).toBe(true)
    })
  })

  // 유효하지 않은 케이스
  describe("유효하지 않은 케이스", () => {
    it("비밀번호가 비어있으면 예외가 발생한다", () => {
      // Given
      const passwordStr = ""

      // When & Then
      expect(() => Password.of(passwordStr)).toThrow("비밀번호는 필수 값입니다.")
    })

    it("비밀번호가 8자 미만이면 예외가 발생한다", () => {
      // Given
      const passwordStr = "Pass1!"

      // When & Then
      expect(() => Password.of(passwordStr)).toThrow("비밀번호는 최소 8자 이상이어야 합니다.")
    })

    it("비밀번호가 32자를 초과하면 예외가 발생한다", () => {
      // Given
      const passwordStr = "ValidPass1!" + "a".repeat(30)

      // When & Then
      expect(() => Password.of(passwordStr)).toThrow("비밀번호는 최대 32자까지 허용됩니다.")
    })

    it("비밀번호에 대문자가 없으면 예외가 발생한다", () => {
      // Given
      const passwordStr = "validpass1!"

      // When & Then
      expect(() => Password.of(passwordStr)).toThrow(
        "비밀번호는 최소 하나의 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.",
      )
    })

    it("비밀번호에 소문자가 없으면 예외가 발생한다", () => {
      // Given
      const passwordStr = "VALIDPASS1!"

      // When & Then
      expect(() => Password.of(passwordStr)).toThrow(
        "비밀번호는 최소 하나의 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.",
      )
    })

    it("비밀번호에 숫자가 없으면 예외가 발생한다", () => {
      // Given
      const passwordStr = "ValidPass!"

      // When & Then
      expect(() => Password.of(passwordStr)).toThrow(
        "비밀번호는 최소 하나의 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.",
      )
    })

    it("비밀번호에 특수문자가 없으면 예외가 발생한다", () => {
      // Given
      const passwordStr = "ValidPass1"

      // When & Then
      expect(() => Password.of(passwordStr)).toThrow(
        "비밀번호는 최소 하나의 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.",
      )
    })

    it("비밀번호에 연속된 문자나 숫자가 있으면 예외가 발생한다", () => {
      // Given
      const passwordStr1 = "ValidP123!"
      const passwordStr2 = "ValidPabc1!"

      // When & Then
      expect(() => Password.of(passwordStr1)).toThrow(
        "비밀번호에 연속된 문자나 숫자(123, abc 등)를 사용할 수 없습니다.",
      )

      expect(() => Password.of(passwordStr2)).toThrow(
        "비밀번호에 연속된 문자나 숫자(123, abc 등)를 사용할 수 없습니다.",
      )
    })
  })

  // 기능 테스트
  describe("기능 검증", () => {
    it("일반 비밀번호와 해시된 비밀번호를 구분할 수 있다", () => {
      // Given
      const regularPassword = Password.of("ValidP@ss7")
      const hashedPassword = Password.ofHashed("$2b$10$X9vHMlVCRwWnx6QKfkzrxeIK5G8JgWVJsi1EWyU0wy59UPX0M5wuS")

      // Then
      expect(regularPassword.isAlreadyHashed()).toBe(false)
      expect(hashedPassword.isAlreadyHashed()).toBe(true)
    })
  })
})
