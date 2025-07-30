import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * 사용자 응답 DTO
 */
export class UserResponseDto {
  @ApiProperty({
    description: '사용자 고유 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
    required: false,
  })
  @Expose()
  name?: string;

  @ApiProperty({
    description: '사용자 역할',
    enum: ['MENTEE', 'MENTOR', 'ADMIN'],
    example: 'MENTEE',
  })
  @Expose()
  role: string;

  @ApiProperty({
    description: '사용자 상태',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    example: 'ACTIVE',
  })
  @Expose()
  status: string;

  @ApiProperty({
    description: '전화번호',
    example: '01012345678',
    required: false,
  })
  @Expose()
  phoneNumber?: string;

  @ApiProperty({
    description: '전화번호 인증 여부',
    example: false,
    required: false,
  })
  @Expose()
  phoneVerified?: boolean;

  @ApiProperty({
    description: '사용자 생성일',
    example: '2023-01-01T00:00:00Z',
  })
  @Expose()
  createdAt: string;

  @ApiProperty({
    description: '사용자 정보 수정일',
    example: '2023-01-01T00:00:00Z',
  })
  @Expose()
  updatedAt: string;

  @ApiProperty({
    description: '마지막 로그인 일시',
    example: '2023-01-01T00:00:00Z',
    required: false,
  })
  @Expose()
  lastLoginAt?: string;
}