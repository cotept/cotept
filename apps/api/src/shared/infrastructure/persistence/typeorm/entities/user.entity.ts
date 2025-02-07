// apps/api/src/shared/infrastructure/persistence/typeorm/entities/user.entity.ts
import { User as UserDomain, UserRole, UserStatus } from "@/modules/user/domain/user"
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity({ schema: "auth", name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255, unique: true })
  email: string

  @Column({ type: "varchar", length: 20, unique: true, name: "phone_number" })
  phoneNumber: string

  @Column({ type: "varchar", length: 100, name: "password_hash" })
  passwordHash: string

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.MENTEE,
  })
  role: UserRole

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus

  @Column({ type: "int", default: 0, name: "login_fail_count" })
  loginFailCount: number

  @Column({ type: "timestamp", nullable: true, name: "last_login_at" })
  lastLoginAt: Date | null

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date | null

  toDomain(): UserDomain {
    return new UserDomain(
      this.id,
      this.email,
      this.phoneNumber,
      this.passwordHash,
      this.role,
      this.status,
      this.loginFailCount,
      this.lastLoginAt || undefined,
      this.createdAt,
      this.updatedAt,
      this.deletedAt || undefined,
    )
  }

  static fromDomain(domain: UserDomain): UserEntity {
    const entity = new UserEntity()
    entity.id = domain.id
    entity.email = domain.email
    entity.phoneNumber = domain.phoneNumber
    entity.passwordHash = domain.passwordHash
    entity.role = domain.role
    entity.status = domain.status
    entity.loginFailCount = domain.loginFailCount
    entity.lastLoginAt = domain.lastLoginAt || null
    return entity
  }
}
