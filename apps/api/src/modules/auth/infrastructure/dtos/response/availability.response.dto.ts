import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

/**
 * 중복 확인 응답 DTO
 */
export class AvailabilityResponseDto {
  @ApiProperty({ 
    description: "사용 가능 여부", 
    example: true,
    type: Boolean
  })
  @Expose()
  @IsBoolean()
  available: boolean

  @ApiProperty({ 
    description: "메시지 (중복 시에만 표시)", 
    example: "이미 사용 중인 이메일입니다",
    required: false,
    type: String
  })
  @Expose()
  @IsOptional()
  @IsString()
  message?: string
}