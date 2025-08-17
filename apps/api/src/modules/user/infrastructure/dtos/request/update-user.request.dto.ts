import { ApiProperty } from '@nestjs/swagger';

import { Expose, Transform } from 'class-transformer';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

/**
 * 사용자 수정 요청 DTO
 */
export class UpdateUserRequestDto {
  @ApiProperty({
    description: '사용자 이름 (2~50자, 한글/영문만 허용)',
    example: '홍길동',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @Transform(({ value }) => value?.trim())
  @Length(2, 50, { message: '이름은 2자 이상 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, { message: '이름은 한글과 영문자만 허용됩니다.' })
  name?: string;

  @ApiProperty({
    description: '전화번호 (- 없이 숫자만)',
    example: '01012345678',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @Transform(({ value }) => value?.replace(/[^0-9]/g, ''))
  @Matches(/^01[0-9]{8,9}$/, { message: '유효한 한국 휴대폰 번호 형식이 아닙니다.' })
  phoneNumber?: string;
}