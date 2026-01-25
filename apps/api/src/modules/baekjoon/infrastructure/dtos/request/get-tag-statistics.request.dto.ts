import { ApiProperty } from "@nestjs/swagger"

import { IsNotEmpty, IsString } from "class-validator"
/**
 * 사용자 태그 통계 요청 DTO
 */
export class GetTagStatisticsRequestDto {
  @ApiProperty({
    description: "사용자 ID",
    example: "user123",
  })
  @IsString({ message: "사용자 ID는 문자열이어야 합니다" })
  @IsNotEmpty({ message: "사용자 ID는 필수 값입니다." })
  userId: string

  @ApiProperty({
    description: "백준 ID",
    example: "solved_user123",
  })
  @IsNotEmpty({ message: "백준 ID는 필수입니다" })
  @IsString({ message: "백준 ID는 문자열이어야 합니다" })
  handle: string
}
