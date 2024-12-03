import { BaseUser } from "@/modules/users/entities/base-user.entity"
import { IMentee } from "@repo/shared"
import { Column, Entity, OneToMany } from "typeorm"
import { MenteeSocialAccount } from "./mentee-social-account.entity"

@Entity("mentees")
export class Mentee extends BaseUser implements IMentee {
  @Column({ nullable: true })
  currentTier?: string
  @OneToMany(() => MenteeSocialAccount, (account) => account.mentee)
  socialAccounts: MenteeSocialAccount[]
}
