import { ApiProperty } from "@nestjs/swagger"
import { Expose } from "class-transformer"

/**
 * 인증 상태 응답 DTO
 */
export class VerificationStatusResponseDto {
  @ApiProperty({
    description: "인증 세션 ID",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @Expose()
  sessionId: string

  @ApiProperty({
    description: "백준 ID",
    example: "solved_user123"
  })
  @Expose()
  handle: string

  @ApiProperty({
    description: "인증 문자열 (프로필 이름에 설정해야 하는 문자열)",
    example: "배부른고양이847293"
  })
  @Expose()
  verificationString: string

  @ApiProperty({
    description: "인증 상태",
    enum: ["PENDING", "COMPLETED", "FAILED", "EXPIRED"],
    example: "PENDING"
  })
  @Expose()
  status: string

  @ApiProperty({
    description: "현재 시도 횟수",
    example: 1
  })
  @Expose()
  attempts: number

  @ApiProperty({
    description: "최대 시도 횟수",
    example: 3
  })
  @Expose()
  maxAttempts: number

  @ApiProperty({
    description: "생성 시간",
    example: "2025-06-01T12:00:00.000Z"
  })
  @Expose()
  createdAt: string

  @ApiProperty({
    description: "만료 시간",
    example: "2025-06-01T13:00:00.000Z"
  })
  @Expose()
  expiresAt: string

  @ApiProperty({
    description: "완료 시간 (완료된 경우에만)",
    example: "2025-06-01T12:30:00.000Z",
    required: false
  })
  @Expose()
  completedAt?: string

  @ApiProperty({
    description: "실패 사유 (실패한 경우에만)",
    example: "인증 문자열이 일치하지 않습니다",
    required: false
  })
  @Expose()
  errorReason?: string
}
