import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsNotEmpty, IsNumber } from "class-validator"

/**
 * ID로 메일 감사 조회 요청 DTO
 */
export class GetMailAuditByIdRequestDto {
  @ApiProperty({
    description: "메일 감사 ID",
    example: 1,
  })
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  idx: number
}
