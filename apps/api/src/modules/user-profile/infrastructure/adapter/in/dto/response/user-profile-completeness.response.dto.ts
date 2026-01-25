import { ApiProperty } from "@nestjs/swagger"

import { Expose, Type } from "class-transformer"

import { UserProfileDto } from "@/modules/user-profile/application/dtos/user-profile.dto"

/**
 * 사용자 프로필 완성도 확인 응답 DTO
 * 프로필 완성도 체크 API의 표준화된 응답 구조
 */
export class UserProfileCompletenessResponseDto {
  @ApiProperty({
    description: "프로필 존재 여부",
    example: true,
  })
  @Expose()
  hasProfile: boolean

  @ApiProperty({
    description: "기본 정보 완성 여부 (닉네임, 실명)",
    example: true,
  })
  @Expose()
  hasBasicInfo: boolean

  @ApiProperty({
    description: "프로필 완성 여부",
    example: false,
  })
  @Expose()
  isComplete: boolean

  @ApiProperty({
    description: "누락된 필드 목록",
    type: [String],
    example: ["fullName", "introduce"],
  })
  @Expose()
  missingFields: string[]

  @ApiProperty({
    description: "프로필 정보 (존재하는 경우만)",
    type: UserProfileDto,
    required: false,
  })
  @Expose()
  @Type(() => UserProfileDto)
  profile?: UserProfileDto

  @ApiProperty({
    description: "완성도 점수 (0-100)",
    example: 75,
  })
  @Expose()
  completenessScore: number

  @ApiProperty({
    description: "응답 메시지",
    example: "프로필 완성도를 확인했습니다.",
  })
  @Expose()
  message: string

  constructor(
    completenessResult: {
      hasProfile: boolean
      hasBasicInfo: boolean
      isComplete: boolean
      missingFields: string[]
      profile?: UserProfileDto
    },
    message: string = "프로필 완성도를 확인했습니다.",
  ) {
    this.hasProfile = completenessResult.hasProfile
    this.hasBasicInfo = completenessResult.hasBasicInfo
    this.isComplete = completenessResult.isComplete
    this.missingFields = completenessResult.missingFields
    this.profile = completenessResult.profile
    this.message = message

    // 완성도 점수 계산 (간단한 로직)
    const totalFields = 4 // nickname, fullName, introduce, profileImageUrl
    const completedFields = totalFields - this.missingFields.length
    this.completenessScore = Math.round((completedFields / totalFields) * 100)
  }
}