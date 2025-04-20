import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

/**
 * 인증 코드 교환 요청 DTO
 */
export class ExchangeAuthCodeRequestDto {
  @ApiProperty({
    example: 'a1b2c3d4...',
    description: '인증 코드',
  })
  @Expose()
  @IsString({ message: '인증 코드는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '인증 코드는 필수 입력 항목입니다.' })
  code: string;
}