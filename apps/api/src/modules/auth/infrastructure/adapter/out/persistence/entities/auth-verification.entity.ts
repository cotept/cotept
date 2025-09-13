import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"

import { UserEntity as User } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"

@Entity("AUTH_VERIFICATIONS")
export class AuthVerificationEntity extends BaseEntity<AuthVerificationEntity> {
  @Column({ name: "user_idx", type: "number", nullable: true })
  userId: number | null

  @ManyToOne(() => User, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_idx", referencedColumnName: "idx" })
  user: User | null

  @Column({ name: "auth_type", type: "varchar2", length: 20 })
  authType: string

  @Column({ name: "target", type: "varchar2", length: 100 })
  target: string

  @Column({ name: "verification_code", type: "varchar2", length: 6 })
  verificationCode: string

  @Column({ name: "expires_at", type: "timestamp" })
  expiresAt: Date

  @Column({ name: "verified", type: "number", default: 0 })
  verified: number

  @Column({ name: "verified_at", type: "timestamp", nullable: true })
  verifiedAt: Date | null

  @Column({ name: "attempt_count", type: "number", default: 0 })
  attemptCount: number

  @Column({ name: "ip_address", type: "varchar2", length: 50, nullable: true })
  ipAddress: string | null
}
