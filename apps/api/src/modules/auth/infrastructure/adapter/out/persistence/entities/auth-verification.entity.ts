import { UserEntity as User } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"

@Entity("AUTH_VERIFICATIONS")
export class AuthVerificationEntity {
  @PrimaryColumn({ name: "verification_id", type: "varchar2", length: 36 })
  id: string

  @Column({ name: "user_id", type: "varchar2", length: 36, nullable: true })
  userId: string | null

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user: User | null

  @Column({ name: "auth_type", type: "varchar2", length: 20 })
  authType: string

  @Column({ name: "target", type: "varchar2", length: 100 })
  target: string

  @Column({ name: "verification_code", type: "varchar2", length: 10 })
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

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date
}
