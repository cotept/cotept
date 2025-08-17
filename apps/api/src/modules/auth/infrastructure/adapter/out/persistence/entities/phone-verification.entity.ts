import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"

import { IdentityProviderEntity } from "./identity-provider.entity"

import { UserEntity as User } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"

@Entity("PHONE_VERIFICATIONS")
export class PhoneVerificationEntity {
  @PrimaryColumn({ name: "verification_id", type: "varchar2", length: 36 })
  id: string

  @Column({ name: "user_id", type: "varchar2", length: 36, nullable: true })
  userId: string | null

  @ManyToOne(() => User, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User | null

  @Column({ name: "provider_id", type: "varchar2", length: 36 })
  providerId: string

  @ManyToOne(() => IdentityProviderEntity)
  @JoinColumn({ name: "provider_id" })
  provider: IdentityProviderEntity

  @Column({ name: "request_id", type: "varchar2", length: 255, unique: true })
  requestId: string

  @Column({ name: "phone_number", type: "varchar2", length: 20, nullable: true })
  phoneNumber: string | null

  @Column({ name: "name", type: "varchar2", length: 100, nullable: true })
  name: string | null

  @Column({ name: "birth_date", type: "varchar2", length: 10, nullable: true })
  birthDate: string | null

  @Column({ name: "gender", type: "varchar2", length: 1, nullable: true })
  gender: string | null

  @Column({ name: "ci", type: "varchar2", length: 255, nullable: true })
  ci: string | null

  @Column({ name: "di", type: "varchar2", length: 255, nullable: true })
  di: string | null

  @Column({ name: "auth_result", type: "varchar2", length: 50, nullable: true })
  authResult: string | null

  @Column({ name: "response_data", type: "clob", nullable: true })
  responseData: string | null

  @Column({ name: "status", type: "varchar2", length: 20, default: "PENDING" })
  status: string

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date

  @Column({ name: "verified_at", type: "timestamp", nullable: true })
  verifiedAt: Date | null
}
