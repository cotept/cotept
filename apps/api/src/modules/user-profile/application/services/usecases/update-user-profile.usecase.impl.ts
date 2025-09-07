import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"

import { UpdateUserProfileRequestDto, UserProfileDto } from "../../dtos/user-profile.dto"
import { UserProfileMapper } from "../../mappers/user-profile.mapper"
import { UpdateUserProfileUseCase } from "../../ports/in/update-user-profile.usecase"
import { UserProfileRepositoryPort } from "../../ports/out/user-profile-repository.port"

@Injectable()
export class UpdateUserProfileUseCaseImpl implements UpdateUserProfileUseCase {
  constructor(
    private readonly userProfileRepository: UserProfileRepositoryPort,
    private readonly userProfileMapper: UserProfileMapper,
  ) {}

  /**
   * 사용자 프로필 업데이트
   * @param userId 업데이트할 사용자 ID
   * @param updateDto 업데이트할 정보
   * @returns 업데이트된 프로필 DTO
   * @throws NotFoundException 프로필이 존재하지 않는 경우
   * @throws ConflictException 닉네임이 중복인 경우
   */
  async execute(userId: string, updateDto: UpdateUserProfileRequestDto): Promise<UserProfileDto> {
    // 1. 기존 프로필 조회
    const existingProfile = await this.userProfileRepository.findByUserId(userId)
    if (!existingProfile) {
      throw new NotFoundException(`사용자 ${userId}의 프로필을 찾을 수 없습니다.`)
    }

    // 2. 닉네임 중복 확인 (변경하려는 경우만)
    if (updateDto.nickname && updateDto.nickname !== existingProfile.nickname) {
      const nicknameExists = await this.userProfileRepository.existsByNickname(
        updateDto.nickname,
        userId, // 현재 사용자는 제외
      )
      if (nicknameExists) {
        throw new ConflictException(`닉네임 '${updateDto.nickname}'은(는) 이미 사용 중입니다.`)
      }
    }

    // 3. 도메인 엔티티 업데이트
    const updatedProfile = this.userProfileMapper.updateRequestToDomain(existingProfile, updateDto)

    // 4. 저장
    const savedProfile = await this.userProfileRepository.save(updatedProfile)

    // 5. DTO로 변환하여 반환
    return this.userProfileMapper.toDto(savedProfile)
  }
}
