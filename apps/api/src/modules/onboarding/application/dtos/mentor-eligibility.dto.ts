import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsBoolean, IsString } from "class-validator"

/**
 * 멘토 자격 요건 확인 응답 DTO
 */
export class MentorEligibilityDto {
  @ApiProperty({ description: "멘토 자격 충족 여부", example: true })
  @Expose()
  @IsBoolean()
  isEligible: boolean

  @ApiProperty({ description: "현재 백준 티어", example: "Platinum III" })
  @Expose()
  @IsString()
  currentTier: string

  @ApiProperty({ description: "멘토 자격 요건", example: "백준 티어 플래티넘 3 이상" })
  @Expose()
  @IsString()
  requirement: string
}
