import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { EntityManager, Repository } from "typeorm"

import { BaekjoonProfileRepositoryPort } from "@/modules/baekjoon/application/ports/out"
import { BaekjoonUser } from "@/modules/baekjoon/domain/model"
import { BaekjoonProfileVerificationStatusType } from "@/modules/baekjoon/domain/vo/baekjoon-profile-verification-status.vo"
import { BaekjoonProfileEntity } from "@/modules/baekjoon/infrastructure/adapter/out/persistence/typeorm/entities"
import { BaekjoonProfileMapper } from "@/modules/baekjoon/infrastructure/adapter/out/persistence/typeorm/mappers"
import { BaseRepository } from "@/shared/infrastructure/persistence/typeorm/repositories/base/base.repository"

@Injectable()
export class BaekjoonProfileRepository
  extends BaseRepository<BaekjoonProfileEntity>
  implements BaekjoonProfileRepositoryPort
{
  constructor(
    @InjectRepository(BaekjoonProfileEntity)
    baekjoonProfileRepository: Repository<BaekjoonProfileEntity>,
    entityManager: EntityManager,
    private readonly mapper: BaekjoonProfileMapper,
  ) {
    super(baekjoonProfileRepository, entityManager, "BaekjoonProfile")
  }
  async updateVerificationStatus(userId: string, status: BaekjoonProfileVerificationStatusType): Promise<void> {
    try {
      await this.findOneAndUpdate({ userId }, { verificationStatus: status })
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`${userId}에 해당하는 백준 프로파일을(를) 찾을 수 없습니다.`)
      }
      this.handleDBError(error, "[BaekjoonProfile]")
    }
  }
  async findPendingVerificationUsers(limit: number = 50): Promise<BaekjoonUser[]> {
    const entities = await this.entityRepository.find({
      where: { verificationStatus: "PENDING" },
      take: limit,
      order: { createdAt: "ASC" },
    })
    return entities.map((entity) => this.mapper.toDomainModel(entity))
  }
  async findVerifiedUsers(limit: number = 100): Promise<BaekjoonUser[]> {
    const entities = await this.entityRepository.find({
      where: { verificationStatus: "VERIFIED" },
      take: limit,
      order: { updatedAt: "DESC" },
    })
    return entities.map((entity) => this.mapper.toDomainModel(entity))
  }
  async findMentorEligibleUsers(limit: number = 100): Promise<BaekjoonUser[]> {
    const entities = await this.entityRepository.find({
      where: {
        isMentorEligible: true,
        verificationStatus: "VERIFIED",
      },
      take: limit,
      order: { updatedAt: "DESC" },
    })
    return entities.map((entity) => this.mapper.toDomainModel(entity))
  }
  async countMentorEligibleUsers(): Promise<number> {
    return await this.count({
      isMentorEligible: true,
      verificationStatus: "VERIFIED",
    })
  }

  async save(baekjoonUser: BaekjoonUser): Promise<BaekjoonUser> {
    // 도메인 모델 → 엔티티 변환
    const entity = this.mapper.toEntity(baekjoonUser)

    const savedEntity = await this.create(entity)

    // 엔티티 → 도메인 모델 변환
    return this.mapper.toDomainModel(savedEntity)
  }

  async findByUserId(userId: string): Promise<BaekjoonUser | null> {
    try {
      const entity = await this.findOne({ userId })
      return this.mapper.toDomainModel(entity)
    } catch {
      return null
    }
  }

  async findByBaekjoonId(baekjoonId: string): Promise<BaekjoonUser | null> {
    try {
      const entity = await this.findOne({ baekjoonId })
      return this.mapper.toDomainModel(entity)
    } catch {
      return null
    }
  }

  async update(userId: string, baekjoonUser: BaekjoonUser): Promise<BaekjoonUser> {
    try {
      const existingEntity = await this.findOne({ userId })

      // 기존 엔티티를 도메인 모델로 업데이트
      const updatedEntity = this.mapper.updateEntityFromDomain(existingEntity, baekjoonUser)

      const savedEntity = await this.entityRepository.save(updatedEntity)

      return this.mapper.toDomainModel(savedEntity)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`${userId}에 해당하는 백준 프로파일을(를) 찾을 수 없습니다.`)
      }
      this.handleDBError(error, "[BaekjoonProfile]")
    }
  }

  async exists(userId: string): Promise<boolean> {
    const count = await this.count({ userId })
    return count > 0
  }

  async delete(userId: string): Promise<void> {
    try {
      await this.softDelete({ userId })
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`${userId}에 해당하는 백준 프로파일을(를) 찾을 수 없습니다.`)
      }
      this.handleDBError(error, "[BaekjoonProfile]")
    }
  }
  // // === 비즈니스 로직 지원 조회 ===

  // async findMentorEligibleUsers(limit: number = 100): Promise<BaekjoonUser[]> {
  //   const entities = await this.repository.find({
  //     where: {
  //       isMentorEligible: true,
  //       verificationStatus: "VERIFIED",
  //     },
  //     take: limit,
  //     order: { updatedAt: "DESC" },
  //   })
  //   return this.mapper.toDomainModelArray(entities)
  // }

  // async findUsersNeedingSync(olderThan: Date, limit: number = 50): Promise<BaekjoonUser[]> {
  //   const entities = await this.repository.find({
  //     where: [{ lastSyncedAt: null }, { lastSyncedAt: MoreThan(olderThan) }],
  //     take: limit,
  //     order: { lastSyncedAt: "ASC" },
  //   })
  //   return this.mapper.toDomainModelArray(entities)
  // }

  // async findPendingVerificationUsers(limit: number = 50): Promise<BaekjoonUser[]> {
  //   const entities = await this.repository.find({
  //     where: { verificationStatus: "PENDING" },
  //     take: limit,
  //     order: { createdAt: "ASC" },
  //   })
  //   return this.mapper.toDomainModelArray(entities)
  // }

  // // === 페이징 조회 ===

  // async findByTierRange(
  //   minTier: TierLevel,
  //   maxTier: TierLevel,
  //   page: number,
  //   limit: number,
  // ): Promise<PaginationResult<BaekjoonUser>> {
  //   const skip = (page - 1) * limit

  //   const [entities, total] = await this.repository.findAndCount({
  //     where: {
  //       // 티어는 문자열로 저장되므로 적절한 필터링 로직 필요
  //       // 실제로는 currentTier를 숫자로 저장하거나 별도 로직 필요
  //     },
  //     skip,
  //     take: limit,
  //     order: { updatedAt: "DESC" },
  //   })

  //   const users = this.mapper.toDomainModelArray(entities)

  //   return {
  //     items: users,
  //     total,
  //     page,
  //     limit,
  //     totalPages: Math.ceil(total / limit),
  //     hasPrevious: page > 1,
  //     hasNext: page < Math.ceil(total / limit),
  //   }
  // }

  // async findAll(page: number, limit: number): Promise<PaginationResult<BaekjoonUser>> {
  //   const skip = (page - 1) * limit

  //   const [entities, total] = await this.repository.findAndCount({
  //     skip,
  //     take: limit,
  //     order: { updatedAt: "DESC" },
  //   })

  //   const users = this.mapper.toDomainModelArray(entities)

  //   return {
  //     items: users,
  //     total,
  //     page,
  //     limit,
  //     totalPages: Math.ceil(total / limit),
  //     hasPrevious: page > 1,
  //     hasNext: page < Math.ceil(total / limit),
  //   }
  // }

  // // === 배치 작업 ===

  // async saveMany(users: BaekjoonUser[]): Promise<BaekjoonUser[]> {
  //   const entities = this.mapper.toEntityArray(users)
  //   const savedEntities = await this.repository.save(entities)
  //   return this.mapper.toDomainModelArray(savedEntities)
  // }

  // // === 간단한 통계 ===

  // async countVerifiedUsers(): Promise<number> {
  //   return await this.repository.count({
  //     where: { verificationStatus: "VERIFIED" },
  //   })
  // }

  // async countMentorEligibleUsers(): Promise<number> {
  //   return await this.repository.count({
  //     where: {
  //       isMentorEligible: true,
  //       verificationStatus: "VERIFIED",
  //     },
  //   })
  // }

  // // === 기존 메서드 (하위 호환성) ===

  // /**
  //  * @deprecated findByHandle을 사용하세요
  //  */
  // async findByBaekjoonId(baekjoonId: string): Promise<BaekjoonUser | null> {
  //   return this.findByHandle(baekjoonId)
  // }

  // /**
  //  * @deprecated update(userId, updateData)를 사용하세요
  //  */
  // async updateBaekjoonUser(userId: string, baekjoonUser: BaekjoonUser): Promise<BaekjoonUser> {
  //   const existingEntity = await this.repository.findOne({
  //     where: { userId },
  //   })

  //   if (!existingEntity) {
  //     throw new NotFoundException(`BaekjoonProfile not found for userId: ${userId}`)
  //   }

  //   const updatedEntity = this.mapper.updateEntityFromDomain(existingEntity, baekjoonUser)
  //   const savedEntity = await this.repository.save(updatedEntity)
  //   return this.mapper.toDomainModel(savedEntity)
  // }
}
