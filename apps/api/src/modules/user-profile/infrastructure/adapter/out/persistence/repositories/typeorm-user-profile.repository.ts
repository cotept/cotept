import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { EntityManager, Repository } from "typeorm"

import { UserProfileRepositoryPort } from "@/modules/user-profile/application/ports/out/user-profile-repository.port"
import UserProfile from "@/modules/user-profile/domain/model/user-profile"
import { UserProfileEntity } from "@/modules/user-profile/infrastructure/adapter/out/persistence/entities/user-profile.entity"
import { UserProfilePersistenceMapper } from "@/modules/user-profile/infrastructure/adapter/out/persistence/mappers/user-profile-persistence.mapper"
import { BaseRepository } from "@/shared/infrastructure/persistence/typeorm/repositories/base/base.repository"

/**
 * TypeORM을 사용한 UserProfile 레포지토리 구현
 */
@Injectable()
export class TypeOrmUserProfileRepository
  extends BaseRepository<UserProfileEntity>
  implements UserProfileRepositoryPort
{
  constructor(
    @InjectRepository(UserProfileEntity)
    userProfileRepository: Repository<UserProfileEntity>,
    entityManager: EntityManager,
    private readonly userProfileMapper: UserProfilePersistenceMapper,
  ) {
    super(userProfileRepository, entityManager, "UserProfile")
  }

  /**
   * IDX로 프로필 조회
   * @param idx 프로필 IDX (기본키)
   * @returns 프로필 도메인 엔티티 또는 null
   */
  async findByIdx(idx: number): Promise<UserProfile | null> {
    try {
      const profileEntity = await this.findOne({ idx })
      return this.userProfileMapper.toDomain(profileEntity)
    } catch {
      return null
    }
  }

  /**
   * 사용자 ID로 프로필 조회
   * @param userId 사용자 ID
   * @returns 프로필 도메인 엔티티 또는 null
   */
  async findByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const profileEntity = await this.findOne({ userId })
      return this.userProfileMapper.toDomain(profileEntity)
    } catch {
      return null
    }
  }

  /**
   * 닉네임으로 프로필 조회 (중복 확인용)
   * @param nickname 닉네임
   * @returns 프로필 도메인 엔티티 또는 null
   */
  async findByNickname(nickname: string): Promise<UserProfile | null> {
    try {
      const profileEntity = await this.findOne({ nickname })
      return this.userProfileMapper.toDomain(profileEntity)
    } catch {
      return null
    }
  }

  /**
   * 프로필 저장 (생성 또는 업데이트)
   * @param profile 저장할 프로필 도메인 엔티티
   * @returns 저장된 프로필 도메인 엔티티
   */
  async save(profile: UserProfile): Promise<UserProfile> {
    const profileEntity = this.userProfileMapper.toEntity(profile)
    const savedEntity = await this.create(profileEntity)
    return this.userProfileMapper.toDomain(savedEntity)
  }

  /**
   * 프로필 삭제
   * @param userId 삭제할 사용자 ID
   * @returns 삭제 성공 여부
   */
  async delete(userId: string): Promise<boolean> {
    try {
      await this.findOneAndDelete({ userId })
      return true
    } catch {
      return false
    }
  }

  /**
   * 사용자 ID로 프로필 존재 여부 확인
   * @param userId 확인할 사용자 ID
   * @returns 존재 여부
   */
  async existsByUserId(userId: string): Promise<boolean> {
    const count = await this.count({ userId })
    return count > 0
  }

  /**
   * 닉네임 중복 확인
   * @param nickname 확인할 닉네임
   * @param excludeUserId 제외할 사용자 ID (업데이트 시)
   * @returns 중복 여부
   */
  async existsByNickname(nickname: string, excludeUserId?: string): Promise<boolean> {
    const whereConditions: any = { nickname }

    // 특정 사용자 제외 (업데이트 시 자신의 닉네임은 제외)
    if (excludeUserId) {
      whereConditions.userId = { $ne: excludeUserId } // Not Equal 조건
    }

    const count = await this.count(whereConditions)
    return count > 0
  }
}
