import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

/**
 * 토큰 응답 DTO
 */
export class TokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '액세스 토큰',
  })
  @Expose()
  @IsString()
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '리프레시 토큰',
  })
  @Expose()
  @IsString()
  refreshToken: string;

  @ApiProperty({
    example: 'Bearer',
    description: '토큰 타입',
  })
  @Expose()
  @IsString()
  tokenType: string;

  @ApiProperty({
    example: 1800,
    description: '액세스 토큰 만료 시간(초)',
  })
  @Expose()
  @IsNumber()
  expiresIn: number;
}
