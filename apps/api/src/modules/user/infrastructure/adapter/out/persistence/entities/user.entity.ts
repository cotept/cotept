import { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm"

/**
 * User 엔티티
 * USERS 테이블에 매핑되는 TypeORM 엔티티
 */
@Entity("USERS")
export class UserEntity {
  @PrimaryColumn({ name: "user_id", type: "varchar2", length: 36 })
  id: string

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

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date

  @Column({ name: "last_login_at", type: "timestamp", nullable: true })
  lastLoginAt?: Date

  @Column({ name: "deleted_at", type: "timestamp", nullable: true })
  deletedAt?: Date
}
