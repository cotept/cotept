import { Column, Entity, OneToOne } from "typeorm"

import { BaekjoonProfileEntity } from "@/modules/baekjoon/infrastructure/adapter/out/persistence/typeorm/entities"
import { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"

/**
 * User 엔티티
 * USERS 테이블에 매핑되는 TypeORM 엔티티
 */
@Entity("USERS")
export class UserEntity extends BaseEntity<UserEntity> {
  @Column({ name: "userId", type: "varchar2", length: 36, unique: true })
  userId: string

  @Column({ name: "email", type: "varchar2", length: 100, unique: true })
  email: string

  @Column({ name: "password_hash", type: "varchar2", length: 255 })
  passwordHash: string

  @Column({ name: "salt", type: "varchar2", length: 100 })
  salt: string

  @Column({
    name: "role",
    type: "varchar2",
    length: 20,
    default: UserRole.MENTEE,
  })
  role: UserRole

  @Column({
    name: "status",
    type: "varchar2",
    length: 20,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus

  @OneToOne(() => BaekjoonProfileEntity, (profile) => profile.user)
  baekjoonProfile?: BaekjoonProfileEntity

  @Column({ name: "phone_number", type: "varchar2", length: 20, nullable: true })
  phoneNumber?: string

  @Column({ name: "phone_verified", type: "number", default: 0 })
  phoneVerified: number

  @Column({ name: "ci_hash", type: "varchar2", length: 255, nullable: true })
  ciHash?: string

  @Column({ name: "di_hash", type: "varchar2", length: 255, nullable: true })
  diHash?: string

  @Column({ name: "name", type: "varchar2", length: 100, nullable: true })
  name?: string

  @Column({ name: "birth_date", type: "varchar2", length: 10, nullable: true })
  birthDate?: string

  @Column({ name: "gender", type: "varchar2", length: 1, nullable: true })
  gender?: string

  @Column({ name: "last_login_at", type: "timestamp", nullable: true })
  lastLoginAt?: Date

  @Column({ name: "deleted_at", type: "timestamp", nullable: true })
  deletedAt?: Date
}
