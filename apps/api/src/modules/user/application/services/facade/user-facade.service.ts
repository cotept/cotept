import { Injectable } from "@nestjs/common"

import { ChangePasswordDto, CreateUserDto, DeleteUserDto, UpdateUserDto } from "@/modules/user/application/dtos"
import { UserResponseMapper } from "@/modules/user/application/mappers/user-response.mapper"
import {
  ChangePasswordUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserUseCase,
  UpdateUserUseCase,
} from "@/modules/user/application/ports/in"
import {
  PasswordChangeResponseDto,
  UserDeletionResponseDto,
  UserListResponseDto,
  UserResponseDto,
} from "@/modules/user/infrastructure/dtos/response"

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
    private readonly responseMapper: UserResponseMapper,
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
  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.getUserUseCase.getById(id)
    return this.responseMapper.toUserResponse(user)
  }

  /**
   * 이메일로 사용자 조회
   */
  async getUserByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.getUserUseCase.getByEmail(email)
    return this.responseMapper.toUserResponse(user)
  }

  /**
   * 새 사용자 생성
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const createdUser = await this.createUserUseCase.execute(createUserDto)
    return this.responseMapper.toUserResponse(createdUser)
  }

  /**
   * 사용자 정보 업데이트
   */
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const updatedUser = await this.updateUserUseCase.execute(id, updateUserDto)
    return this.responseMapper.toUserResponse(updatedUser)
  }

  /**
   * 사용자 삭제
   */
  async deleteUser(id: string, deleteUserDto?: DeleteUserDto): Promise<UserDeletionResponseDto> {
    await this.deleteUserUseCase.execute(id, deleteUserDto)
    return this.responseMapper.toUserDeletionResponse(id)
  }

  /**
   * 비밀번호 변경
   */
  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<PasswordChangeResponseDto> {
    await this.changePasswordUseCase.execute(id, changePasswordDto)
    return this.responseMapper.toPasswordChangeResponse(true)
  }
}
