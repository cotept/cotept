import { Inject, Injectable } from "@nestjs/common"
import { NotFoundException } from "@nestjs/common/exceptions"

import { CompleteBaekjoonVerificationDto } from "../../dtos/complete-baekjoon-verification.dto"
import { CompleteBaekjoonVerificationUseCase } from "../../ports/in/complete-baekjoon-verification.usecase"
import { OnboardingStateRepositoryPort } from "../../ports/out/onboarding-state.repository.port"

import { CompleteVerificationOutputDto } from "@/modules/baekjoon/application/dtos"
import { CompleteVerificationUseCase } from "@/modules/baekjoon/application/ports/in"
import { UserProfileRepositoryPort } from "@/modules/user-profile/application/ports"

@Injectable()
export class CompleteBaekjoonVerificationUseCaseImpl implements CompleteBaekjoonVerificationUseCase {
  constructor(
    @Inject(CompleteVerificationUseCase)
    private readonly baekjoonCompleteVerificationUseCase: CompleteVerificationUseCase,
    private readonly onboardingStateRepository: OnboardingStateRepositoryPort,
    private readonly userProfileRepository: UserProfileRepositoryPort,
  ) {}

  async execute(dto: CompleteBaekjoonVerificationDto): Promise<CompleteVerificationOutputDto> {
    const userProfile = await this.userProfileRepository.findByUserId(dto.userId)
    if (!userProfile) {
      throw new NotFoundException(`User profile for user ID ${dto.userId} not found.`)
    }

    // 기존 baekjoon 모듈의 유스케이스 호출
    const result = await this.baekjoonCompleteVerificationUseCase.execute({
      email: dto.userId,
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
