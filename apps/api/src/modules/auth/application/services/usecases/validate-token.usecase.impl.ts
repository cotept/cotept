import { Injectable } from "@nestjs/common"

import { ValidateTokenDto } from "@/modules/auth/application/dtos/validate-token.dto"
import { TokenMapper } from "@/modules/auth/application/mappers"
import { ValidateTokenUseCase } from "@/modules/auth/application/ports/in/validate-token.usecase"
import { TokenGeneratorPort } from "@/modules/auth/application/ports/out/token-generator.port"
import { TokenStoragePort } from "@/modules/auth/application/ports/out/token-storage.port"
import { TokenPayload } from "@/modules/auth/domain/model/token-payload"

/**
 * 토큰 검증 유스케이스 구현체
 */
@Injectable()
export class ValidateTokenUseCaseImpl implements ValidateTokenUseCase {
  constructor(
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly tokenStorage: TokenStoragePort,
    private readonly tokenMapper: TokenMapper,
  ) {}

  /**
   * JWT 토큰 검증 및 페이로드 추출
   * @param validateTokenDto 토큰 검증 정보(토큰)
   * @returns 토큰 페이로드 또는 null(유효하지 않은 토큰)
   */
  async execute(validateTokenDto: ValidateTokenDto): Promise<TokenPayload | null> {
    // 1. 토큰 구문 검증 및 페이로드 추출
    const rawTokenPayload = this.tokenGenerator.verifyAccessToken(validateTokenDto.token)
    if (!rawTokenPayload) {
      return null
    }
    const tokenPayload = this.tokenMapper.toTokenPayload(rawTokenPayload)
    // 2. 토큰 만료 확인
    if (tokenPayload.isExpired()) {
      return null
    }

    // 3. 토큰 블랙리스트 확인
    if (tokenPayload.jti) {
      const isBlacklisted = await this.tokenStorage.isBlacklisted(tokenPayload.jti)
      if (isBlacklisted) {
        return null
      }
    }

    // 4. 유효한 토큰 - 페이로드 반환
    return tokenPayload
  }
}
