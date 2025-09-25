import { Injectable, NotFoundException } from "@nestjs/common"

import { MentorEligibilityDto } from "../../dtos/mentor-eligibility.dto"
import { CheckMentorEligibilityUseCase } from "../../ports/in/check-mentor-eligibility.usecase"

import { BaekjoonProfileRepositoryPort } from "@/modules/baekjoon/application/ports/out"
import { CheckMentorEligibilityDto } from "@/modules/onboarding/application/dtos/check-mentor-eligibility.dto"

@Injectable()
export class CheckMentorEligibilityUseCaseImpl implements CheckMentorEligibilityUseCase {
  constructor(private readonly baekjoonProfileRepository: BaekjoonProfileRepositoryPort) {}

  async execute(dto: CheckMentorEligibilityDto): Promise<MentorEligibilityDto> {
    const baekjoonProfile = await this.baekjoonProfileRepository.findByUserId(dto.userId)

    if (!baekjoonProfile) {
      throw new NotFoundException(`사용자 ID ${dto.userId}에 대한 백준 프로필을 찾을 수 없습니다.`)
    }

    const isEligible = baekjoonProfile.isMentorEligible()
    const requirement = `백준 티어 플래티넘 3 이상`

    return {
      isEligible,
      currentTier: baekjoonProfile.getCurrentTier().getName(),
      requirement,
    }
  }
}
