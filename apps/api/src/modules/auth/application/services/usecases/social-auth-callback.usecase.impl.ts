import { clentUrlConfig } from "@/configs/token"
import { GenerateAuthCodeDto } from "@/modules/auth/application/dtos/generate-auth-code.dto"
import {
  SocialAuthCallbackDto,
  SocialAuthCallbackResponseDto,
} from "@/modules/auth/application/dtos/social-auth-callback.dto"
import { GenerateAuthCodeUseCase } from "@/modules/auth/application/ports/in/generate-auth-code.usecase"
import { SocialAuthCallbackUseCase } from "@/modules/auth/application/ports/in/social-auth-callback.usecase"
import { LoginSessionRepositoryPort } from "@/modules/auth/application/ports/out/login-session-repository.port"
import { TokenStoragePort } from "@/modules/auth/application/ports/out/token-storage.port"
import { ErrorUtils } from "@/shared/utils/error.util"
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

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
    private readonly tokenStorage: TokenStoragePort,
    private readonly loginSessionRepository: LoginSessionRepositoryPort,
    private readonly generateAuthCodeUseCase: GenerateAuthCodeUseCase,
    private readonly configService: ConfigService,
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
      if (!user.id) {
        this.logger.error("Social auth callback: User ID is missing")
        throw new UnauthorizedException("사용자 ID 정보가 없습니다.")
      }

      if (!user.email) {
        this.logger.error("Social auth callback: User email is missing")
        throw new UnauthorizedException("이메일 정보가 없습니다.")
      }

      // 임시 인증 코드 생성
      const generateAuthCodeDto = new GenerateAuthCodeDto(user.id)
      const authCodeResult = await this.generateAuthCodeUseCase.execute(generateAuthCodeDto)

      this.logger.debug(`Generated auth code for user ${user.id}, expires at ${authCodeResult.expiresAt.toISOString()}`)

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
