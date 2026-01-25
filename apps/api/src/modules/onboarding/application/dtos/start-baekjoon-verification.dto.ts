import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsNotEmpty, IsString } from "class-validator"

/**
 * 백준 인증 시작을 위한 DTO
 */
export class StartBaekjoonVerificationDto {
  @ApiProperty({ description: "사용자 ID", example: "user123" })
  @Expose()
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty({ description: "백준 핸들", example: "solved_user123" })
  @Expose()
  @IsString()
  @IsNotEmpty()
  baekjoonHandle: string
}
