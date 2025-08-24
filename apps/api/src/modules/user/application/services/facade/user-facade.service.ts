import { Injectable } from "@nestjs/common"

import {
  ChangePasswordDto,
  CreateUserDto,
  DeleteUserDto,
  PasswordChangeResponseDto,
  UpdateUserDto,
  UserDeletionResponseDto,
  UserDto,
  UserListResponseDto,
} from "@/modules/user/application/dto"
import { UserMapper } from "@/modules/user/application/mappers"
import {
  ChangePasswordUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserUseCase,
  UpdateUserUseCase,
} from "@/modules/user/application/ports/in"

/**
 * 사용자 관련 파사드 서비스
 * 컨트롤러와 유스케이스 사이의 중간 레이어로 동작하며 컨트롤러의 복잡성을 줄이는 역할을 합니다.
 */
@Injectable()
export class UserFacadeService {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly responseMapper: UserMapper,
  ) {}

  /**
   * 사용자 목록 조회
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    role?: string,
    status?: string,
  ): Promise<UserListResponseDto> {
    const result = await this.getUserUseCase.getAll({ page, limit, role, status })
    return this.responseMapper.toUserListResponse(result.users, result.total, result.page, result.limit)
  }

  /**
   * ID로 사용자 조회
   */
  async getUserByIdx(idx: number): Promise<UserDto> {
    const user = await this.getUserUseCase.getByIdx(idx)
    return user
  }

  /**
   * ID로 사용자 조회
   */
  async getUserByUserId(userId: string): Promise<UserDto> {
    const user = await this.getUserUseCase.getByUserId(userId)
    return user
  }

  /**
   * 이메일로 사용자 조회
   */
  async getUserByEmail(email: string): Promise<UserDto> {
    const user = await this.getUserUseCase.getByEmail(email)
    return user
  }

  /**
   * 새 사용자 생성
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserDto> {
    const createdUser = await this.createUserUseCase.execute(createUserDto)
    return createdUser
  }

  /**
   * 사용자 정보 업데이트
   */
  async updateUser(idx: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const updatedUser = await this.updateUserUseCase.execute(idx, updateUserDto)
    return updatedUser
  }

  /**
   * 사용자 삭제
   */
  async deleteUser(idx: number, deleteUserDto?: DeleteUserDto): Promise<UserDeletionResponseDto> {
    await this.deleteUserUseCase.execute(idx, deleteUserDto)
    return this.responseMapper.toUserDeletionResponse(deleteUserDto?.userId ?? "")
  }

  /**
   * 비밀번호 변경
   */
  async changePassword(idx: number, changePasswordDto: ChangePasswordDto): Promise<PasswordChangeResponseDto> {
    await this.changePasswordUseCase.execute(idx, changePasswordDto)
    return this.responseMapper.toPasswordChangeResponse(true)
  }
}
