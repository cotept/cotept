import { SocialProvider } from "@/modules/auth/domain/model"

export interface PendingLinkInfo {}

export class PendingLinkInfo {
  constructor(
    public readonly userId: string,
    public readonly provider: SocialProvider,
    public readonly socialId: string,
    public readonly email: string,
    public readonly name?: string,
    public readonly accessToken?: string,
    public readonly refreshToken?: string,
    public readonly profileData?: any,
  ) {}
}
