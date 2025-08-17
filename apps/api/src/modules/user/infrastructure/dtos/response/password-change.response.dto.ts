import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

/**
 * 비밀번호 변경 응답 DTO
 */
export class PasswordChangeResponseDto {
  @ApiProperty({
    description: '비밀번호 변경 성공 여부',
    example: true,
  })
  @Expose()
  success: boolean;

  @ApiProperty({
    description: '변경 완료 시간',
    example: '2023-01-01T00:00:00Z',
  })
  @Expose()
  changedAt: string;

  @ApiProperty({
    description: '응답 메시지',
    example: '비밀번호가 성공적으로 변경되었습니다.',
  })
  @Expose()
  message: string;
}