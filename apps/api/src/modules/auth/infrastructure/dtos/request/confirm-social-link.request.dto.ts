import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsBoolean, IsNotEmpty, IsString } from "class-validator"

/**
 * 소셜 계정 연결 확인 요청 DTO
 */
export class ConfirmSocialLinkRequestDto {
  @ApiProperty({
    example: "a1b2c3d4...",
    description: "임시 연결 토큰",
  })
  @Expose()
  @IsString({ message: "토큰은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "토큰은 필수 입력 항목입니다." })
  token: string

  @ApiProperty({
    example: true,
    description: "계정 연결 승인 여부",
  })
  @Expose()
  @IsBoolean({ message: "승인 여부는 boolean 값이어야 합니다." })
  @IsNotEmpty({ message: "승인 여부는 필수 입력 항목입니다." })
  approved: boolean
}
