import { IsDate, IsEnum, IsString, IsUUID } from "class-validator"
import { RegistrationStatus } from "../../enums/registration-status.enum"

export class RegistrationResponseDto {
  @IsString()
  @IsUUID()
  registrationId: string

  @IsEnum(RegistrationStatus)
  status: RegistrationStatus

  @IsString()
  message: string

  @IsDate()
  expiresAt: Date
}
