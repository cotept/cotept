import { AuthFacadeService } from "@/modules/auth/application/services/facade/auth-facade.service"
import { SocialProvider } from "@/modules/auth/domain/model"
import { ErrorUtils } from "@/shared/utils/error.util"
import { Controller, Get, HttpCode, HttpStatus, Logger, Query, Req, Res, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger"
import { Request, Response } from "express"

/**
 * Google 소셜 로그인 컨트롤러
 */
@ApiTags("Google 인증")
@Controller("auth/google")
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name)
  constructor(private readonly authFacadeService: AuthFacadeService) {}

  /**
   * Google 로그인 시작
   */
  @Get()
  @HttpCode(HttpStatus.FOUND)
  @UseGuards(AuthGuard("google"))
  @ApiOperation({
    summary: "Google 로그인 시작",
    description: "Google OAuth 인증을 시작합니다.",
  })
  @ApiQuery({
    name: "redirectUrl",
    required: false,
    description: "인증 성공 후 리다이렉트할 클라이언트 URL",
  })
  @ApiResponse({ status: 302, description: "Google 인증 페이지로 리다이렉트" })
  async googleLogin(@Query("redirectUrl") redirectUrl?: string) {
    // AuthGuard('google')가 자동으로 Google 인증 페이지로 리다이렉트합니다.
    return { message: "Google 인증 페이지로 리다이렉트 중..." }
  }

  /**
   * Google 로그인 콜백 처리
   */
  @Get("callback")
  @HttpCode(HttpStatus.FOUND)
  @UseGuards(AuthGuard("google"))
  @ApiOperation({
    summary: "Google 로그인 콜백",
    description: "Google 인증 후 리다이렉트되는 엔드포인트입니다.",
  })
  @ApiQuery({
    name: "code",
    required: false,
    description: "Google 인증 코드 (자동으로 처리됨)",
  })
  @ApiQuery({
    name: "redirectUrl",
    required: false,
    description: "인증 성공 후 리다이렉트할 클라이언트 URL",
  })
  @ApiResponse({ status: 302, description: "클라이언트로 리다이렉트" })
  @ApiUnauthorizedResponse({ description: "Google 인증 실패" })
  async googleCallback(@Req() req: Request, @Res() res: Response, @Query("redirectUrl") redirectUrl?: string) {
    try {
      // Facade 서비스에 모든 비즈니스 로직 위임
      const redirectInfo = await this.authFacadeService.handleSocialAuthCallback({
        provider: SocialProvider.GOOGLE,
        user: req.user,
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
        redirectUrl,
      })

      // 리다이렉트만 처리
      return res.redirect(redirectInfo.redirectUrl)
    } catch (error) {
      this.logger.error(
        `Google 콜백 처리 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )

      // 에러 페이지로 리다이렉트
      return res.redirect(`/auth/error?message=${encodeURIComponent("Google 로그인 처리 중 오류가 발생했습니다.")}`)
    }
  }
}
