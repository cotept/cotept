import { Column, Entity, OneToMany } from "typeorm"

import { PhoneVerificationEntity } from "./phone-verification.entity"

import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"

@Entity("IDENTITY_PROVIDERS")
export class IdentityProviderEntity extends BaseEntity<IdentityProviderEntity> {
  @Column({ name: "name", type: "varchar2", length: 50, unique: true })
  name: string

  @Column({ name: "provider_type", type: "varchar2", length: 50 })
  providerType: string

  @Column({ name: "api_key", type: "varchar2", length: 255 })
  apiKey: string

  @Column({ name: "api_secret", type: "varchar2", length: 255 })
  apiSecret: string

  @Column({ name: "config", type: "clob", nullable: true })
  config: string | null

  @Column({ name: "active", type: "number", default: 1 })
  active: number

  @OneToMany(() => PhoneVerificationEntity, (verification) => verification.provider)
  verifications: PhoneVerificationEntity[]
}
