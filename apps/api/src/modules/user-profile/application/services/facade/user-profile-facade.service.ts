import { Injectable } from "@nestjs/common"

import {
  CreateUserProfileRequestDto,
  UpdateUserProfileRequestDto,
  UserProfileDto,
} from "@/modules/user-profile/application/dtos/user-profile.dto"
import { UserProfileMapper } from "@/modules/user-profile/application/mappers/user-profile.mapper"
import {
  CreateUserProfileUseCase,
  DeleteUserProfileUseCase,
  GetMyProfileUseCase,
  GetUserProfileUseCase,
  UpdateUserProfileUseCase,
} from "@/modules/user-profile/application/ports/in"

/**
 * 사용자 프로필 관련 파사드 서비스
 * 컨트롤러와 유스케이스 사이의 중간 레이어로 동작하며 컨트롤러의 복잡성을 줄이는 역할을 합니다.
 * 여러 UseCase들을 조합하여 복잡한 비즈니스 워크플로우를 처리합니다.
 */
@Injectable()
export class UserProfileFacadeService {
  constructor(
    private readonly createUserProfileUseCase: CreateUserProfileUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly deleteUserProfileUseCase: DeleteUserProfileUseCase,
    private readonly userProfileMapper: UserProfileMapper,
  ) {}

  /**
   * 프로필 ID로 프로필 조회
   */
  async getProfileByIdx(idx: number): Promise<UserProfileDto | null> {
    return await this.getUserProfileUseCase.executeByIdx(idx)
  }

  /**
   * 사용자 ID로 프로필 조회
   */
  async getProfileByUserId(userId: string): Promise<UserProfileDto | null> {
    return await this.getUserProfileUseCase.executeByUserId(userId)
  }

  /**
   * 프로필 ID로 프로필 조회 (존재하지 않으면 예외 발생)
   */
  async getProfileByIdxOrThrow(idx: number): Promise<UserProfileDto> {
    return await this.getUserProfileUseCase.executeByIdxOrThrow(idx)
  }

  /**
   * 사용자 ID로 프로필 조회 (존재하지 않으면 예외 발생)
   */
  async getProfileByUserIdOrThrow(userId: string): Promise<UserProfileDto> {
    return await this.getUserProfileUseCase.executeByUserIdOrThrow(userId)
  }

  /**
   * 내 프로필 정보 조회 (멘티 프로필 + 멘토 프로필 보유 여부)
   */
  async getMyProfile(userId: string) {
    return await this.getMyProfileUseCase.execute(userId)
  }

  /**
   * 새 프로필 생성
   */
  async createProfile(createDto: CreateUserProfileRequestDto): Promise<UserProfileDto> {
    return await this.createUserProfileUseCase.execute(createDto)
  }

  /**
   * 프로필 업데이트
   */
  async updateProfile(userId: string, updateDto: UpdateUserProfileRequestDto): Promise<UserProfileDto> {
    return await this.updateUserProfileUseCase.execute(userId, updateDto)
  }

  /**
   * 프로필 삭제
   */
  async deleteProfile(userId: string): Promise<boolean> {
    return await this.deleteUserProfileUseCase.execute(userId)
  }

  /**
   * 프로필 완성도 확인
   * 비즈니스 로직을 활용한 복합 워크플로우
   */
  async checkProfileCompleteness(userId: string): Promise<{
    hasProfile: boolean
    hasBasicInfo: boolean
    isComplete: boolean
    missingFields: string[]
    profile?: UserProfileDto
  }> {
    const profile = await this.getProfileByUserId(userId)

    if (!profile) {
      return {
        hasProfile: false,
        hasBasicInfo: false,
        isComplete: false,
        missingFields: ["nickname", "fullName"],
      }
    }

    // 도메인 엔티티로 변환 후 완성도 체크
    const domain = this.userProfileMapper.toDomain(profile)
    const completeness = this.userProfileMapper.checkProfileCompleteness(domain)

    return {
      hasProfile: true,
      hasBasicInfo: completeness.hasBasicInfo,
      isComplete: completeness.isComplete,
      missingFields: completeness.missingFields,
      profile,
    }
  }

  /**
   * 프로필 생성 또는 업데이트 (Upsert)
   * 복합 비즈니스 로직 - 프로필이 존재하면 업데이트, 없으면 생성
   */
  async upsertProfile(
    userId: string,
    profileData: {
      nickname: string
      fullName?: string
      introduce?: string
      profileImageUrl?: string
    },
  ): Promise<{
    profile: UserProfileDto
    isNew: boolean
    updatedFields?: string[]
  }> {
    const existingProfile = await this.getProfileByUserId(userId)

    if (!existingProfile) {
      // 새 프로필 생성
      const createDto: CreateUserProfileRequestDto = {
        userId,
        nickname: profileData.nickname,
        fullName: profileData.fullName,
        introduce: profileData.introduce,
        profileImageUrl: profileData.profileImageUrl,
      }

      const newProfile = await this.createProfile(createDto)

      return {
        profile: newProfile,
        isNew: true,
      }
    } else {
      // 기존 프로필 업데이트
      const updateDto: UpdateUserProfileRequestDto = {
        nickname: profileData.nickname,
        fullName: profileData.fullName,
        introduce: profileData.introduce,
        profileImageUrl: profileData.profileImageUrl,
      }

      const updatedProfile = await this.updateProfile(userId, updateDto)
      const updatedFields = this.userProfileMapper.extractUpdatedFields(updateDto)

      return {
        profile: updatedProfile,
        isNew: false,
        updatedFields,
      }
    }
  }

  /**
   * 회원가입 시 기본 프로필 생성
   * 최소한의 정보로 프로필 생성 후 완성도 가이드 제공
   */
  async createBasicProfileForSignup(
    userId: string,
    nickname: string,
    introduce?: string,
  ): Promise<{
    profile: UserProfileDto
    completeness: {
      hasBasicInfo: boolean
      isComplete: boolean
      missingFields: string[]
    }
    nextSteps: string[]
  }> {
    const createDto: CreateUserProfileRequestDto = {
      userId,
      nickname,
      introduce,
    }

    const profile = await this.createProfile(createDto)

    // 도메인 엔티티로 변환 후 완성도 체크
    const domain = this.userProfileMapper.toDomain(profile)
    const completeness = this.userProfileMapper.checkProfileCompleteness(domain)

    // 다음 단계 가이드
    const nextSteps: string[] = []
    if (completeness.missingFields.includes("fullName")) {
      nextSteps.push("실명을 입력하여 프로필을 완성해주세요.")
    }
    if (!introduce) {
      nextSteps.push("자기소개를 추가하여 멘토들에게 어필해보세요.")
    }
    if (!profile.profileImageUrl) {
      nextSteps.push("프로필 사진을 등록하여 더 친근한 인상을 만들어보세요.")
    }

    return {
      profile,
      completeness,
      nextSteps,
    }
  }
}
