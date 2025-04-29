import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * 소셜 로그인 토큰 응답 정보 DTO
 */
export class SocialTokenResponseDto {
  @Expose()
  @IsString({ message: '액세스 토큰은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '액세스 토큰은 필수 입력 항목입니다.' })
  accessToken: string;
  
  @Expose()
  @IsOptional()
  @IsString()
  refreshToken?: string;
  
  @Expose()
  @IsOptional()
  @IsString()
  tokenType?: string;
  
  @Expose()
  @IsOptional()
  @IsNumber()
  expiresIn?: number;
  
  @Expose()
  @IsOptional()
  @IsString()
  scope?: string;
}
