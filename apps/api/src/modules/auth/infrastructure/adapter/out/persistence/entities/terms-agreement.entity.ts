import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"

import { TermsEntity } from "./terms.entity"

import { UserEntity as User } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"

@Entity("TERMS_AGREEMENTS")
export class TermsAgreementEntity extends BaseEntity<TermsAgreementEntity> {
  @Column({ name: "user_idx", type: "number" })
  userIdx: number

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_idx", referencedColumnName: "idx" })
  user: User

  @Column({ name: "terms_idx", type: "number" })
  termsId: number

  @ManyToOne(() => TermsEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "terms_idx", referencedColumnName: "idx" })
  terms: TermsEntity

  @Column({ name: "agreed", type: "number", default: 1 })
  agreed: number

  @Column({ name: "agreed_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  agreedAt: Date

  @Column({ name: "ip_address", type: "varchar2", length: 50, nullable: true })
  ipAddress: string | null
}
