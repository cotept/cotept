import { SocialProfileDto, SocialProvider, SocialTokenResponseDto } from "@/modules/auth/application/dtos"
import { SocialProfilePort } from "@/modules/auth/application/ports/out"
import { Injectable, Logger } from "@nestjs/common"

// 임시 더미 SocialProfileService 구현
@Injectable()
export class DummySocialProfileService implements SocialProfilePort {
  private readonly logger = new Logger(DummySocialProfileService.name)

  /**
   * 인증 코드로 액세스 토큰 가져오기
   */
  async getTokenByCode(provider: SocialProvider, code: string, redirectUri: string): Promise<SocialTokenResponseDto> {
    this.logger.log(
      `[더미 소셜 토큰 요청] 제공자: ${provider}, 코드: ${code.substring(0, 5)}..., 리다이렉트: ${redirectUri}`,
    )

    // 더미 응답 생성
    const response = new SocialTokenResponseDto()
    response.accessToken = `dummy_access_token_${Date.now()}`
    response.refreshToken = `dummy_refresh_token_${Date.now()}`
    response.tokenType = "Bearer"
    response.expiresIn = 3600
    response.scope = "email profile"

    return response
  }

  /**
   * 인증 코드로 소셜 프로필 가져오기
   */
  async getProfileByCode(provider: SocialProvider, code: string, redirectUri: string): Promise<SocialProfileDto> {
    this.logger.log(
      `[더미 소셜 프로필 요청] 제공자: ${provider}, 코드: ${code.substring(0, 5)}..., 리다이렉트: ${redirectUri}`,
    )

    // 더미 토큰 요청
    const tokenResponse = await this.getTokenByCode(provider, code, redirectUri)

    // 더미 프로필 생성
    const profile = new SocialProfileDto()
    profile.id = `dummy_${provider}_id_${Date.now()}`
    profile.email = `dummy_user_${Date.now()}@example.com`
    profile.name = `Dummy ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`
    profile.profileImageUrl = `https://example.com/dummy_profile.jpg`
    profile.provider = provider
    profile.accessToken = tokenResponse.accessToken
    profile.refreshToken = tokenResponse.refreshToken
    profile.raw = { dummy: true, timestamp: new Date().toISOString() }

    return profile
  }

  /**
   * 액세스 토큰으로 소셜 프로필 가져오기
   */
  async getProfileByToken(provider: SocialProvider, accessToken: string): Promise<SocialProfileDto> {
    this.logger.log(`[더미 토큰 프로필 요청] 제공자: ${provider}, 토큰: ${accessToken.substring(0, 5)}...`)

    // 더미 프로필 생성
    const profile = new SocialProfileDto()
    profile.id = `dummy_${provider}_id_${Date.now()}`
    profile.email = `dummy_user_${Date.now()}@example.com`
    profile.name = `Dummy ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`
    profile.profileImageUrl = `https://example.com/dummy_profile.jpg`
    profile.provider = provider
    profile.accessToken = accessToken
    profile.raw = { dummy: true, timestamp: new Date().toISOString() }

    return profile
  }

  /**
   * 리프레시 토큰으로 새 액세스 토큰 갱신
   */
  async refreshToken(provider: SocialProvider, refreshToken: string): Promise<SocialTokenResponseDto> {
    this.logger.log(`[더미 토큰 갱신] 제공자: ${provider}, 리프레시 토큰: ${refreshToken.substring(0, 5)}...`)

    // 더미 응답 생성
    const response = new SocialTokenResponseDto()
    response.accessToken = `dummy_refreshed_access_token_${Date.now()}`
    response.refreshToken = `dummy_refreshed_refresh_token_${Date.now()}`
    response.tokenType = "Bearer"
    response.expiresIn = 3600
    response.scope = "email profile"

    return response
  }

  /**
   * 소셜 로그인 URL 생성
   */
  generateAuthUrl(provider: SocialProvider, redirectUri: string, state?: string): string {
    this.logger.log(`[더미 인증 URL 생성] 제공자: ${provider}, 리다이렉트: ${redirectUri}, 상태: ${state || "none"}`)

    // 더미 URL 생성
    return `https://dummy-${provider}-auth.example.com/authorize?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state || ""}&dummy=true`
  }

  /**
   * 소셜 계정 연결 해제
   */
  async revokeToken(provider: SocialProvider, accessToken: string): Promise<boolean> {
    this.logger.log(`[더미 토큰 취소] 제공자: ${provider}, 토큰: ${accessToken.substring(0, 5)}...`)

    return true // 항상 성공으로 처리
  }
}
