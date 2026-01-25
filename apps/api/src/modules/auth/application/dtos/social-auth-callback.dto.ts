import { IsEnum, IsObject, IsOptional, IsString } from "class-validator"

import { SocialProvider } from "@/modules/auth/domain/model"

/**
 * 소셜 인증 콜백 처리를 위한 DTO
 */
export class SocialAuthCallbackDto {
  /**
   * 소셜 로그인 제공자
   */
  @IsEnum(SocialProvider, { message: "유효한 소셜 로그인 제공자가 아닙니다." })
  provider: SocialProvider

  /**
   * Passport 인증으로 얻은 사용자 정보
   */
  @IsObject()
  user: any

  /**
   * 요청 IP 주소
   */
  @IsString()
  ipAddress: string

  /**
   * 사용자 에이전트
   */
  @IsString()
  userAgent: string

  /**
   * 인증 성공 후 리다이렉트할 URL
   */
  @IsOptional()
  @IsString()
  redirectUrl?: string
}

/**
 * 소셜 인증 콜백 응답 DTO
 */
export class SocialAuthCallbackResponseDto {
  /**
   * 리다이렉트할 URL
   */
  redirectUrl: string
}
