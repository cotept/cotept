import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"

/**
 * 인증 결과 응답 DTO
 */
export class VerificationResultResponseDto {
  @ApiProperty({
    description: "인증 성공 여부",
    example: true,
  })
  @Expose()
  success: boolean

  @ApiProperty({
    description: "인증 세션 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @Expose()
  sessionId: string

  @ApiProperty({
    description: "인증 상태",
    enum: ["PENDING", "COMPLETED", "FAILED", "EXPIRED"],
    example: "COMPLETED",
  })
  @Expose()
  status: string

  @ApiProperty({
    description: "결과 메시지",
    example: "백준 ID 인증이 완료되었습니다",
  })
  @Expose()
  message: string

  @ApiProperty({
    description: "완료 시간 (성공한 경우에만)",
    example: "2025-06-01T12:30:00.000Z",
    required: false,
  })
  @Expose()
  completedAt?: string

  @ApiProperty({
    description: "실패 사유 (실패한 경우에만)",
    example: "인증 문자열이 일치하지 않습니다",
    required: false,
  })
  @Expose()
  errorReason?: string

  @ApiProperty({
    description: "현재 시도 횟수",
    example: 2,
  })
  @Expose()
  attempts: number

  @ApiProperty({
    description: "남은 시도 횟수",
    example: 1,
  })
  @Expose()
  remainingAttempts: number
}
