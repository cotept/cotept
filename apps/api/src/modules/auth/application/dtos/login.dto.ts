import { Expose } from "class-transformer"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

/**
 * 로그인 DTO
 */
export class LoginDto {
  @Expose()
  @IsString({ message: "아이디는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "아이디는 필수 입력 항목입니다." })
  id: string

  @Expose()
  @IsString({ message: "비밀번호는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "비밀번호는 필수 입력 항목입니다." })
  password: string

  @Expose()
  @IsOptional()
  @IsString()
  ipAddress?: string

  @Expose()
  @IsOptional()
  @IsString()
  userAgent?: string
}
