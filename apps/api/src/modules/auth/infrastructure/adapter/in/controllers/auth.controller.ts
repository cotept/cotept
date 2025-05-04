import { AuthFacadeService } from "@/modules/auth/application/services/facade/auth-facade.service"
import { CurrentUserId } from "@/modules/auth/infrastructure/common/decorators"
import { JwtAuthGuard } from "@/modules/auth/infrastructure/common/guards/jwt-auth.guard"
import {
  ExchangeAuthCodeRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  SendVerificationCodeRequestDto,
  ValidateTokenRequestDto,
  VerifyCodeRequestDto,
  ConfirmSocialLinkRequestDto,
} from "@/modules/auth/infrastructure/dtos/request"
import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { Request, Response } from "express"

/**
 * 인증 컨트롤러
 */
@ApiTags("인증")
@Controller("auth")
export class AuthController {
  constructor(private readonly authFacadeService: AuthFacadeService) {}

  /**
   * 로그인
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "로그인", description: "이메일과 비밀번호로 로그인하고 토큰을 발급합니다." })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ description: "로그인 성공" })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터" })
  @ApiUnauthorizedResponse({ description: "인증 실패" })
  async login(
    @Body() loginRequestDto: LoginRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip
    const userAgent = req.headers["user-agent"] || ""

    return await this.authFacadeService.login(loginRequestDto, ipAddress, userAgent, res)
  }

  /**
   * 로그아웃
   */
  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "로그아웃", description: "사용자를 로그아웃하고 토큰을 무효화합니다." })
  @ApiOkResponse({ description: "로그아웃 성공" })
  @ApiUnauthorizedResponse({ description: "인증 필요" })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response, @CurrentUserId() userId: string) {
    const token = req.headers.authorization?.split(" ")[1] || ""
    return await this.authFacadeService.logout(userId, token, res)
  }

  /**
   * 토큰 갱신
   */
  @Post("slient-refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "토큰 갱신", description: "리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급합니다." })
  @ApiBody({ type: RefreshTokenRequestDto })
  @ApiOkResponse({ description: "토큰 갱신 성공" })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터" })
  @ApiUnauthorizedResponse({ description: "유효하지 않은 리프레시 토큰" })
  async refreshToken(
    @Body() refreshTokenRequestDto: RefreshTokenRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip
    const userAgent = req.headers["user-agent"] || ""

    return await this.authFacadeService.refreshToken(refreshTokenRequestDto, ipAddress, userAgent, res)
  }

  /**
   * 토큰 검증
   */
  @Post("validate-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "토큰 검증", description: "액세스 토큰의 유효성을 검증합니다." })
  @ApiBody({ type: ValidateTokenRequestDto })
  @ApiOkResponse({ description: "토큰 검증 결과" })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터" })
  async validateToken(@Body() validateTokenRequestDto: ValidateTokenRequestDto) {
    return this.authFacadeService.validateToken(validateTokenRequestDto)
  }

  /**
   * 인증 코드 발송
   */
  @Post("send-verification-code")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "인증 코드 발송", description: "이메일 또는 전화번호로 인증 코드를 발송합니다." })
  @ApiBody({ type: SendVerificationCodeRequestDto })
  @ApiOkResponse({ description: "인증 코드 발송 성공" })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터" })
  async sendVerificationCode(
    @Body() sendVerificationCodeRequestDto: SendVerificationCodeRequestDto,
    @Req() req: Request,
    @CurrentUserId() userId?: string,
  ) {
    const ipAddress = req.ip

    return this.authFacadeService.sendVerificationCode(sendVerificationCodeRequestDto, userId, ipAddress)
  }

  /**
   * 인증 코드 확인
   */
  @Post("verify-code")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "인증 코드 확인", description: "발송된 인증 코드의 유효성을 검증합니다." })
  @ApiBody({ type: VerifyCodeRequestDto })
  @ApiOkResponse({ description: "인증 코드 확인 성공" })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터 또는 유효하지 않은 인증 코드" })
  async verifyCode(@Body() verifyCodeRequestDto: VerifyCodeRequestDto) {
    return this.authFacadeService.verifyCode(verifyCodeRequestDto)
  }

  /**
   * 임시 인증 코드를 토큰으로 교환
   */
  @Post("exchange-code")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "임시 인증 코드를 실제 토큰으로 교환",
    description: "소셜 로그인 후 서버에서 발급된 임시 인증 코드를 토큰으로 교환합니다.",
  })
  @ApiBody({ type: ExchangeAuthCodeRequestDto })
  @ApiOkResponse({ description: "토큰 교환 성공" })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터" })
  @ApiUnauthorizedResponse({ description: "유효하지 않은 인증 코드" })
  async exchangeAuthCode(
    @Body() exchangeAuthCodeRequestDto: ExchangeAuthCodeRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip
    const userAgent = req.headers["user-agent"] || ""

    return await this.authFacadeService.exchangeAuthCode(exchangeAuthCodeRequestDto, ipAddress, userAgent, res)
  }

  /**
   * 소셜 계정 연결 확인
   */
  @Post("confirm-social-link")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "소셜 계정 연결 확인",
    description: "기존 계정에 소셜 계정 연결을 승인 또는 거부합니다.",
  })
  @ApiBody({ type: ConfirmSocialLinkRequestDto })
  @ApiOkResponse({ description: "계정 연결 처리 성공" })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터" })
  @ApiUnauthorizedResponse({ description: "유효하지 않은 토큰" })
  async confirmSocialLink(
    @Body() confirmSocialLinkRequestDto: ConfirmSocialLinkRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip
    const userAgent = req.headers["user-agent"] || ""

    return await this.authFacadeService.confirmSocialLink(confirmSocialLinkRequestDto, ipAddress, userAgent, res)
  }
}
