import { Injectable } from "@nestjs/common"

import User from "@/modules/user/domain/model/user"
import { UserEntity } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { EntityMapper } from "@/shared/infrastructure/mappers/entity.mapper"

@Injectable()
export class UserPersistenceMapper extends EntityMapper<User, UserEntity> {
  /**
   * Entity → Domain 변환
   * User 생성자의 자동 변환 기능을 최대한 활용
   */
  toDomain(entity: UserEntity): User {
    return new User({
      idx: entity.idx,
      userId: entity.userId,

      // ✅ User 생성자가 string → Email 자동 변환
      email: entity.email,

      passwordHash: entity.passwordHash,
      salt: entity.salt,
      role: entity.role,
      status: entity.status,

      // ✅ User 생성자가 string → Name 자동 변환 (null-safe)
      name: entity.name,

      // ✅ User 생성자가 string → PhoneNumber 자동 변환 + 인증 상태 설정
      phoneNumber: entity.phoneNumber,
      phoneVerified: EntityMapper.numberToBoolean(entity.phoneVerified),

      ciHash: entity.ciHash,
      diHash: entity.diHash,
      birthDate: entity.birthDate,
      gender: entity.gender,

      // BaseEntity에서 상속된 시간 필드
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastLoginAt: entity.lastLoginAt,
    })
  }

  /**
   * Domain → Entity 변환
   * 값 객체를 원시 타입으로 평면화
   */
  toEntity(domain: User): UserEntity {
    const entity = new UserEntity()

    // ✅ idx는 자동생성 필드이므로 조건부 할당
    if (domain.idx !== undefined) {
      entity.idx = domain.idx
    }

    entity.userId = domain.userId

    // ✅ 값 객체 → 원시값 변환 (도메인 모델의 getter 활용)
    entity.email = domain.getEmailString()
    entity.passwordHash = domain.passwordHash
    entity.salt = domain.salt
    entity.role = domain.role
    entity.status = domain.status

    // ✅ Optional 값 객체들 안전 변환
    entity.name = domain.getNameString()
    entity.phoneNumber = domain.getPhoneNumberString()
    entity.phoneVerified = EntityMapper.booleanToNumber(domain.isPhoneVerified())

    entity.ciHash = domain.ciHash
    entity.diHash = domain.diHash
    entity.birthDate = domain.birthDate
    entity.gender = domain.gender

    // 시간 필드는 BaseEntity가 자동 관리하지만 도메인 값이 있으면 사용
    entity.createdAt = domain.createdAt
    entity.updatedAt = domain.updatedAt
    entity.lastLoginAt = domain.lastLoginAt

    return entity
  }

  /**
   * 새 사용자 생성용 (idx 제외)
   */
  toEntityForCreate(user: User): UserEntity {
    const entity = this.toEntity(user)
    // 자동생성 필드는 idx를 undefined로 설정
    return entity
  }
}
