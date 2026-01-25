import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsNotEmpty, IsString } from "class-validator"

/**
 * 멘토 자격 요건 확인을 위한 DTO
 */
export class CheckMentorEligibilityDto {
  @ApiProperty({ description: "사용자 ID", example: "user123" })
  @Expose()
  @IsString()
  @IsNotEmpty()
  userId: string
}
