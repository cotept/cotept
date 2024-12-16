import { IsString, IsUUID, Length } from "class-validator"

export class EmailVerificationDto {
  @IsString()
  @Length(6)
  code: string

  @IsString()
  @IsUUID()
  registrationId: string
}
