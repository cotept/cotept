import { Injectable, Logger, UnauthorizedException } from "@nestjs/common"

import { Response } from "express"

import { convertJwtUserIdToNumber, convertDomainUserIdToString } from "@/shared/utils/auth-type-converter.util"
import { GenerateAuthCodeDto } from "@/modules/auth/application/dtos/generate-auth-code.dto"
import { LoginDto } from "@/modules/auth/application/dtos/login.dto"
import { SocialAuthCallbackDto } from "@/modules/auth/application/dtos/social-auth-callback.dto"
import { ValidateAuthCodeDto } from "@/modules/auth/application/dtos/validate-auth-code.dto"
import { AuthResponseMapper } from "@/modules/auth/application/mappers/auth-response.mapper"
import { FindIdUseCase } from "@/modules/auth/application/ports/in/find-id.usecase"
import { GenerateAuthCodeUseCase } from "@/modules/auth/application/ports/in/generate-auth-code.usecase"
import { LoginUseCase } from "@/modules/auth/application/ports/in/login.usecase"
import { LogoutUseCase } from "@/modules/auth/application/ports/in/logout.usecase"
import { RefreshTokenUseCase } from "@/modules/auth/application/ports/in/refresh-token.usecase"
import { ResetPasswordUseCase } from "@/modules/auth/application/ports/in/reset-password.usecase"
import { SendVerificationCodeUseCase } from "@/modules/auth/application/ports/in/send-verification-code.usecase"
import { SocialAuthCallbackUseCase } from "@/modules/auth/application/ports/in/social-auth-callback.usecase"
import { ValidateAuthCodeUseCase } from "@/modules/auth/application/ports/in/validate-auth-code.usecase"
import { ValidateTokenUseCase } from "@/modules/auth/application/ports/in/validate-token.usecase"
import { VerifyCodeUseCase } from "@/modules/auth/application/ports/in/verify-code.usecase"
import { AuthUserRepositoryPort } from "@/modules/auth/application/ports/out/auth-user-repository.port"
import { PasswordHasherPort } from "@/modules/auth/application/ports/out/password-hasher.port"
import { TokenStoragePort } from "@/modules/auth/application/ports/out/token-storage.port"
import { AuthUser } from "@/modules/auth/domain/model/auth-user"
import { AuthRequestMapper } from "@/modules/auth/infrastructure/adapter/in/mappers/auth-request.mapper"
import { CookieManagerAdapter } from "@/modules/auth/infrastructure/adapter/out/services/cookie-manager.adapter"
import {
  ConfirmSocialLinkRequestDto,
  ExchangeAuthCodeRequestDto,
  FindIdRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  ResetPasswordRequestDto,
  SendVerificationCodeRequestDto,
  ValidateTokenRequestDto,
  VerifyCodeRequestDto,
} from "@/modules/auth/infrastructure/dtos/request"
import {
  FindIdResponseDto,
  LogoutResponseDto,
  ResetPasswordResponseDto,
  SocialLinkConfirmationResponseDto,
  SocialRedirectResponseDto,
  TokenResponseDto,
  ValidationResultResponseDto,
  VerificationCodeResponseDto,
  VerificationResultResponseDto,
} from "@/modules/auth/infrastructure/dtos/response"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * 인증 관련 파사드 서비스
 * 컨트롤러와 유스케이스 사이의 중간 레이어로 동작하며 컨트롤러의 복잡성을 줄이는 역할을 합니다.
 * 모든 인증 관련 로직에 대한 단일 진입점을 제공합니다.
 */
