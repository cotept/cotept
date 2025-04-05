import { User, UserRole, UserStatus } from "@/modules/user/domain/model/user.entity"
import { Email } from "@/modules/user/domain/vo/email.vo"
import { PhoneNumber } from "@/modules/user/domain/vo/phone-number.vo"

describe("User Entity with Value Objects", () => {
  describe("생성 검증", () => {
    it("기본 값으로 사용자를 생성할 수 있다", () => {
      // Given
      const email = "test@example.com"
      const passwordHash = "hashed_password"
      const salt = "random_salt"
      const role = UserRole.MENTEE

      // When
      const user = User.createWithBasicAuth({
        email,
        passwordHash,
        salt,
        role,
      })

      // Then
      expect(user).toBeDefined()
      expect(user.getEmailString()).toBe(email)
      expect(user.passwordHash).toBe(passwordHash)
      expect(user.salt).toBe(salt)
      expect(user.role).toBe(role)
      expect(user.status).toBe(UserStatus.ACTIVE)
      expect(user.id).toBeDefined() // UUID 자동 생성
      expect(user.createdAt).toBeDefined()
      expect(user.updatedAt).toBeDefined()
    })

    it("Email 값 객체로 사용자를 생성할 수 있다", () => {
      // Given
      const email = Email.of("test@example.com")
      const passwordHash = "hashed_password"
      const salt = "random_salt"
      const role = UserRole.MENTEE

      // When
      const user = User.createWithBasicAuth({
        email,
        passwordHash,
        salt,
        role,
      })

      // Then
      expect(user).toBeDefined()
      expect(user.email).toBe(email) // 동일 참조 검증
      expect(user.getEmailString()).toBe("test@example.com")
    })

    it("PhoneNumber 값 객체로 사용자를 생성할 수 있다", () => {
      // Given
      const email = "test@example.com"
      const phoneNumber = PhoneNumber.of("01012345678")
      const passwordHash = "hashed_password"
      const salt = "random_salt"
      const role = UserRole.MENTEE

      // When
      const user = User.createWithBasicAuth({
        email,
        passwordHash,
        salt,
        role,
        phoneNumber,
      })

      // Then
      expect(user).toBeDefined()
      expect(user.phoneNumber).toBe(phoneNumber) // 동일 참조 검증
      expect(user.getPhoneNumberString()).toBe("01012345678")
      expect(user.isPhoneVerified()).toBe(false)
    })

    it("PASS 인증으로 사용자를 생성할 수 있다", () => {
      // Given
      const email = "test@example.com"
      const phoneNumber = "01012345678"
      const passwordHash = "hashed_password"
      const salt = "random_salt"
      const role = UserRole.MENTEE
      const name = "홍길동"
      const ciHash = "ci_hash_value"
      const diHash = "di_hash_value"
      const birthDate = "1990-01-01"
      const gender = "M"

      // When
      const user = User.createWithPassAuth({
        email,
        passwordHash,
        salt,
        role,
        name,
        phoneNumber,
        ciHash,
        diHash,
        birthDate,
        gender,
      })

      // Then
      expect(user).toBeDefined()
      expect(user.getEmailString()).toBe(email)
      expect(user.getPhoneNumberString()).toBe(phoneNumber)
      expect(user.isPhoneVerified()).toBe(true) // PASS 인증 시 자동 인증
      expect(user.ciHash).toBe(ciHash)
      expect(user.diHash).toBe(diHash)
      expect(user.birthDate).toBe(birthDate)
      expect(user.gender).toBe(gender)
    })
  })

  describe("메서드 검증", () => {
    it("로그인 시간이 업데이트된다", () => {
      // Given
      const user = User.createWithBasicAuth({
        email: "test@example.com",
        passwordHash: "hashed_password",
        salt: "random_salt",
        role: UserRole.MENTEE,
      })

      // 기존 시간 저장
      const previousUpdatedAt = user.updatedAt

      // When
      jest.spyOn(global, "Date").mockImplementationOnce(() => new Date("2023-01-01"))
      user.updateLastLogin()

      // Then
      expect(user.lastLoginAt).toBeDefined()
      expect(user.updatedAt).not.toEqual(previousUpdatedAt)
    })

    it("상태가 업데이트된다", () => {
      // Given
      const user = User.createWithBasicAuth({
        email: "test@example.com",
        passwordHash: "hashed_password",
        salt: "random_salt",
        role: UserRole.MENTEE,
      })

      // When
      user.updateStatus(UserStatus.SUSPENDED)

      // Then
      expect(user.status).toBe(UserStatus.SUSPENDED)
      expect(user.isActive()).toBe(false)
    })

    it("기본 정보가 업데이트된다", () => {
      // Given
      const user = User.createWithBasicAuth({
        email: "test@example.com",
        passwordHash: "hashed_password",
        salt: "random_salt",
        role: UserRole.MENTEE,
      })

      const newName = "홍길동"
      const newPhoneNumber = "01087654321"

      // When
      user.updateBasicInfo({
        name: newName,
        phoneNumber: newPhoneNumber,
      })

      // Then
      expect(user.name).toBe(newName)
      expect(user.getPhoneNumberString()).toBe(newPhoneNumber)
    })

    it("전화번호 인증 상태가 업데이트된다", () => {
      // Given
      const user = User.createWithBasicAuth({
        email: "test@example.com",
        passwordHash: "hashed_password",
        salt: "random_salt",
        role: UserRole.MENTEE,
        phoneNumber: "01012345678",
      })

      // When
      user.setPhoneVerified(true)

      // Then
      expect(user.isPhoneVerified()).toBe(true)
    })
  })
})
