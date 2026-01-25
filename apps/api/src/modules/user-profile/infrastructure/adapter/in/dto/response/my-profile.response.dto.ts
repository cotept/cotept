import { ApiProperty } from "@nestjs/swagger"

import { UserProfileDto } from "@/modules/user-profile/application/dtos/user-profile.dto"

/**
 * 내 프로필 정보 응답 DTO
 * 멘티 프로필 + 멘토 프로필 보유 여부
 */
export class MyProfileResponseDto {
  @ApiProperty({
    description: "멘티 프로필 정보",
    type: UserProfileDto,
  })
  menteeProfile: UserProfileDto

  @ApiProperty({
    description: "멘토 프로필 보유 여부",
    example: true,
  })
  hasMentorProfile: boolean

  @ApiProperty({
    description: "멘토 프로필 ID (멘토인 경우)",
    example: 123,
    required: false,
  })
  mentorProfileId?: number

  constructor(menteeProfile: UserProfileDto, hasMentorProfile: boolean, mentorProfileId?: number) {
    this.menteeProfile = menteeProfile
    this.hasMentorProfile = hasMentorProfile
    this.mentorProfileId = mentorProfileId
  }
}
