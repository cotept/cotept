import { ApiProperty, PickType } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsNotEmpty } from "class-validator"

import { UserDto } from "./user.dto"

import { UserRole } from "@/modules/user/domain/model/user"

/**
 * 사용자 생성 DTO
 * UserDto에서 필요한 필드만 선택하여 사용
 */
export class CreateUserDto extends PickType(UserDto, [
  "userId",
  "email",
  "password",
  "name",
  "phoneNumber",
  "role",
] as const) {
  @ApiProperty({
    description: "비밀번호 (8~32자, 대소문자, 숫자, 특수문자 포함)",
    example: "StrongP@ss123",
  })
  @Expose()
  @IsNotEmpty({ message: "비밀번호는 필수 값입니다." })
  password: string

  @ApiProperty({
    description: "사용자 역할 (기본값: MENTEE)",
    example: UserRole.MENTEE,
    required: false,
    enum: UserRole,
    enumName: "UserRole",
  })
  @Expose()
  role: UserRole = UserRole.MENTEE
}
