import { BaseUser } from "@/modules/users/entities/base-user.entity"
import {
  IMentor,
  IMentorProfile,
  MentorApprovalStatus,
} from "@repo/shared/src/users"
import { Column, Entity, OneToMany } from "typeorm"
import { MentorSocialAccount } from "./mentor-social-account.entity"

@Entity("mentors")
export class Mentor extends BaseUser implements IMentor {
  @Column()
  currentTier: string

  @Column({
    type: "enum",
    enum: MentorApprovalStatus,
    default: MentorApprovalStatus.PENDING,
  })
  approvalStatus: MentorApprovalStatus

  @Column("jsonb", { nullable: true })
  profile: IMentorProfile

  @Column({ nullable: true })
  approvedAt?: Date

  @Column({ nullable: true })
  approvedBy?: string

  @OneToMany(() => MentorSocialAccount, (account) => account.mentor)
  socialAccounts: MentorSocialAccount[]
}
