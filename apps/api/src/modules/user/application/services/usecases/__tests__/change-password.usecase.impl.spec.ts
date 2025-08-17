import { BadRequestException, NotFoundException, UnauthorizedException } from "@nestjs/common"

import { ChangePasswordDto } from "@/modules/user/application/dtos/change-password.dto"
import { PasswordServicePort } from "@/modules/user/application/ports/out/password-service.port"
import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"
import { ChangePasswordUseCaseImpl } from "@/modules/user/application/services/usecases/change-password.usecase.impl"
import User, { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { Email } from "@/modules/user/domain/vo/email.vo"

describe("비밀번호 변경 유스케이스", () => {
  let changePasswordUseCase: ChangePasswordUseCaseImpl
  let mockUserRepository: jest.Mocked<UserRepositoryPort>
  let mockPasswordService: jest.Mocked<PasswordServicePort>

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

    // 테스트 대상 유스케이스 인스턴스 생성
    changePasswordUseCase = new ChangePasswordUseCaseImpl(mockUserRepository, mockPasswordService)
  })

  describe("execute 메소드", () => {
    it("올바른 비밀번호 정보로 비밀번호를 성공적으로 변경해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"
      const now = new Date()

      // 기존 사용자 정보
      const user = new User({
        id: userId,
        email: Email.of("test@example.com"),
        passwordHash: "old-hashed-password",
        salt: "old-salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        createdAt: now,
        updatedAt: now,
      })

      // 비밀번호 변경 정보
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: "CurrentP@ss123",
        newPassword: "NewStrongP@ss123",
        confirmPassword: "NewStrongP@ss123",
      }

      // 리포지터리 응답 설정
      mockUserRepository.findById.mockResolvedValue(user)

      // 현재 비밀번호 검증 결과 - 올바름
      mockPasswordService.verifyPassword.mockResolvedValue(true)

      // 새 비밀번호 해싱 결과
      mockPasswordService.hashPassword.mockResolvedValue({
        hash: "new-hashed-password",
        salt: "new-salt-value",
      })

      // 사용자 저장 결과
      mockUserRepository.save.mockResolvedValue({
        ...user,
        passwordHash: "new-hashed-password",
        salt: "new-salt-value",
      } as User)

      // When
      const result = await changePasswordUseCase.execute(userId, changePasswordDto)

      // Then
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockPasswordService.verifyPassword).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        "old-hashed-password", // 현재 비밀번호 검증 시 기존 해시 사용
        "old-salt-value", // 현재 비밀번호 검증 시 기존 솔트 사용
      )
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(changePasswordDto.newPassword)

      // 저장 시 비밀번호와 솔트가 업데이트되었는지 확인
      const savedUser = mockUserRepository.save.mock.calls[0][0]
      expect(savedUser.passwordHash).toBe("new-hashed-password")
      expect(savedUser.salt).toBe("new-salt-value")

      expect(result).toBe(true)
    })

    it("존재하지 않는 사용자의 비밀번호를 변경할 경우 NotFoundException을 발생시켜야 한다", async () => {
      // Given
      const userId = "non-existent-id"

      // 비밀번호 변경 정보
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: "CurrentP@ss123",
        newPassword: "NewStrongP@ss123",
        confirmPassword: "NewStrongP@ss123",
      }

      // 사용자가 존재하지 않음을 설정
      mockUserRepository.findById.mockResolvedValue(null)

      // When & Then
      await expect(changePasswordUseCase.execute(userId, changePasswordDto)).rejects.toThrow(NotFoundException)

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockPasswordService.verifyPassword).not.toHaveBeenCalled()
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled()
      expect(mockUserRepository.save).not.toHaveBeenCalled()
    })

    it("현재 비밀번호가 일치하지 않는 경우 UnauthorizedException을 발생시켜야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      // 기존 사용자 정보
      const user = new User({
        id: userId,
        email: Email.of("test@example.com"),
        passwordHash: "old-hashed-password",
        salt: "old-salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
      })

      // 비밀번호 변경 정보 (현재 비밀번호 올바르지 않음)
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: "WrongP@ss123",
        newPassword: "NewStrongP@ss123",
        confirmPassword: "NewStrongP@ss123",
      }

      // 리포지터리 응답 설정
      mockUserRepository.findById.mockResolvedValue(user)

      // 현재 비밀번호 검증 결과 - 올바르지 않음
      mockPasswordService.verifyPassword.mockResolvedValue(false)

      // When & Then
      await expect(changePasswordUseCase.execute(userId, changePasswordDto)).rejects.toThrow(UnauthorizedException)

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockPasswordService.verifyPassword).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        "old-hashed-password",
        "old-salt-value",
      )
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled()
      expect(mockUserRepository.save).not.toHaveBeenCalled()
    })

    it("새 비밀번호와 확인 비밀번호가 일치하지 않는 경우 BadRequestException을 발생시켜야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      // 기존 사용자 정보
      const user = new User({
        id: userId,
        email: Email.of("test@example.com"),
        passwordHash: "old-hashed-password",
        salt: "old-salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
      })

      // 비밀번호 변경 정보 (새 비밀번호와 확인이 일치하지 않음)
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: "CurrentP@ss123",
        newPassword: "NewStrongP@ss123",
        confirmPassword: "DifferentP@ss123",
      }

      // 리포지터리 응답 설정
      mockUserRepository.findById.mockResolvedValue(user)

      // 현재 비밀번호 검증 결과 - 올바름
      mockPasswordService.verifyPassword.mockResolvedValue(true)

      // When & Then
      await expect(changePasswordUseCase.execute(userId, changePasswordDto)).rejects.toThrow(BadRequestException)

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockPasswordService.verifyPassword).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        "old-hashed-password",
        "old-salt-value",
      )
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled()
      expect(mockUserRepository.save).not.toHaveBeenCalled()
    })

    it("새 비밀번호가 현재 비밀번호와 동일한 경우 BadRequestException을 발생시켜야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      // 기존 사용자 정보
      const user = new User({
        id: userId,
        email: Email.of("test@example.com"),
        passwordHash: "old-hashed-password",
        salt: "old-salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
      })

      // 비밀번호 변경 정보 (새 비밀번호와 현재 비밀번호가 동일)
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: "CurrentP@ss123",
        newPassword: "CurrentP@ss123",
        confirmPassword: "CurrentP@ss123",
      }

      // 리포지터리 응답 설정
      mockUserRepository.findById.mockResolvedValue(user)

      // 현재 비밀번호 검증 결과 - 올바름
      mockPasswordService.verifyPassword.mockResolvedValue(true)

      // When & Then
      await expect(changePasswordUseCase.execute(userId, changePasswordDto)).rejects.toThrow(BadRequestException)

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockPasswordService.verifyPassword).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        "old-hashed-password",
        "old-salt-value",
      )
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled()
      expect(mockUserRepository.save).not.toHaveBeenCalled()
    })
  })
})
