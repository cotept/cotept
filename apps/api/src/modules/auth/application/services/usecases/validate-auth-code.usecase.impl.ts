import { Injectable, Logger } from "@nestjs/common"

import { ValidateAuthCodeDto, ValidateAuthCodeResultDto } from "../../dtos/validate-auth-code.dto"
import { ValidateAuthCodeUseCase } from "../../ports/in/validate-auth-code.usecase"
import { TokenStoragePort } from "../../ports/out/token-storage.port"

import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * 인증 코드 검증 유스케이스 구현
 */
@Injectable()
export class ValidateAuthCodeUseCaseImpl implements ValidateAuthCodeUseCase {
  private readonly logger = new Logger(ValidateAuthCodeUseCaseImpl.name)

  constructor(private readonly tokenStorage: TokenStoragePort) {}

  /**
   * 인증 코드 검증 및 사용자 ID 반환
   * @param dto 검증할 인증 코드 정보
   * @returns 검증 결과 및 사용자 ID
   */
  async execute(dto: ValidateAuthCodeDto): Promise<ValidateAuthCodeResultDto> {
    try {
      // 입력 검증
      if (!dto || !dto.code) {
        this.logger.warn("Auth code is empty or invalid")
        return new ValidateAuthCodeResultDto("", false)
      }

      const { code } = dto

      // Redis에서 인증 코드로 사용자 ID 조회
      const userId = await this.tokenStorage.getUserIdByAuthCode(code)

      if (!userId) {
        this.logger.warn(`Auth code not found or expired: ${code}`)
        return new ValidateAuthCodeResultDto("", false)
      }

      // 사용된 인증 코드 삭제 (일회용)
      await this.tokenStorage.deleteAuthCode(code)
      this.logger.debug(`Validated and consumed auth code for user ${userId}`)

      return new ValidateAuthCodeResultDto(userId, true)
    } catch (error) {
      this.logger.error(
        `Failed to validate auth code: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      return new ValidateAuthCodeResultDto("", false)
    }
  }
}
