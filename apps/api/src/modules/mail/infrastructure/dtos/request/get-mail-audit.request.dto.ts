import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsOptional, IsString, IsUUID } from "class-validator"

/**
 * 메일 감사 조회 요청 DTO
 */
export class GetMailAuditRequestDto {
  @ApiProperty({
    description: "메일 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsUUID("4")
  mailId?: string

  @ApiProperty({
    description: "수신자 이메일",
    example: "user@example.com",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString()
  recipient?: string

  @ApiProperty({
    description: "메일 템플릿",
    example: "email_verification",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString()
  template?: string
}
