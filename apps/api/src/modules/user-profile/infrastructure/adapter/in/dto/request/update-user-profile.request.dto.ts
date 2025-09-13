import { ApiPropertyOptional, PartialType, PickType } from "@nestjs/swagger"

import { Expose } from "class-transformer"

import { UpdateUserProfileRequestDto as ApplicationUpdateDto } from "@/modules/user-profile/application/dtos/user-profile.dto"

/**
 * UserProfile 업데이트 요청 DTO (Infrastructure Layer)
 * Controller에서 사용하는 HTTP API 전용 DTO
 * Application Layer의 UpdateUserProfileRequestDto를 상속하여 API별 커스터마이징
 */
export class UpdateUserProfileRequestDto extends PartialType(
  PickType(ApplicationUpdateDto, ["nickname", "fullName", "introduce", "profileImageUrl"] as const),
) {
  @ApiPropertyOptional({
    description: "닉네임 (2~50자, 한글/영문/숫자만 허용)",
    example: "새로운닉네임123",
  })
  @Expose()
  nickname?: string

  @ApiPropertyOptional({
    description: "실명 (2~50자, 한글/영문만 허용)",
    example: "김철수",
  })
  @Expose()
  fullName?: string

  @ApiPropertyOptional({
    description: "자기소개 (280자 이하, 트위터 스타일)",
    example: "안녕하세요! 업데이트된 소개입니다.",
  })
  @Expose()
  introduce?: string

  @ApiPropertyOptional({
    description: "프로필 이미지 URL",
    example: "https://example.com/new-profile/image.jpg",
  })
  @Expose()
  profileImageUrl?: string
}
