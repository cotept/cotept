import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"

import { Strategy, VerifyCallback } from "passport-google-oauth20"

import { OAuthGoogleConfig } from "@/configs/social-provider"
import { SocialProvider } from "@/modules/auth/domain/model"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * 참고: 이 전략을 사용하기 위해서는 다음 패키지를 설치해야 합니다:
 * npm install passport-google-oauth20
 * npm install --save-dev @types/passport-google-oauth20
 */

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  private readonly logger = new Logger(GoogleStrategy.name)

  constructor(private readonly configService: ConfigService) {
    super({
      ...configService.getOrThrow<OAuthGoogleConfig>("google"),
      scope: ["email", "profile"],
    })
  }

  /**
   * Google OAuth 인증 완료 후 호출되는 메서드
   * @param accessToken Google에서 제공한 액세스 토큰
   * @param refreshToken Google에서 제공한 리프레시 토큰
   * @param profile Google 프로필 정보
   * @param done 완료 콜백
   */
  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    try {
      this.logger.debug(`Google 인증 프로필: ${JSON.stringify(profile)}`)

      // 프로필 정보가 없는 경우
      if (!profile) {
        this.logger.error("Google 인증: 프로필 정보가 없습니다.")
        return done(new UnauthorizedException("Google 인증 정보가 유효하지 않습니다."), false)
      }

      // 이메일 정보가 없는 경우
      if (!profile.emails || profile.emails.length === 0) {
        this.logger.error("Google 인증: 이메일 정보가 없습니다.")
        return done(new UnauthorizedException("Google 계정의 이메일 정보를 조회할 수 없습니다."), false)
      }

      const { name, emails, photos } = profile

      const user = {
        id: profile.id, // 필수 필드
        email: emails[0].value,
        name: name.givenName + " " + name.familyName,
        provider: SocialProvider.GOOGLE,
        socialId: profile.id,
        // role: "MENTEE", // 기본 역할
        accessToken,
        refreshToken,
        profileImageUrl: photos && photos.length > 0 ? photos[0].value : null,
        profileData: profile,
      }

      // 성공 케이스
      return done(null, user)
    } catch (error) {
      // 오류 케이스
      this.logger.error(`Google 인증 오류: ${ErrorUtils.getErrorMessage(error)}`, ErrorUtils.getErrorStack(error))
      return done(new InternalServerErrorException("Google 인증 처리 중 오류가 발생했습니다."), false)
    }
  }
}
