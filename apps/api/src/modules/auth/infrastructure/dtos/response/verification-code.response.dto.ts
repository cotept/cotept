import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

/**
 * 인증 코드 발송 응답 DTO
 */
export class VerificationCodeResponseDto {
  @ApiProperty({
    description: '검증 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  @IsUUID('4')
  @IsNotEmpty()
  verificationId: string;

  @ApiProperty({
    description: '인증 만료 시간 (ISO 형식)',
    example: '2023-06-15T09:00:00.000Z',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  expiresAt: string;
}
