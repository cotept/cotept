import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

/**
 * 사용자 삭제 요청 DTO
 */
export class DeleteUserRequestDto {
  @ApiProperty({
    description: '삭제 사유',
    example: '사용자 요청에 의한 계정 삭제',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString({ message: '삭제 사유는 문자열이어야 합니다.' })
  reason?: string;

  @ApiProperty({
    description: '삭제 확인을 위한 비밀번호',
    example: 'UserP@ss123',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  password?: string;
}