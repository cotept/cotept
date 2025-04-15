import { SocialProvider } from "@/modules/auth/application/dtos"
import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsObject, IsOptional, IsString } from "class-validator"

/**
 * 소셜 인증 콜백 요청 DTO
 */
export class SocialAuthCallbackRequestDto {
  /**
   * 소셜 로그인 제공자
   */
  @ApiProperty({
    enum: SocialProvider,
    description: "소셜 로그인 제공자 (github, google 등)",
  })
  @IsEnum(SocialProvider)
  provider: SocialProvider

  /**
   * 소셜 인증으로 받은 사용자 정보
   */
  @ApiProperty({
    description: "소셜 인증으로 받은 사용자 정보",
    type: "object",
    additionalProperties: true,
  })
  @IsObject()
  user: any

  /**
   * 클라이언트 IP 주소
   */
  @ApiProperty({
    description: "클라이언트 IP 주소",
  })
  @IsString()
  ipAddress: string

  /**
   * 클라이언트 User-Agent
   */
  @ApiProperty({
    description: "클라이언트 User-Agent",
  })
  @IsString()
  userAgent: string

  /**
   * 인증 성공 후 리다이렉트할 클라이언트 URL
   */
  @ApiProperty({
    description: "인증 성공 후 리다이렉트할 클라이언트 URL",
    required: false,
  })
  @IsOptional()
  @IsString()
  redirectUrl?: string
}
