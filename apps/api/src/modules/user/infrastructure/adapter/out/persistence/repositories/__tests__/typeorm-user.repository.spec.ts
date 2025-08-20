import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"

import { EntityManager, Repository } from "typeorm"

import { TypeOrmUserRepository } from "../typeorm-user.repository"

import { DeleteUserDto } from "@/modules/user/application/dtos/delete-user.dto"
import User, { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { Email } from "@/modules/user/domain/vo/email.vo"
import { UserEntity } from "@/modules/user/infrastructure/adapter/out/persistence/entities"
import { UserPersistenceMapper } from "@/modules/user/infrastructure/adapter/out/persistence/mappers"
import { PaginatedResult } from "@/shared/infrastructure/dto/api-response.dto"

// Mock data and entities
const createMockUserEntity = (partial: Partial<UserEntity>): UserEntity => {
  const entity = new UserEntity()
  return Object.assign(entity, {
    idx: 1,
    userId: "user-id-123",
    email: "test@example.com",
    passwordHash: "hashed-password",
    salt: "salt",
    role: UserRole.MENTEE,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  })
}

const createMockUserDomain = (partial: Partial<User>): User => {
  return new User({
    idx: 1,
    userId: "user-id-123",
    email: "test@example.com",
    passwordHash: "hashed-password",
    salt: "salt",
    role: UserRole.MENTEE,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  })
}

describe("TypeOrmUserRepository", () => {
  let repository: TypeOrmUserRepository
  let mockTypeOrmRepo: jest.Mocked<Repository<UserEntity>>
  let mockMapper: jest.Mocked<UserPersistenceMapper>

  beforeEach(async () => {
    const mockRepoProvider = {
      provide: getRepositoryToken(UserEntity),
      useValue: {
        findOne: jest.fn(),
        findAndCount: jest.fn(),
        save: jest.fn(),
        softDelete: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        create: jest.fn((entity) => entity), // Mock create to return the passed entity
      },
    }

    const mockMapperProvider = {
      provide: UserPersistenceMapper,
      useValue: {
        toDomain: jest.fn(),
        toDomainList: jest.fn(),
        toEntity: jest.fn(),
      },
    }

    const mockEntityManagerProvider = {
      provide: EntityManager,
      useValue: {
        // Mock entity manager methods if needed
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeOrmUserRepository, mockRepoProvider, mockMapperProvider, mockEntityManagerProvider],
    }).compile()

    repository = module.get<TypeOrmUserRepository>(TypeOrmUserRepository)
    mockTypeOrmRepo = module.get(getRepositoryToken(UserEntity))
    mockMapper = module.get(UserPersistenceMapper)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("findByIdx", () => {
    it("should return a user domain model if found", async () => {
      const userEntity = createMockUserEntity({ idx: 1 })
      const userDomain = createMockUserDomain({ idx: 1 })

      mockTypeOrmRepo.findOne.mockResolvedValue(userEntity)
      mockMapper.toDomain.mockReturnValue(userDomain)

      const result = await repository.findByIdx(1)

      expect(mockTypeOrmRepo.findOne).toHaveBeenCalledWith({ where: { idx: 1 } })
      expect(mockMapper.toDomain).toHaveBeenCalledWith(userEntity)
      expect(result).toEqual(userDomain)
    })

    it("should return null if user is not found", async () => {
      mockTypeOrmRepo.findOne.mockResolvedValue(null)
      mockMapper.toDomain.mockImplementation(() => {
        throw new Error()
      })

      const result = await repository.findByIdx(999)

      expect(mockTypeOrmRepo.findOne).toHaveBeenCalledWith({ where: { idx: 999 } })
      expect(result).toBeNull()
    })
  })

  describe("findByUserId", () => {
    it("should return a user domain model if found", async () => {
      const userId = "user-id-123"
      const userEntity = createMockUserEntity({ userId })
      const userDomain = createMockUserDomain({ userId })

      mockTypeOrmRepo.findOne.mockResolvedValue(userEntity)
      mockMapper.toDomain.mockReturnValue(userDomain)

      const result = await repository.findByUserId(userId)

      expect(mockTypeOrmRepo.findOne).toHaveBeenCalledWith({ where: { userId } })
      expect(mockMapper.toDomain).toHaveBeenCalledWith(userEntity)
      expect(result).toEqual(userDomain)
    })

    it("should return null if user is not found", async () => {
      mockTypeOrmRepo.findOne.mockResolvedValue(null)
      mockMapper.toDomain.mockImplementation(() => {
        throw new Error()
      })

      const result = await repository.findByUserId("non-existent-id")

      expect(mockTypeOrmRepo.findOne).toHaveBeenCalledWith({ where: { userId: "non-existent-id" } })
      expect(result).toBeNull()
    })
  })

  describe("findByEmail", () => {
    it("should return a user domain model if found", async () => {
      const email = "test@example.com"
      const userEntity = createMockUserEntity({ email })
      const userDomain = createMockUserDomain({ email: Email.of(email) })

      mockTypeOrmRepo.findOne.mockResolvedValue(userEntity)
      mockMapper.toDomain.mockReturnValue(userDomain)

      const result = await repository.findByEmail(email)

      expect(mockTypeOrmRepo.findOne).toHaveBeenCalledWith({ where: { email } })
      expect(mockMapper.toDomain).toHaveBeenCalledWith(userEntity)
      expect(result).toEqual(userDomain)
    })

    it("should return null if user is not found", async () => {
      mockTypeOrmRepo.findOne.mockResolvedValue(null)
      mockMapper.toDomain.mockImplementation(() => {
        throw new Error()
      })

      const result = await repository.findByEmail("non-existent@example.com")

      expect(mockTypeOrmRepo.findOne).toHaveBeenCalledWith({ where: { email: "non-existent@example.com" } })
      expect(result).toBeNull()
    })
  })

  describe("findAllUsers", () => {
    it("should return paginated users with filters", async () => {
      const userEntities = [createMockUserEntity({})]
      const userDomains = [createMockUserDomain({})]
      const total = 1
      const options = { page: 1, limit: 10, role: UserRole.MENTEE, status: UserStatus.ACTIVE }

      const paginatedResult: PaginatedResult<UserEntity> = {
        items: userEntities,
        totalItemCount: total,
        currentPage: options.page,
        limit: options.limit,
        totalPageCount: 0,
      }

      const paginateSpy = jest.spyOn(repository, "paginateWithSort").mockResolvedValue(paginatedResult)

      mockMapper.toDomainList.mockReturnValue(userDomains)

      const result = await repository.findAllUsers(options)

      expect(paginateSpy).toHaveBeenCalledWith(
        { role: options.role, status: options.status },
        { currentPage: options.page, limit: options.limit, sort: { field: "createdAt", order: "DESC" } },
      )
      expect(mockMapper.toDomainList).toHaveBeenCalledWith(userEntities)
      expect(result).toEqual({ users: userDomains, total })

      paginateSpy.mockRestore()
    })
  })

  describe("save", () => {
    it("should save a user and return the domain model", async () => {
      const userDomain = createMockUserDomain({})
      const userEntity = createMockUserEntity({})

      mockMapper.toEntity.mockReturnValue(userEntity)
      mockTypeOrmRepo.save.mockResolvedValue(userEntity)
      mockMapper.toDomain.mockReturnValue(userDomain)

      // BaseRepository.create calls repository.save(), so we can spy on it.
      const createSpy = jest.spyOn(repository, "create").mockResolvedValue(userEntity)

      const result = await repository.save(userDomain)

      expect(mockMapper.toEntity).toHaveBeenCalledWith(userDomain)
      expect(createSpy).toHaveBeenCalledWith(userEntity)
      expect(mockMapper.toDomain).toHaveBeenCalledWith(userEntity)
      expect(result).toEqual(userDomain)

      createSpy.mockRestore()
    })
  })

  describe("delete", () => {
    const idx = 1

    it("should perform soft delete by default and return true", async () => {
      const options: DeleteUserDto = {}
      const softDeleteSpy = jest.spyOn(repository, "softDelete").mockResolvedValue({ affected: 1, raw: [] } as any)

      const result = await repository.delete(idx, options)

      expect(softDeleteSpy).toHaveBeenCalledWith({ idx })
      expect(result).toBe(true)

      softDeleteSpy.mockRestore()
    })

    it("should perform soft delete when specified and return true", async () => {
      const options: DeleteUserDto = { deleteType: "SOFT" }
      const softDeleteSpy = jest.spyOn(repository, "softDelete").mockResolvedValue({ affected: 1, raw: [] } as any)

      const result = await repository.delete(idx, options)

      expect(softDeleteSpy).toHaveBeenCalledWith({ idx })
      expect(result).toBe(true)

      softDeleteSpy.mockRestore()
    })

    it("should return false if soft delete fails", async () => {
      const options: DeleteUserDto = { deleteType: "SOFT" }
      const softDeleteSpy = jest.spyOn(repository, "softDelete").mockRejectedValue(new Error("DB error"))

      const result = await repository.delete(idx, options)

      expect(result).toBe(false)
      softDeleteSpy.mockRestore()
    })

    it("should perform hard delete when specified and return true", async () => {
      const options: DeleteUserDto = { deleteType: "HARD" }
      const findOneAndDeleteSpy = jest
        .spyOn(repository, "findOneAndDelete")
        .mockResolvedValue({ affected: 1, raw: [] } as any)

      const result = await repository.delete(idx, options)

      expect(findOneAndDeleteSpy).toHaveBeenCalledWith({ idx })
      expect(result).toBe(true)

      findOneAndDeleteSpy.mockRestore()
    })

    it("should return false if hard delete fails", async () => {
      const options: DeleteUserDto = { deleteType: "HARD" }
      const findOneAndDeleteSpy = jest.spyOn(repository, "findOneAndDelete").mockRejectedValue(new Error("DB error"))

      const result = await repository.delete(idx, options)

      expect(result).toBe(false)
      findOneAndDeleteSpy.mockRestore()
    })
  })

  describe("existsByEmail", () => {
    it("should return true if email exists", async () => {
      const email = "exists@example.com"
      mockTypeOrmRepo.count.mockResolvedValue(1)

      const result = await repository.existsByEmail(email)

      expect(mockTypeOrmRepo.count).toHaveBeenCalledWith({ where: { email } })
      expect(result).toBe(true)
    })

    it("should return false if email does not exist", async () => {
      const email = "non-existent@example.com"
      mockTypeOrmRepo.count.mockResolvedValue(0)

      const result = await repository.existsByEmail(email)

      expect(mockTypeOrmRepo.count).toHaveBeenCalledWith({ where: { email } })
      expect(result).toBe(false)
    })
  })
})
