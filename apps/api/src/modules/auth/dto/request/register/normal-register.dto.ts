import {
  ValidationPatterns,
  ValidationRules,
} from "@/common/constants/validation.constants"
import {
  IsBojId,
  IsKoreanPhone,
  IsPassword,
  IsRequiredTerms,
} from "@/common/decorators/validation.decorators"
import { IsBoolean, IsEmail, MaxLength } from "class-validator"

export class NormalRegisterDto {
  @IsEmail({}, { message: ValidationPatterns.EMAIL.MESSAGE })
  @MaxLength(ValidationRules.EMAIL.MAX_LENGTH)
  email: string

  @IsPassword()
  password: string

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
