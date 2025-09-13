import { Injectable } from "@nestjs/common"

import UserProfile from "@/modules/user-profile/domain/model/user-profile"
import { UserProfileEntity } from "@/modules/user-profile/infrastructure/adapter/out/persistence/entities/user-profile.entity"
import { EntityMapper } from "@/shared/infrastructure/mappers/entity.mapper"

@Injectable()
export class UserProfilePersistenceMapper extends EntityMapper<UserProfile, UserProfileEntity> {
  /**
   * Entity → Domain 변환
   * UserProfile 생성자의 자동 변환 기능을 최대한 활용
   */
  toDomain(entity: UserProfileEntity): UserProfile {
    return new UserProfile({
      idx: entity.idx,
      userId: entity.userId,

      // ✅ UserProfile 생성자가 string → Nickname 자동 변환
      nickname: entity.nickname,

      // ✅ UserProfile 생성자가 string → Name 자동 변환 (null-safe)
      fullName: entity.fullName,

      introduce: entity.introduce,
      profileImageUrl: entity.profileImageUrl,

      // BaseEntity에서 상속된 시간 필드
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })
  }

  /**
   * Domain → Entity 변환
   * 값 객체를 원시 타입으로 평면화
   */
  toEntity(domain: UserProfile): UserProfileEntity {
    const entity = new UserProfileEntity()

    // ✅ idx는 자동생성 필드이므로 조건부 할당
    if (domain.idx !== undefined) {
      entity.idx = domain.idx
    }

    entity.userId = domain.userId

    // ✅ 값 객체 → 원시값 변환 (도메인 모델의 getter 활용)
    entity.nickname = domain.nickname // getter를 통해 string으로 반환
    entity.fullName = domain.fullName // getter를 통해 string 또는 undefined 반환
    entity.introduce = domain.introduce
    entity.profileImageUrl = domain.profileImageUrl

    // 시간 필드는 BaseEntity가 자동 관리하지만 도메인 값이 있으면 사용
    entity.createdAt = domain.createdAt
    entity.updatedAt = domain.updatedAt

    return entity
  }

  /**
   * 새 프로필 생성용 (idx 제외)
   */
  toEntityForCreate(profile: UserProfile): UserProfileEntity {
    const entity = this.toEntity(profile)
    // 자동생성 필드는 idx를 undefined로 설정
    return entity
  }
}
