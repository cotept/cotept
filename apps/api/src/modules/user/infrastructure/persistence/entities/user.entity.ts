// apps/api/src/modules/user/infrastructure/persistence/entities/user.entity.ts
import { BaseEntity } from "@/shared/infrastructure/entities/base.entity"
import { Column, DeleteDateColumn, Entity } from "typeorm"
import { UserRole, UserStatus } from "../../../domain/user"

@Entity({ schema: "auth", name: "users" })
export class UserEntity extends BaseEntity<UserEntity> {
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

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date | null
}
