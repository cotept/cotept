import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"

import { UserProfileResponseDto as ApplicationResponseDto } from "@/modules/user-profile/application/dtos/user-profile.dto"

/**
 * UserProfile 업데이트 성공 응답 DTO (Infrastructure Layer)
 * Controller에서 사용하는 HTTP API 전용 DTO
 */
export class UserProfileUpdateResponseDto {
  @ApiProperty({
    description: "업데이트된 사용자 프로필 정보",
    type: ApplicationResponseDto,
  })
  @Expose()
  profile: ApplicationResponseDto

  @ApiProperty({
    description: "성공 메시지",
    example: "사용자 프로필이 성공적으로 업데이트되었습니다.",
  })
  @Expose()
  message: string

  @ApiProperty({
    description: "업데이트된 필드 목록",
    example: ["nickname", "introduce"],
    type: [String],
  })
  @Expose()
  updatedFields: string[]

  constructor(
    profile: ApplicationResponseDto,
    updatedFields: string[],
    message: string = "사용자 프로필이 성공적으로 업데이트되었습니다.",
  ) {
    this.profile = profile
    this.message = message
    this.updatedFields = updatedFields
  }
}
