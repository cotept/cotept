import { ApiProperty } from "@nestjs/swagger"

import { IsBoolean, IsNumber, IsString } from "class-validator"

/**
 * 온보딩 상태 조회 요청 DTO
 */
export class GetOnboardingStateDto {
  @ApiProperty({
    description: "사용자 ID",
    example: "user-uuid-123",
  })
  @IsString()
  userId: string
}

/**
 * 온보딩 상태 조회 응답 DTO
 */
export class OnboardingStateResponseDto {
  @ApiProperty({
    description: "사용자 ID",
    example: "user-uuid-123",
  })
  userId: string

  @ApiProperty({
    description: "현재 온보딩 단계",
    example: 1,
  })
  @IsNumber()
  currentStep: number

  @ApiProperty({
    description: "프로필 생성 완료 여부",
    example: true,
  })
  @IsBoolean()
  profileCreated: boolean

  @ApiProperty({
    description: "백준 인증 완료 여부",
    example: false,
  })
  @IsBoolean()
  baekjoonVerified: boolean

  @ApiProperty({
    description: "스킬 분석 완료 여부",
    example: false,
  })
  @IsBoolean()
  skillAnalysisCompleted: boolean

  @ApiProperty({
    description: "멘토 프로필 생성 완료 여부",
    example: false,
  })
  @IsBoolean()
  mentorProfileCreated: boolean

  @ApiProperty({
    description: "온보딩 완료 여부",
    example: true,
  })
  @IsBoolean()
  isCompleted: boolean

  @ApiProperty({
    description: "백준 연동 완료 여부",
    example: false,
  })
  @IsBoolean()
  hasBaekjoonLinked: boolean

  @ApiProperty({
    description: "온보딩 완료 일시",
    example: "2024-01-01T00:00:00.000Z",
    required: false,
  })
  completedAt?: Date
}
