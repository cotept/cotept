import { LogoutDto } from "@/modules/auth/application/dtos/logout.dto"
import { LogoutUseCase } from "@/modules/auth/application/ports/in/logout.usecase"
import { LoginSessionRepositoryPort } from "@/modules/auth/application/ports/out/login-session-repository.port"
import { TokenGeneratorPort } from "@/modules/auth/application/ports/out/token-generator.port"
import { TokenStoragePort } from "@/modules/auth/application/ports/out/token-storage.port"
import { InvalidTokenException } from "@/modules/auth/domain/model/auth-exception"
import { Injectable, UnauthorizedException } from "@nestjs/common"

/**
 * 로그아웃 유스케이스 구현체
 */
@Injectable()
export class LogoutUseCaseImpl implements LogoutUseCase {
  constructor(
    private readonly loginSessionRepository: LoginSessionRepositoryPort,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly tokenStorage: TokenStoragePort,
  ) {}

  /**
   * 사용자 로그아웃 처리
   * @param logoutDto 로그아웃 정보(사용자 ID, 토큰)
   */
  async execute(logoutDto: LogoutDto): Promise<void> {
    // 1. 액세스 토큰 검증
    const tokenPayload = this.tokenGenerator.verifyAccessToken(logoutDto.token)
    if (!tokenPayload) {
      throw new InvalidTokenException("Invalid token")
    }

    // 2. 토큰의 사용자 ID와 요청 사용자 ID 일치 확인
    if (tokenPayload.sub !== logoutDto.userId) {
      throw new UnauthorizedException("Unauthorized")
    }

    // 3. 토큰 블랙리스트에 추가
    if (tokenPayload.exp && tokenPayload.jti) {
      const expiresIn = Math.floor(tokenPayload.exp - Date.now() / 1000)
      if (expiresIn > 0) {
        await this.tokenStorage.addToBlacklist(tokenPayload.jti, expiresIn)
      }
    }

    // 4. 현재 세션 종료 처리
    const session = await this.loginSessionRepository.findByToken(logoutDto.token)
    if (session) {
      session.logout()
      await this.loginSessionRepository.save(session)
    }

    // 5. (선택적) 모든 리프레시 토큰 패밀리 삭제
    // 일반적으로 로그아웃 시에는 해당 세션만 종료하고, 다른 기기의 세션은 유지합니다.
    // 필요에 따라 모든 세션 종료 기능을 별도로 구현할 수 있습니다.
    // await this.tokenStorage.deleteAllRefreshTokenFamilies(logoutDto.userId);
  }
}
