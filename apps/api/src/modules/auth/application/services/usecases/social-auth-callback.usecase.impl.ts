import { Injectable, Logger, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { clentUrlConfig } from "@/configs/token"
import { GenerateAuthCodeDto } from "@/modules/auth/application/dtos/generate-auth-code.dto"
import {
  SocialAuthCallbackDto,
  SocialAuthCallbackResponseDto,
} from "@/modules/auth/application/dtos/social-auth-callback.dto"
import { GenerateAuthCodeUseCase } from "@/modules/auth/application/ports/in/generate-auth-code.usecase"
import { SocialAuthCallbackUseCase } from "@/modules/auth/application/ports/in/social-auth-callback.usecase"
import { AuthCachePort } from "@/modules/auth/application/ports/out/auth-cache.port"
import { AuthUserRepositoryPort } from "@/modules/auth/application/ports/out/auth-user-repository.port"
import { LoginSessionRepositoryPort } from "@/modules/auth/application/ports/out/login-session-repository.port"
import { PendingLinkInfo } from "@/modules/auth/domain/model/pending-link-info"
import { CryptoService } from "@/shared/infrastructure/services/crypto"
import { convertDomainUserIdToString } from "@/shared/utils/auth-type-converter.util"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * 소셜 인증 콜백 처리 유스케이스 구현체
 * PassportJS에서 처리된 사용자 정보를 활용해 토큰을 생성하고 리다이렉트 URL을 구성합니다.
 */
@Injectable()
export class SocialAuthCallbackUseCaseImpl implements SocialAuthCallbackUseCase {
  private readonly logger = new Logger(SocialAuthCallbackUseCaseImpl.name)
  private readonly CLIENT_REDIRECT_URL = this.configService.getOrThrow<clentUrlConfig>("clientUrl").clientUrl
  private readonly CLIENT_ERROR_REDIRECT_URL = this.configService.getOrThrow<clentUrlConfig>("clientUrl").clientErrorUrl

  constructor(
    private readonly authCache: AuthCachePort,
    private readonly loginSessionRepository: LoginSessionRepositoryPort,
    private readonly generateAuthCodeUseCase: GenerateAuthCodeUseCase,
    private readonly configService: ConfigService,
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * 소셜 인증 콜백 처리
   * @param callbackDto 콜백 처리에 필요한 데이터
   * @returns 리다이렉트 URL 정보가 포함된 객체
   */
  async execute(callbackDto: SocialAuthCallbackDto): Promise<SocialAuthCallbackResponseDto> {
    try {
      const { user, ipAddress, userAgent, redirectUrl, provider } = callbackDto

      this.logger.debug(`Handling social auth callback for provider: ${provider}`)

      if (!user) {
        this.logger.error("Social auth callback: No user information provided")
        throw new UnauthorizedException("소셜 인증 정보가 없습니다.")
      }

      // 필수 필드 확인
      if (!user.email) {
        this.logger.error("Social auth callback: User email is missing")
        throw new UnauthorizedException("이메일 정보가 없습니다.")
      }

      if (!user.socialId) {
        this.logger.error("Social auth callback: Social ID is missing")
        throw new UnauthorizedException("소셜 ID 정보가 없습니다.")
      }

      let userId: string

      // 1. 소셜 ID로 기존 연결된 계정 찾기
      const existingAuthUser = await this.authUserRepository.findBySocialId(provider, user.socialId)

      if (existingAuthUser) {
        // 기존에 연결된 소셜 계정으로 로그인
        userId = convertDomainUserIdToString(existingAuthUser.id)
        this.logger.debug(`Found existing user by social ID: ${userId}`)
      } else {
        // 2. 이메일로 기존 사용자 찾기
        const existingUserByEmail = await this.authUserRepository.findByEmail(user.email)

        if (existingUserByEmail) {
          // 기존 사용자가 있으면 연결 확인 절차 필요
          const pendingLinkToken = this.cryptoService.generateRandomString(32)

          // 임시 연결 정보 저장
          const pendingInfo: PendingLinkInfo = {
            userId: convertDomainUserIdToString(existingUserByEmail.id),
            provider,
            socialId: user.socialId,
            email: user.email,
            name: user.name,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            profileData: user.profileData,
          }

          await this.authCache.savePendingLinkInfo(pendingLinkToken, pendingInfo, 300) // 5분 유효

          this.logger.debug(`Created pending link token for existing user: ${existingUserByEmail.id}`)

          // 클라이언트 리다이렉트 URL
          const defaultRedirectUrl = this.CLIENT_REDIRECT_URL || "http://localhost:3000"
          const clientRedirectUrl = redirectUrl || `${defaultRedirectUrl}/auth/social-link-callback`
          const resultUrl = new URL(clientRedirectUrl)

          // 연결 확인이 필요한 상태로 리다이렉트
          resultUrl.searchParams.append("status", "pending_link")
          resultUrl.searchParams.append("token", pendingLinkToken)
          resultUrl.searchParams.append("email", user.email)
          resultUrl.searchParams.append("provider", provider)

          return { redirectUrl: resultUrl.toString() }
        } else {
          // 3. 새 사용자 생성
          const newUser = await this.authUserRepository.createSocialUser(
            user.email,
            user.name || "",
            provider,
            user.socialId,
            user.accessToken,
            user.refreshToken,
            user.profileImageUrl,
            user.profileData,
          )
          userId = convertDomainUserIdToString(newUser.id)
          this.logger.debug(`Created new user from social profile: ${userId}`)
        }
      }

      // 임시 인증 코드 생성
      const generateAuthCodeDto = new GenerateAuthCodeDto(userId)
      const authCodeResult = await this.generateAuthCodeUseCase.execute(generateAuthCodeDto)

      this.logger.debug(`Generated auth code for user ${userId}, expires at ${authCodeResult.expiresAt.toISOString()}`)

      // 클라이언트 리다이렉트 URL
      const defaultRedirectUrl = this.CLIENT_REDIRECT_URL || "http://localhost:3000"
      const clientRedirectUrl = redirectUrl || `${defaultRedirectUrl}/auth/social-callback`
      const resultUrl = new URL(clientRedirectUrl)

      // 인증 코드만 URL 파라미터로 전달
      resultUrl.searchParams.append("code", authCodeResult.code)
      resultUrl.searchParams.append("provider", provider)

      this.logger.debug(`Social auth callback processed successfully for provider: ${provider}`)
      return { redirectUrl: resultUrl.toString() }
    } catch (error) {
      this.logger.error(
        `Error in social auth callback: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )

      // 오류 발생 시 에러 페이지로 리다이렉트
      const defaultRedirectUrl = this.CLIENT_ERROR_REDIRECT_URL || "http://localhost:3000"
      const clientRedirectUrl = callbackDto.redirectUrl || `${defaultRedirectUrl}/auth/social-callback`
      const errorUrl = new URL(clientRedirectUrl)

      errorUrl.searchParams.append("error", "true")
      errorUrl.searchParams.append(
        "errorMessage",
        ErrorUtils.getErrorMessage(error) || "소셜 로그인 처리 중 오류가 발생했습니다.",
      )

      return { redirectUrl: errorUrl.toString() }
    }
  }
}
