import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';

/**
 * 인증 코드 확인 요청 DTO
 */
export class VerifyCodeRequestDto {
  @ApiProperty({
    description: '검증 ID',
    example: '1703123456789',
  })
  @Expose()
  @IsNumberString({}, { message: '유효한 검증 ID 형식이 아닙니다.' })
  @IsNotEmpty({ message: '검증 ID는 필수 입력 항목입니다.' })
  verificationId: string;

  @ApiProperty({
    description: '인증 코드 (6자리)',
    example: '123456',
  })
  @Expose()
  @IsString({ message: '인증 코드는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '인증 코드는 필수 입력 항목입니다.' })
  @Length(6, 6, { message: '인증 코드는 6자리여야 합니다.' })
  code: string;
}
