import { Injectable, NotFoundException } from "@nestjs/common"

import { RefreshTokenDto } from "@/modules/auth/application/dtos/refresh-token.dto"
import { RefreshTokenUseCase } from "@/modules/auth/application/ports/in/refresh-token.usecase"
import { AuthUserRepositoryPort } from "@/modules/auth/application/ports/out/auth-user-repository.port"
import { LoginSessionRepositoryPort } from "@/modules/auth/application/ports/out/login-session-repository.port"
import { TokenGeneratorPort } from "@/modules/auth/application/ports/out/token-generator.port"
import { TokenStoragePort } from "@/modules/auth/application/ports/out/token-storage.port"
import {
  AccountDeactivatedException,
  InvalidTokenException,
  TokenTheftSuspectedException,
} from "@/modules/auth/domain/model/auth-exception"
import { LoginSession } from "@/modules/auth/domain/model/login-session"
import { TokenPair } from "@/modules/auth/domain/model/token-pair"
import { convertJwtUserIdToNumber } from "@/shared/utils/auth-type-converter.util"

/**
 * 토큰 갱신 유스케이스 구현체
 */
@Injectable()
export class RefreshTokenUseCaseImpl implements RefreshTokenUseCase {
  constructor(
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly loginSessionRepository: LoginSessionRepositoryPort,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly tokenStorage: TokenStoragePort,
  ) {}

  /**
   * 리프레시 토큰을 사용하여 새로운 액세스 토큰과 리프레시 토큰 발급
   * @param refreshTokenDto 토큰 갱신 정보(리프레시 토큰, IP, User-Agent)
   * @returns 새로운 액세스 토큰과 리프레시 토큰 쌍
   */
  async execute(refreshTokenDto: RefreshTokenDto): Promise<TokenPair> {
    // 1. 리프레시 토큰 검증
    const tokenPayload = this.tokenGenerator.verifyRefreshToken(refreshTokenDto.refreshToken)
    if (!tokenPayload) {
      throw new InvalidTokenException("Invalid refresh token")
    }

    // 2. 토큰 패밀리 ID 확인
    if (!tokenPayload.sub || !tokenPayload.family) {
      throw new InvalidTokenException("Invalid token claims")
    }

    // 3. 토큰 패밀리 검증
    const userId = convertJwtUserIdToNumber(tokenPayload.sub, "RefreshToken 사용자 ID 변환")
    const storedTokenId = await this.tokenStorage.getRefreshTokenFamily(userId, tokenPayload.family)

    if (!storedTokenId || storedTokenId !== tokenPayload.jti) {
      // 토큰 재사용 감지 - 모든 토큰 패밀리 삭제 (보안 조치)
      await this.tokenStorage.deleteAllRefreshTokenFamilies(userId)
      throw new TokenTheftSuspectedException("Token reuse detected")
    }

    // 4. 사용자 조회
    const user = await this.authUserRepository.findById(userId)
    if (!user) {
      throw new NotFoundException("User not found")
    }

    // 5. 계정 상태 확인
    if (!user.canLogin()) {
      throw new AccountDeactivatedException("Account is not active")
    }

    // 6. 기존 토큰 패밀리 삭제
    await this.tokenStorage.deleteRefreshTokenFamily(userId, tokenPayload.family)

    // 7. 새 토큰 생성
    const newTokenPair = this.tokenGenerator.generateTokenPair(user.id, user.email, user.role)

    // 8. 새 토큰 패밀리 저장
    if (newTokenPair.familyId) {
      await this.tokenStorage.saveRefreshTokenFamily(
        user.id,
        newTokenPair.familyId,
        newTokenPair.refreshToken,
        newTokenPair.refreshTokenExpiresIn,
      )
    }

    // 9. 새 로그인 세션 생성 및 저장
    const sessionId = Date.now() // UUID 대신 timestamp 기반 number ID 사용
    const loginSession = LoginSession.create(
      sessionId,
      user.id,
      newTokenPair.accessToken,
      refreshTokenDto.ipAddress || "",
      refreshTokenDto.userAgent || "",
      newTokenPair.accessTokenExpiresIn,
    )
    await this.loginSessionRepository.save(loginSession)

    // 10. 새 토큰 쌍 반환
    return newTokenPair
  }
}
