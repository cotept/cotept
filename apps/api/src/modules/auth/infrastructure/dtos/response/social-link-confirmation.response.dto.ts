import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

/**
 * 소셜 계정 연결 확인 응답 DTO
 */
export class SocialLinkConfirmationResponseDto {
  @ApiProperty({
    description: '연결 처리 성공 여부',
    example: true,
  })
  @Expose()
  success: boolean;

  @ApiProperty({
    description: '연결 상태',
    enum: ['LINKED', 'REJECTED', 'PENDING'],
    example: 'LINKED',
  })
  @Expose()
  linkStatus: string;

  @ApiProperty({
    description: '처리 완료 시간',
    example: '2023-01-01T00:00:00Z',
  })
  @Expose()
  processedAt: string;

  @ApiProperty({
    description: '응답 메시지',
    example: '소셜 계정이 성공적으로 연결되었습니다.',
  })
  @Expose()
  message: string;
}