import { ApiProperty } from "@nestjs/swagger"
import { PickType } from "@nestjs/swagger/dist/type-helpers"
import { Expose } from "class-transformer"
import { IsNotEmpty } from "class-validator"
import { UserDto } from "./user.dto"

/**
 * 사용자 생성 DTO
 * UserDto에서 필요한 필드만 선택하여 사용
 */
export class CreateUserDto extends PickType(UserDto, ["email", "password", "name", "phoneNumber", "role"] as const) {
  @ApiProperty({
    description: "비밀번호 (8~32자, 대소문자, 숫자, 특수문자 포함)",
    example: "StrongP@ss123",
  })
  @Expose()
  @IsNotEmpty({ message: "비밀번호는 필수 값입니다." })
  password: string

  @ApiProperty({
    description: "사용자 역할 (기본값: MENTEE)",
    enum: ["MENTEE", "MENTOR"],
    example: "MENTEE",
    required: false,
  })
  @Expose()
  role: string = "MENTEE"
}
