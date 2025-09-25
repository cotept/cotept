import { ApiProperty, PickType } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsNotEmpty, IsString } from "class-validator"

import { UserProfileDto } from "@/modules/user-profile/application/dtos"

/**
 * 기본 프로필 생성을 위한 DTO
 * UserProfileDto에서 nickname과 profileImageUrl만 사용합니다.
 * userId는 인증 컨텍스트에서 받아옵니다.
 */
export class CreateBasicProfileDto extends PickType(UserProfileDto, ["nickname", "profileImageUrl"] as const) {
  @ApiProperty({ description: "사용자 ID", example: "user123" })
  @Expose()
  @IsString()
  @IsNotEmpty()
  userId: string
}
