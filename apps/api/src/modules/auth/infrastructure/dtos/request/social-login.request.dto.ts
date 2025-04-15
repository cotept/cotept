import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { SocialProvider } from '@/modules/auth/application/dtos/social-login.dto';

/**
 * 소셜 로그인 요청 DTO
 */
export class SocialLoginRequestDto {
  @ApiProperty({
    description: '소셜 로그인 제공자',
    enum: SocialProvider,
    example: SocialProvider.GOOGLE,
  })
  @Expose()
  @IsEnum(SocialProvider, { message: '유효한 소셜 로그인 제공자가 아닙니다.' })
  @IsNotEmpty({ message: '소셜 로그인 제공자는 필수 입력 항목입니다.' })
  provider: SocialProvider;

  @ApiProperty({
    description: '인증 코드',
    example: 'abcdefghijklmnopqrstuvwxyz',
  })
  @Expose()
  @IsString({ message: '인증 코드는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '인증 코드는 필수 입력 항목입니다.' })
  code: string;

  @ApiProperty({
    description: '리다이렉트 URI',
    example: 'https://cotept.com/auth/google/callback',
  })
  @Expose()
  @IsUrl({}, { message: '유효한 URL 형식이 아닙니다.' })
  @IsNotEmpty({ message: '리다이렉트 URI는 필수 입력 항목입니다.' })
  redirectUri: string;
}
