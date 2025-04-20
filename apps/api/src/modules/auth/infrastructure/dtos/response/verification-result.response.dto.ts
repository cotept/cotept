import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

/**
 * 인증 코드 확인 결과 응답 DTO
 */
export class VerificationResultResponseDto {
  @ApiProperty({
    description: '인증 성공 여부',
    example: true,
  })
  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  success: boolean;
}
