import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 토큰 검증 DTO
 */
export class ValidateTokenDto {
  @Expose()
  @IsString({ message: '토큰은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '토큰은 필수 입력 항목입니다.' })
  token: string;
}
