import { IsBoolean, IsDate, IsEnum, IsString, IsUUID } from "class-validator"
import { RegistrationStatus } from "../../enums"

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

  @IsString()
  nextStep?: string // 다음 단계 엔드포인트 정보

  @IsBoolean()
  canProceed?: boolean // 다음 단계 진행 가능 여부
}
