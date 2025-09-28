import { Inject, Injectable } from "@nestjs/common"

import { CompleteBaekjoonVerificationDto } from "../../dtos/complete-baekjoon-verification.dto"
import { CompleteBaekjoonVerificationUseCase } from "../../ports/in/complete-baekjoon-verification.usecase"
import { OnboardingStateRepositoryPort } from "../../ports/out/onboarding-state.repository.port"

import { CompleteVerificationUseCase } from "@/modules/baekjoon/application/ports/in"
import { BaekjoonFacadeService } from "@/modules/baekjoon/application/services"
import { VerificationResultResponseDto } from "@/modules/baekjoon/infrastructure/dtos/response"
import { UserFacadeService } from "@/modules/user/application/services"
import { UserProfileFacadeService } from "@/modules/user-profile/application"

@Injectable()
export class CompleteBaekjoonVerificationUseCaseImpl implements CompleteBaekjoonVerificationUseCase {
  constructor(
    @Inject(CompleteVerificationUseCase)
    private readonly onboardingStateRepository: OnboardingStateRepositoryPort,
    private readonly baekjoonService: BaekjoonFacadeService,
    private readonly userProfileService: UserProfileFacadeService,
    private readonly userService: UserFacadeService,
  ) {}

  async execute(dto: CompleteBaekjoonVerificationDto): Promise<VerificationResultResponseDto> {
    const user = await this.userService.getUserByUserId(dto.userId)

    await this.userProfileService.getProfileByUserIdOrThrow(dto.userId)

    // 기존 baekjoon 모듈의 유스케이스 호출
    const result = await this.baekjoonService.completeVerification({
      email: user.email,
      handle: dto.baekjoonHandle,
      sessionId: dto.verificationSessionId,
    })

    // 인증 성공 시 온보딩 상태 업데이트
    if (result.success) {
      const onboardingState = await this.onboardingStateRepository.findByUserId(dto.userId)
      if (onboardingState) {
        onboardingState.completeBaekjoonVerification()
        await this.onboardingStateRepository.save(onboardingState)
      }
    }

    return result
  }
}
