import User, { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { Email } from "@/modules/user/domain/vo/email.vo"
import { Name } from "@/modules/user/domain/vo/name.vo"
import { PhoneNumber } from "@/modules/user/domain/vo/phone-number.vo"
import { UserEntity } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { Injectable } from "@nestjs/common"
import { instanceToPlain, plainToInstance } from "class-transformer"

/**
 * 아웃바운드 어댑터 매퍼
 * 도메인 객체와 데이터베이스 엔티티 간의 변환을 담당
 * class-transformer를 활용하여 변환 효율성 향상
 */
@Injectable()
export class UserPersistenceMapper {
  /**
   * 도메인 엔티티 -> 영속성 엔티티 변환
   */
  toEntity(user: User): UserEntity {
    // 도메인 엔티티를 일반 객체로 변환
    const plainData = {
      id: user.id,
      email: user.getEmailString(),
      passwordHash: user.passwordHash,
      salt: user.salt,
      role: user.role,
      status: user.status,
      name: user.getNameString(),
      phoneNumber: user.getPhoneNumberString(),
      phoneVerified: user.isPhoneVerified() ? 1 : 0,
      ciHash: user.ciHash,
      diHash: user.diHash,
      birthDate: user.birthDate,
      gender: user.gender,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    }

    // plainToInstance를 사용하여 영속성 엔티티로 변환
    return plainToInstance(UserEntity, plainData)
  }

  /**
   * 영속성 엔티티 -> 도메인 엔티티 변환
   */
  toDomain(entity: UserEntity): User {
    // 영속성 엔티티를 일반 객체로 변환
    const plainData = instanceToPlain(entity)

    // 값 객체 생성 (도메인 규칙 준수를 위한 필수 작업)
    const email = Email.of(plainData.email)
    const name = plainData.name ? Name.of(plainData.name) : undefined
    const phoneNumber = plainData.phoneNumber
      ? PhoneNumber.of(plainData.phoneNumber, plainData.phoneVerified === 1)
      : undefined

    // 도메인 객체 생성 - 생성자 직접 사용
    const user = new User({
      id: plainData.id,
      email,
      passwordHash: plainData.passwordHash,
      salt: plainData.salt,
      role: plainData.role as UserRole,
      status: plainData.status as UserStatus,
      name,
      phoneNumber,
      phoneVerified: plainData.phoneVerified === 1,
      ciHash: plainData.ciHash,
      diHash: plainData.diHash,
      birthDate: plainData.birthDate,
      gender: plainData.gender,
      createdAt: plainData.createdAt,
      updatedAt: plainData.updatedAt,
      lastLoginAt: plainData.lastLoginAt,
    })

    return user
  }

  /**
   * 영속성 엔티티 목록 -> 도메인 엔티티 목록 변환
   */
  toDomainList(entities: UserEntity[]): User[] {
    return entities.map((entity) => this.toDomain(entity))
  }

  /**
   * 도메인 엔티티 목록 -> 영속성 엔티티 목록 변환
   */
  toEntityList(users: User[]): UserEntity[] {
    return users.map((user) => this.toEntity(user))
  }
}
