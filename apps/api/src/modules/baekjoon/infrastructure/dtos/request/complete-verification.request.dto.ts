import { ApiProperty } from "@nestjs/swagger"

import { IsNotEmpty, IsString, IsUUID } from "class-validator"

/**
 * 인증 완료 요청 DTO
 */
export class CompleteVerificationRequestDto {
  @ApiProperty({
    description: "인증 세션 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
    format: "uuid",
  })
  @IsNotEmpty({ message: "세션 ID는 필수입니다" })
  @IsString({ message: "세션 ID는 문자열이어야 합니다" })
  @IsUUID("4", { message: "올바른 UUID 형식이어야 합니다" })
  sessionId: string

  @ApiProperty({
    description: "사용자 ID",
    example: "user123",
  })
  @IsString({ message: "사용자 ID는 문자열이어야 합니다" })
  @IsNotEmpty({ message: "사용자 ID는 필수 값입니다." })
  userId: string

  @ApiProperty({
    description: "백준 ID (사용자명)",
    example: "solved_user123",
  })
  @IsNotEmpty({ message: "백준 ID는 필수입니다" })
  @IsString({ message: "백준 ID는 문자열이어야 합니다" })
  handle: string
}
