import { UserEntity as User } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"
import { TermsEntity } from "./terms.entity"

@Entity("TERMS_AGREEMENTS")
export class TermsAgreementEntity {
  @PrimaryColumn({ name: "agreement_id", type: "varchar2", length: 36 })
  id: string

  @Column({ name: "user_id", type: "varchar2", length: 36 })
  userId: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User

  @Column({ name: "terms_id", type: "varchar2", length: 36 })
  termsId: string

  @ManyToOne(() => TermsEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "terms_id" })
  terms: TermsEntity

  @Column({ name: "agreed", type: "number", default: 1 })
  agreed: number

  @Column({ name: "agreed_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  agreedAt: Date

  @Column({ name: "ip_address", type: "varchar2", length: 50, nullable: true })
  ipAddress: string | null

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date
}
