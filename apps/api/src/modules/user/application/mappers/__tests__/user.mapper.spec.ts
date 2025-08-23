import { UserMapper } from "@/modules/user/application/mappers/user.mapper"
import User, { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { Email } from "@/modules/user/domain/vo/email.vo"
import { Name } from "@/modules/user/domain/vo/name.vo"
import { PhoneNumber } from "@/modules/user/domain/vo/phone-number.vo"

describe("유저 매퍼", () => {
  let userMapper: UserMapper

  beforeEach(() => {
    userMapper = new UserMapper()
  })

  describe("toDto 메소드", () => {
    it("유저 엔티티를 DTO로 올바르게 변환해야 한다", () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"
      const now = new Date()
      const user = new User({
        userId: userId,
        email: Email.of("test@example.com"),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        name: Name.of("홍길동"),
        phoneNumber: PhoneNumber.of("01012345678", true),
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      })

      // When
      const result = userMapper.toDto(user)

      // Then
      expect(result).toBeDefined()
      expect(result.userId).toBe(userId)
      expect(result.email).toBe("test@example.com")
      expect(result.name).toBe("홍길동")
      expect(result.role).toBe(UserRole.MENTEE)
      expect(result.status).toBe(UserStatus.ACTIVE)
      expect(result.phoneNumber).toBe("01012345678")
      expect(result.phoneVerified).toBe(true)
      expect(result.createdAt).toEqual(now)
      expect(result.updatedAt).toEqual(now)
      expect(result.lastLoginAt).toEqual(now)
    })

    it("이름과 전화번호가 없는 유저 엔티티를 DTO로 변환해야 한다", () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"
      const now = new Date()
      const user = new User({
        userId: userId,
        email: Email.of("test@example.com"),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        createdAt: now,
        updatedAt: now,
      })

      // When
      const result = userMapper.toDto(user)

      // Then
      expect(result).toBeDefined()
      expect(result.userId).toBe(userId)
      expect(result.email).toBe("test@example.com")
      expect(result.name).toBeUndefined()
      expect(result.phoneNumber).toBeUndefined()
      expect(result.phoneVerified).toBe(false) // phoneNumber가 없으므로 false
      expect(result.lastLoginAt).toBeUndefined()
    })
  })

  describe("toDtoList 메소드", () => {
    it("여러 유저 엔티티를 DTO 배열로 변환해야 한다", () => {
      // Given
      const now = new Date()
      const users = [
        new User({
          userId: "123e4567-e89b-12d3-a456-426614174000",
          email: Email.of("user1@example.com"),
          passwordHash: "hashed-password-1",
          salt: "salt-value-1",
          role: UserRole.MENTEE,
          status: UserStatus.ACTIVE,
          name: Name.of("사용자a"),
          createdAt: now,
          updatedAt: now,
        }),
        new User({
          userId: "223e4567-e89b-12d3-a456-426614174000",
          email: Email.of("user2@example.com"),
          passwordHash: "hashed-password-2",
          salt: "salt-value-2",
          role: UserRole.MENTOR,
          status: UserStatus.ACTIVE,
          name: Name.of("사용자b"),
          phoneNumber: PhoneNumber.of("01098765432", false),
          createdAt: now,
          updatedAt: now,
        }),
      ]

      // When
      const results = userMapper.toDtoList(users)

      // Then
      expect(results).toBeInstanceOf(Array)
      expect(results.length).toBe(2)

      // 첫 번째 사용자 검증
      expect(results[0].userId).toBe("123e4567-e89b-12d3-a456-426614174000")
      expect(results[0].email).toBe("user1@example.com")
      expect(results[0].name).toBe("사용자a")
      expect(results[0].role).toBe(UserRole.MENTEE)
      expect(results[0].phoneNumber).toBeUndefined()

      // 두 번째 사용자 검증
      expect(results[1].userId).toBe("223e4567-e89b-12d3-a456-426614174000")
      expect(results[1].email).toBe("user2@example.com")
      expect(results[1].name).toBe("사용자b")
      expect(results[1].role).toBe(UserRole.MENTOR)
      expect(results[1].phoneNumber).toBe("01098765432")
      expect(results[1].phoneVerified).toBe(false)
    })

    it("빈 배열이 주어졌을 때 빈 DTO 배열을 반환해야 한다", () => {
      // Given
      const users: User[] = []

      // When
      const results = userMapper.toDtoList(users)

      // Then
      expect(results).toBeInstanceOf(Array)
      expect(results.length).toBe(0)
    })
  })
})
