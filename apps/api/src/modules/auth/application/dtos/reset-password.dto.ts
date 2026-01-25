import { Expose } from "class-transformer"
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from "class-validator"

/**
 * 비밀번호 재설정 DTO
 * 인증된 사용자의 비밀번호를 재설정하기 위한 정보
 */
export class ResetPasswordDto {
  /** 사용자 이메일 */
  @Expose()
  @IsEmail({}, { message: "유효한 이메일 주소를 입력해주세요." })
  @IsNotEmpty({ message: "이메일은 필수 항목입니다." })
  email: string

  /** 인증 ID (인증 코드 발송 후 받은 ID) */
  @Expose()
  @IsString({ message: "인증 ID는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 ID는 필수 항목입니다." })
  verificationId: string

  /** 인증 코드 */
  @Expose()
  @IsString({ message: "인증 코드는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 코드는 필수 항목입니다." })
  @Length(6, 6, { message: "인증 코드는 6자리여야 합니다." })
  verificationCode: string

  /** 새 비밀번호 */
  @Expose()
  @IsString({ message: "비밀번호는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "비밀번호는 필수 항목입니다." })
  @Length(8, 20, { message: "비밀번호는 8자 이상 20자 이하여야 합니다." })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: "비밀번호는 최소 8자 이상이며, 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.",
  })
  newPassword: string

  /** IP 주소 */
  @Expose()
  @IsOptional()
  @IsString({ message: "IP 주소는 문자열이어야 합니다." })
  ipAddress?: string
}
