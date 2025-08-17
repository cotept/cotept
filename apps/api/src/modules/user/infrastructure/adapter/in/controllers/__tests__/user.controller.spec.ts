import { HttpStatus } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import { ChangePasswordDto } from "@/modules/user/application/dtos/change-password.dto"
import { CreateUserDto } from "@/modules/user/application/dtos/create-user.dto"
import { DeleteUserDto } from "@/modules/user/application/dtos/delete-user.dto"
import { UpdateUserDto } from "@/modules/user/application/dtos/update-user.dto"
import { UserDto } from "@/modules/user/application/dtos/user.dto"
import { UserFacadeService } from "@/modules/user/application/services/facade/user-facade.service"
import { UserController } from "@/modules/user/infrastructure/adapter/in/controllers/user.controller"
import { ApiResponse } from "@/shared/infrastructure/dto/api-response.dto"

describe("사용자 컨트롤러", () => {
  let userController: UserController
  let mockUserFacadeService: jest.Mocked<UserFacadeService>

  beforeEach(async () => {
    // 파사드 서비스 모킹
    mockUserFacadeService = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      changePassword: jest.fn(),
    } as unknown as jest.Mocked<UserFacadeService>

    // 테스트 모듈 생성
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserFacadeService,
          useValue: mockUserFacadeService,
        },
      ],
    }).compile()

    // 컨트롤러 인스턴스 가져오기
    userController = module.get<UserController>(UserController)
  })

  describe("getAllUsers 메소드", () => {
    it("페이지네이션 및 필터 옵션을 사용하여 모든 사용자를 조회해야 한다", async () => {
      // Given
      const page = 1
      const limit = 10
      const role = "MENTEE"
      const status = "ACTIVE"

      const expectedResponse = new ApiResponse(HttpStatus.OK, true, "사용자 목록 조회 성공", {
        users: [
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            email: "user1@example.com",
          },
        ] as unknown as UserDto[],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      })

      mockUserFacadeService.getAllUsers.mockResolvedValue(expectedResponse)

      // When
      const result = await userController.getAllUsers(page, limit, role, status)

      // Then
      expect(mockUserFacadeService.getAllUsers).toHaveBeenCalledWith(page, limit, role, status)
      expect(result).toEqual(expectedResponse)
    })
  })

  describe("getUserById 메소드", () => {
    it("ID로 사용자를 조회해야 한다", async () => {
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

      const expectedResponse = new ApiResponse(HttpStatus.OK, true, "사용자 조회 성공", userDto)

      mockUserFacadeService.getUserById.mockResolvedValue(expectedResponse)

      // When
      const result = await userController.getUserById(userId)

      // Then
      expect(mockUserFacadeService.getUserById).toHaveBeenCalledWith(userId)
      expect(result).toEqual(expectedResponse)
    })
  })

  describe("createUser 메소드", () => {
    it("새 사용자를 생성해야 한다", async () => {
      // Given
      const createUserDto: CreateUserDto = {
        email: "newuser@example.com",
        password: "StrongP@ss123",
        name: "홍길동",
        role: "MENTEE",
      } as CreateUserDto

      const expectedResponse = new ApiResponse(HttpStatus.CREATED, true, "사용자 생성 성공", {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "newuser@example.com",
        name: "홍길동",
        role: "MENTEE",
      } as unknown as UserDto)

      mockUserFacadeService.createUser.mockResolvedValue(expectedResponse)

      // When
      const result = await userController.createUser(createUserDto)

      // Then
      expect(mockUserFacadeService.createUser).toHaveBeenCalledWith(createUserDto)
      expect(result).toEqual(expectedResponse)
    })
  })

  describe("updateUser 메소드", () => {
    it("사용자 정보를 업데이트해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      const updateUserDto: UpdateUserDto = {
        name: "김철수",
        status: "INACTIVE",
      } as UpdateUserDto

      const expectedResponse = new ApiResponse(HttpStatus.OK, true, "사용자 정보 수정 성공", {
        id: userId,
        email: "user@example.com",
        name: "김철수",
        status: "INACTIVE",
      } as unknown as UserDto)

      mockUserFacadeService.updateUser.mockResolvedValue(expectedResponse)

      // When
      const result = await userController.updateUser(userId, updateUserDto)

      // Then
      expect(mockUserFacadeService.updateUser).toHaveBeenCalledWith(userId, updateUserDto)
      expect(result).toEqual(expectedResponse)
    })
  })

  describe("deleteUser 메소드", () => {
    it("사용자를 삭제해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      const deleteUserDto: DeleteUserDto = {
        reason: "서비스 이용 중단",
        deleteType: "SOFT",
      } as DeleteUserDto

      const expectedResponse = new ApiResponse(HttpStatus.NO_CONTENT, true, "사용자 삭제 성공")

      mockUserFacadeService.deleteUser.mockResolvedValue(expectedResponse)

      // When
      const result = await userController.deleteUser(userId, deleteUserDto)

      // Then
      expect(mockUserFacadeService.deleteUser).toHaveBeenCalledWith(userId, deleteUserDto)
      expect(result).toEqual(expectedResponse)
    })
  })

  describe("changePassword 메소드", () => {
    it("사용자 비밀번호를 변경해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      const changePasswordDto: ChangePasswordDto = {
        currentPassword: "CurrentP@ss123",
        newPassword: "NewStrongP@ss123",
        confirmPassword: "NewStrongP@ss123",
      }

      const expectedResponse = new ApiResponse(HttpStatus.OK, true, "비밀번호 변경 성공")

      mockUserFacadeService.changePassword.mockResolvedValue(expectedResponse)

      // When
      const result = await userController.changePassword(userId, changePasswordDto)

      // Then
      expect(mockUserFacadeService.changePassword).toHaveBeenCalledWith(userId, changePasswordDto)
      expect(result).toEqual(expectedResponse)
    })
  })
})
