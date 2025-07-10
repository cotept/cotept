import { ApiProperty } from "@nestjs/swagger"

import { IsEmail, IsNotEmpty, IsString } from "class-validator"

/**
 * 프로필 조회 요청 DTO
 */
export class GetProfileRequestDto {
  @ApiProperty({
    description: "사용자 이메일",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "유효한 이메일 형식이 아닙니다." })
  @IsNotEmpty({ message: "이메일은 필수 값입니다." })
  email: string

  @ApiProperty({
    description: "백준 ID",
    example: "solved_user123",
  })
  @IsNotEmpty({ message: "백준 ID는 필수입니다" })
  @IsString({ message: "백준 ID는 문자열이어야 합니다" })
  handle: string
}
