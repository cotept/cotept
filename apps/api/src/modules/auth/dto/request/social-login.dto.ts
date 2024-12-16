import { SocialProvider } from "@repo/shared/src/auth"
import { IsEnum, IsString } from "class-validator"

export class SocialLoginDto {
  @IsString()
  accessToken: string

  @IsEnum(SocialProvider)
  provider: SocialProvider
}
