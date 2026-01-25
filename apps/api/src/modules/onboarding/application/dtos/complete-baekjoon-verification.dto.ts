import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsNotEmpty, IsString } from "class-validator"

/**
 * 백준 인증 완료를 위한 DTO
 */
export class CompleteBaekjoonVerificationDto {
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

  @ApiProperty({ description: "인증 세션 ID", example: "550e8400-e29b-41d4-a716-446655440000" })
  @Expose()
  @IsString()
  @IsNotEmpty()
  verificationSessionId: string
}
