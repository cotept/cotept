import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

/**
 * 사용자 삭제 응답 DTO
 */
export class UserDeletionResponseDto {
  @ApiProperty({
    description: '삭제 성공 여부',
    example: true,
  })
  @Expose()
  success: boolean;

  @ApiProperty({
    description: '삭제된 사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  deletedUserId: string;

  @ApiProperty({
    description: '삭제 완료 시간',
    example: '2023-01-01T00:00:00Z',
  })
  @Expose()
  deletedAt: string;

  @ApiProperty({
    description: '응답 메시지',
    example: '사용자가 성공적으로 삭제되었습니다.',
  })
  @Expose()
  message: string;
}