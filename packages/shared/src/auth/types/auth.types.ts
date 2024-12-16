//auth.types.ts
import { SocialProvider } from "../enums"

export interface IOAuthProfile {
  socialId: string
  email: string
  name?: string
  profileImage?: string
  provider: SocialProvider
}
