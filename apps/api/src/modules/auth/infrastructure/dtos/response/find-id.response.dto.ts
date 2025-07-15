import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * 아이디 찾기 응답 DTO
 */
export class FindIdResponseDto {
  @ApiProperty({
    description: '찾기 성공 여부',
    example: true,
  })
  @Expose()
  success: boolean;

  @ApiProperty({
    description: '마스킹된 아이디',
    example: 'u***123',
    required: false,
  })
  @Expose()
  maskedId?: string;


  @ApiProperty({
    description: '응답 메시지',
    example: '가입된 아이디를 찾았습니다.',
  })
  @Expose()
  message: string;
}