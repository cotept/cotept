import { PartialType, PickType } from "@nestjs/swagger"

import { UserDto } from "@/modules/user/application/dto/user.dto"

/**
 * 사용자 수정 요청 DTO
 * UserDto에서 수정 가능한 필드들만 선택하여 부분 업데이트
 */
export class UpdateUserRequestDto extends PartialType(
  PickType(UserDto, ["userId", "name", "phoneNumber", "email"] as const),
) {}
