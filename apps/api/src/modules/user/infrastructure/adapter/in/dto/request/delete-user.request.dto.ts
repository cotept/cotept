import { ApiProperty, PickType } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsOptional, IsString } from "class-validator"

import { UserDto } from "@/modules/user/application/dto/user.dto"

/**
 * 사용자 삭제 요청 DTO
 */
export class DeleteUserRequestDto extends PickType(UserDto, ["userId"]) {
  @ApiProperty({
    description: "삭제 사유",
    example: "사용자 요청에 의한 계정 삭제",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString({ message: "삭제 사유는 문자열이어야 합니다." })
  reason?: string

  @ApiProperty({
    description: "삭제 확인을 위한 비밀번호",
    example: "UserP@ss123",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString({ message: "비밀번호는 문자열이어야 합니다." })
  password?: string
}
