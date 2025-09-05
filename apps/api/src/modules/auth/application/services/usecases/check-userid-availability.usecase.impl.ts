import { ConflictException, Injectable, Logger } from "@nestjs/common"

import { AvailabilityResultDto, CheckUserIdAvailabilityDto } from "@/modules/auth/application/dtos"
import { CheckUserIdAvailabilityUseCase } from "@/modules/auth/application/ports/in/check-userid-availability.usecase"
import { AuthUserRepositoryPort } from "@/modules/auth/application/ports/out/auth-user-repository.port"
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/domain/constants/auth-error-messages"

/**
 * 사용자 ID 중복 확인 유스케이스 구현체
 */
@Injectable()
export class CheckUserIdAvailabilityUseCaseImpl implements CheckUserIdAvailabilityUseCase {
  private readonly logger = new Logger(CheckUserIdAvailabilityUseCaseImpl.name)

  constructor(private readonly authUserRepository: AuthUserRepositoryPort) {}

  /**
   * 사용자 ID 중복을 확인합니다
   * @param dto 사용자 ID 중복 확인 정보
   * @returns 중복 확인 결과
   */
  async execute(dto: CheckUserIdAvailabilityDto): Promise<AvailabilityResultDto> {
    try {
      this.logger.debug(`사용자 ID 중복 확인 시작: ${dto.userId}`)

      const existingUser = await this.authUserRepository.findByUserId(dto.userId)

      if (existingUser) {
        this.logger.debug(`사용자 ID 중복 확인 결과: 이미 사용 중인 ID`)
        throw new ConflictException(AUTH_ERROR_MESSAGES.USERID_ALREADY_EXISTS)
      }

      this.logger.debug(`사용자 ID 중복 확인 결과: 사용 가능한 ID`)
      return { available: true }
    } catch (error) {
      this.logger.error(`사용자 ID 중복 확인 실패: ${dto.userId}`, error)
      throw error
    }
  }
}
