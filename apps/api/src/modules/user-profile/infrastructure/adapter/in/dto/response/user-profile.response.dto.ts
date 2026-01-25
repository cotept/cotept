import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"

import { UserProfileResponseDto as ApplicationResponseDto } from "@/modules/user-profile/application/dtos/user-profile.dto"

/**
 * UserProfile 조회 응답 DTO (Infrastructure Layer)
 * Controller에서 사용하는 HTTP API 전용 DTO
 * Application Layer의 UserProfileResponseDto를 래핑하여 API 표준 응답 형태 제공
 */
export class UserProfileResponseDto {
  @ApiProperty({
    description: "사용자 프로필 정보",
    type: ApplicationResponseDto,
  })
  @Expose()
  profile: ApplicationResponseDto

  @ApiProperty({
    description: "성공 메시지",
    example: "사용자 프로필 조회가 성공적으로 완료되었습니다.",
  })
  @Expose()
  message: string

  constructor(profile: ApplicationResponseDto, message: string = "사용자 프로필 조회가 성공적으로 완료되었습니다.") {
    this.profile = profile
    this.message = message
  }
}
