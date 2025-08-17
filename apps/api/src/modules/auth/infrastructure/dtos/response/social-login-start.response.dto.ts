import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

/**
 * 소셜 로그인 시작 응답 DTO
 */
export class SocialLoginStartResponseDto {
  @ApiProperty({
    description: '인증 시작 성공 여부',
    example: true,
  })
  @Expose()
  success: boolean;

  @ApiProperty({
    description: '소셜 제공자',
    enum: ['GITHUB', 'GOOGLE'],
    example: 'GITHUB',
  })
  @Expose()
  provider: string;

  @ApiProperty({
    description: '응답 메시지',
    example: 'GitHub 인증 페이지로 리다이렉트 중...',
  })
  @Expose()
  message: string;

  @ApiProperty({
    description: '인증 시작 시간',
    example: '2023-01-01T00:00:00Z',
  })
  @Expose()
  startedAt: string;
}