import { ApiProperty } from "@nestjs/swagger"
import { Expose } from "class-transformer"

/**
 * 백준 프로필 응답 DTO
 */
export class BaekjoonProfileResponseDto {
  @ApiProperty({
    description: "사용자 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @Expose()
  userId: string

  @ApiProperty({
    description: "백준 ID",
    example: "solved_user123",
  })
  @Expose()
  handle: string

  @ApiProperty({
    description: "현재 티어",
    example: "Gold V",
  })
  @Expose()
  tier: string

  @ApiProperty({
    description: "최고 티어",
    example: "Platinum V",
  })
  @Expose()
  maxTier: string

  @ApiProperty({
    description: "해결한 문제 수",
    example: 150,
  })
  @Expose()
  solvedCount: number

  @ApiProperty({
    description: "마지막 업데이트 시간",
    example: "2025-06-01T12:00:00.000Z",
  })
  @Expose()
  lastUpdated: string

  @ApiProperty({
    description: "멘토 자격 여부 (Platinum 3 이상)",
    example: true,
  })
  @Expose()
  isMentorEligible: boolean
}
