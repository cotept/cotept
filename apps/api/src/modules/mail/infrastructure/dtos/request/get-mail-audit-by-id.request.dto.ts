import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsNotEmpty, IsUUID } from "class-validator"

/**
 * ID로 메일 감사 조회 요청 DTO
 */
export class GetMailAuditByIdRequestDto {
  @ApiProperty({
    description: "메일 감사 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @Expose()
  @IsUUID("4")
  @IsNotEmpty()
  id: string
}
