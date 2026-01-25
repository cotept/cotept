import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsNotEmpty, IsString } from "class-validator"

/**
 * 온보딩 완료를 위한 DTO
 */
export class CompleteOnboardingDto {
  @ApiProperty({ description: "사용자 ID", example: "user123" })
  @Expose()
  @IsString()
  @IsNotEmpty()
  userId: string
}
