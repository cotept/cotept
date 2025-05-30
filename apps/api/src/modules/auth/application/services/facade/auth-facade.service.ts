import { FindIdDto } from "@/modules/auth/application/dtos/find-id.dto"
import { GenerateAuthCodeDto } from "@/modules/auth/application/dtos/generate-auth-code.dto"
import { LoginDto } from "@/modules/auth/application/dtos/login.dto"
import { ResetPasswordDto } from "@/modules/auth/application/dtos/reset-password.dto"
import { SocialAuthCallbackDto } from "@/modules/auth/application/dtos/social-auth-callback.dto"
import { ValidateAuthCodeDto } from "@/modules/auth/application/dtos/validate-auth-code.dto"
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
import { ApiResponse } from "@/shared/infrastructure/dto/api-response.dto"
import { ErrorUtils } from "@/shared/utils/error.util"
import { HttpStatus, Injectable, Logger, UnauthorizedException } from "@nestjs/common"
import { Response } from "express"

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
    private readonly findIdUseCase: FindIdUseCase,                // 추가
    private readonly resetPasswordUseCase: ResetPasswordUseCase,  // 추가
    private readonly authRequestMapper: AuthRequestMapper,
    private readonly cookieManager: CookieManagerAdapter,
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenStorage: TokenStoragePort,
  ) {}

  /**
   * 사용자 로그인 및 토큰 발급
   */
  async login(loginRequestDto: LoginRequestDto, ipAddress?: string, userAgent?: string, res?: Response) {
    try {
      const loginDto = this.authRequestMapper.toLoginDto(loginRequestDto, ipAddress, userAgent)

      const tokenPair = await this.loginUseCase.execute(loginDto)

      // 응답 객체가 있는 경우 쿠키에 리프레시 토큰 설정
      if (res && tokenPair.refreshToken) {
        const refreshTokenExpiresIn = 7 * 24 * 60 * 60 * 1000 // 7일 (밀리초 단위)
        this.cookieManager.setRefreshTokenCookie(res, tokenPair.refreshToken, refreshTokenExpiresIn)

        // 리프레시 토큰을 응답에서 제외
        const responseObj = tokenPair.toResponseObject()
        const responseData = {
          accessToken: responseObj.accessToken,
          expiresIn: responseObj.expiresIn,
        }

        return new ApiResponse(HttpStatus.OK, true, "로그인 성공", responseData)
      }

      // 응답 객체가 없는 경우 모든 정보 반환
      return new ApiResponse(HttpStatus.OK, true, "로그인 성공", tokenPair.toResponseObject())
    } catch (error) {
      this.logger.error(`로그인 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`, ErrorUtils.getErrorStack(error))
      throw error
    }
  }

  /**
   * 사용자 로그아웃
   */
  async logout(userId: string, token: string, res?: Response) {
    try {
      const logoutDto = this.authRequestMapper.toLogoutDto(userId, token)

      await this.logoutUseCase.execute(logoutDto)

      // 응답 객체가 있는 경우 리프레시 토큰 쿠키 삭제
      if (res) {
        this.cookieManager.clearRefreshTokenCookie(res)
      }

      return new ApiResponse(HttpStatus.OK, true, "로그아웃 성공")
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
  ) {
    try {
      const refreshTokenDto = this.authRequestMapper.toRefreshTokenDto(refreshTokenRequestDto, ipAddress, userAgent)

      const tokenPair = await this.refreshTokenUseCase.execute(refreshTokenDto)

      // 응답 객체가 있는 경우 쿠키에 리프레시 토큰 설정
      if (res && tokenPair.refreshToken) {
        const refreshTokenExpiresIn = 7 * 24 * 60 * 60 * 1000 // 7일 (밀리초 단위)
        this.cookieManager.setRefreshTokenCookie(res, tokenPair.refreshToken, refreshTokenExpiresIn)

        // 리프레시 토큰을 응답에서 제외
        const responseObj = tokenPair.toResponseObject()
        const responseData = {
          accessToken: responseObj.accessToken,
          expiresIn: responseObj.expiresIn,
        }

        return new ApiResponse(HttpStatus.OK, true, "토큰 갱신 성공", responseData)
      }

      return new ApiResponse(HttpStatus.OK, true, "토큰 갱신 성공", tokenPair.toResponseObject())
    } catch (error) {
      this.logger.error(`토큰 갱신 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`, ErrorUtils.getErrorStack(error))
      throw error
    }
  }

  /**
   * 토큰 유효성 검증
   */
  async validateToken(validateTokenRequestDto: ValidateTokenRequestDto) {
    try {
      const validateTokenDto = this.authRequestMapper.toValidateTokenDto(validateTokenRequestDto)

      const tokenPayload = await this.validateTokenUseCase.execute(validateTokenDto)

      const isValid = !!tokenPayload
      const response = {
        isValid,
        ...(isValid && {
          userId: tokenPayload!.sub,
          email: tokenPayload!.email,
          role: tokenPayload!.role,
        }),
      }

      return new ApiResponse(
        HttpStatus.OK,
        true,
        isValid ? "유효한 토큰입니다." : "유효하지 않은 토큰입니다.",
        response,
      )
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
  ) {
    try {
      const sendVerificationCodeDto = this.authRequestMapper.toSendVerificationCodeDto(
        sendVerificationCodeRequestDto,
        userId,
        ipAddress,
      )

      const result = await this.sendVerificationCodeUseCase.execute(sendVerificationCodeDto)

      return new ApiResponse(HttpStatus.OK, true, "인증 코드가 발송되었습니다.", {
        verificationId: result.verificationId,
        expiresAt: result.expiresAt.toISOString(),
      })
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
  async verifyCode(verifyCodeRequestDto: VerifyCodeRequestDto) {
    try {
      const verifyCodeDto = this.authRequestMapper.toVerifyCodeDto(verifyCodeRequestDto)

      const success = await this.verifyCodeUseCase.execute(verifyCodeDto)

      return new ApiResponse(
        HttpStatus.OK,
        success,
        success ? "인증이 완료되었습니다." : "유효하지 않은 인증 코드입니다.",
        { success },
      )
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
  async findId(findIdRequestDto: FindIdRequestDto, ipAddress?: string) {
    try {
      const findIdDto = this.authRequestMapper.toFindIdDto(findIdRequestDto, ipAddress)

      const result = await this.findIdUseCase.execute(findIdDto)

      return new ApiResponse(HttpStatus.OK, true, "아이디 찾기 성공", {
        email: result.maskingEmail, // 마스킹된 이메일만 반환
      })
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
  async resetPassword(resetPasswordRequestDto: ResetPasswordRequestDto, ipAddress?: string) {
    try {
      const resetPasswordDto = this.authRequestMapper.toResetPasswordDto(resetPasswordRequestDto, ipAddress)

      const success = await this.resetPasswordUseCase.execute(resetPasswordDto)

      return new ApiResponse(
        HttpStatus.OK,
        success,
        success ? "비밀번호가 성공적으로 변경되었습니다." : "비밀번호 변경에 실패했습니다.",
        { success },
      )
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
  async handleSocialAuthCallback(callbackParams: SocialAuthCallbackDto) {
    try {
      return await this.socialAuthCallbackUseCase.execute(callbackParams)
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
  async generateAuthCode(userId: string) {
    try {
      const generateAuthCodeDto = new GenerateAuthCodeDto(userId)
      const result = await this.generateAuthCodeUseCase.execute(generateAuthCodeDto)

      return new ApiResponse(HttpStatus.OK, true, "인증 코드 생성 성공", {
        code: result.code,
        expiresAt: result.expiresAt.toISOString(),
      })
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
  ) {
    try {
      // 인증 코드 검증
      const validateAuthCodeDto = new ValidateAuthCodeDto(exchangeAuthCodeRequestDto.code)
      const validationResult = await this.validateAuthCodeUseCase.execute(validateAuthCodeDto)

      if (!validationResult.isValid) {
        throw new UnauthorizedException("유효하지 않은 인증 코드입니다.")
      }

      // 사용자 정보 조회
      const userId = validationResult.userId
      const user = await this.authUserRepository.findById(userId)

      if (!user) {
        throw new UnauthorizedException("사용자를 찾을 수 없습니다.")
      }

      // 토큰 생성을 위해 LoginDto 생성
      const loginDto = new LoginDto()
      loginDto.email = user.getEmail() // 실제 이메일 사용
      loginDto.password = "" // 소셜 로그인은 비밀번호 검증을 하지 않음
      loginDto.ipAddress = ipAddress
      loginDto.userAgent = userAgent

      // 로그인 유스케이스를 통해 토큰 발급
      const tokenPair = await this.loginUseCase.execute(loginDto)

      // 응답 객체가 있는 경우 쿠키에 리프레시 토큰 설정
      if (res && tokenPair.refreshToken) {
        const refreshTokenExpiresIn = 7 * 24 * 60 * 60 * 1000 // 7일 (밀리초 단위)
        this.cookieManager.setRefreshTokenCookie(res, tokenPair.refreshToken, refreshTokenExpiresIn)

        // 리프레시 토큰을 응답에서 제외
        const responseObj = tokenPair.toResponseObject()
        const responseData = {
          accessToken: responseObj.accessToken,
          expiresIn: responseObj.expiresIn,
        }

        return new ApiResponse(HttpStatus.OK, true, "인증 코드 교환 성공", responseData)
      }

      return new ApiResponse(HttpStatus.OK, true, "인증 코드 교환 성공", tokenPair.toResponseObject())
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
      return await this.authUserRepository.findById(id)
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
  ) {
    try {
      // 1. 임시 토큰 검증
      const pendingInfo = await this.tokenStorage.getPendingLinkInfo(confirmSocialLinkRequestDto.token)
      if (!pendingInfo) {
        throw new UnauthorizedException("유효하지 않거나 만료된 요청입니다.")
      }

      // 2. 사용자 결정에 따른 처리
      if (confirmSocialLinkRequestDto.approved) {
        // 기존 connectSocialAccount 메서드 활용
        await this.authUserRepository.connectSocialAccount(
          pendingInfo.userId,
          pendingInfo.provider,
          pendingInfo.socialId,
          pendingInfo.accessToken,
          pendingInfo.refreshToken,
          pendingInfo.profileData,
        )

        // 기존 login 로직 활용하여 토큰 발급
        const loginDto = new LoginDto()
        loginDto.email = pendingInfo.email
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

        return new ApiResponse(HttpStatus.OK, true, "계정 연결 및 로그인 성공", {
          accessToken: tokenPair.accessToken,
          expiresIn: tokenPair.accessTokenExpiresIn,
        })
      } else {
        // 연결 거부
        await this.tokenStorage.deletePendingLinkInfo(confirmSocialLinkRequestDto.token)
        return new ApiResponse(HttpStatus.OK, true, "계정 연결이 취소되었습니다.", { success: false })
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
