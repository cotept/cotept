import { IsKoreanPhone } from "@/common/decorators/validation.decorators"
import { IsString, IsUUID, Length } from "class-validator"

export class PhoneVerificationDto {
  @IsKoreanPhone()
  phone: string

  @IsString()
  @Length(6)
  code: string

  @IsString()
  @IsUUID()
  registrationId: string
}
