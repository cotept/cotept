import {
  IsBojId,
  IsKoreanPhone,
  IsRequiredTerms,
} from "@/common/decorators/validation.decorators"
import { AuthProvider } from "@/modules/auth/enums/auth-provider.enum"
import { IsBoolean, IsEnum, IsString } from "class-validator"

export class SocialRegisterDto {
  @IsString()
  socialAccessToken: string

  @IsEnum(AuthProvider)
  provider: AuthProvider

  @IsBojId()
  bojId: string

  @IsKoreanPhone()
  phone: string

  @IsRequiredTerms()
  serviceTerms: boolean

  @IsRequiredTerms()
  privacyPolicy: boolean

  @IsBoolean()
  marketingConsent: boolean
}
