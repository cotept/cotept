import { CreateUserDto } from "@/modules/user/application/dtos/create-user.dto"
import { UserDto } from "@/modules/user/application/dtos/user.dto"
import { UserMapper } from "@/modules/user/application/mappers/user.mapper"
import { PasswordServicePort } from "@/modules/user/application/ports/out/password-service.port"
import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"
import { CreateUserUseCaseImpl } from "@/modules/user/application/services/usecases/create-user.usecase.impl"
import User, { UserRole, UserStatus } from "@/modules/user/domain/model/user.entity"
import { Email } from "@/modules/user/domain/vo/email.vo"
import { ConflictException } from "@nestjs/common"

describe("사용자 생성 유스케이스", () => {
  let createUserUseCase: CreateUserUseCaseImpl
  let mockUserRepository: jest.Mocked<UserRepositoryPort>
  let mockPasswordService: jest.Mocked<PasswordServicePort>
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

    mockPasswordService = {
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
    } as jest.Mocked<PasswordServicePort>

    mockUserMapper = {
      toDto: jest.fn(),
      toDtoList: jest.fn(),
    } as jest.Mocked<UserMapper>

    // 테스트 대상 유스케이스 인스턴스 생성
    createUserUseCase = new CreateUserUseCaseImpl(mockUserRepository, mockPasswordService, mockUserMapper)
  })

  describe("execute 메소드", () => {
    it("새로운 사용자를 성공적으로 생성해야 한다", async () => {
      // Given
      const createUserDto: CreateUserDto = {
        email: "new@example.com",
        password: "StrongP@ss123",
        name: "홍길동",
        role: UserRole.MENTEE,
        phoneNumber: "01012345678",
      }

      const userId = "123e4567-e89b-12d3-a456-426614174000"
      const now = new Date()

      // 이메일 중복 체크 결과 - 중복 없음
      mockUserRepository.existsByEmail.mockResolvedValue(false)

      // 비밀번호 해싱 결과
      mockPasswordService.hashPassword.mockResolvedValue({
        hash: "hashed-password",
        salt: "salt-value",
      })

      // 생성된 사용자 엔티티
      const createdUser = new User({
        id: userId,
        email: Email.of(createUserDto.email),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        name: createUserDto.name,
        phoneNumber: createUserDto.phoneNumber,
        createdAt: now,
        updatedAt: now,
      })

      // 저장 결과
      mockUserRepository.save.mockResolvedValue(createdUser)

      // DTO 변환 결과
      const expectedUserDto: Partial<UserDto> = {
        id: userId,
        email: createUserDto.email,
        name: createUserDto.name,
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        phoneNumber: createUserDto.phoneNumber,
        phoneVerified: false,
        createdAt: now,
        updatedAt: now,
      }
      mockUserMapper.toDto.mockReturnValue(expectedUserDto as UserDto)

      // When
      const result = await createUserUseCase.execute(createUserDto)

      // Then
      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(createUserDto.email)
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(createUserDto.password)
      expect(mockUserRepository.save).toHaveBeenCalled()
      expect(mockUserMapper.toDto).toHaveBeenCalled()
      expect(result).toEqual(expectedUserDto)
    })

    it("이미 존재하는 이메일로 사용자 생성 시 충돌 예외를 발생시켜야 한다", async () => {
      // Given
      const createUserDto: CreateUserDto = {
        email: "existing@example.com",
        password: "StrongP@ss123",
        name: "홍길동",
        role: UserRole.MENTEE,
      }

      // 이메일 중복 체크 결과 - 중복 있음
      mockUserRepository.existsByEmail.mockResolvedValue(true)

      // When & Then
      await expect(createUserUseCase.execute(createUserDto)).rejects.toThrow(ConflictException)
      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(createUserDto.email)
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled()
      expect(mockUserRepository.save).not.toHaveBeenCalled()
    })

    it("기본 역할을 지정하지 않으면 MENTEE 역할로 사용자를 생성해야 한다", async () => {
      // Given
      const createUserDto = {
        email: "new@example.com",
        password: "StrongP@ss123",
        name: "홍길동",
        // role이 지정되지 않음
      } as unknown as CreateUserDto

      // 이메일 중복 체크 결과 - 중복 없음
      mockUserRepository.existsByEmail.mockResolvedValue(false)

      // 비밀번호 해싱 결과
      mockPasswordService.hashPassword.mockResolvedValue({
        hash: "hashed-password",
        salt: "salt-value",
      })

      // 저장 시 내부적으로 User.createWithBasicAuth 호출될 때 기본값 사용
      mockUserRepository.save.mockImplementation((user: User) => {
        return Promise.resolve({
          ...user,
          id: "123e4567-e89b-12d3-a456-426614174000",
        } as unknown as User)
      })

      // When
      await createUserUseCase.execute(createUserDto)

      // Then
      expect(mockUserRepository.save).toHaveBeenCalled()
      // save에 전달된 user 객체의 role이 MENTEE인지 확인
      const savedUser = mockUserRepository.save.mock.calls[0][0]
      expect(savedUser.role).toBe(UserRole.MENTEE)
    })
  })
})
