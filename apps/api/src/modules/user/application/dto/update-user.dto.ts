import { PartialType, PickType } from "@nestjs/swagger"

import { UserDto } from "./user.dto"

/**
 * 사용자 정보 업데이트 DTO
 * UserDto에서 id, email, role, 생성일, 수정일, 마지막 로그인 일시를 제외하고
 * 나머지 필드를 선택적(Partial)으로 사용
 */
export class UpdateUserDto extends PartialType(
  PickType(UserDto, [
    "userId",
    "email",
    "name",
    "phoneNumber",
    "updatedAt",
    "lastLoginAt",
    "role",
    "password",
    "status",
    "phoneVerified",
  ] as const),
) {}
