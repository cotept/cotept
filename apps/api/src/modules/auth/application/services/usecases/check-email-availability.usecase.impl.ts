import { ConflictException, Injectable, Logger } from "@nestjs/common"

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
   * @returns 중복 확인 결과 (사용 가능한 경우만)
   * @throws ConflictException 이미 사용 중인 이메일인 경우
   */
  async execute(dto: CheckEmailAvailabilityDto): Promise<AvailabilityResultDto> {
    try {
      this.logger.debug(`이메일 중복 확인 시작: ${dto.email}`)

      const existingUser = await this.authUserRepository.findByEmail(dto.email)

      if (existingUser) {
        this.logger.debug(`이메일 중복 확인 결과: 이미 사용 중인 이메일`)
        throw new ConflictException(AUTH_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS)
      }

      this.logger.debug(`이메일 중복 확인 결과: 사용 가능한 이메일`)
      return { available: true }
    } catch (error) {
      this.logger.error(`이메일 중복 확인 실패: ${dto.email}`, error)
      throw error
    }
  }
}
