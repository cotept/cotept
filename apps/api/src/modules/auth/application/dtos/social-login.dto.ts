import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

/**
 * 소셜 로그인 제공자 유형
 */
export enum SocialProvider {
  GOOGLE = 'google',
  KAKAO = 'kakao',
  NAVER = 'naver',
  GITHUB = 'github'
}

/**
 * 소셜 로그인 DTO
 */
export class SocialLoginDto {
  @Expose()
  @IsEnum(SocialProvider, { message: '유효한 소셜 로그인 제공자가 아닙니다.' })
  @IsNotEmpty({ message: '소셜 로그인 제공자는 필수 입력 항목입니다.' })
  provider: SocialProvider;

  @Expose()
  @IsString({ message: '인증 코드는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '인증 코드는 필수 입력 항목입니다.' })
  code: string;

  @Expose()
  @IsUrl({}, { message: '유효한 URL 형식이 아닙니다.' })
  @IsNotEmpty({ message: '리다이렉트 URI는 필수 입력 항목입니다.' })
  redirectUri: string;

  @Expose()
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @Expose()
  @IsOptional()
  @IsString()
  userAgent?: string;
}
