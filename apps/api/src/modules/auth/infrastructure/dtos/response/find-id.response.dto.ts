import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

/**
 * 아이디 찾기 응답 DTO
 */
export class FindIdResponseDto {
  @ApiProperty({
    description: '마스킹된 아이디',
    example: 'u***123',
    required: false,
  })
  @Expose()
  maskedId?: string;
}