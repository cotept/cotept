import { UserDto } from "@/modules/user/application/dtos/user.dto"
import { UserMapper } from "@/modules/user/application/mappers/user.mapper"
import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"
import { GetUserUseCaseImpl } from "@/modules/user/application/services/usecases/get-user.usecase.impl"
import User, { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { Email } from "@/modules/user/domain/vo/email.vo"
import { Name } from "@/modules/user/domain/vo/name.vo"
import { NotFoundException } from "@nestjs/common"

describe("사용자 조회 유스케이스", () => {
  let getUserUseCase: GetUserUseCaseImpl
  let mockUserRepository: jest.Mocked<UserRepositoryPort>
  let mockUserMapper: jest.Mocked<UserMapper>

  beforeEach(() => {
    // 각 테스트에 필요한 모의 객체 생성
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      existsByEmail: jest.fn(),
    } as jest.Mocked<UserRepositoryPort>

    mockUserMapper = {
      toDto: jest.fn(),
      toDtoList: jest.fn(),
    } as jest.Mocked<UserMapper>

    // 테스트 대상 유스케이스 인스턴스 생성
    getUserUseCase = new GetUserUseCaseImpl(mockUserRepository, mockUserMapper)
  })

  describe("getById 메소드", () => {
    it("ID로 사용자를 성공적으로 조회해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"
      const now = new Date()

      const user = new User({
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

      // 리포지터리 응답 설정
      mockUserRepository.findById.mockResolvedValue(user)

      // DTO 변환 결과
      const expectedUserDto: Partial<UserDto> = {
        id: userId,
        email: "test@example.com",
        name: "홍길동",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        createdAt: now,
        updatedAt: now,
      }
      mockUserMapper.toDto.mockReturnValue(expectedUserDto as UserDto)

      // When
      const result = await getUserUseCase.getById(userId)

      // Then
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockUserMapper.toDto).toHaveBeenCalledWith(user)
      expect(result).toEqual(expectedUserDto)
    })

    it("존재하지 않는 ID로 조회 시 NotFoundException을 발생시켜야 한다", async () => {
      // Given
      const userId = "non-existent-id"

      // 리포지터리 응답 설정 - 사용자 없음
      mockUserRepository.findById.mockResolvedValue(null)

      // When & Then
      await expect(getUserUseCase.getById(userId)).rejects.toThrow(NotFoundException)
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockUserMapper.toDto).not.toHaveBeenCalled()
    })
  })

  describe("getByEmail 메소드", () => {
    it("이메일로 사용자를 성공적으로 조회해야 한다", async () => {
      // Given
      const email = "test@example.com"
      const userId = "123e4567-e89b-12d3-a456-426614174000"
      const now = new Date()

      const user = new User({
        id: userId,
        email: Email.of(email),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        name: Name.of("홍길동"),
        createdAt: now,
        updatedAt: now,
      })

      // 리포지터리 응답 설정
      mockUserRepository.findByEmail.mockResolvedValue(user)

      // DTO 변환 결과
      const expectedUserDto: Partial<UserDto> = {
        id: userId,
        email: email,
        name: "홍길동",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        createdAt: now,
        updatedAt: now,
      }
      mockUserMapper.toDto.mockReturnValue(expectedUserDto as UserDto)

      // When
      const result = await getUserUseCase.getByEmail(email)

      // Then
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(mockUserMapper.toDto).toHaveBeenCalledWith(user)
      expect(result).toEqual(expectedUserDto)
    })

    it("존재하지 않는 이메일로 조회 시 NotFoundException을 발생시켜야 한다", async () => {
      // Given
      const email = "non-existent@example.com"

      // 리포지터리 응답 설정 - 사용자 없음
      mockUserRepository.findByEmail.mockResolvedValue(null)

      // When & Then
      await expect(getUserUseCase.getByEmail(email)).rejects.toThrow(NotFoundException)
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(mockUserMapper.toDto).not.toHaveBeenCalled()
    })
  })

  describe("getAll 메소드", () => {
    it("모든 사용자를 성공적으로 조회해야 한다", async () => {
      // Given
      const now = new Date()
      const users = [
        new User({
          id: "123e4567-e89b-12d3-a456-426614174000",
          email: Email.of("user1@example.com"),
          passwordHash: "hashed-password-1",
          salt: "salt-value-1",
          role: UserRole.MENTEE,
          status: UserStatus.ACTIVE,
          createdAt: now,
          updatedAt: now,
        }),
        new User({
          id: "223e4567-e89b-12d3-a456-426614174000",
          email: Email.of("user2@example.com"),
          passwordHash: "hashed-password-2",
          salt: "salt-value-2",
          role: UserRole.MENTOR,
          status: UserStatus.ACTIVE,
          createdAt: now,
          updatedAt: now,
        }),
      ]

      const total = 2

      // 리포지터리 응답 설정
      mockUserRepository.findAll.mockResolvedValue({ users, total })

      // DTO 변환 결과
      const userDtos: Partial<UserDto>[] = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          email: "user1@example.com",
          role: UserRole.MENTEE,
          status: UserStatus.ACTIVE,
        },
        {
          id: "223e4567-e89b-12d3-a456-426614174000",
          email: "user2@example.com",
          role: UserRole.MENTOR,
          status: UserStatus.ACTIVE,
        },
      ]
      mockUserMapper.toDtoList.mockReturnValue(userDtos as UserDto[])

      const options = { page: 1, limit: 10 }

      // When
      const result = await getUserUseCase.getAll(options)

      // Then
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({
        page: options.page,
        limit: options.limit,
        role: undefined,
        status: undefined,
      })
      expect(mockUserMapper.toDtoList).toHaveBeenCalledWith(users)
      expect(result).toEqual({
        users: userDtos,
        total,
        page: options.page,
        limit: options.limit,
      })
    })

    it("역할과 상태 필터링이 올바르게 적용되어야 한다", async () => {
      // Given
      const options = {
        page: 2,
        limit: 5,
        role: UserRole.MENTOR,
        status: UserStatus.ACTIVE,
      }

      const users: User[] = []
      const total = 0

      // 리포지터리 응답 설정
      mockUserRepository.findAll.mockResolvedValue({ users, total })

      // DTO 변환 결과
      mockUserMapper.toDtoList.mockReturnValue([])

      // When
      const result = await getUserUseCase.getAll(options)

      // Then
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({
        page: options.page,
        limit: options.limit,
        role: UserRole.MENTOR,
        status: UserStatus.ACTIVE,
      })
      expect(result).toEqual({
        users: [],
        total: 0,
        page: options.page,
        limit: options.limit,
      })
    })

    it("기본 페이지네이션 값이 제공되지 않았을 때 올바르게 설정되어야 한다", async () => {
      // Given
      const users: User[] = []
      const total = 0

      // 리포지터리 응답 설정
      mockUserRepository.findAll.mockResolvedValue({ users, total })

      // DTO 변환 결과
      mockUserMapper.toDtoList.mockReturnValue([])

      // When - 옵션 없이 호출
      const result = await getUserUseCase.getAll()

      // Then
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({
        page: 1, // 기본값
        limit: 10, // 기본값
        role: undefined,
        status: undefined,
      })
      expect(result).toEqual({
        users: [],
        total: 0,
        page: 1,
        limit: 10,
      })
    })
  })
})
