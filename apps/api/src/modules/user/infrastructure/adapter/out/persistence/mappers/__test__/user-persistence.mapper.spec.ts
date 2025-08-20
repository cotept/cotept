import { UserEntity } from "../entities/user.entity"
import { UserPersistenceMapper } from "./user-persistence.mapper"

import User, { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { BaseMapper } from "@/shared/infrastructure/mappers/base.mapper"

describe("UserPersistenceMapper", () => {
  let mapper: UserPersistenceMapper

  beforeEach(() => {
    mapper = new UserPersistenceMapper()
  })

  describe("toDomain", () => {
    it("should map a full UserEntity to a User domain model", () => {
      const entity = new UserEntity()
      entity.idx = 1
      entity.userId = "user-id-123"
      entity.email = "test@example.com"
      entity.passwordHash = "hashed-password"
      entity.salt = "salt"
      entity.role = UserRole.MENTEE
      entity.status = UserStatus.ACTIVE
      entity.name = "홍길동"
      entity.phoneNumber = "010-1234-5678"
      entity.phoneVerified = 1
      entity.ciHash = "ci-hash"
      entity.diHash = "di-hash"
      entity.birthDate = "1990-01-01"
      entity.gender = "M"
      entity.createdAt = new Date()
      entity.updatedAt = new Date()
      entity.lastLoginAt = new Date()

      const domain = mapper.toDomain(entity)

      expect(domain).toBeInstanceOf(User)
      expect(domain.idx).toBe(entity.idx)
      expect(domain.userId).toBe(entity.userId)
      expect(domain.getEmailString()).toBe(entity.email)
      expect(domain.passwordHash).toBe(entity.passwordHash)
      expect(domain.salt).toBe(entity.salt)
      expect(domain.role).toBe(entity.role)
      expect(domain.status).toBe(entity.status)
      expect(domain.getNameString()).toBe(entity.name)
      expect(domain.getPhoneNumberString()).toBe(entity.phoneNumber)
      expect(domain.isPhoneVerified()).toBe(true)
      expect(domain.ciHash).toBe(entity.ciHash)
      expect(domain.diHash).toBe(entity.diHash)
      expect(domain.birthDate).toBe(entity.birthDate)
      expect(domain.gender).toBe(entity.gender)
      expect(domain.createdAt).toEqual(entity.createdAt)
      expect(domain.updatedAt).toEqual(entity.updatedAt)
      expect(domain.lastLoginAt).toEqual(entity.lastLoginAt)
    })

    it("should handle optional fields being null or undefined", () => {
      const entity = new UserEntity()
      entity.idx = 1
      entity.userId = "user-id-123"
      entity.email = "test@example.com"
      entity.passwordHash = "hashed-password"
      entity.salt = "salt"
      entity.role = UserRole.MENTEE
      entity.status = UserStatus.ACTIVE
      entity.phoneVerified = 0
      // Optional fields are undefined by default in the new entity

      const domain = mapper.toDomain(entity)

      expect(domain.getNameString()).toBeUndefined()
      expect(domain.getPhoneNumberString()).toBeUndefined()
      expect(domain.isPhoneVerified()).toBe(false)
      expect(domain.ciHash).toBeUndefined()
      expect(domain.diHash).toBeUndefined()
      expect(domain.birthDate).toBeUndefined()
      expect(domain.gender).toBeUndefined()
      expect(domain.lastLoginAt).toBeUndefined()
    })
  })

  describe("toEntity", () => {
    it("should map a full User domain model to a UserEntity", () => {
      const domain = new User({
        idx: 1,
        userId: "user-id-123",
        email: "test@example.com",
        passwordHash: "hashed-password",
        salt: "salt",
        role: UserRole.MENTOR,
        status: UserStatus.INACTIVE,
        name: "홍길동",
        phoneNumber: "010-1234-5678",
        phoneVerified: true,
        ciHash: "ci-hash",
        diHash: "di-hash",
        birthDate: "1990-01-01",
        gender: "M",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      })

      const entity = mapper.toEntity(domain)

      expect(entity).toBeInstanceOf(UserEntity)
      expect(entity.idx).toBe(domain.idx)
      expect(entity.userId).toBe(domain.userId)
      expect(entity.email).toBe(domain.getEmailString())
      expect(entity.passwordHash).toBe(domain.passwordHash)
      expect(entity.salt).toBe(domain.salt)
      expect(entity.role).toBe(domain.role)
      expect(entity.status).toBe(domain.status)
      expect(entity.name).toBe(domain.getNameString())
      expect(entity.phoneNumber).toBe(domain.getPhoneNumberString())
      expect(entity.phoneVerified).toBe(1)
      expect(entity.ciHash).toBe(domain.ciHash)
      expect(entity.diHash).toBe(domain.diHash)
      expect(entity.birthDate).toBe(domain.birthDate)
      expect(entity.gender).toBe(domain.gender)
      expect(entity.createdAt).toEqual(domain.createdAt)
      expect(entity.updatedAt).toEqual(domain.updatedAt)
      expect(entity.lastLoginAt).toEqual(domain.lastLoginAt)
    })

    it("should map a new User (without idx) to a UserEntity", () => {
      const domain = new User({
        userId: "user-id-123",
        email: "new@example.com",
        passwordHash: "new-password",
        salt: "new-salt",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
      })

      const entity = mapper.toEntity(domain)

      expect(entity.idx).toBeUndefined()
      expect(entity.userId).toBe(domain.userId)
      expect(entity.email).toBe(domain.getEmailString())
    })
  })

  describe("toEntityForCreate", () => {
    it("should return an entity suitable for creation", () => {
      const domain = new User({
        userId: "user-id-123",
        email: "create@example.com",
        passwordHash: "create-password",
        salt: "create-salt",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
      })

      const entity = mapper.toEntityForCreate(domain)

      expect(entity.idx).toBeUndefined()
      expect(entity.userId).toBe(domain.userId)
      expect(entity.email).toBe(domain.getEmailString())
    })
  })

  describe("BaseMapper static methods", () => {
    it("numberToBoolean should convert 1 to true and 0 to false", () => {
      expect(BaseMapper.numberToBoolean(1)).toBe(true)
      expect(BaseMapper.numberToBoolean(0)).toBe(false)
      expect(BaseMapper.numberToBoolean(undefined)).toBe(false)
      expect(BaseMapper.numberToBoolean(null)).toBe(false)
    })

    it("booleanToNumber should convert true to 1 and false to 0", () => {
      expect(BaseMapper.booleanToNumber(true)).toBe(1)
      expect(BaseMapper.booleanToNumber(false)).toBe(0)
    })
  })
})
