import { BaekjoonProfileRepositoryPort } from "@/modules/baekjoon/application/ports/out"
import { BaekjoonUser } from "@/modules/baekjoon/domain/model"
import { BaekjoonProfileVerificationStatusType } from "@/modules/baekjoon/domain/vo/baekjoon-profile-verification-status.vo"
import { BaekjoonProfile } from "@/modules/baekjoon/infrastructure/adapter/out/persistence/typeorm/entites"
import { BaekjoonProfileMapper } from "@/modules/baekjoon/infrastructure/adapter/out/persistence/typeorm/mappers"
import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, MoreThan } from "typeorm"

@Injectable()
export class BaekjoonProfileRepositoryImpl implements BaekjoonProfileRepositoryPort {
  constructor(
    @InjectRepository(BaekjoonProfile)
    private readonly repository: Repository<BaekjoonProfile>,
    private readonly mapper: BaekjoonProfileMapper,
  ) {}

  async save(baekjoonUser: BaekjoonUser): Promise<BaekjoonUser> {
    // 도메인 모델 → 엔티티 변환
    const entity = this.mapper.toEntity(baekjoonUser)

    const savedEntity = await this.repository.save(entity)

    // 엔티티 → 도메인 모델 변환
    return this.mapper.toDomainModel(savedEntity)
  }

  async findByUserId(userId: string): Promise<BaekjoonUser | null> {
    const entity = await this.repository.findOne({
      where: { userId },
    })

    return entity ? this.mapper.toDomainModel(entity) : null
  }

  async findByBaekjoonId(baekjoonId: string): Promise<BaekjoonUser | null> {
    const entity = await this.repository.findOne({
      where: { baekjoonId },
    })

    return entity ? this.mapper.toDomainModel(entity) : null
  }

  async update(userId: string, baekjoonUser: BaekjoonUser): Promise<BaekjoonUser> {
    const existingEntity = await this.repository.findOne({
      where: { userId },
    })

    if (!existingEntity) {
      throw new NotFoundException(`${userId}에 해당하는 백준 프로파일을(를) 찾을 수 없습니다.`)
    }

    // 기존 엔티티를 도메인 모델로 업데이트
    const updatedEntity = this.mapper.updateEntityFromDomain(existingEntity, baekjoonUser)

    const savedEntity = await this.repository.save(updatedEntity)

    return this.mapper.toDomainModel(savedEntity)
  }

  async exists(userId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { userId },
    })
    return count > 0
  }

  async delete(userId: string): Promise<void> {
    const result = await this.repository.delete({ userId })

    if (result.affected === 0) {
      throw new NotFoundException(`${userId}에 해당하는 백준 프로파일을(를) 찾을 수 없습니다.`)
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
