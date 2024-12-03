import { SocialProvider } from "../enums/social-provider.enum"

export interface ISocialAccount {
  id: string
  provider: SocialProvider
  socialId: string
  email?: string
  createdAt: Date
}

export interface IMenteeSocialAccount extends ISocialAccount {
  menteeId: string
}

export interface IMentorSocialAccount extends ISocialAccount {
  mentorId: string
}
