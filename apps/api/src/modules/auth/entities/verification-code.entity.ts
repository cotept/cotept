import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm"

@Entity("verification_codes")
export class VerificationCode {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  phone: string

  @Column()
  code: string

  @Column({ default: 0 })
  attemptCount: number

  @Column({ default: false })
  verified: boolean

  @Column({ default: false })
  invalidated: boolean // 재사용 방지

  @Column()
  expiresAt: Date

  @CreateDateColumn()
  createdAt: Date

  @Column({ nullable: true })
  verifiedAt?: Date

  @Column({ nullable: true })
  ipAddress?: string

  @Column({ nullable: true })
  deviceId?: string

  @Column({ nullable: true })
  userId?: string // User 엔티티 직접 참조 대신 ID만 저장
}
