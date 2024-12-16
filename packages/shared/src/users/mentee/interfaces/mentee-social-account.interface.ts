// mentee-social-account.interface.ts
import { ISocialAccount } from "../../../auth"

export interface IMenteeSocialAccount extends ISocialAccount {
  menteeId: string
}
