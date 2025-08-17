import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { randomBytes } from "crypto"

import { GenerateAuthCodeDto, GenerateAuthCodeResultDto } from "../../dtos/generate-auth-code.dto"
import { GenerateAuthCodeUseCase } from "../../ports/in/generate-auth-code.usecase"
import { TokenStoragePort } from "../../ports/out/token-storage.port"

import { AuthCodeConfig } from "@/configs/token"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * 인증 코드 생성 유스케이스 구현
 */
@Injectable()
export class GenerateAuthCodeUseCaseImpl implements GenerateAuthCodeUseCase {
  private readonly logger = new Logger(GenerateAuthCodeUseCaseImpl.name)

  // 인증 코드 설정
  private readonly AUTH_CODE_LENGTH = this.configService.getOrThrow<AuthCodeConfig>("authCode").authCodeLength // 바이트 단위
  private readonly AUTH_CODE_EXPIRES_IN = this.configService.getOrThrow<AuthCodeConfig>("authCode").authCodeExpiresIn

  constructor(
    private readonly tokenStorage: TokenStoragePort,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 인증 코드 생성 및 저장
   * @param dto 인증 코드 생성 DTO
   * @returns 생성된 인증 코드 정보
   */
  async execute(dto: GenerateAuthCodeDto): Promise<GenerateAuthCodeResultDto> {
    try {
      // 입력 검증
      if (!dto || !dto.userId) {
        this.logger.error("Invalid input: userId is required")
        throw new Error("사용자 ID는 필수 항목입니다.")
      }

      const { userId } = dto

      // 암호학적으로 안전한 랜덤 코드 생성
      const authCode = randomBytes(Number(this.AUTH_CODE_LENGTH)).toString("hex")

      // 만료 시간 계산
      const expiresAt = new Date()
      expiresAt.setSeconds(expiresAt.getSeconds() + this.AUTH_CODE_EXPIRES_IN)

      // Redis에 인증 코드 저장
      await this.tokenStorage.saveAuthCode(authCode, userId, this.AUTH_CODE_EXPIRES_IN)

      this.logger.debug(`Generated auth code for user ${userId} (expires at ${expiresAt.toISOString()})`)
      return new GenerateAuthCodeResultDto(authCode, expiresAt)
    } catch (error) {
      this.logger.error(
        `Failed to generate auth code: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }
}
