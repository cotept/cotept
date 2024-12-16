import { IsKoreanPhone } from "@/common/decorators/validation.decorators"
import { IsString, IsUUID } from "class-validator"

export class SendPhoneVerificationDto {
  @IsKoreanPhone()
  phone: string

  @IsString()
  @IsUUID()
  registrationId: string
}
