import { ApiProperty } from "@nestjs/swagger"

import { IsString } from "class-validator"

/**
 * 백준 연동 건너뛰기 요청 DTO
 */
export class SkipBaekjoonDto {
  @ApiProperty({
    description: "사용자 ID",
    example: "user-uuid-123",
  })
  @IsString()
  userId: string
}

/**
 * 백준 연동 건너뛰기 응답 DTO
 */
export class SkipBaekjoonResponseDto {
  @ApiProperty({
    description: "온보딩 완료 여부",
    example: true,
  })
  onboardingCompleted: boolean

  @ApiProperty({
    description: "백준 연동 상태",
    example: false,
  })
  baekjoonLinked: boolean
}
