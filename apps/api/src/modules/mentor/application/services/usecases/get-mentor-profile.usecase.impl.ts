import { Inject, Injectable, NotFoundException } from "@nestjs/common"

import { GetMentorProfileUseCase } from "@/modules/mentor/application/ports/in/get-mentor-profile.usecase"
import { MentorProfileRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-profile-repository.port"
import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"

@Injectable()
export class GetMentorProfileUseCaseImpl implements GetMentorProfileUseCase {
  constructor(
    @Inject(MentorProfileRepositoryPort)
    private readonly mentorProfileRepository: MentorProfileRepositoryPort,
  ) {}

  /**
   * 사용자 ID로 멘토 프로필 조회
   * @param userId 사용자 ID
   * @returns 멘토 프로필 정보 DTO
   * @throws NotFoundException 멘토 프로필이 존재하지 않는 경우
   */
  async getByUserId(userId: string): Promise<MentorProfile> {
    const mentorProfile = await this.mentorProfileRepository.findByUserId(userId)
    if (!mentorProfile) {
      throw new NotFoundException(`User ID ${userId}에 해당하는 멘토 프로필을 찾을 수 없습니다.`)
    }

    return mentorProfile
  }
  /**
   * 사용자 IDX로 멘토 프로필 조회
   * @param userIdx 사용자 IDX
   * @returns 멘토 프로필 정보 DTO
   * @throws NotFoundException 멘토 프로필이 존재하지 않는 경우
   */
  async getByIdx(userIdx: number): Promise<MentorProfile> {
    const mentorProfile = await this.mentorProfileRepository.findByIdx(userIdx)
    if (!mentorProfile) {
      throw new NotFoundException(`User IDX ${userIdx}에 해당하는 멘토 프로필을 찾을 수 없습니다.`)
    }

    return mentorProfile
  }
}
