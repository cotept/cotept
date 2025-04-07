import { UpdateUserDto } from "@/modules/user/application/dtos/update-user.dto"
import { UserDto } from "@/modules/user/application/dtos/user.dto"
import { UserMapper } from "@/modules/user/application/mappers/user.mapper"
import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"
import { UpdateUserUseCaseImpl } from "@/modules/user/application/services/usecases/update-user.usecase.impl"
import User, { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { Email } from "@/modules/user/domain/vo/email.vo"
import { Name } from "@/modules/user/domain/vo/name.vo"
import { PhoneNumber } from "@/modules/user/domain/vo/phone-number.vo"
import { NotFoundException } from "@nestjs/common"

describe("사용자 정보 업데이트 유스케이스", () => {
  let updateUserUseCase: UpdateUserUseCaseImpl
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
    updateUserUseCase = new UpdateUserUseCaseImpl(mockUserRepository, mockUserMapper)
  })

  describe("execute 메소드", () => {
    it("사용자 정보를 성공적으로 업데이트해야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"
      const now = new Date()

      // 기존 사용자 정보
      const user = new User({
        id: userId,
        email: Email.of("test@example.com"),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        name: Name.of("홍길동"),
        phoneNumber: PhoneNumber.of("01012345678", false),
        createdAt: now,
        updatedAt: now,
      })

      // 업데이트할 정보
      const updateUserDto: UpdateUserDto = {
        name: "김철수",
        phoneNumber: "01087654321",
        status: UserStatus.INACTIVE,
        phoneVerified: true,
      }

      // 리포지터리 응답 설정
      mockUserRepository.findById.mockResolvedValue(user)

      // 저장 후 반환할 사용자 (업데이트된 정보 포함)
      const updatedUser = {
        ...user,
        name: "김철수", // updateBasicInfo 호출 결과
        phoneNumber: PhoneNumber.of("01087654321", true), // updateBasicInfo 및 setPhoneVerified 호출 결과
        status: UserStatus.INACTIVE, // updateStatus 호출 결과
        updatedAt: expect.any(Date), // 업데이트 시간은 현재 시간으로 자동 설정
      }
      mockUserRepository.save.mockResolvedValue(updatedUser as User)

      // DTO 변환 결과
      const expectedUserDto: Partial<UserDto> = {
        id: userId,
        email: "test@example.com",
        name: "김철수",
        role: UserRole.MENTEE,
        status: UserStatus.INACTIVE,
        phoneNumber: "01087654321",
        phoneVerified: true,
      }
      mockUserMapper.toDto.mockReturnValue(expectedUserDto as UserDto)

      // When
      const result = await updateUserUseCase.execute(userId, updateUserDto)

      // Then
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockUserRepository.save).toHaveBeenCalled()
      expect(mockUserMapper.toDto).toHaveBeenCalled()

      // 저장된 사용자에 업데이트된 정보가 반영되었는지 확인
      const savedUser = mockUserRepository.save.mock.calls[0][0]
      expect(savedUser.getNameString()).toBe("김철수")
      expect(savedUser.getPhoneNumberString()).toBe("01087654321")
      expect(savedUser.isPhoneVerified()).toBe(true)
      expect(savedUser.status).toBe(UserStatus.INACTIVE)

      expect(result).toEqual(expectedUserDto)
    })

    it("이름만 업데이트할 경우 이름만 변경되어야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"
      const now = new Date()

      // 기존 사용자 정보
      const user = new User({
        id: userId,
        email: Email.of("test@example.com"),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        name: Name.of("홍길동"),
        phoneNumber: PhoneNumber.of("01012345678", false),
        createdAt: now,
        updatedAt: now,
      })

      // 스파이 설정
      const updateBasicInfoSpy = jest.spyOn(user, "updateBasicInfo")
      const updateStatusSpy = jest.spyOn(user, "updateStatus")
      const setPhoneVerifiedSpy = jest.spyOn(user, "setPhoneVerified")

      // 업데이트할 정보 - 이름만
      const updateUserDto: UpdateUserDto = {
        name: "김철수",
      }

      // 리포지터리 응답 설정
      mockUserRepository.findById.mockResolvedValue(user)
      mockUserRepository.save.mockImplementation((u) => Promise.resolve(u))
      mockUserMapper.toDto.mockImplementation(() => ({ name: "김철수" }) as UserDto)

      // When
      await updateUserUseCase.execute(userId, updateUserDto)

      // Then
      expect(updateBasicInfoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.any(Object),
          phoneNumber: undefined,
        }),
      )
      expect(updateStatusSpy).not.toHaveBeenCalled()
      expect(setPhoneVerifiedSpy).not.toHaveBeenCalled()
    })

    it("전화번호 인증 상태만 업데이트할 경우 인증 상태만 변경되어야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"
      const now = new Date()

      // 기존 사용자 정보
      const user = new User({
        id: userId,
        email: Email.of("test@example.com"),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        name: Name.of("홍길동"),
        phoneNumber: PhoneNumber.of("01012345678", false),
        createdAt: now,
        updatedAt: now,
      })

      // 스파이 설정
      const updateBasicInfoSpy = jest.spyOn(user, "updateBasicInfo")
      const updateStatusSpy = jest.spyOn(user, "updateStatus")
      const setPhoneVerifiedSpy = jest.spyOn(user, "setPhoneVerified")

      // 업데이트할 정보 - 전화번호 인증 상태만
      const updateUserDto: UpdateUserDto = {
        phoneVerified: true,
      }

      // 리포지터리 응답 설정
      mockUserRepository.findById.mockResolvedValue(user)
      mockUserRepository.save.mockImplementation((u) => Promise.resolve(u))
      mockUserMapper.toDto.mockImplementation(() => ({ phoneVerified: true }) as UserDto)

      // When
      await updateUserUseCase.execute(userId, updateUserDto)

      // Then
      expect(updateBasicInfoSpy).not.toHaveBeenCalled()
      expect(updateStatusSpy).not.toHaveBeenCalled()
      expect(setPhoneVerifiedSpy).toHaveBeenCalledWith(true)
    })

    it("존재하지 않는 사용자를 업데이트할 경우 NotFoundException을 발생시켜야 한다", async () => {
      // Given
      const userId = "non-existent-id"
      const updateUserDto: UpdateUserDto = {
        name: "김철수",
      }

      // 리포지터리 응답 설정 - 사용자 없음
      mockUserRepository.findById.mockResolvedValue(null)

      // When & Then
      await expect(updateUserUseCase.execute(userId, updateUserDto)).rejects.toThrow(NotFoundException)
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockUserRepository.save).not.toHaveBeenCalled()
    })

    it("전화번호를 null로 설정해도 업데이트 로직이 호출되지 않아야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"
      const now = new Date()

      // 기존 사용자 정보 (전화번호 포함)
      const user = new User({
        id: userId,
        email: Email.of("test@example.com"),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        name: Name.of("홍길동"),
        phoneNumber: PhoneNumber.of("01012345678", false),
        createdAt: now,
        updatedAt: now,
      })

      // 스파이 설정
      const updateBasicInfoSpy = jest.spyOn(user, "updateBasicInfo")

      // 업데이트할 정보 - 전화번호 null로 설정
      const updateUserDto: UpdateUserDto = {
        phoneNumber: null as any, // null로 설정하면 제거하는 의미
      }

      // 리포지터리 응답 설정
      mockUserRepository.findById.mockResolvedValue(user)
      mockUserRepository.save.mockImplementation((u) => Promise.resolve(u))
      mockUserMapper.toDto.mockImplementation(() => ({ phoneNumber: undefined }) as UserDto)

      // When
      await updateUserUseCase.execute(userId, updateUserDto)

      // Then
      // 전화번호 업데이트 로직이 호출되지 않아야 함
      expect(updateBasicInfoSpy).not.toHaveBeenCalled()
    })

    it("전화번호를 빈 문자열로 설정해도 업데이트 로직이 호출되지 않아야 한다", async () => {
      // Given
      const userId = "123e4567-e89b-12d3-a456-426614174000"
      const now = new Date()

      // 기존 사용자 정보 (전화번호 포함)
      const user = new User({
        id: userId,
        email: Email.of("test@example.com"),
        passwordHash: "hashed-password",
        salt: "salt-value",
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        name: Name.of("홍길동"),
        phoneNumber: PhoneNumber.of("01012345678", false),
        createdAt: now,
        updatedAt: now,
      })

      // 스파이 설정
      const updateBasicInfoSpy = jest.spyOn(user, "updateBasicInfo")

      // 업데이트할 정보 - 전화번호 빈 문자열로 설정
      const updateUserDto: UpdateUserDto = {
        phoneNumber: "" as any, // 빈 문자열로 설정하면 제거하는 의미
      }

      // 리포지터리 응답 설정
      mockUserRepository.findById.mockResolvedValue(user)
      mockUserRepository.save.mockImplementation((u) => Promise.resolve(u))
      mockUserMapper.toDto.mockImplementation(() => ({ phoneNumber: undefined }) as UserDto)

      // When
      await updateUserUseCase.execute(userId, updateUserDto)

      // Then
      // 전화번호 업데이트 로직이 호출되지 않아야 함
      expect(updateBasicInfoSpy).not.toHaveBeenCalled()
    })
  })
})
