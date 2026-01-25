import { Injectable, Logger, NotFoundException } from "@nestjs/common"

import { SelectProfileDto } from "@/modules/auth/application/dtos/select-profile.dto"
import { SelectProfileUseCase } from "@/modules/auth/application/ports/in/select-profile.usecase"
import { AuthUserRepositoryPort } from "@/modules/auth/application/ports/out/auth-user-repository.port"
import { TokenGeneratorPort } from "@/modules/auth/application/ports/out/token-generator.port"
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/domain/constants/auth-error-messages"
import { TokenPair } from "@/modules/auth/domain/model/token-pair"
import { MentorFacadeService } from "@/modules/mentor/application/services/facade/mentor-facade.service"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * 프로필 타입 선택 유스케이스 구현체
 * 멘토 사용자가 활성 프로필을 선택하고 JWT 메타데이터를 업데이트합니다.
 */
@Injectable()
export class SelectProfileUseCaseImpl implements SelectProfileUseCase {
  private readonly logger = new Logger(SelectProfileUseCaseImpl.name)

  constructor(
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly mentorFacade: MentorFacadeService,
  ) {}

  /**
   * 프로필 선택 및 토큰 갱신
   * @param selectProfileDto 프로필 선택 정보 (userId, activeProfile)
   * @returns activeProfile 메타데이터가 포함된 새로운 TokenPair
   */
  async execute(selectProfileDto: SelectProfileDto): Promise<TokenPair> {
    try {
      // 1. JWT userId (string)를 DB userId (number)로 변환

      // 2. 사용자 존재 여부 확인
      const user = await this.authUserRepository.findById(selectProfileDto.userIdx)
      if (!user) {
        throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND)
      }

      // 3. "mentor" 선택 시 멘토 프로필 존재 여부 검증
      if (selectProfileDto.activeProfile === "mentor") {
        const mentorProfile = await this.mentorFacade.getMentorProfileByIdx(selectProfileDto.userIdx)
        if (!mentorProfile) {
          throw new NotFoundException("멘토 프로필이 존재하지 않습니다. 멘토 프로필을 먼저 생성해주세요.")
        }
      }

      // 4. activeProfile 메타데이터를 포함한 새로운 토큰 생성
      const tokenPair = this.tokenGenerator.generateTokenPair(user.id, user.email, user.role, {
        activeProfile: selectProfileDto.activeProfile,
      })

      this.logger.log(`프로필 선택 완료 - userId: ${user.id}, activeProfile: ${selectProfileDto.activeProfile}`)

      return tokenPair
    } catch (error) {
      this.logger.error(
        `프로필 선택 처리 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }
}
