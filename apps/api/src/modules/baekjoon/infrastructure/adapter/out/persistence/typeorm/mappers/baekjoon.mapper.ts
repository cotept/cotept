import { Injectable } from "@nestjs/common"

import { BaekjoonUser } from "@/modules/baekjoon/domain/model"
import { Tier, TierLevelEnum } from "@/modules/baekjoon/domain/vo"
import { BaekjoonProfileEntity } from "@/modules/baekjoon/infrastructure/adapter/out/persistence/typeorm/entities"

@Injectable()
export class BaekjoonProfileMapper {
  /**
   * 도메인 엔티티 → 영속성 엔티티
   * BaekjoonUser → BaekjoonProfile
   */
  toEntity(domainModel: BaekjoonUser): BaekjoonProfileEntity {
    const profile = new BaekjoonProfileEntity()

    profile.userId = domainModel.getUserId()
    profile.baekjoonId = domainModel.getHandleString()
    profile.currentTier = domainModel.getCurrentTier().getName()
    profile.highestTier = domainModel.getCurrentTier().getName() // 현재는 동일하게 설정
    profile.verificationStatus = domainModel.isVerified() ? "VERIFIED" : "PENDING"
    profile.isMentorEligible = domainModel.isMentorEligible()
    profile.lastSyncedAt = domainModel.getLastSyncedAt()

    // 기존 엔티티 업데이트인 경우 createdAt, updatedAt 유지
    if (domainModel.getCreatedAt()) {
      profile.createdAt = domainModel.getCreatedAt()
    }
    if (domainModel.getUpdatedAt()) {
      profile.updatedAt = domainModel.getUpdatedAt()
    }

    return profile
  }

  /**
   * 영속성 엔티티 → 도메인 엔티티
   * BaekjoonProfile → BaekjoonUser
   */
  toDomainModel(entity: BaekjoonProfileEntity): BaekjoonUser {
    return new BaekjoonUser({
      userId: entity.userId,
      handle: entity.baekjoonId,
      currentTier: this.parseTierFromString(entity.currentTier),
      solvedCount: 0, // 기본값 (NoSQL에서 가져올 예정)
      name: undefined, // 기본값 (NoSQL에서 가져올 예정)
      verified: entity.verificationStatus === "VERIFIED",
      verifiedAt: entity.verificationStatus === "VERIFIED" ? entity.updatedAt : undefined,
      lastSyncedAt: entity.lastSyncedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })
  }

  /**
   * 도메인 엔티티 배열 → 영속성 엔티티 배열
   */
  toEntityArray(domainModels: BaekjoonUser[]): BaekjoonProfileEntity[] {
    return domainModels.map((model) => this.toEntity(model))
  }

  /**
   * 영속성 엔티티 배열 → 도메인 엔티티 배열
   */
  toDomainModelArray(entities: BaekjoonProfileEntity[]): BaekjoonUser[] {
    return entities.map((entity) => this.toDomainModel(entity))
  }

  /**
   * 기존 엔티티를 도메인 모델로 업데이트
   * 부분 업데이트 시 유용
   */
  updateEntityFromDomain(entity: BaekjoonProfileEntity, domainModel: BaekjoonUser): BaekjoonProfileEntity {
    entity.currentTier = domainModel.getCurrentTier().getName()
    entity.verificationStatus = domainModel.getVerificationStatus()
    entity.isMentorEligible = domainModel.isMentorEligible()
    entity.lastSyncedAt = domainModel.getLastSyncedAt()
    entity.updatedAt = new Date()

    return entity
  }

  /**
   * 티어 문자열을 TierLevelEnum로 변환
   * 티어 이름을 파싱하여 적절한 TierLevelEnum 반환
   */
  private parseTierFromString(tierString?: string): TierLevelEnum {
    if (!tierString) {
      return TierLevelEnum.Unrated
    }

    try {
      return Tier.fromName(tierString).getLevel()
    } catch (error) {
      console.warn(`Unknown tier string: ${tierString}, defaulting to UNRATED`)
      return TierLevelEnum.Unrated
    }
  }
}
