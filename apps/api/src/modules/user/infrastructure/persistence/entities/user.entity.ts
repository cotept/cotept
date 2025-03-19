// apps/api/src/modules/user/infrastructure/persistence/entities/user.entity.ts
import { UserRole, UserStatus } from "@/modules/user/domain/user"
import { BaseEntity } from "@/shared/infrastructure/entities/base.entity"
import { Column, DeleteDateColumn, Entity } from "typeorm"

@Entity({ schema: "auth", name: "users" })
export class UserEntity extends BaseEntity<UserEntity> {
  @Column({ type: "varchar", length: 255, unique: true })
  email: string

  @Column({ type: "varchar", length: 20, unique: true, name: "phone_number" })
  phoneNumber: string

  @Column({ type: "varchar", length: 100, name: "password_hash" })
  passwordHash: string

  @Column({
    type: "varchar2",
    length: 10,
    name: "role",
    transformer: {
      to: (value: UserRole) => value,
      from: (value: string) => value as UserRole,
    },
    default: UserRole.MENTEE,
  })
  role: UserRole

  @Column({
    type: "varchar2",
    length: 10,
    name: "status",
    transformer: {
      to: (value: UserStatus) => value,
      from: (value: string) => value as UserStatus,
    },
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
