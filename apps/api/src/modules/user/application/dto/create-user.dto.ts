import { ApiProperty, PickType } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsOptional, IsString, Length, Matches } from "class-validator"

import { UserDto } from "./user.dto"

import { UserRole } from "@/modules/user/domain/model/user"

/**
 * 사용자 생성 DTO
 * UserDto에서 필요한 필드만 선택하여 사용
 */
export class CreateUserDto extends PickType(UserDto, ["userId", "email", "name", "phoneNumber", "role"] as const) {
  @IsString({ message: "비밀번호는 문자열이어야 합니다." })
  @IsOptional()
  @Length(8, 32, { message: "비밀번호는 8자 이상 32자 이하여야 합니다." })
  @Matches(/^(?=.*[a-z[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/, {
    message: "비밀번호는 최소 하나의 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.",
  })
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
