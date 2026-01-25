import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsBoolean } from "class-validator"

/**
 * 중복 확인 응답 DTO
 */
export class AvailabilityResponseDto {
  @ApiProperty({
    description: "사용 가능 여부",
    example: true,
    type: Boolean,
  })
  @Expose()
  @IsBoolean()
  available: boolean
}
