//metor-social-account.interface.ts
import { ISocialAccount } from "../../../auth"

export interface IMentorSocialAccount extends ISocialAccount {
  mentorId: string
}
