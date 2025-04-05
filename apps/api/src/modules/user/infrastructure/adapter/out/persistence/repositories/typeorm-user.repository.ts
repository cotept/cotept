import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"
import User, { UserRole, UserStatus } from "@/modules/user/domain/model/user.entity"
import { UserEntity } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { UserPersistenceMapper } from "@/modules/user/infrastructure/adapter/out/persistence/mappers/user-persistence.mapper"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

/**
 * TypeORM을 사용한 User 레포지토리 구현
 */
@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userMapper: UserPersistenceMapper
  ) {}

  /**
   * ID로 사용자 조회
   * @param id 사용자 ID
   * @returns 사용자 도메인 엔티티 또는 null
   */
  async findById(id: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { id } })
    if (!userEntity) return null
    
    return this.userMapper.toDomain(userEntity)
  }

  /**
   * 이메일로 사용자 조회
   * @param email 사용자 이메일
   * @returns 사용자 도메인 엔티티 또는 null
   */
  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { email } })
    if (!userEntity) return null
    
    return this.userMapper.toDomain(userEntity)
  }

  /**
   * 모든 사용자 조회 (페이지네이션 및 필터링 지원)
   * @param options 페이지네이션 및 필터링 옵션
   * @returns 사용자 도메인 엔티티 배열 및 총 개수
   */
  async findAll(options?: {
    page?: number
    limit?: number
    role?: UserRole
    status?: UserStatus
  }): Promise<{ users: User[]; total: number }> {
    const page = options?.page || 1
    const limit = options?.limit || 10
    const skip = (page - 1) * limit
    
    const whereConditions: any = {}
    if (options?.role) whereConditions.role = options.role
    if (options?.status) whereConditions.status = options.status
    
    const [userEntities, total] = await this.userRepository.findAndCount({
      where: whereConditions,
      skip,
      take: limit,
      order: { createdAt: "DESC" }
    })
    
    const users = this.userMapper.toDomainList(userEntities)
    return { users, total }
  }

  /**
   * 사용자 저장 (생성 또는 업데이트)
   * @param user 저장할 사용자 도메인 엔티티
   * @returns 저장된 사용자 도메인 엔티티
   */
  async save(user: User): Promise<User> {
    const userEntity = this.userMapper.toEntity(user)
    const savedEntity = await this.userRepository.save(userEntity)
    return this.userMapper.toDomain(savedEntity)
  }

  /**
   * 사용자 삭제
   * @param id 삭제할 사용자 ID
   * @returns 삭제 성공 여부
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id)
    return result.affected ? result.affected > 0 : false
  }

  /**
   * 중복 이메일 확인
   * @param email 확인할 이메일
   * @returns 중복 여부
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { email } })
    return count > 0
  }
}
