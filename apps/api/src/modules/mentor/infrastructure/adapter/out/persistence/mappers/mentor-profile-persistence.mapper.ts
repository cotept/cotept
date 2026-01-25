import { Injectable } from "@nestjs/common"

import { MentorTagPersistenceMapper } from "./mentor-tag-persistence.mapper"

import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"
import { MentorProfileEntity } from "@/modules/mentor/infrastructure/adapter/out/persistence/entities/mentor-profile.entity"
import { UserEntity } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { EntityMapper } from "@/shared/infrastructure/mappers/entity.mapper"

@Injectable()
export class MentorProfilePersistenceMapper extends EntityMapper<MentorProfile, MentorProfileEntity> {
  constructor(private readonly tagMapper: MentorTagPersistenceMapper) {
    super()
  }

  /**
   * Entity → Domain 변환
   * - 연관된 Tag 엔티티들을 도메인 모델로 변환
   * - 숫자(0/1)로 저장된 boolean 필드들을 변환
   */
  toDomain(entity: MentorProfileEntity): MentorProfile {
    return new MentorProfile({
      idx: entity.idx,
      userId: entity.userId,
      introductionTitle: entity.introductionTitle,
      introductionContent: entity.introductionContent,
      baekjoonTierDisplay: EntityMapper.numberToBoolean(entity.baekjoonTierDisplay),
      mentoringCount: entity.mentoringCount,
      totalReviewCount: entity.totalReviewCount,
      averageRating: entity.averageRating,
      isVerified: EntityMapper.numberToBoolean(entity.isVerified),
      isActive: EntityMapper.numberToBoolean(entity.isActive),
      profileCompletion: entity.profileCompletion,
      tags: entity.mentorProfileTags?.map((profileTag) => this.tagMapper.toDomain(profileTag.mentorTag)) ?? [],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })
  }

  /**
   * Domain → Entity 변환
   * - 도메인 모델의 값들을 엔티티 필드에 매핑
   * - boolean 값들을 숫자(0/1)로 변환
   * - UserEntity는 idx만 참조하여 관계 설정
   * - Tag는 변환하지 않음 (Repository에서 별도 처리)
   */
  toEntity(domain: MentorProfile): MentorProfileEntity {
    const entity = new MentorProfileEntity()

    if (domain.idx !== undefined) {
      entity.idx = domain.idx
    }

    // UserEntity 관계 설정
    // 참고: 실제 UserEntity 인스턴스는 Repository 레이어에서 find 후 주입해야 함
    // 여기서는 userId를 이용해 임시 참조만 설정
    const userEntity = new UserEntity()
    // userEntity.idx = domain.user.idx // 실제 구현 시에는 user 도메인 객체가 필요
    entity.user = userEntity

    entity.userId = domain.userId
    entity.introductionTitle = domain.introductionTitle
    entity.introductionContent = domain.introductionContent
    entity.baekjoonTierDisplay = EntityMapper.booleanToNumber(domain.baekjoonTierDisplay)
    entity.mentoringCount = domain.mentoringCount
    entity.totalReviewCount = domain.totalReviewCount
    entity.averageRating = domain.averageRating
    entity.isVerified = EntityMapper.booleanToNumber(domain.isVerified)
    entity.isActive = EntityMapper.booleanToNumber(domain.isActive)
    entity.profileCompletion = domain.profileCompletion
    entity.createdAt = domain.createdAt
    entity.updatedAt = domain.updatedAt

    // Tag 엔티티 매핑은 Repository에서 처리 (MentorProfileTag 중간 테이블 때문)
    // entity.mentorProfileTags = domain.tags.map(tag => ...);

    return entity
  }
}
