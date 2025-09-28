import { PickType } from "@nestjs/swagger"

import { UserProfileDto } from "@/modules/user-profile/application/dtos"

/**
 * 기본 프로필 생성을 위한 DTO
 * UserProfileDto에서 nickname과 profileImageUrl만 사용합니다.
 * userId는 인증 컨텍스트에서 받아옵니다.
 */
export class CreateBasicProfileDto extends PickType(UserProfileDto, [
  "userId",
  "nickname",
  "profileImageUrl",
] as const) {}
