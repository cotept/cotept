import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"

import { Strategy } from "passport-github2"

import { OAuthGithubConfig } from "@/configs/social-provider"
import { SocialProvider } from "@/modules/auth/domain/model"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * 참고: 이 전략을 사용하기 위해서는 다음 패키지를 설치해야 합니다:
 * npm install passport-github2
 * npm install --save-dev @types/passport-github2
 */

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  private readonly logger = new Logger(GithubStrategy.name)

  constructor(private readonly configService: ConfigService) {
    super({
      ...configService.getOrThrow<OAuthGithubConfig>("github"),
      scope: ["user:email", "read:user"],
    })
  }

  /**
   * Github OAuth 인증 완료 후 호출되는 메서드
   * @param accessToken Github에서 제공한 액세스 토큰
   * @param refreshToken Github에서 제공한 리프레시 토큰
   * @param profile Github 프로필 정보
   * @param done 완료 콜백
   */
  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    try {
      this.logger.debug(`GitHub 인증 프로필: ${JSON.stringify(profile)}`)

      // 프로필 정보가 없는 경우
      if (!profile) {
        this.logger.error("GitHub 인증: 프로필 정보가 없습니다.")
        return done(new UnauthorizedException("GitHub 인증 정보가 유효하지 않습니다."), false)
      }

      const { id, displayName, username, emails, photos } = profile

      // GitHub는 사용자가 이메일을 공개하지 않을 수 있음
      let email = null
      if (emails && emails.length > 0) {
        // 기본 이메일이나 첫 번째 이메일 사용
        const primaryEmail = emails.find((e) => e.primary) || emails[0]
        email = primaryEmail.value
      }

      // 이메일이 없는 경우, GitHub 사용자명으로 임시 이메일 생성
      const userEmail = email || `github_${username}@example.com`

      const user = {
        id: id, // 필수 필드
        email: userEmail,
        name: displayName || username,
        provider: SocialProvider.GITHUB,
        socialId: id,
        // role: "MENTEE", // 기본 역할
        accessToken,
        refreshToken: refreshToken || null, // GitHub는 리프레시 토큰을 제공하지 않을 수 있음
        profileImageUrl: photos && photos.length > 0 ? photos[0].value : null,
        profileData: profile,
      }

      // 성공 케이스
      return done(null, user)
    } catch (error) {
      // 오류 케이스
      this.logger.error(`GitHub 인증 오류: ${ErrorUtils.getErrorMessage(error)}`, ErrorUtils.getErrorStack(error))
      return done(new InternalServerErrorException("GitHub 인증 처리 중 오류가 발생했습니다."), false)
    }
  }
}
