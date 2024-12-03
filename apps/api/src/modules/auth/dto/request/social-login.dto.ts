import { IsEnum, IsOptional, IsString } from "class-validator"
import { AuthProvider } from "../../../../../../../shared/enums/social-provider.enum"

export class SocialLoginDto {
  @IsString()
  accessToken: string

  @IsEnum(AuthProvider)
  provider: AuthProvider

  @IsString()
  @IsOptional()
  deviceId?: string
}
