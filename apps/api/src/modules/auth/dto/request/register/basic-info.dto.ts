import {
  ValidationPatterns,
  ValidationRules,
} from "@/common/constants/validation.constants"
import { IsPassword } from "@/common/decorators/validation.decorators"
import { IsEmail, IsString, IsUUID, MaxLength } from "class-validator"

// register/basic-info.dto.ts
export class BasicInfoDto {
  @IsString()
  @IsUUID()
  registrationId: string

  @IsEmail({}, { message: ValidationPatterns.EMAIL.MESSAGE })
  @MaxLength(ValidationRules.EMAIL.MAX_LENGTH)
  email: string

  @IsPassword()
  password: string
}
