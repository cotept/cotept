import { ApiProperty, PickType } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsNotEmpty } from "class-validator"

import { CreateUserProfileRequestDto as ApplicationCreateDto } from "@/modules/user-profile/application/dtos/user-profile.dto"

/**
 * UserProfile 생성 요청 DTO (Infrastructure Layer)
 * Controller에서 사용하는 HTTP API 전용 DTO
 * Application Layer의 CreateUserProfileRequestDto를 상속하여 API별 커스터마이징
 */
export class CreateUserProfileRequestDto extends PickType(ApplicationCreateDto, [
  "userId",
  "nickname",
  "fullName",
  "introduce",
  "profileImageUrl",
] as const) {
  @ApiProperty({
    description: "사용자 로그인 아이디 (User 모듈에서 기존 검증된 사용자)",
    example: "dudtod1596",
  })
  @Expose()
  @IsNotEmpty({ message: "사용자 아이디는 필수 값입니다." })
  userId!: string

  @ApiProperty({
    description: "닉네임 (2~50자, 한글/영문/숫자만 허용) - 필수",
    example: "코딩마스터123",
  })
  @Expose()
  @IsNotEmpty({ message: "닉네임은 필수 값입니다." })
  nickname!: string
}
