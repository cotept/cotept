import { Injectable, Logger, UnauthorizedException } from "@nestjs/common"

import { LoginDto } from "@/modules/auth/application/dtos/login.dto"
import { LoginUseCase } from "@/modules/auth/application/ports/in/login.usecase"
import { AuthUserRepositoryPort } from "@/modules/auth/application/ports/out/auth-user-repository.port"
import { LoginSessionRepositoryPort } from "@/modules/auth/application/ports/out/login-session-repository.port"
import { PasswordHasherPort } from "@/modules/auth/application/ports/out/password-hasher.port"
import { TokenGeneratorPort } from "@/modules/auth/application/ports/out/token-generator.port"
import { TokenStoragePort } from "@/modules/auth/application/ports/out/token-storage.port"
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/domain/constants/auth-error-messages"
import { LoginSession } from "@/modules/auth/domain/model/login-session"
import { TokenPair } from "@/modules/auth/domain/model/token-pair"
import { ErrorUtils } from "@/shared/utils/error.util"
/**
 * 로그인 유스케이스 구현체
 */
@Injectable()
export class LoginUseCaseImpl implements LoginUseCase {
  private readonly logger = new Logger(LoginUseCaseImpl.name)

  constructor(
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly loginSessionRepository: LoginSessionRepositoryPort,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly tokenStorage: TokenStoragePort,
  ) {}

  /**
   * 아이디와 비밀번호로 사용자를 인증하고 토큰 발급
   * @param loginDto 로그인 정보(아이디, 비밀번호, IP, User-Agent)
   * @returns 액세스 토큰과 리프레시 토큰 쌍
   */
  async execute(loginDto: LoginDto): Promise<TokenPair> {
    try {
      // 1. 사용자 인증
      const user = await this.authUserRepository.findByUserId(loginDto.id)
      if (!user) {
        throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS)
      }

      // 2. 비밀번호 검증
      const isValid = await this.passwordHasher.verify(loginDto.password, user.getPasswordHash())
      if (!isValid) {
        throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS)
      }

      // 3. 계정 상태 확인
      if (!user.canLogin()) {
        throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCOUNT_NOT_ACTIVE)
      }

      // 4. 토큰 생성
      const tokenPair = this.tokenGenerator.generateTokenPair(user.id, user.email, user.role)

      // 5. 리프레시 토큰 패밀리 저장
      if (tokenPair.familyId) {
        await this.tokenStorage.saveRefreshTokenFamily(
          user.id,
          tokenPair.familyId,
          tokenPair.refreshToken,
          tokenPair.refreshTokenExpiresIn,
        )
      }

      // 6. 로그인 세션 생성 및 저장
      const sessionId = Date.now() // UUID 대신 timestamp 기반 number ID 사용
      const loginSession = LoginSession.create(
        sessionId,
        user.id,
        tokenPair.accessToken,
        loginDto.ipAddress || "",
        loginDto.userAgent || "",
        tokenPair.accessTokenExpiresIn,
      )
      await this.loginSessionRepository.save(loginSession)

      // 7. 토큰 쌍 반환
      return tokenPair
    } catch (error) {
      this.logger.error(
        `로그인 처리 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }
}
