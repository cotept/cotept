import { ApiProperty } from "@nestjs/swagger"

import { Expose, Type } from "class-transformer"

import { UserProfileDto } from "@/modules/user-profile/application/dtos/user-profile.dto"

/**
 * 회원가입 시 기본 프로필 생성 응답 DTO
 * 회원가입 프로세스에서 기본 프로필 생성 API의 응답 구조
 */
export class BasicProfileCreationResponseDto {
  @ApiProperty({
    description: "생성된 기본 프로필 정보",
    type: UserProfileDto,
  })
  @Expose()
  @Type(() => UserProfileDto)
  profile: UserProfileDto

  @ApiProperty({
    description: "프로필 완성도 정보",
    type: "object",
    properties: {
      hasBasicInfo: { type: "boolean", description: "기본 정보 완성 여부" },
      isComplete: { type: "boolean", description: "프로필 완성 여부" },
      missingFields: { type: "array", items: { type: "string" }, description: "누락된 필드들" },
    },
  })
  @Expose()
  completeness: {
    hasBasicInfo: boolean
    isComplete: boolean
    missingFields: string[]
  }

  @ApiProperty({
    description: "다음 단계 가이드 메시지",
    type: [String],
    example: [
      "실명을 입력하여 프로필을 완성해주세요.",
      "프로필 사진을 등록하여 더 친근한 인상을 만들어보세요."
    ],
  })
  @Expose()
  nextSteps: string[]

  @ApiProperty({
    description: "응답 메시지",
    example: "회원가입 기본 프로필이 성공적으로 생성되었습니다.",
  })
  @Expose()
  message: string

  @ApiProperty({
    description: "완성도 점수 (0-100)",
    example: 50,
  })
  @Expose()
  completenessScore: number

  constructor(
    signupResult: {
      profile: UserProfileDto
      completeness: {
        hasBasicInfo: boolean
        isComplete: boolean
        missingFields: string[]
      }
      nextSteps: string[]
    },
    message: string = "회원가입 기본 프로필이 성공적으로 생성되었습니다.",
  ) {
    this.profile = signupResult.profile
    this.completeness = signupResult.completeness
    this.nextSteps = signupResult.nextSteps
    this.message = message

    // 완성도 점수 계산
    const totalFields = 4 // nickname, fullName, introduce, profileImageUrl
    const completedFields = totalFields - this.completeness.missingFields.length
    this.completenessScore = Math.round((completedFields / totalFields) * 100)
  }
}