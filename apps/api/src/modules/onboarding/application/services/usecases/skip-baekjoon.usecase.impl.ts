import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"

import { SkipBaekjoonDto, SkipBaekjoonResponseDto } from "../../dtos/skip-baekjoon.dto"
import { SkipBaekjoonUseCase } from "../../ports/in/skip-baekjoon.usecase"
import { OnboardingStateRepositoryPort } from "../../ports/out/onboarding-state.repository.port"

@Injectable()
export class SkipBaekjoonUseCaseImpl implements SkipBaekjoonUseCase {
  constructor(private readonly onboardingStateRepository: OnboardingStateRepositoryPort) {}

  async execute(dto: SkipBaekjoonDto): Promise<SkipBaekjoonResponseDto> {
    // 1. 온보딩 상태 조회
    const onboardingState = await this.onboardingStateRepository.findByUserId(dto.userId)
    if (!onboardingState) {
      throw new NotFoundException(`사용자 ID ${dto.userId}에 대한 온보딩 상태를 찾을 수 없습니다.`)
    }

    // 2. 백준 연동을 건너뛸 수 있는지 확인
    if (!onboardingState.canSkipBaekjoon()) {
      throw new BadRequestException("백준 연동을 건너뛸 수 없습니다. 프로필 설정을 먼저 완료해주세요.")
    }

    // 3. 백준 연동 단계 건너뛰기
    onboardingState.skipBaekjoon()

    // 4. 업데이트된 온보딩 상태 저장
    await this.onboardingStateRepository.save(onboardingState)

    return {
      onboardingCompleted: onboardingState.isCompleted(),
      baekjoonLinked: onboardingState.hasBaekjoonLinked(),
    }
  }
}