@Injectable()
export class AuthFacadeService {
  private readonly logger = new Logger(AuthFacadeService.name)
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly sendVerificationCodeUseCase: SendVerificationCodeUseCase,
    private readonly verifyCodeUseCase: VerifyCodeUseCase,
    private readonly socialAuthCallbackUseCase: SocialAuthCallbackUseCase,
    private readonly generateAuthCodeUseCase: GenerateAuthCodeUseCase,
    private readonly validateAuthCodeUseCase: ValidateAuthCodeUseCase,
    private readonly findIdUseCase: FindIdUseCase, // 추가
    private readonly resetPasswordUseCase: ResetPasswordUseCase, // 추가
    private readonly authRequestMapper: AuthRequestMapper,
    private readonly authResponseMapper: AuthResponseMapper,
    private readonly cookieManager: CookieManagerAdapter,
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenStorage: TokenStoragePort,
  ) {}

  /**
   * 사용자 로그인 및 토큰 발급
   */
  async login(
    loginRequestDto: LoginRequestDto,
    ipAddress?: string,
    userAgent?: string,
    res?: Response,
  ): Promise<TokenResponseDto> {
    try {
      const loginDto = this.authRequestMapper.toLoginDto(loginRequestDto, ipAddress, userAgent)

      const tokenPair = await this.loginUseCase.execute(loginDto)

      // 응답 객체가 있는 경우 쿠키에 리프레시 토큰 설정
      if (res && tokenPair.refreshToken) {
        const refreshTokenExpiresIn = 7 * 24 * 60 * 60 * 1000 // 7일 (밀리초 단위)
        this.cookieManager.setRefreshTokenCookie(res, tokenPair.refreshToken, refreshTokenExpiresIn)

        // 리프레시 토큰을 응답에서 제외한 토큰 응답 생성
        const tokenResponse = this.authResponseMapper.toTokenResponse(tokenPair)
        tokenResponse.refreshToken = "" // 쿠키로 설정되므로 응답에서 제외
        return tokenResponse
      }

      // 응답 객체가 없는 경우 모든 정보 반환
      return this.authResponseMapper.toTokenResponse(tokenPair)
    } catch (error) {
      this.logger.error(`로그인 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`, ErrorUtils.getErrorStack(error))
      throw error
    }
  }

  /**
   * 사용자 로그아웃
   */
  async logout(userId: string, token: string, res?: Response): Promise<LogoutResponseDto> {
    try {
      const logoutDto = this.authRequestMapper.toLogoutDto(userId, token)

      await this.logoutUseCase.execute(logoutDto)

      // 응답 객체가 있는 경우 리프레시 토큰 쿠키 삭제
      if (res) {
        this.cookieManager.clearRefreshTokenCookie(res)
      }

      return this.authResponseMapper.toLogoutResponse()
    } catch (error) {
      this.logger.error(`로그아웃 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`, ErrorUtils.getErrorStack(error))
      throw error
    }
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(
    refreshTokenRequestDto: RefreshTokenRequestDto,
    ipAddress?: string,
    userAgent?: string,
    res?: Response,
  ): Promise<TokenResponseDto> {
    try {
      const refreshTokenDto = this.authRequestMapper.toRefreshTokenDto(refreshTokenRequestDto, ipAddress, userAgent)

      const tokenPair = await this.refreshTokenUseCase.execute(refreshTokenDto)

      // 응답 객체가 있는 경우 쿠키에 리프레시 토큰 설정
      if (res && tokenPair.refreshToken) {
        const refreshTokenExpiresIn = 7 * 24 * 60 * 60 * 1000 // 7일 (밀리초 단위)
        this.cookieManager.setRefreshTokenCookie(res, tokenPair.refreshToken, refreshTokenExpiresIn)

        // 리프레시 토큰을 응답에서 제외한 토큰 응답 생성
        const tokenResponse = this.authResponseMapper.toTokenResponse(tokenPair)
        tokenResponse.refreshToken = "" // 쿠키로 설정되므로 응답에서 제외
        return tokenResponse
      }

      // 응답 객체가 없는 경우 모든 정보 반환
      return this.authResponseMapper.toTokenResponse(tokenPair)
    } catch (error) {
      this.logger.error(`토큰 갱신 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`, ErrorUtils.getErrorStack(error))
      throw error
    }
  }

  /**
   * 토큰 유효성 검증
   */
  async validateToken(validateTokenRequestDto: ValidateTokenRequestDto): Promise<ValidationResultResponseDto> {
    try {
      const validateTokenDto = this.authRequestMapper.toValidateTokenDto(validateTokenRequestDto)

      const tokenPayload = await this.validateTokenUseCase.execute(validateTokenDto)

      const isValid = !!tokenPayload
      const userId = isValid ? tokenPayload!.sub : undefined

      return this.authResponseMapper.toValidationResponse(isValid, userId)
    } catch (error) {
      this.logger.error(`토큰 검증 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`, ErrorUtils.getErrorStack(error))
      throw error
    }
  }

  /**
   * 인증 코드 발송
   */
  async sendVerificationCode(
    sendVerificationCodeRequestDto: SendVerificationCodeRequestDto,
    userId?: string,
    ipAddress?: string,
  ): Promise<VerificationCodeResponseDto> {
    try {
      const sendVerificationCodeDto = this.authRequestMapper.toSendVerificationCodeDto(
        sendVerificationCodeRequestDto,
        userId,
        ipAddress,
      )

      const result = await this.sendVerificationCodeUseCase.execute(sendVerificationCodeDto)

      return this.authResponseMapper.toVerificationCodeResponse(result.verificationId, result.expiresAt)
    } catch (error) {
      this.logger.error(
        `인증 코드 발송 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 인증 코드 확인
   */
  async verifyCode(verifyCodeRequestDto: VerifyCodeRequestDto): Promise<VerificationResultResponseDto> {
    try {
      const verifyCodeDto = this.authRequestMapper.toVerifyCodeDto(verifyCodeRequestDto)

      const success = await this.verifyCodeUseCase.execute(verifyCodeDto)

      return this.authResponseMapper.toVerificationResultResponse(success)
    } catch (error) {
      this.logger.error(
        `인증 코드 확인 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 아이디 찾기
   */
  async findId(findIdRequestDto: FindIdRequestDto, ipAddress?: string): Promise<FindIdResponseDto> {
    try {
      const findIdDto = this.authRequestMapper.toFindIdDto(findIdRequestDto, ipAddress)

      const result = await this.findIdUseCase.execute(findIdDto)

      return this.authResponseMapper.toFindIdResponse(result.maskingId)
    } catch (error) {
      this.logger.error(
        `아이디 찾기 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 비밀번호 재설정
   */
  async resetPassword(
    resetPasswordRequestDto: ResetPasswordRequestDto,
    ipAddress?: string,
  ): Promise<ResetPasswordResponseDto> {
    try {
      const resetPasswordDto = this.authRequestMapper.toResetPasswordDto(resetPasswordRequestDto, ipAddress)

      await this.resetPasswordUseCase.execute(resetPasswordDto)

      return this.authResponseMapper.toResetPasswordResponse()
    } catch (error) {
      this.logger.error(
        `비밀번호 재설정 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 소셜 인증 콜백 처리
   * @param callbackParams 콜백 처리에 필요한 매개변수
   */
  async handleSocialAuthCallback(callbackParams: SocialAuthCallbackDto): Promise<SocialRedirectResponseDto> {
    try {
      const result = await this.socialAuthCallbackUseCase.execute(callbackParams)
      return this.authResponseMapper.toSocialRedirectResponse(result.redirectUrl)
    } catch (error) {
      this.logger.error(
        `소셜 인증 콜백 처리 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 인증 코드 생성
   * @param userId 사용자 ID
   * @returns 인증 코드 정보
   */
  async generateAuthCode(userId: string): Promise<VerificationCodeResponseDto> {
    try {
      const generateAuthCodeDto = new GenerateAuthCodeDto(userId)
      const result = await this.generateAuthCodeUseCase.execute(generateAuthCodeDto)

      return this.authResponseMapper.toVerificationCodeResponse(result.code, result.expiresAt)
    } catch (error) {
      this.logger.error(
        `인증 코드 생성 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 자체 인증 코드 교환
   * @param exchangeAuthCodeRequestDto 인증 코드 교환 요청 DTO
   * @param ipAddress IP 주소
   * @param userAgent 사용자 에이전트 문자열
   * @param res Express Response 객체
   * @returns 토큰 교환 결과
   */
  async exchangeAuthCode(
    exchangeAuthCodeRequestDto: ExchangeAuthCodeRequestDto,
    ipAddress?: string,
    userAgent?: string,
    res?: Response,
  ): Promise<TokenResponseDto> {
    try {
      // 인증 코드 검증
      const validateAuthCodeDto = new ValidateAuthCodeDto(exchangeAuthCodeRequestDto.code)
      const validationResult = await this.validateAuthCodeUseCase.execute(validateAuthCodeDto)

      if (!validationResult.isValid) {
        throw new UnauthorizedException("유효하지 않은 인증 코드입니다.")
      }

      // 사용자 정보 조회
      const userId = validationResult.userId
      const numericUserId = convertJwtUserIdToNumber(userId, "ExchangeAuthCode userId 변환")
      const user = await this.authUserRepository.findById(numericUserId)

      if (!user) {
        throw new UnauthorizedException("사용자를 찾을 수 없습니다.")
      }

      // 토큰 생성을 위해 LoginDto 생성
      const loginDto = new LoginDto()
      loginDto.id = convertDomainUserIdToString(user.getId()) // number를 string으로 변환
      loginDto.password = "" // 소셜 로그인은 비밀번호 검증을 하지 않음
      loginDto.ipAddress = ipAddress
      loginDto.userAgent = userAgent

      // 로그인 유스케이스를 통해 토큰 발급
      const tokenPair = await this.loginUseCase.execute(loginDto)

      // 응답 객체가 있는 경우 쿠키에 리프레시 토큰 설정
      if (res && tokenPair.refreshToken) {
        const refreshTokenExpiresIn = 7 * 24 * 60 * 60 * 1000 // 7일 (밀리초 단위)
        this.cookieManager.setRefreshTokenCookie(res, tokenPair.refreshToken, refreshTokenExpiresIn)

        // 리프레시 토큰을 응답에서 제외한 토큰 응답 생성
        const tokenResponse = this.authResponseMapper.toTokenResponse(tokenPair)
        tokenResponse.refreshToken = "" // 쿠키로 설정되므로 응답에서 제외
        return tokenResponse
      }

      // 응답 객체가 없는 경우 모든 정보 반환
      return this.authResponseMapper.toTokenResponse(tokenPair)
    } catch (error) {
      this.logger.error(
        `인증 코드 교환 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 사용자 인증 정보 확인
   * @param email 이메일
   * @param password 비밀번호
   * @returns 인증 성공 여부
   */
  async validateCredentials(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.findUserByEmail(email)
      if (!user) return false

      // 비밀번호 검증 로직
      return await this.passwordHasher.verify(password, user.getPasswordHash())
    } catch (error) {
      this.logger.error(
        `사용자 인증 정보 확인 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      return false
    }
  }

  /**
   * 이메일로 사용자 찾기
   * @param email 이메일
   * @returns 사용자 또는 null
   */
  async findUserByEmail(email: string): Promise<AuthUser | null> {
    try {
      return await this.authUserRepository.findByEmail(email)
    } catch (error) {
      this.logger.error(
        `이메일로 사용자 찾기 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      return null
    }
  }

  /**
   * ID로 사용자 찾기
   * @param id 사용자 ID
   * @returns 사용자 또는 null
   */
  async findUserById(id: string): Promise<AuthUser | null> {
    try {
      const numericId = convertJwtUserIdToNumber(id, "FindUserById 변환")
      return await this.authUserRepository.findById(numericId)
    } catch (error) {
      this.logger.error(
        `ID로 사용자 찾기 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      return null
    }
  }

  /**
   * 소셜 계정 연결 확인
   * @param confirmSocialLinkRequestDto 소셜 계정 연결 확인 요청 DTO
   * @param ipAddress IP 주소
   * @param userAgent 사용자 에이전트 문자열
   * @param res Express Response 객체
   * @returns 계정 연결 처리 결과
   */
  async confirmSocialLink(
    confirmSocialLinkRequestDto: ConfirmSocialLinkRequestDto,
    ipAddress?: string,
    userAgent?: string,
    res?: Response,
  ): Promise<SocialLinkConfirmationResponseDto | TokenResponseDto> {
    try {
      // 1. 임시 토큰 검증
      const pendingInfo = await this.tokenStorage.getPendingLinkInfo(confirmSocialLinkRequestDto.token)
      if (!pendingInfo) {
        throw new UnauthorizedException("유효하지 않거나 만료된 요청입니다.")
      }

      // 2. 사용자 결정에 따른 처리
      if (confirmSocialLinkRequestDto.approved) {
        // 기존 connectSocialAccount 메서드 활용
        const numericUserId = convertJwtUserIdToNumber(pendingInfo.userId, "ConnectSocialAccount userId 변환")
        await this.authUserRepository.connectSocialAccount(
          numericUserId,
          pendingInfo.provider,
          pendingInfo.socialId,
          pendingInfo.accessToken,
          pendingInfo.refreshToken,
          pendingInfo.profileData,
        )

        // 이메일로 사용자 찾아서 아이디 가져오기
        const user = await this.authUserRepository.findByEmail(pendingInfo.email)
        if (!user) {
          throw new UnauthorizedException("해당 이메일과 연결된 사용자를 찾을 수 없습니다.")
        }

        // 기존 login 로직 활용하여 토큰 발급
        const loginDto = new LoginDto()
        loginDto.id = convertDomainUserIdToString(user.getId()) // number를 string으로 변환
        loginDto.password = "" // 소셜 로그인은 비밀번호 불필요
        loginDto.ipAddress = ipAddress
        loginDto.userAgent = userAgent

        const tokenPair = await this.loginUseCase.execute(loginDto)

        // 기존 쿠키 설정 로직 활용
        if (res && tokenPair.refreshToken) {
          this.cookieManager.setRefreshTokenCookie(res, tokenPair.refreshToken, tokenPair.refreshTokenExpiresIn)
        }

        // 사용된 토큰 삭제
        await this.tokenStorage.deletePendingLinkInfo(confirmSocialLinkRequestDto.token)

        // 리프레시 토큰을 응답에서 제외한 토큰 응답 생성
        const tokenResponse = this.authResponseMapper.toTokenResponse(tokenPair)
        if (res) {
          tokenResponse.refreshToken = "" // 쿠키로 설정되므로 응답에서 제외
        }
        return tokenResponse
      } else {
        // 연결 거부
        await this.tokenStorage.deletePendingLinkInfo(confirmSocialLinkRequestDto.token)
        return this.authResponseMapper.toSocialLinkConfirmationResponse(false)
      }
    } catch (error) {
      this.logger.error(
        `소셜 계정 연결 확인 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }
}
