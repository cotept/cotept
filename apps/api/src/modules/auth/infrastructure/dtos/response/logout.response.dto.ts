import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * 로그아웃 응답 DTO
 */
export class LogoutResponseDto {
  @ApiProperty({
    description: '로그아웃 성공 여부',
    example: true,
  })
  @Expose()
  success: boolean;

  @ApiProperty({
    description: '로그아웃 완료 시간',
    example: '2023-01-01T00:00:00Z',
  })
  @Expose()
  loggedOutAt: string;

  @ApiProperty({
    description: '응답 메시지',
    example: '성공적으로 로그아웃되었습니다.',
  })
  @Expose()
  message: string;
}