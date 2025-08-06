import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsArray, IsDateString, IsEnum, IsObject, IsOptional, IsString, IsUUID } from "class-validator"
import { MailStatus } from '@/modules/mail/domain/model/mail-audit'

/**
 * 메일 감사 응답 DTO
 */
export class MailAuditResponseDto {
  @ApiProperty({
    description: "메일 감사 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @Expose()
  @IsUUID("4")
  id: string

  @ApiProperty({
    description: "메일 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @Expose()
  @IsUUID("4")
  mailId: string

  @ApiProperty({
    description: "메일 템플릿",
    example: "email_verification",
  })
  @Expose()
  @IsString()
  template: string

  @ApiProperty({
    description: "수신자 목록",
    example: ["user@example.com", "admin@example.com"],
    type: [String],
  })
  @Expose()
  @IsArray()
  @IsString({ each: true })
  recipients: string[]

  @ApiProperty({
    description: "메일 상태",
    example: MailStatus.SENT,
    enum: MailStatus,
    enumName: 'MailStatus',
  })
  @Expose()
  @IsEnum(MailStatus)
  status: MailStatus

  @ApiProperty({
    description: "발송 시간",
    example: "2023-06-15T09:30:00.000Z",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsDateString()
  sentAt: string | null

  @ApiProperty({
    description: "오류 메시지",
    example: "SMTP connection failed",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString()
  error?: string

  @ApiProperty({
    description: "생성 시간",
    example: "2023-06-15T09:25:00.000Z",
  })
  @Expose()
  @IsDateString()
  createdAt: string

  @ApiProperty({
    description: "메일 컨텍스트 데이터",
    example: { username: "john_doe", verificationCode: "123456" },
  })
  @Expose()
  @IsObject()
  context: Record<string, any>

  @ApiProperty({
    description: "언어 설정",
    example: "ko",
  })
  @Expose()
  @IsString()
  locale: string
}
