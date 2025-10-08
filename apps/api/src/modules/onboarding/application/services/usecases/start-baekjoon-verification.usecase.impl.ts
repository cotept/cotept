import { Injectable } from "@nestjs/common"

import { StartBaekjoonVerificationDto } from "../../dtos/start-baekjoon-verification.dto"
import { StartBaekjoonVerificationUseCase } from "../../ports/in/start-baekjoon-verification.usecase"

import { BaekjoonFacadeService } from "@/modules/baekjoon/application/services"
import { VerificationStatusResponseDto } from "@/modules/baekjoon/infrastructure/dtos/response"
import { UserFacadeService } from "@/modules/user/application/services"
import { UserProfileFacadeService } from "@/modules/user-profile/application"

@Injectable()
export class StartBaekjoonVerificationUseCaseImpl implements StartBaekjoonVerificationUseCase {
  constructor(
    private readonly baekjoonService: BaekjoonFacadeService,
    private readonly userService: UserFacadeService,
    private readonly userProfileService: UserProfileFacadeService,
  ) {}

  async execute(dto: StartBaekjoonVerificationDto): Promise<VerificationStatusResponseDto> {
    const user = await this.userService.getUserByUserId(dto.userId)

    await this.userProfileService.getProfileByUserIdOrThrow(dto.userId)

    // 기존 baekjoon 모듈의 유스케이스 호출
    return this.baekjoonService.startVerification({
      email: user.email,
      handle: dto.baekjoonHandle,
    })
  }
}
