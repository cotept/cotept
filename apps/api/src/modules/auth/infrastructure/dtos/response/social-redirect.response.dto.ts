import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

/**
 * 소셜 로그인 리다이렉트 응답 DTO
 */
export class SocialRedirectResponseDto {
  @ApiProperty({
    description: '리다이렉트 URL',
    example: 'https://client.example.com/auth/callback?code=abc123',
  })
  @Expose()
  redirectUrl: string;

  @ApiProperty({
    description: '리다이렉트 상태',
    enum: ['SUCCESS', 'PENDING', 'ERROR'],
    example: 'SUCCESS',
  })
  @Expose()
  status: string;

  @ApiProperty({
    description: '응답 메시지',
    example: '소셜 로그인이 성공적으로 처리되었습니다.',
  })
  @Expose()
  message: string;

  @ApiProperty({
    description: '처리 시간',
    example: '2023-01-01T00:00:00Z',
  })
  @Expose()
  processedAt: string;
}