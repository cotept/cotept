import { RegisterType } from "@/modules/auth/enums/register-type.enum"
import { RegistrationStatus } from "@/modules/auth/enums/registration-status.enum"
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

// src/modules/users/entities/registration-progress.entity.ts
@Entity("registration_progress")
export class RegistrationProgress {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: RegisterType,
  })
  registerType: RegisterType

  @Column({ nullable: true })
  email?: string

  @Column({ nullable: true })
  bojId?: string

  @Column({ nullable: true })
  phone?: string

  @Column({ nullable: true })
  socialProvider?: string

  @Column({ nullable: true })
  socialAccessToken?: string

  @Column({
    type: "enum",
    enum: RegistrationStatus,
    default: RegistrationStatus.INITIATED,
  })
  status: RegistrationStatus

  @Column({ type: "jsonb" })
  termsAgreement: {
    serviceTerms: boolean
    privacyPolicy: boolean
    marketingConsent: boolean
    agreedAt: Date
  }

  @Column({ default: false })
  isPhoneVerified: boolean

  @Column({ nullable: true })
  phoneVerifiedAt?: Date

  @Column()
  expiresAt: Date

  @Column({ nullable: true })
  completedUserId?: string // 최종 생성된 User ID

  @Column({ nullable: true })
  cancelReason?: string

  @Column({ default: false })
  isCanceled: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ nullable: true })
  ipAddress?: string

  @Column({ nullable: true })
  deviceId?: string
}
