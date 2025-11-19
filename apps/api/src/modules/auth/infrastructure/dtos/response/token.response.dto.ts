import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsEnum, IsNumber, IsString } from "class-validator"

import { UserRole } from "@/modules/user/domain/model/user"

/**
 * 토큰 응답 DTO
 */
export class TokenResponseDto {
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "액세스 토큰",
  })
  @Expose()
  @IsString()
  accessToken: string

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "리프레시 토큰",
  })
  @Expose()
  @IsString()
  refreshToken: string

  @ApiProperty({
    example: "Bearer",
    description: "토큰 타입",
  })
  @Expose()
  @IsString()
  tokenType: string

  @ApiProperty({
    example: 1800,
    description: "액세스 토큰 만료 시간(초)",
  })
  @Expose()
  @IsNumber()
  expiresIn: number

  @ApiProperty({
    example: 1,
    description: "사용자 고유 ID (idx)",
  })
  @Expose()
  @IsNumber()
  idx: number

  @ApiProperty({
    example: "user@example.com",
    description: "사용자 이메일",
  })
  @Expose()
  @IsString()
  email: string

  @ApiProperty({
    example: UserRole.MENTEE,
    description: "사용자 역할",
    enum: UserRole,
    enumName: "UserRole",
  })
  @Expose()
  @IsEnum(UserRole)
  role: UserRole
}
