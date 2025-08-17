import { NotFoundException } from "@nestjs/common"

import { DeleteUserDto } from "@/modules/user/application/dtos/delete-user.dto"
import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"
import { DeleteUserUseCaseImpl } from "@/modules/user/application/services/usecases/delete-user.usecase.impl"
import User, { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { Email } from "@/modules/user/domain/vo/email.vo"

describe("사용자 삭제 유스케이스", () => {
  let deleteUserUseCase: DeleteUserUseCaseImpl
  let mockUserRepository: jest.Mocked<UserRepositoryPort>

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

    // 테스트 대상 유스케이스 인스턴스 생성
    deleteUserUseCase = new DeleteUserUseCaseImpl(mockUserRepository)
  })

  describe("execute 메소드", () => {
    it("존재하는 사용자를 성공적으로 삭제해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      // 사용자가 존재함을 설정
      const user = new User({
        id: userId,
        email: Email.of("test@example.com"),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
      })
      mockUserRepository.findById.mockResolvedValue(user)

      // 삭제 성공을 설정
      mockUserRepository.delete.mockResolvedValue(true)

      // When
      const result = await deleteUserUseCase.execute(userId)

      // Then
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId)
      expect(result).toBe(true)
    })

    it("삭제 옵션을 포함하여 사용자를 삭제해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      // 삭제 옵션
      const deleteUserDto: DeleteUserDto = {
        reason: "서비스 이용 중단",
        deleteType: "HARD",
        deleteRelatedData: true,
      }

      // 사용자가 존재함을 설정
      const user = new User({
        id: userId,
        email: Email.of("test@example.com"),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
      })
      mockUserRepository.findById.mockResolvedValue(user)

      // 삭제 성공을 설정
      mockUserRepository.delete.mockResolvedValue(true)

      // When
      const result = await deleteUserUseCase.execute(userId, deleteUserDto)

      // Then
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId)
      expect(result).toBe(true)

      // 현재 구현에서는 deleteUserDto를 사용하지 않지만,
      // 향후 확장 시 사용할 예정임을 가정하고 테스트함
    })

    it("존재하지 않는 사용자를 삭제할 경우 NotFoundException을 발생시켜야 한다", async () => {
      // Given
      const userId = "non-existent-id"

      // 사용자가 존재하지 않음을 설정
      mockUserRepository.findById.mockResolvedValue(null)

      // When & Then
      await expect(deleteUserUseCase.execute(userId)).rejects.toThrow(NotFoundException)

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockUserRepository.delete).not.toHaveBeenCalled()
    })

    it("리포지토리에서 삭제가 실패한 경우 false를 반환해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"

      // 사용자가 존재함을 설정
      const user = new User({
        id: userId,
        email: Email.of("test@example.com"),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
      })
      mockUserRepository.findById.mockResolvedValue(user)

      // 삭제 실패를 설정
      mockUserRepository.delete.mockResolvedValue(false)

      // When
      const result = await deleteUserUseCase.execute(userId)

      // Then
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId)
      expect(result).toBe(false)
    })
  })
})
