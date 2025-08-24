import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"

import { UserEntity as User } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"

@Entity("SESSION_LOGS")
export class SessionLogEntity extends BaseEntity<SessionLogEntity> {
  @Column({ name: "user_idx", type: "number" })
  userIdx: number

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_idx", referencedColumnName: "idx" })
  user: User

  @Column({ name: "token", type: "varchar2", length: 512, unique: true })
  token: string

  @Column({ name: "ip_address", type: "varchar2", length: 45, nullable: true })
  ipAddress: string | null

  @Column({ name: "user_agent", type: "varchar2", length: 500, nullable: true })
  userAgent: string | null

  @Column({ name: "expires_at", type: "timestamp" })
  expiresAt: Date

  @Column({ name: "ended_at", type: "timestamp", nullable: true })
  endedAt: Date | null

  @Column({ name: "end_reason", type: "varchar2", length: 50, nullable: true })
  endReason: string | null
}
