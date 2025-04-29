import { ChangePasswordDto } from "@/modules/user/application/dtos/change-password.dto"
import { CreateUserDto } from "@/modules/user/application/dtos/create-user.dto"
import { DeleteUserDto } from "@/modules/user/application/dtos/delete-user.dto"
import { UpdateUserDto } from "@/modules/user/application/dtos/update-user.dto"
import { UserDto } from "@/modules/user/application/dtos/user.dto"
import { ChangePasswordUseCase } from "@/modules/user/application/ports/in/change-password.usecase"
import { CreateUserUseCase } from "@/modules/user/application/ports/in/create-user.usecase"
import { DeleteUserUseCase } from "@/modules/user/application/ports/in/delete-user.usecase"
import { GetUserUseCase } from "@/modules/user/application/ports/in/get-user.usecase"
import { UpdateUserUseCase } from "@/modules/user/application/ports/in/update-user.usecase"
import { UserFacadeService } from "@/modules/user/application/services/facade/user-facade.service"
import { UserRequestMapper } from "@/modules/user/infrastructure/adapter/in/mappers"
import { HttpStatus } from "@nestjs/common"

describe("사용자 파사드 서비스", () => {
  let userFacadeService: UserFacadeService
  let mockGetUserUseCase: jest.Mocked<GetUserUseCase>
  let mockCreateUserUseCase: jest.Mocked<CreateUserUseCase>
  let mockUpdateUserUseCase: jest.Mocked<UpdateUserUseCase>
  let mockDeleteUserUseCase: jest.Mocked<DeleteUserUseCase>
  let mockChangePasswordUseCase: jest.Mocked<ChangePasswordUseCase>
  let mockUserRequestMapper: jest.Mocked<UserRequestMapper>

  beforeEach(() => {
    // 각 테스트에 필요한 모의 객체 생성
    mockGetUserUseCase = {
      getById: jest.fn(),
      getByEmail: jest.fn(),
      getAll: jest.fn(),
    } as jest.Mocked<GetUserUseCase>

    mockCreateUserUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<CreateUserUseCase>

    mockUpdateUserUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<UpdateUserUseCase>

    mockDeleteUserUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<DeleteUserUseCase>

    mockChangePasswordUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<ChangePasswordUseCase>

    mockUserRequestMapper = {
      toCreateDto: jest.fn(),
      toUpdateDto: jest.fn(),
    } as unknown as jest.Mocked<UserRequestMapper>

    // 테스트 대상 파사드 서비스 인스턴스 생성
    userFacadeService = new UserFacadeService(
      mockGetUserUseCase,
      mockCreateUserUseCase,
      mockUpdateUserUseCase,
      mockDeleteUserUseCase,
      mockChangePasswordUseCase,
      mockUserRequestMapper,
    )
  })

  describe("getAllUsers 메소드", () => {
    it("사용자 목록을 성공적으로 조회하고 적절한 응답 형식으로 반환해야 한다", async () => {
      // Given
      const page = 1
      const limit = 10
      const role = "MENTEE"
      const status = "ACTIVE"

      const userDtos: UserDto[] = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          email: "user1@example.com",
          role: "MENTEE",
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as UserDto,
        {
          id: "223e4567-e89b-12d3-a456-426614174000",
          email: "user2@example.com",
          role: "MENTEE",
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as UserDto,
      ]

      const total = 2

      // 유스케이스 응답 설정
      mockGetUserUseCase.getAll.mockResolvedValue({
        users: userDtos,
        total,
        page,
        limit,
      })

      // When
      const result = await userFacadeService.getAllUsers(page, limit, role, status)

      // Then
      expect(mockGetUserUseCase.getAll).toHaveBeenCalledWith({ page, limit, role, status })
      expect(result.statusCode).toBe(HttpStatus.OK)
      expect(result.success).toBe(true)
      expect(result.message).toBe("사용자 목록 조회 성공")
      expect(result.data).toEqual({
        users: userDtos,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    })
  })

  describe("getUserById 메소드", () => {
    it("ID로 사용자를 성공적으로 조회하고 적절한 응답 형식으로 반환해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      const userDto: UserDto = {
        id: userId,
        email: "user@example.com",
        role: "MENTEE",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserDto

      // 유스케이스 응답 설정
      mockGetUserUseCase.getById.mockResolvedValue(userDto)

      // When
      const result = await userFacadeService.getUserById(userId)

      // Then
      expect(mockGetUserUseCase.getById).toHaveBeenCalledWith(userId)
      expect(result.statusCode).toBe(HttpStatus.OK)
      expect(result.success).toBe(true)
      expect(result.message).toBe("사용자 조회 성공")
      expect(result.data).toEqual(userDto)
    })
  })

  describe("getUserByEmail 메소드", () => {
    it("이메일로 사용자를 성공적으로 조회하고 적절한 응답 형식으로 반환해야 한다", async () => {
      // Given
      const email = "user@example.com"

      const userDto: UserDto = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: email,
        role: "MENTEE",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserDto

      // 유스케이스 응답 설정
      mockGetUserUseCase.getByEmail.mockResolvedValue(userDto)

      // When
      const result = await userFacadeService.getUserByEmail(email)

      // Then
      expect(mockGetUserUseCase.getByEmail).toHaveBeenCalledWith(email)
      expect(result.statusCode).toBe(HttpStatus.OK)
      expect(result.success).toBe(true)
      expect(result.message).toBe("사용자 조회 성공")
      expect(result.data).toEqual(userDto)
    })
  })

  describe("createUser 메소드", () => {
    it("사용자를 성공적으로 생성하고 적절한 응답 형식으로 반환해야 한다", async () => {
      // Given
      const createUserDto: CreateUserDto = {
        email: "newuser@example.com",
        password: "StrongP@ss123",
        name: "홍길동",
        role: "MENTEE",
      } as CreateUserDto

      const mappedDto = { ...createUserDto }

      const createdUserDto: UserDto = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "newuser@example.com",
        name: "홍길동",
        role: "MENTEE",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserDto

      // 매퍼 응답 설정
      mockUserRequestMapper.toCreateDto.mockReturnValue(mappedDto as any)

      // 유스케이스 응답 설정
      mockCreateUserUseCase.execute.mockResolvedValue(createdUserDto)

      // When
      const result = await userFacadeService.createUser(createUserDto)

      // Then
      expect(mockUserRequestMapper.toCreateDto).toHaveBeenCalledWith(createUserDto)
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(mappedDto)
      expect(result.statusCode).toBe(HttpStatus.CREATED)
      expect(result.success).toBe(true)
      expect(result.message).toBe("사용자 생성 성공")
      expect(result.data).toEqual(createdUserDto)
    })
  })

  describe("updateUser 메소드", () => {
    it("사용자 정보를 성공적으로 업데이트하고 적절한 응답 형식으로 반환해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      const updateUserDto: UpdateUserDto = {
        name: "김철수",
        status: "INACTIVE",
      } as UpdateUserDto

      const mappedDto = { ...updateUserDto }

      const updatedUserDto: UserDto = {
        id: userId,
        email: "user@example.com",
        name: "김철수",
        role: "MENTEE",
        status: "INACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserDto

      // 매퍼 응답 설정
      mockUserRequestMapper.toUpdateDto.mockReturnValue(mappedDto as any)

      // 유스케이스 응답 설정
      mockUpdateUserUseCase.execute.mockResolvedValue(updatedUserDto)

      // When
      const result = await userFacadeService.updateUser(userId, updateUserDto)

      // Then
      expect(mockUserRequestMapper.toUpdateDto).toHaveBeenCalledWith(updateUserDto)
      expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith(userId, mappedDto)
      expect(result.statusCode).toBe(HttpStatus.OK)
      expect(result.success).toBe(true)
      expect(result.message).toBe("사용자 정보 수정 성공")
      expect(result.data).toEqual(updatedUserDto)
    })
  })

  describe("deleteUser 메소드", () => {
    it("사용자를 성공적으로 삭제하고 적절한 응답 형식으로 반환해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      const deleteUserDto: DeleteUserDto = {
        reason: "서비스 이용 중단",
        deleteType: "SOFT",
      } as DeleteUserDto

      // 유스케이스 응답 설정
      mockDeleteUserUseCase.execute.mockResolvedValue(true)

      // When
      const result = await userFacadeService.deleteUser(userId, deleteUserDto)

      // Then
      expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith(userId, deleteUserDto)
      expect(result.statusCode).toBe(HttpStatus.NO_CONTENT)
      expect(result.success).toBe(true)
      expect(result.message).toBe("사용자 삭제 성공")
      expect(result.data).toBeUndefined()
    })
  })

  describe("changePassword 메소드", () => {
    it("비밀번호를 성공적으로 변경하고 적절한 응답 형식으로 반환해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      const changePasswordDto: ChangePasswordDto = {
        currentPassword: "CurrentP@ss123",
        newPassword: "NewStrongP@ss123",
        confirmPassword: "NewStrongP@ss123",
      }

      // 유스케이스 응답 설정
      mockChangePasswordUseCase.execute.mockResolvedValue(true)

      // When
      const result = await userFacadeService.changePassword(userId, changePasswordDto)

      // Then
      expect(mockChangePasswordUseCase.execute).toHaveBeenCalledWith(userId, changePasswordDto)
      expect(result.statusCode).toBe(HttpStatus.OK)
      expect(result.success).toBe(true)
      expect(result.message).toBe("비밀번호 변경 성공")
      expect(result.data).toBeUndefined()
    })
  })
})
