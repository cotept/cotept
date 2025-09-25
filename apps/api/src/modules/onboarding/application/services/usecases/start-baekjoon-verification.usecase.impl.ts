import { Inject, Injectable } from "@nestjs/common"
import { NotFoundException } from "@nestjs/common/exceptions"

import { StartBaekjoonVerificationDto } from "../../dtos/start-baekjoon-verification.dto"
import { StartBaekjoonVerificationUseCase } from "../../ports/in/start-baekjoon-verification.usecase"

import { StartVerificationOutputDto } from "@/modules/baekjoon/application/dtos"
import { StartVerificationUseCase as BaekjoonStartVerificationUseCase } from "@/modules/baekjoon/application/ports/in"
import { UserProfileRepositoryPort } from "@/modules/user-profile/application/ports"

@Injectable()
export class StartBaekjoonVerificationUseCaseImpl implements StartBaekjoonVerificationUseCase {
  constructor(
    @Inject(BaekjoonStartVerificationUseCase)
    private readonly baekjoonStartVerificationUseCase: BaekjoonStartVerificationUseCase,
    private readonly userProfileRepository: UserProfileRepositoryPort,
  ) {}

  async execute(dto: StartBaekjoonVerificationDto): Promise<StartVerificationOutputDto> {
    const userProfile = await this.userProfileRepository.findByUserId(dto.userId)
    if (!userProfile) {
      throw new NotFoundException(`사용자 ID ${dto.userId}에 대한 사용자 프로필을 찾을 수 없습니다.`)
    }

    // 기존 baekjoon 모듈의 유스케이스 호출
    return this.baekjoonStartVerificationUseCase.execute({
      email: userProfile.userId, // baekjoon 모듈은 email을 식별자로 사용할 수 있음
      handle: dto.baekjoonHandle,
    })
  }
}
