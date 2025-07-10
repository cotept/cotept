import { IsEmail, IsNotEmpty, IsString } from "class-validator"

/**
 * 인증 시작 입력 DTO
 * 백준 ID 인증을 시작하기 위한 입력 데이터
 */
export class StartVerificationInputDto {
  @IsEmail({}, { message: "유효한 이메일 형식이 아닙니다." })
  @IsNotEmpty({ message: "이메일은 필수 값입니다." })
  email: string

  @IsNotEmpty({ message: "백준 ID는 필수입니다" })
  @IsString({ message: "백준 ID는 문자열이어야 합니다" })
  handle: string
}