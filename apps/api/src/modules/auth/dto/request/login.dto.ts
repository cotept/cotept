import {
  ValidationPatterns,
  ValidationRules,
} from "@/common/constants/validation.constants"
import { IsPassword } from "@/common/decorators/validation.decorators"
import { IsEmail, MaxLength } from "class-validator"

export class LoginDto {
  @IsEmail({}, { message: ValidationPatterns.EMAIL.MESSAGE })
  @MaxLength(ValidationRules.EMAIL.MAX_LENGTH)
  email: string

  @IsPassword()
  password: string
}
