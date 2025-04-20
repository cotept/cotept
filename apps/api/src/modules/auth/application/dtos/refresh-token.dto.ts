import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * 토큰 갱신 DTO
 */
export class RefreshTokenDto {
  @Expose()
  @IsString({ message: '리프레시 토큰은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '리프레시 토큰은 필수 입력 항목입니다.' })
  refreshToken: string;

  @Expose()
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @Expose()
  @IsOptional()
  @IsString()
  userAgent?: string;
}
