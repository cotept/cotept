import { Injectable } from "@nestjs/common"

import { MentorProfileDto } from "@/modules/mentor/application/dtos/mentor-profile.dto"
import { MentorFacadeService } from "@/modules/mentor/application/services/facade/mentor-facade.service"
import { UserProfileMapper } from "@/modules/user-profile/application/mappers/user-profile.mapper"
import { GetMyProfileUseCase } from "@/modules/user-profile/application/ports/in/get-my-profile.usecase"
import { GetUserProfileUseCase } from "@/modules/user-profile/application/ports/in/get-user-profile.usecase"
import { MyProfileResponseDto } from "@/modules/user-profile/infrastructure/adapter/in/dto/response"

@Injectable()
export class GetMyProfileUseCaseImpl implements GetMyProfileUseCase {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly mentorFacadeService: MentorFacadeService,
    private readonly userProfileMapper: UserProfileMapper,
  ) {}

  async execute(userId: string): Promise<MyProfileResponseDto> {
    // 1. 멘티 프로필 조회 (필수) - 없으면 예외 발생
    const menteeProfile = await this.getUserProfileUseCase.executeByUserIdOrThrow(userId)

    // 2. 멘토 프로필 조회 (선택)
    let mentorProfile: MentorProfileDto | null = null
    try {
      mentorProfile = await this.mentorFacadeService.getMentorProfileByUserId(userId)
    } catch {
      // 멘토 프로필이 없는 경우 (NotFoundException) 무시
      mentorProfile = null
    }

    // 3. Mapper를 통해 Response DTO 생성
    return this.userProfileMapper.toMyProfileResponseDto(
      menteeProfile,
      !!mentorProfile,
      mentorProfile?.idx,
    )
  }
}
