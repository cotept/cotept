import { ApiProperty } from "@nestjs/swagger"

import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator"

/**
 * 비밀번호 재설정 요청 DTO
 */
export class ResetPasswordRequestDto {
  @ApiProperty({
    description: "사용자 이메일",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "유효한 이메일 주소를 입력해주세요." })
  @IsNotEmpty({ message: "이메일은 필수 항목입니다." })
  email: string

  @ApiProperty({
    description: "인증 ID (인증 코드 발송 후 받은 ID)",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  @IsString({ message: "인증 ID는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 ID는 필수 항목입니다." })
  verificationId: string

  @ApiProperty({
    description: "인증 코드",
    example: "123456",
  })
  @IsString({ message: "인증 코드는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 코드는 필수 항목입니다." })
  @Length(6, 6, { message: "인증 코드는 6자리여야 합니다." })
  verificationCode: string

  @ApiProperty({
    description: "새 비밀번호",
    example: "NewPassword123!",
  })
  @IsString({ message: "비밀번호는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "비밀번호는 필수 항목입니다." })
  @Length(8, 20, { message: "비밀번호는 8자 이상 20자 이하여야 합니다." })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: "비밀번호는 최소 8자 이상이며, 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.",
  })
  newPassword: string
}
