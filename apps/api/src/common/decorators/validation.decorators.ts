import { applyDecorators } from "@nestjs/common"
import {
  Equals,
  IsBoolean,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator"
import {
  ValidationPatterns,
  ValidationRules,
} from "../constants/validation.constants"

export function IsPassword() {
  return applyDecorators(
    IsString(),
    MinLength(ValidationRules.PASSWORD.MIN_LENGTH),
    MaxLength(ValidationRules.PASSWORD.MAX_LENGTH),
    Matches(ValidationPatterns.PASSWORD.PATTERN, {
      message: ValidationPatterns.PASSWORD.MESSAGE,
    }),
  )
}

export function IsBojId() {
  return applyDecorators(
    IsString(),
    MinLength(ValidationRules.BOJ_ID.MIN_LENGTH),
    MaxLength(ValidationRules.BOJ_ID.MAX_LENGTH),
    Matches(ValidationPatterns.BOJ_ID.PATTERN, {
      message: ValidationPatterns.BOJ_ID.MESSAGE,
    }),
  )
}

export function IsKoreanPhone() {
  return applyDecorators(
    IsString(),
    Matches(ValidationPatterns.PHONE.PATTERN, {
      message: ValidationPatterns.PHONE.MESSAGE,
    }),
  )
}

export function IsRequiredTerms(message: string = "필수 약관에 동의해주세요") {
  return applyDecorators(IsBoolean(), Equals(true, { message }))
}
