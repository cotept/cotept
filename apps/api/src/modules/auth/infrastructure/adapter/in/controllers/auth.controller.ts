import { AuthFacadeService } from "@/modules/auth/application/services/facade/auth-facade.service"
import { CurrentUserId } from "@/modules/auth/infrastructure/common/decorators"
import { JwtAuthGuard } from "@/modules/auth/infrastructure/common/guards/jwt-auth.guard"
import { CookieManagerAdapter } from "@/modules/auth/infrastructure/adapter/out/services/cookie-manager.adapter"
import {
  ExchangeAuthCodeRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  SendVerificationCodeRequestDto,
  SocialLoginRequestDto,
  ValidateTokenRequestDto,
  VerifyCodeRequestDto,
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
  constructor(
    private readonly authFacadeService: AuthFacadeService,
    private readonly cookieManager: CookieManagerAdapter
  ) {}

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
    @Res({ passthrough: true }) res: Response
  ) {
    const ipAddress = req.ip
    const userAgent = req.headers["user-agent"] || ""

    const response = await this.authFacadeService.login(loginRequestDto, ipAddress, userAgent)
    
    if (response.success && response.data) {
      // 리프레시 토큰을 쿠키에 설정
      const refreshToken = response.data.refreshToken
      const expiresIn = 7 * 24 * 60 * 60 // 7일 (초 단위)
      
      this.cookieManager.setRefreshTokenCookie(res, refreshToken, expiresIn)
      
      // 응답에서 리프레시 토큰 제거 (쿠키로 설정했으므로)
      const { refreshToken: _, ...responseData } = response.data
      
      return {
        ...response,
        data: responseData,
      }
    }
    
    return response
  }

  /**
   * 토큰 갱신
   */
  @Post("refresh-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "토큰 갱신", description: "리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급합니다." })
  @ApiBody({ type: RefreshTokenRequestDto })
  @ApiOkResponse({ description: "토큰 갱신 성공" })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터" })
  @ApiUnauthorizedResponse({ description: "유효하지 않은 리프레시 토큰" })
  async refreshToken(
    @Body() refreshTokenRequestDto: RefreshTokenRequestDto, 
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const ipAddress = req.ip
    const userAgent = req.headers["user-agent"] || ""

    const response = await this.authFacadeService.refreshToken(refreshTokenRequestDto, ipAddress, userAgent)
    
    if (response.success && response.data) {
      // 리프레시 토큰을 쿠키에 설정
      const refreshToken = response.data.refreshToken
      const expiresIn = 7 * 24 * 60 * 60 // 7일 (초 단위)
      
      this.cookieManager.setRefreshTokenCookie(res, refreshToken, expiresIn)
      
      // 응답에서 리프레시 토큰 제거 (쿠키로 설정했으므로)
      const { refreshToken: _, ...responseData } = response.data
      
      return {
        ...response,
        data: responseData,
      }
    }
    
    return response
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
   * 로그아웃
   */
  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "로그아웃", description: "사용자를 로그아웃하고 토큰을 무효화합니다." })
  @ApiOkResponse({ description: "로그아웃 성공" })
  @ApiUnauthorizedResponse({ description: "인증 필요" })
  async logout(
    @Req() req: Request, 
    @Res({ passthrough: true }) res: Response,
    @CurrentUserId() userId: string
  ) {
    const token = req.headers.authorization?.split(" ")[1] || ""
    const response = await this.authFacadeService.logout(userId, token)
    
    // 리프레시 토큰 쿠키 삭제
    this.cookieManager.clearRefreshTokenCookie(res)
    
    return response
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
   * 소셜 로그인
   */
  @Post("social-login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "소셜 로그인", description: "소셜 인증 코드를 사용하여 로그인하고 토큰을 발급합니다." })
  @ApiBody({ type: SocialLoginRequestDto })
  @ApiOkResponse({ description: "소셜 로그인 성공" })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터" })
  @ApiUnauthorizedResponse({ description: "소셜 인증 실패" })
  async socialLogin(
    @Body() socialLoginRequestDto: SocialLoginRequestDto, 
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const ipAddress = req.ip
    const userAgent = req.headers["user-agent"] || ""

    const response = await this.authFacadeService.socialLogin(socialLoginRequestDto, ipAddress, userAgent)
    
    if (response.success && response.data) {
      // 리프레시 토큰을 쿠키에 설정
      const refreshToken = response.data.refreshToken
      const expiresIn = 7 * 24 * 60 * 60 // 7일 (초 단위)
      
      this.cookieManager.setRefreshTokenCookie(res, refreshToken, expiresIn)
      
      // 응답에서 리프레시 토큰 제거 (쿠키로 설정했으므로)
      const { refreshToken: _, ...responseData } = response.data
      
      return {
        ...response,
        data: responseData,
      }
    }
    
    return response
  }

  /**
   * Github 로그인
   */
  @Post("github-login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "깃허브 로그인", description: "소셜 인증 코드를 사용하여 로그인하고 토큰을 발급합니다." })
  @ApiBody({ type: SocialLoginRequestDto })
  @ApiOkResponse({ description: "깃허브 소셜 로그인 성공" })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터" })
  @ApiUnauthorizedResponse({ description: "깃허브 소셜 인증 실패" })
  async githubLogin(
    @Body() socialLoginRequestDto: SocialLoginRequestDto, 
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const ipAddress = req.ip
    const userAgent = req.headers["user-agent"] || ""

    const response = await this.authFacadeService.socialLogin(socialLoginRequestDto, ipAddress, userAgent)
    
    if (response.success && response.data) {
      // 리프레시 토큰을 쿠키에 설정
      const refreshToken = response.data.refreshToken
      const expiresIn = 7 * 24 * 60 * 60 // 7일 (초 단위)
      
      this.cookieManager.setRefreshTokenCookie(res, refreshToken, expiresIn)
      
      // 응답에서 리프레시 토큰 제거 (쿠키로 설정했으므로)
      const { refreshToken: _, ...responseData } = response.data
      
      return {
        ...response,
        data: responseData,
      }
    }
    
    return response
  }
  
  /**
   * 인증 코드 교환
   */
  @Post("exchange-code")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "인증 코드 교환", 
    description: "소셜 로그인 후 발급된 인증 코드를 토큰으로 교환합니다." 
  })
  @ApiBody({ type: ExchangeAuthCodeRequestDto })
  @ApiOkResponse({ description: "토큰 교환 성공" })
  @ApiBadRequestResponse({ description: "잘못된 요청 데이터" })
  @ApiUnauthorizedResponse({ description: "유효하지 않은 인증 코드" })
  async exchangeAuthCode(
    @Body() exchangeAuthCodeRequestDto: ExchangeAuthCodeRequestDto, 
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"] || "";
    
    const response = await this.authFacadeService.exchangeAuthCode(
      exchangeAuthCodeRequestDto, 
      ipAddress, 
      userAgent
    );
    
    if (response.success && response.data) {
      // 리프레시 토큰을 쿠키에 설정
      const refreshToken = response.data.refreshToken;
      const expiresIn = 7 * 24 * 60 * 60; // 7일 (초 단위)
      
      this.cookieManager.setRefreshTokenCookie(res, refreshToken, expiresIn);
      
      // 응답에서 리프레시 토큰 제거 (쿠키로 설정했으므로)
      const { refreshToken: _, ...responseData } = response.data;
      
      return {
        ...response,
        data: responseData,
      };
    }
    
    return response;
  }
}
