import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"

/**
 * 사용자 프로필 삭제 응답 DTO
 * 프로필 삭제 API의 표준화된 응답 구조
 */
export class UserProfileDeletionResponseDto {
  @ApiProperty({
    description: "삭제 성공 여부",
    example: true,
  })
  @Expose()
  success: boolean

  @ApiProperty({
    description: "응답 메시지",
    example: "사용자 프로필이 성공적으로 삭제되었습니다.",
  })
  @Expose()
  message: string

  @ApiProperty({
    description: "삭제된 사용자 ID",
    example: "dudtod1596",
  })
  @Expose()
  deletedUserId: string

  @ApiProperty({
    description: "삭제 시각",
    example: "2024-01-01T12:00:00.000Z",
  })
  @Expose()
  deletedAt: string

  constructor(
    success: boolean,
    deletedUserId: string,
    message: string = "사용자 프로필이 성공적으로 삭제되었습니다.",
  ) {
    this.success = success
    this.message = message
    this.deletedUserId = deletedUserId
    this.deletedAt = new Date().toISOString()
  }
}