import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator"

import { SocialProvider } from "@/modules/auth/domain/model"

/**
 * 소셜 프로필 응답 DTO
 */
export class SocialProfileResponseDto {
  @ApiProperty({
    description: "소셜 제공자 내 사용자 ID",
    example: "12345678",
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  id: string

  @ApiProperty({
    description: "소셜 계정 이메일",
    example: "user@example.com",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({
    description: "소셜 계정 이름",
    example: "홍길동",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({
    description: "소셜 프로필 이미지 URL",
    example: "https://example.com/profile.jpg",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string

  @ApiProperty({
    description: "소셜 로그인 제공자",
    enum: SocialProvider,
    example: SocialProvider.GOOGLE,
  })
  @Expose()
  @IsEnum(SocialProvider)
  @IsNotEmpty()
  provider: SocialProvider
}
