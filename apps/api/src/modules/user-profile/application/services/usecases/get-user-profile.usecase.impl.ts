import { Injectable, NotFoundException } from "@nestjs/common"

import { UserProfileDto } from "../../dtos/user-profile.dto"
import { UserProfileMapper } from "../../mappers/user-profile.mapper"
import { GetUserProfileUseCase } from "../../ports/in/get-user-profile.usecase"
import { UserProfileRepositoryPort } from "../../ports/out/user-profile-repository.port"

@Injectable()
export class GetUserProfileUseCaseImpl implements GetUserProfileUseCase {
  constructor(
    private readonly userProfileRepository: UserProfileRepositoryPort,
    private readonly userProfileMapper: UserProfileMapper,
  ) {}

  /**
   * 사용자 ID로 프로필 조회
   * @param userId 사용자 ID
   * @returns 사용자 프로필 DTO 또는 null
   */
  async executeByUserId(userId: string): Promise<UserProfileDto | null> {
    const profile = await this.userProfileRepository.findByUserId(userId)

    if (!profile) {
      return null
    }

    return this.userProfileMapper.toDto(profile)
  }

  /**
   * 프로필 ID로 프로필 조회
   * @param idx 프로필 ID (기본키)
   * @returns 사용자 프로필 DTO 또는 null
   */
  async executeByIdx(idx: number): Promise<UserProfileDto | null> {
    const profile = await this.userProfileRepository.findByIdx(idx)

    if (!profile) {
      return null
    }

    return this.userProfileMapper.toDto(profile)
  }

  /**
   * 사용자 ID로 프로필 조회 (NotFound 예외 발생 버전)
   * @param userId 사용자 ID
   * @returns 사용자 프로필 DTO
   * @throws NotFoundException 프로필이 존재하지 않는 경우
   */
  async executeByUserIdOrThrow(userId: string): Promise<UserProfileDto> {
    const profileDto = await this.executeByUserId(userId)

    if (!profileDto) {
      throw new NotFoundException(`사용자 ${userId}의 프로필을 찾을 수 없습니다.`)
    }

    return profileDto
  }

  /**
   * 프로필 ID로 프로필 조회 (NotFound 예외 발생 버전)
   * @param idx 프로필 ID (기본키)
   * @returns 사용자 프로필 DTO
   * @throws NotFoundException 프로필이 존재하지 않는 경우
   */
  async executeByIdxOrThrow(idx: number): Promise<UserProfileDto> {
    const profileDto = await this.executeByIdx(idx)

    if (!profileDto) {
      throw new NotFoundException(`프로필 ID ${idx}를 찾을 수 없습니다.`)
    }

    return profileDto
  }
}
