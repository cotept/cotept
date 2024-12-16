import { IsBojId } from "@/common/decorators/validation.decorators"
import { IsString, IsUUID } from "class-validator"

// register/boj-verification.dto.ts
export class BojVerificationDto {
  @IsString()
  @IsUUID()
  registrationId: string

  @IsBojId()
  bojId: string
}
