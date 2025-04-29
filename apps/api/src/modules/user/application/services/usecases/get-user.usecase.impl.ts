import { UserDto } from "@/modules/user/application/dtos/user.dto"
import { UserMapper } from "@/modules/user/application/mappers/user.mapper"
import { GetUserUseCase } from "@/modules/user/application/ports/in/get-user.usecase"
import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"
import { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { Injectable, NotFoundException } from "@nestjs/common"

@Injectable()
export class GetUserUseCaseImpl implements GetUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly userMapper: UserMapper,
  ) {}

  /**
   * ID로 사용자 조회
   * @param id 사용자 ID
   * @returns 사용자 정보 DTO
   * @throws NotFoundException 사용자가 존재하지 않는 경우
   */
  async getById(id: string): Promise<UserDto> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new NotFoundException(`ID ${id}에 해당하는 사용자를 찾을 수 없습니다.`)
    }

    return this.userMapper.toDto(user)
  }

  /**
   * 이메일로 사용자 조회
   * @param email 사용자 이메일
   * @returns 사용자 정보 DTO
   * @throws NotFoundException 사용자가 존재하지 않는 경우
   */
  async getByEmail(email: string): Promise<UserDto> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new NotFoundException(`이메일 ${email}에 해당하는 사용자를 찾을 수 없습니다.`)
    }

    return this.userMapper.toDto(user)
  }

  /**
   * 모든 사용자 조회
   * @param options 페이지네이션 및 필터링 옵션
   * @returns 사용자 정보 DTO 배열
   */
  async getAll(options?: {
    page?: number
    limit?: number
    role?: string
    status?: string
  }): Promise<{ users: UserDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10 } = options || {}

    const userRole = options?.role ? (options.role as UserRole) : undefined
    const userStatus = options?.status ? (options.status as UserStatus) : undefined

    const { users, total } = await this.userRepository.findAll({
      page,
      limit,
      role: userRole,
      status: userStatus,
    })

    return {
      users: this.userMapper.toDtoList(users),
      total,
      page,
      limit,
    }
  }
}
