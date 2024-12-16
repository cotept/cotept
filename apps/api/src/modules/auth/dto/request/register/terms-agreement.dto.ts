import { IsRequiredTerms } from "@/common/decorators/validation.decorators"
import { RegistrationRole } from "@/modules/auth/enums"
import { IsBoolean, IsEnum, IsString, IsUUID } from "class-validator"

// register/terms-agreement.dto.ts
export class TermsAgreementDto {
  @IsString()
  @IsUUID()
  registrationId: string

  @IsRequiredTerms()
  serviceTerms: boolean

  @IsRequiredTerms()
  privacyPolicy: boolean

  @IsBoolean()
  marketingConsent: boolean

  @IsEnum(RegistrationRole)
  role: RegistrationRole
}
