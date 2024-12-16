//social-account.interface.ts
import { SocialProvider } from "../enums"

export interface ISocialAccount {
  id: string
  provider: SocialProvider
  socialId: string
  email?: string
  createdAt: Date
}
