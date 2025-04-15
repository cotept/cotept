import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * 로그인 DTO
 */
export class LoginDto {
  @Expose()
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email: string;

  @Expose()
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  password: string;

  @Expose()
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @Expose()
  @IsOptional()
  @IsString()
  userAgent?: string;
}
