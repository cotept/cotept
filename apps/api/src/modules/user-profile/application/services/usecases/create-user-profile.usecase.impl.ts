import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"

import { CreateUserProfileRequestDto, UserProfileDto } from "../../dtos/user-profile.dto"
import { UserProfileMapper } from "../../mappers/user-profile.mapper"
import { CreateUserProfileUseCase } from "../../ports/in/create-user-profile.usecase"
import { UserProfileRepositoryPort } from "../../ports/out/user-profile-repository.port"

import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"

@Injectable()
export class CreateUserProfileUseCaseImpl implements CreateUserProfileUseCase {
  constructor(
    private readonly userProfileRepository: UserProfileRepositoryPort,
    private readonly userRepository: UserRepositoryPort,
    private readonly userProfileMapper: UserProfileMapper,
  ) {}

  /**
   * 새 사용자 프로필 생성
   * @param createDto 생성할 프로필 정보
   * @returns 생성된 프로필 정보 DTO
   * @throws NotFoundException 사용자가 존재하지 않는 경우
   * @throws ConflictException 이미 프로필이 존재하거나 닉네임이 중복인 경우
   */
  async execute(createDto: CreateUserProfileRequestDto): Promise<UserProfileDto> {
    // 1. 사용자 존재 여부 확인
    const userExists = await this.userRepository.findByUserId(createDto.userId)
    if (!userExists) {
      throw new NotFoundException(`사용자 ${createDto.userId}을(를) 찾을 수 없습니다.`)
    }

    // 2. 이미 프로필이 존재하는지 확인
    const existingProfile = await this.userProfileRepository.existsByUserId(createDto.userId)
    if (existingProfile) {
      throw new ConflictException(`사용자 ${createDto.userId}의 프로필이 이미 존재합니다.`)
    }

    // 3. 닉네임 중복 확인
    const nicknameExists = await this.userProfileRepository.existsByNickname(createDto.nickname)
    if (nicknameExists) {
      throw new ConflictException(`닉네임 '${createDto.nickname}'은(는) 이미 사용 중입니다.`)
    }

    // 4. 도메인 엔티티 생성
    const userProfile = this.userProfileMapper.createRequestToDomain(createDto)

    // 5. 저장
    const savedProfile = await this.userProfileRepository.save(userProfile)

    // 6. DTO로 변환하여 반환
    return this.userProfileMapper.toDto(savedProfile)
  }
}
