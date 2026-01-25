import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 토큰 갱신 요청 DTO
 */
export class RefreshTokenRequestDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '리프레시 토큰',
  })
  @Expose()
  @IsString({ message: '리프레시 토큰은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '리프레시 토큰은 필수 입력 항목입니다.' })
  refreshToken: string;
}
