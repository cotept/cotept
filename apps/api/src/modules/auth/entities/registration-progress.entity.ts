import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { RegisterType } from "../enums/register-type.enum"
import { RegistrationRole } from "../enums/registration-role.enum"
import { RegistrationStatus } from "../enums/registration-status.enum"

@Entity("registration_progress")
export class RegistrationProgress {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: RegisterType,
  })
  registerType: RegisterType // NORMAL/SOCIAL

  @Column({
    type: "enum",
    enum: RegistrationRole,
  })
  userType: RegistrationRole // MENTEE/MENTOR

  @Column({
    type: "enum",
    enum: RegistrationStatus,
    default: RegistrationStatus.INITIATED,
  })
  status: RegistrationStatus

  @Column({ nullable: true })
  @Index()
  phone?: string

  @Column({ nullable: true })
  @Index()
  email?: string

  @Column({ type: "jsonb", nullable: true })
  registrationData: {
    termsAgreement?: {
      agreedAt: Date
      termsVersion: string
    }
    phoneVerification?: {
      verifiedAt: Date
    }
    emailVerification?: {
      verifiedAt: Date
    }
    bojVerification?: {
      verifiedAt: Date
      bojId: string
      tier: string
    }
  }

  @Column()
  expiresAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ nullable: true })
  lastActiveAt: Date
}
