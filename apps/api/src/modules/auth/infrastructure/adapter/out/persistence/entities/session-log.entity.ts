import { UserEntity as User } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"

@Entity("SESSION_LOGS")
export class SessionLogEntity {
  @PrimaryColumn({ name: "log_id", type: "varchar2", length: 36 })
  id: string

  @Column({ name: "user_id", type: "varchar2", length: 36 })
  userId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User

  @Column({ name: "token", type: "varchar2", length: 255, unique: true })
  token: string

  @Column({ name: "ip_address", type: "varchar2", length: 45, nullable: true })
  ipAddress: string | null

  @Column({ name: "user_agent", type: "varchar2", length: 500, nullable: true })
  userAgent: string | null

  @Column({ name: "expires_at", type: "timestamp" })
  expiresAt: Date

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date

  @Column({ name: "ended_at", type: "timestamp", nullable: true })
  endedAt: Date | null

  @Column({ name: "end_reason", type: "varchar2", length: 50, nullable: true })
  endReason: string | null
}
