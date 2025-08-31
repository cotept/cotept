import { Injectable, Logger } from "@nestjs/common"

import { AvailabilityResultDto, CheckEmailAvailabilityDto } from "@/modules/auth/application/dtos"
import { CheckEmailAvailabilityUseCase } from "@/modules/auth/application/ports/in/check-email-availability.usecase"
import { AuthUserRepositoryPort } from "@/modules/auth/application/ports/out/auth-user-repository.port"
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/domain/constants/auth-error-messages"

/**
 * 이메일 중복 확인 유스케이스 구현체
 */
@Injectable()
export class CheckEmailAvailabilityUseCaseImpl implements CheckEmailAvailabilityUseCase {
  private readonly logger = new Logger(CheckEmailAvailabilityUseCaseImpl.name)

  constructor(private readonly authUserRepository: AuthUserRepositoryPort) {}

  /**
   * 이메일 중복을 확인합니다
   * @param dto 이메일 중복 확인 정보
   * @returns 중복 확인 결과
   */
  async execute(dto: CheckEmailAvailabilityDto): Promise<AvailabilityResultDto> {
    try {
      this.logger.debug(`이메일 중복 확인 시작: ${dto.email}`)

      const existingUser = await this.authUserRepository.findByEmail(dto.email)
      const available = !existingUser
      
      this.logger.debug(`이메일 중복 확인 결과: available=${available}`)

      return {
        available,
        message: available ? undefined : AUTH_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      }
    } catch (error) {
      this.logger.error(`이메일 중복 확인 실패: ${dto.email}`, error)
      throw error
    }
  }
}