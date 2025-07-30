import User, { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { Email } from "@/modules/user/domain/vo/email.vo"
import { Name } from "@/modules/user/domain/vo/name.vo"
import { UserEntity } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { UserPersistenceMapper } from "@/modules/user/infrastructure/adapter/out/persistence/mappers/user-persistence.mapper"
import { TypeOrmUserRepository } from "@/modules/user/infrastructure/adapter/out/persistence/repositories/typeorm-user.repository"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Repository } from "typeorm"

describe("타입ORM 사용자 리포지토리", () => {
  let repository: TypeOrmUserRepository
  let mockUserRepository: jest.Mocked<Repository<UserEntity>>
  let mockUserMapper: jest.Mocked<UserPersistenceMapper>

  beforeEach(async () => {
    // 리포지토리 모킹
    mockUserRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserEntity>>

    // 매퍼 모킹
    mockUserMapper = {
      toDomain: jest.fn(),
      toDomainList: jest.fn(),
      toEntity: jest.fn(),
    } as unknown as jest.Mocked<UserPersistenceMapper>

    // 테스트 모듈 생성
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmUserRepository,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: UserPersistenceMapper,
          useValue: mockUserMapper,
        },
      ],
    }).compile()

    // 리포지토리 인스턴스 가져오기
    repository = module.get<TypeOrmUserRepository>(TypeOrmUserRepository)
  })

  describe("findById 메소드", () => {
    it("ID로 사용자를 찾아 도메인 객체로 변환해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      const userEntity: Partial<UserEntity> = {
        id: userId,
        email: "test@example.com",
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        name: "홍길동",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const domainUser = new User({
        id: userId,
        email: Email.of("test@example.com"),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        name: Name.of("홍길동"),
      })

      // 리포지토리 응답 설정
      mockUserRepository.findOne.mockResolvedValue(userEntity as UserEntity)

      // 매퍼 응답 설정
      mockUserMapper.toDomain.mockReturnValue(domainUser)

      // When
      const result = await repository.findById(userId)

      // Then
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } })
      expect(mockUserMapper.toDomain).toHaveBeenCalledWith(userEntity)
      expect(result).toEqual(domainUser)
    })

    it("ID에 해당하는 사용자가 없으면 null을 반환해야 한다", async () => {
      // Given
      const userId = "non-existent-id"

      // 리포지토리 응답 설정 - 사용자 없음
      mockUserRepository.findOne.mockResolvedValue(null)

      // When
      const result = await repository.findById(userId)

      // Then
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } })
      expect(mockUserMapper.toDomain).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })
  })

  describe("findByEmail 메소드", () => {
    it("이메일로 사용자를 찾아 도메인 객체로 변환해야 한다", async () => {
      // Given
      const email = "test@example.com"

      const userEntity: Partial<UserEntity> = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: email,
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        name: "홍길동",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const domainUser = new User({
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: Email.of(email),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        name: Name.of("홍길동"),
      })

      // 리포지토리 응답 설정
      mockUserRepository.findOne.mockResolvedValue(userEntity as UserEntity)

      // 매퍼 응답 설정
      mockUserMapper.toDomain.mockReturnValue(domainUser)

      // When
      const result = await repository.findByEmail(email)

      // Then
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email } })
      expect(mockUserMapper.toDomain).toHaveBeenCalledWith(userEntity)
      expect(result).toEqual(domainUser)
    })

    it("이메일에 해당하는 사용자가 없으면 null을 반환해야 한다", async () => {
      // Given
      const email = "non-existent@example.com"

      // 리포지토리 응답 설정 - 사용자 없음
      mockUserRepository.findOne.mockResolvedValue(null)

      // When
      const result = await repository.findByEmail(email)

      // Then
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email } })
      expect(mockUserMapper.toDomain).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })
  })

  describe("findAllUsers 메소드", () => {
    it("필터링 및 페이지네이션을 적용하여 모든 사용자를 조회해야 한다", async () => {
      // Given
      const page = 2
      const limit = 5
      const role = UserRole.MENTEE
      const status = UserStatus.ACTIVE

      const userEntities: Partial<UserEntity>[] = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          email: "user1@example.com",
          passwordHash: "hashed-password-1",
          salt: "salt-value-1",
          role: UserRole.MENTEE,
          status: UserStatus.ACTIVE,
        },
        {
          id: "223e4567-e89b-12d3-a456-426614174000",
          email: "user2@example.com",
          passwordHash: "hashed-password-2",
          salt: "salt-value-2",
          role: UserRole.MENTEE,
          status: UserStatus.ACTIVE,
        },
      ]

      const domainUsers = [
        new User({
          id: "123e4567-e89b-12d3-a456-426614174000",
          email: Email.of("user1@example.com"),
          passwordHash: "hashed-password-1",
          salt: "salt-value-1",
          role: UserRole.MENTEE,
          status: UserStatus.ACTIVE,
        }),
        new User({
          id: "223e4567-e89b-12d3-a456-426614174000",
          email: Email.of("user2@example.com"),
          passwordHash: "hashed-password-2",
          salt: "salt-value-2",
          role: UserRole.MENTEE,
          status: UserStatus.ACTIVE,
        }),
      ]

      const total = 12 // 총 12개 중 5~9번째 항목 반환

      // 리포지토리 응답 설정
      mockUserRepository.findAndCount.mockResolvedValue([userEntities as UserEntity[], total])

      // 매퍼 응답 설정
      mockUserMapper.toDomainList.mockReturnValue(domainUsers)

      // When
      const result = await repository.findAllUsers({ page, limit, role, status })

      // Then
      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
        where: { role, status },
        skip: (page - 1) * limit, // 5
        take: limit, // 5
        order: { createdAt: "DESC" },
      })
      expect(mockUserMapper.toDomainList).toHaveBeenCalledWith(userEntities)
      expect(result).toEqual({
        users: domainUsers,
        total,
      })
    })

    it("옵션이 제공되지 않으면 기본값으로 첫 페이지를 조회해야 한다", async () => {
      // Given
      const userEntities: Partial<UserEntity>[] = []
      const total = 0

      // 리포지토리 응답 설정
      mockUserRepository.findAndCount.mockResolvedValue([userEntities as UserEntity[], total])

      // 매퍼 응답 설정
      mockUserMapper.toDomainList.mockReturnValue([])

      // When
      const result = await repository.findAllUsers()

      // Then
      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
        where: {}, // 필터 없음
        skip: 0, // 첫 페이지
        take: 10, // 기본 limit
        order: { createdAt: "DESC" },
      })
      expect(result).toEqual({
        users: [],
        total: 0,
      })
    })
  })

  describe("save 메소드", () => {
    it("도메인 객체를 엔티티로 변환하여 저장하고 결과를 다시 도메인 객체로 변환해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"
      const now = new Date()

      const domainUser = new User({
        id: userId,
        email: Email.of("test@example.com"),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        name: Name.of("홍길동"),
        createdAt: now,
        updatedAt: now,
      })

      const userEntity: Partial<UserEntity> = {
        id: userId,
        email: "test@example.com",
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        name: "홍길동",
        createdAt: now,
        updatedAt: now,
      }

      const savedEntity: Partial<UserEntity> = {
        ...userEntity,
        updatedAt: new Date(now.getTime() + 1000), // 업데이트 시간 변경
      }

      const savedDomainUser = new User({
        ...domainUser,
        updatedAt: savedEntity.updatedAt,
      })

      // 매퍼 응답 설정
      mockUserMapper.toEntity.mockReturnValue(userEntity as UserEntity)
      mockUserRepository.save.mockResolvedValue(savedEntity as UserEntity)
      mockUserMapper.toDomain.mockReturnValue(savedDomainUser)

      // When
      const result = await repository.save(domainUser)

      // Then
      expect(mockUserMapper.toEntity).toHaveBeenCalledWith(domainUser)
      expect(mockUserRepository.save).toHaveBeenCalledWith(userEntity)
      expect(mockUserMapper.toDomain).toHaveBeenCalledWith(savedEntity)
      expect(result).toEqual(savedDomainUser)
    })
  })

  describe("delete 메소드", () => {
    it("ID로 사용자를 삭제하고 성공 여부를 반환해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      // 리포지토리 응답 설정 - 삭제 성공
      mockUserRepository.delete.mockResolvedValue({ affected: 1 } as any)

      // When
      const result = await repository.delete(userId)

      // Then
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId)
      expect(result).toBe(true)
    })

    it("존재하지 않는 ID를 삭제하려고 할 때 false를 반환해야 한다", async () => {
      // Given
      const userId = "non-existent-id"

      // 리포지토리 응답 설정 - 영향 받은 행 없음
      mockUserRepository.delete.mockResolvedValue({ affected: 0 } as any)

      // When
      const result = await repository.delete(userId)

      // Then
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId)
      expect(result).toBe(false)
    })
  })

  describe("existsByEmail 메소드", () => {
    it("이메일이 존재하면 true를 반환해야 한다", async () => {
      // Given
      const email = "existing@example.com"

      // 리포지토리 응답 설정 - 이메일 존재
      mockUserRepository.count.mockResolvedValue(1)

      // When
      const result = await repository.existsByEmail(email)

      // Then
      expect(mockUserRepository.count).toHaveBeenCalledWith({ where: { email } })
      expect(result).toBe(true)
    })

    it("이메일이 존재하지 않으면 false를 반환해야 한다", async () => {
      // Given
      const email = "non-existent@example.com"

      // 리포지토리 응답 설정 - 이메일 존재하지 않음
      mockUserRepository.count.mockResolvedValue(0)

      // When
      const result = await repository.existsByEmail(email)

      // Then
      expect(mockUserRepository.count).toHaveBeenCalledWith({ where: { email } })
      expect(result).toBe(false)
    })
  })
})
