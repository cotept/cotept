import { SocialProvider } from "@repo/shared/src/auth"
import { IMenteeSocialAccount } from "@repo/shared/src/users"
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import { Mentee } from "./mentee.entity"

@Entity("mentee_social_accounts")
export class MenteeSocialAccount implements IMenteeSocialAccount {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  menteeId: string

  @ManyToOne(() => Mentee, (mentee) => mentee.socialAccounts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "mentee_id" })
  mentee: Mentee

  @Column({
    type: "enum",
    enum: SocialProvider,
  })
  provider: SocialProvider

  @Column()
  socialId: string

  @Column({ nullable: true })
  email?: string

  @CreateDateColumn()
  createdAt: Date

  @Index("IDX_MENTEE_PROVIDER_SOCIAL_ID", { unique: true })
  @Column()
  providerWithSocialId: string
}
