import { Expose } from "class-transformer"
import { IsNotEmpty, IsString, IsUUID, Length } from "class-validator"

/**
 * 인증 코드 확인 DTO
 */
export class VerifyCodeDto {
  @Expose()
  @IsUUID("4", { message: "유효한 검증 ID 형식이 아닙니다." })
  @IsNotEmpty({ message: "검증 ID는 필수 입력 항목입니다." })
  verificationId: string

  @Expose()
  @IsString({ message: "인증 코드는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 코드는 필수 입력 항목입니다." })
  @Length(6, 6, { message: "인증 코드는 6자리여야 합니다." })
  code: string
}
