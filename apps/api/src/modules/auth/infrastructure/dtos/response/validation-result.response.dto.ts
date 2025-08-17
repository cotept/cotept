import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';
import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * 토큰 검증 결과 응답 DTO
 */
export class ValidationResultResponseDto {
  @ApiProperty({
    example: true,
    description: '토큰 유효 여부',
  })
  @Expose()
  @IsBoolean()
  isValid: boolean;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: '사용자 ID',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: '사용자 이메일',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'MENTEE',
    description: '사용자 역할',
    required: false,
    enum: ['MENTEE', 'MENTOR', 'ADMIN'],
  })
  @Expose()
  @IsOptional()
  @IsString()
  role?: string;
}
