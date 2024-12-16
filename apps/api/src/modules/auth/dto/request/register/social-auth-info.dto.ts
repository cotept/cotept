import { RegistrationRole } from "@/modules/auth/enums"
import { SocialProvider } from "@repo/shared/src/auth"
import { IsEnum, IsString } from "class-validator"

// register/social-auth-info.dto.ts
export class SocialAuthInfoDto {
  @IsString()
  socialAccessToken: string

  @IsEnum(SocialProvider)
  provider: SocialProvider

  @IsEnum(RegistrationRole)
  role: RegistrationRole
}
