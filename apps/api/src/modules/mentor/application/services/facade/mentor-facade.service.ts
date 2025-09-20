import { Inject, Injectable } from "@nestjs/common"

import { CreateMentorProfileDto } from "@/modules/mentor/application/dtos/create-mentor-profile.dto"
import { DeletionResponseDto } from "@/modules/mentor/application/dtos/deletion-response.dto"
import { MentorProfileDto } from "@/modules/mentor/application/dtos/mentor-profile.dto"
import { UpdateMentorProfileDto } from "@/modules/mentor/application/dtos/update-mentor-profile.dto"
import { MentorProfileMapper } from "@/modules/mentor/application/mappers/mentor-profile.mapper"
import { CreateMentorProfileUseCase } from "@/modules/mentor/application/ports/in/create-mentor-profile.usecase"
import { DeleteMentorProfileUseCase } from "@/modules/mentor/application/ports/in/delete-mentor-profile.usecase"
import { GetMentorProfileUseCase } from "@/modules/mentor/application/ports/in/get-mentor-profile.usecase"
import { HardDeleteMentorProfileUseCase } from "@/modules/mentor/application/ports/in/hard-delete-mentor-profile.usecase"
import { UpdateMentorProfileUseCase } from "@/modules/mentor/application/ports/in/update-mentor-profile.usecase"

/**
 * 멘토 관련 파사드 서비스
 * 컨트롤러와 유스케이스 사이의 중간 레이어로 동작하며 컨트롤러의 복잡성을 줄이는 역할을 합니다.
 */
@Injectable()
export class MentorFacadeService {
  constructor(
    @Inject("GetMentorProfileUseCase")
    private readonly getMentorProfileUseCase: GetMentorProfileUseCase,
    @Inject("CreateMentorProfileUseCase")
    private readonly createMentorProfileUseCase: CreateMentorProfileUseCase,
    @Inject("UpdateMentorProfileUseCase")
    private readonly updateMentorProfileUseCase: UpdateMentorProfileUseCase,
    @Inject("DeleteMentorProfileUseCase")
    private readonly deleteMentorProfileUseCase: DeleteMentorProfileUseCase,
    @Inject("HardDeleteMentorProfileUseCase")
    private readonly hardDeleteMentorProfileUseCase: HardDeleteMentorProfileUseCase,
    private readonly responseMapper: MentorProfileMapper,
  ) {}

  /**
   * 새 멘토 프로필 생성
   */
  async createMentorProfile(dto: CreateMentorProfileDto): Promise<MentorProfileDto> {
    const newProfile = await this.createMentorProfileUseCase.execute(dto)
    return this.responseMapper.toDto(newProfile)
  }

  /**
   * 멘토 프로필 정보 수정 (PUT)
   */
  async updateMentorProfile(idx: number, dto: UpdateMentorProfileDto): Promise<MentorProfileDto> {
    const updatedProfile = await this.updateMentorProfileUseCase.execute(idx, dto)
    return this.responseMapper.toDto(updatedProfile)
  }

  /**
   * 멘토 프로필 논리적 삭제
   */
  async deleteMentorProfile(idx: number): Promise<DeletionResponseDto> {
    await this.deleteMentorProfileUseCase.execute(idx)
    return { success: true, message: "멘토 프로필이 성공적으로 비활성화되었습니다." }
  }

  /**
   * 멘토 프로필 물리적 삭제
   */
  async hardDeleteMentorProfile(idx: number): Promise<DeletionResponseDto> {
    await this.hardDeleteMentorProfileUseCase.execute(idx)
    return { success: true, message: "멘토 프로필이 영구적으로 삭제되었습니다." }
  }

  /**
   * 사용자 ID로 멘토 프로필 조회
   */
  async getMentorProfileByUserId(userId: string): Promise<MentorProfileDto> {
    const mentorProfile = await this.getMentorProfileUseCase.getByUserId(userId)
    return this.responseMapper.toDto(mentorProfile)
  }

  /**
   * IDX로 멘토 프로필 조회
   */
  async getMentorProfileByIdx(idx: number): Promise<MentorProfileDto> {
    const mentorProfile = await this.getMentorProfileUseCase.getByIdx(idx)
    return this.responseMapper.toDto(mentorProfile)
  }
}
