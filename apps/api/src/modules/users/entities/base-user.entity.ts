import { AccountStatus } from "@repo/shared/src/users/base"
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

@Entity()
export abstract class BaseUser {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  email: string

  @Column({ nullable: true }) // 소셜 로그인 고려
  password?: string

  @Column({ unique: true })
  bojId: string

  @Column({ unique: true })
  phone: string

  @Column()
  isEmailVerified: boolean

  @Column()
  isPhoneVerified: boolean

  @CreateDateColumn()
  emailVerifiedAt?: Date

  @CreateDateColumn()
  phoneVerifiedAt?: Date

  @Column({
    type: "enum",
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ nullable: true })
  lastLoginAt?: Date
}
