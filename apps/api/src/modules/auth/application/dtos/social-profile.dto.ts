import { Expose, Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl } from 'class-validator';
import { SocialProvider } from './social-login.dto';

/**
 * 소셜 프로필 정보 DTO
 */
export class SocialProfileDto {
  @Expose()
  @IsString({ message: '소셜 ID는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '소셜 ID는 필수 입력 항목입니다.' })
  id: string;

  @Expose()
  @IsOptional()
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  email?: string;

  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @Expose()
  @IsOptional()
  @IsUrl({}, { message: '유효한 URL 형식이 아닙니다.' })
  profileImageUrl?: string;

  @Expose()
  @IsEnum(SocialProvider, { message: '유효한 소셜 로그인 제공자가 아닙니다.' })
  @IsNotEmpty({ message: '소셜 로그인 제공자는 필수 입력 항목입니다.' })
  provider: SocialProvider;

  @Expose()
  @IsOptional()
  @IsString()
  accessToken?: string;

  @Expose()
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @Expose()
  @IsOptional()
  @IsObject()
  @Type(() => Object)
  raw?: Record<string, any>;
}
