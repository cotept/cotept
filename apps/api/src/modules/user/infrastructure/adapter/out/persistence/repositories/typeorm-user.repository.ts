import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { EntityManager, Repository } from "typeorm"

import { DeleteUserDto } from "@/modules/user/application/dtos"
import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"
import User, { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { UserEntity } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { UserPersistenceMapper } from "@/modules/user/infrastructure/adapter/out/persistence/mappers/user-persistence.mapper"
import { BaseRepository } from "@/shared/infrastructure/persistence/typeorm/repositories/base/base.repository"

/**
 * TypeORM을 사용한 User 레포지토리 구현
 */
@Injectable()
export class TypeOrmUserRepository extends BaseRepository<UserEntity> implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    userRepository: Repository<UserEntity>,
    entityManager: EntityManager,
    private readonly userMapper: UserPersistenceMapper,
  ) {
    super(userRepository, entityManager, "User")
  }

  /**
   * ID로 사용자 조회
   * @param id 사용자 ID
   * @returns 사용자 도메인 엔티티 또는 null
   */
  async findById(id: string): Promise<User | null> {
    try {
      const userEntity = await this.findOne({ id })
      return this.userMapper.toDomain(userEntity)
    } catch {
      return null
    }
  }

  /**
   * 이메일로 사용자 조회
   * @param email 사용자 이메일
   * @returns 사용자 도메인 엔티티 또는 null
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const userEntity = await this.findOne({ email })
      return this.userMapper.toDomain(userEntity)
    } catch {
      return null
    }
  }

  /**
   * 모든 사용자 조회 (페이지네이션 및 필터링 지원)
   * @param options 페이지네이션 및 필터링 옵션
   * @returns 사용자 도메인 엔티티 배열 및 총 개수
   */
  async findAllUsers(options?: {
    page?: number
    limit?: number
    role?: UserRole
    status?: UserStatus
  }): Promise<{ users: User[]; total: number }> {
    const page = options?.page || 1
    const limit = options?.limit || 10

    const whereConditions: any = {}
    if (options?.role) whereConditions.role = options.role
    if (options?.status) whereConditions.status = options.status

    const paginationOptions = { currentPage: page, limit }
    const result = await this.paginateWithSort(whereConditions, {
      ...paginationOptions,
      sort: { field: "createdAt", order: "DESC" },
    })

    const users = this.userMapper.toDomainList(result.items)
    return { users, total: result.totalItemCount }
  }

  /**
   * 사용자 저장 (생성 또는 업데이트)
   * @param user 저장할 사용자 도메인 엔티티
   * @returns 저장된 사용자 도메인 엔티티
   */
  async save(user: User): Promise<User> {
    const userEntity = this.userMapper.toEntity(user)
    const savedEntity = await this.create(userEntity)
    return this.userMapper.toDomain(savedEntity)
  }

  /**
   * 사용자 삭제
   * @param id 삭제할 사용자 ID
   * @returns 삭제 성공 여부
   */
  async delete(id: string, options: DeleteUserDto): Promise<boolean> {
    const deleteType = options?.deleteType || "SOFT"

    // 소프트 삭제 처리
    if (deleteType === "SOFT") {
      try {
        await this.softDelete({ id })
        return true
      } catch {
        return false
      }
    }

    try {
      await this.findOneAndDelete({ id })
      return true
    } catch {
      return false
    }
  }

  /**
   * 중복 이메일 확인
   * @param email 확인할 이메일
   * @returns 중복 여부
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.count({ email })
    return count > 0
  }
}
