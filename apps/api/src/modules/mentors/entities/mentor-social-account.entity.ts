import { IMentorSocialAccount, SocialProvider } from "@repo/shared"
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import { Mentor } from "./mentor.entity"

@Entity("mentor_social_accounts")
export class MentorSocialAccount implements IMentorSocialAccount {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  mentorId: string

  @ManyToOne(() => Mentor, (mentor) => mentor.socialAccounts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "mentor_id" })
  mentor: Mentor

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

  @Index("IDX_MENTOR_PROVIDER_SOCIAL_ID", { unique: true })
  @Column()
  providerWithSocialId: string
}
