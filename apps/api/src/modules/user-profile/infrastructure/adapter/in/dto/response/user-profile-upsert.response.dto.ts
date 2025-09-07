import { ApiProperty } from "@nestjs/swagger"

import { Expose, Type } from "class-transformer"

import { UserProfileDto } from "@/modules/user-profile/application/dtos/user-profile.dto"

/**
 * 사용자 프로필 Upsert 응답 DTO
 * 프로필 생성 또는 수정 API의 표준화된 응답 구조
 */
export class UserProfileUpsertResponseDto {
  @ApiProperty({
    description: "처리된 사용자 프로필 정보",
    type: UserProfileDto,
  })
  @Expose()
  @Type(() => UserProfileDto)
  profile: UserProfileDto

  @ApiProperty({
    description: "새로 생성된 프로필인지 여부",
    example: false,
  })
  @Expose()
  isNew: boolean

  @ApiProperty({
    description: "수정된 필드 목록 (수정의 경우만)",
    type: [String],
    example: ["nickname", "introduce"],
    required: false,
  })
  @Expose()
  updatedFields?: string[]

  @ApiProperty({
    description: "응답 메시지",
    example: "사용자 프로필이 성공적으로 수정되었습니다.",
  })
  @Expose()
  message: string

  @ApiProperty({
    description: "처리 유형",
    enum: ["created", "updated"],
    example: "updated",
  })
  @Expose()
  operation: "created" | "updated"

  constructor(
    upsertResult: {
      profile: UserProfileDto
      isNew: boolean
      updatedFields?: string[]
    },
  ) {
    this.profile = upsertResult.profile
    this.isNew = upsertResult.isNew
    this.updatedFields = upsertResult.updatedFields
    this.operation = upsertResult.isNew ? "created" : "updated"
    
    this.message = upsertResult.isNew
      ? "사용자 프로필이 성공적으로 생성되었습니다."
      : "사용자 프로필이 성공적으로 수정되었습니다."
  }
}