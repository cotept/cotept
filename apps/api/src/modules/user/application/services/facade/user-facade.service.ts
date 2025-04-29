import { ChangePasswordDto, CreateUserDto, DeleteUserDto, UpdateUserDto } from "@/modules/user/application/dtos"
import {
  ChangePasswordUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserUseCase,
  UpdateUserUseCase,
} from "@/modules/user/application/ports/in"
import { UserRequestMapper } from "@/modules/user/infrastructure/adapter/in/mappers"
import { ApiResponse } from "@/shared/infrastructure/dto/api-response.dto"
import { HttpStatus, Injectable } from "@nestjs/common"

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
    private readonly userRequestMapper: UserRequestMapper,
  ) {}

  /**
   * 사용자 목록 조회
   */
  async getAllUsers(page?: number, limit?: number, role?: string, status?: string) {
    const result = await this.getUserUseCase.getAll({ page, limit, role, status })
    return new ApiResponse(HttpStatus.OK, true, "사용자 목록 조회 성공", {
      users: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    })
  }

  /**
   * ID로 사용자 조회
   */
  async getUserById(id: string) {
    const user = await this.getUserUseCase.getById(id)
    return new ApiResponse(HttpStatus.OK, true, "사용자 조회 성공", user)
  }

  /**
   * 이메일로 사용자 조회
   */
  async getUserByEmail(email: string) {
    const user = await this.getUserUseCase.getByEmail(email)
    return new ApiResponse(HttpStatus.OK, true, "사용자 조회 성공", user)
  }

  /**
   * 새 사용자 생성
   */
  async createUser(createUserDto: CreateUserDto) {
    const dto = this.userRequestMapper.toCreateDto(createUserDto)
    const createdUser = await this.createUserUseCase.execute(dto)
    return new ApiResponse(HttpStatus.CREATED, true, "사용자 생성 성공", createdUser)
  }

  /**
   * 사용자 정보 업데이트
   */
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const dto = this.userRequestMapper.toUpdateDto(updateUserDto)
    const updatedUser = await this.updateUserUseCase.execute(id, dto)
    return new ApiResponse(HttpStatus.OK, true, "사용자 정보 수정 성공", updatedUser)
  }

  /**
   * 사용자 삭제
   */
  async deleteUser(id: string, deleteUserDto?: DeleteUserDto) {
    await this.deleteUserUseCase.execute(id, deleteUserDto)
    return new ApiResponse(HttpStatus.NO_CONTENT, true, "사용자 삭제 성공")
  }

  /**
   * 비밀번호 변경
   */
  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    await this.changePasswordUseCase.execute(id, changePasswordDto)
    return new ApiResponse(HttpStatus.OK, true, "비밀번호 변경 성공")
  }
}
