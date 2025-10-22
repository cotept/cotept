import { Injectable } from "@nestjs/common"

import {
  CreateUserProfileRequestDto,
  UpdateUserProfileRequestDto,
  UserProfileDto,
  UserProfileResponseDto,
} from "@/modules/user-profile/application/dtos/user-profile.dto"
import { MyProfileResponseDto } from "@/modules/user-profile/infrastructure/adapter/in/dto/response"
import UserProfile from "@/modules/user-profile/domain/model/user-profile"

/**
 * UserProfile 매퍼
 * Application DTO ↔ Domain Entity 간의 변환을 담당
 */
@Injectable()
export class UserProfileMapper {
  /**
   * Domain → Application DTO 변환
   * UseCase에서 반환할 때 사용
   */
  toDto(domain: UserProfile): UserProfileDto {
    const dto = new UserProfileDto()

    dto.idx = domain.idx!
    dto.userId = domain.userId
    dto.nickname = domain.nickname // getter를 통해 문자열로 반환
    dto.fullName = domain.fullName // getter를 통해 문자열 또는 undefined 반환
    dto.introduce = domain.introduce
    dto.profileImageUrl = domain.profileImageUrl
    dto.createdAt = domain.createdAt
    dto.updatedAt = domain.updatedAt

    return dto
  }

  /**
   * Application DTO → Domain 변환
   * Repository에서 조회한 데이터를 도메인으로 변환할 때 사용
   */
  toDomain(dto: UserProfileDto): UserProfile {
    return new UserProfile({
      idx: dto.idx,
      userId: dto.userId,
      nickname: dto.nickname, // 생성자에서 자동으로 Nickname 값 객체로 변환
      fullName: dto.fullName, // 생성자에서 자동으로 Name 값 객체로 변환
      introduce: dto.introduce,
      profileImageUrl: dto.profileImageUrl,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    })
  }

  /**
   * CreateRequest DTO → Domain 변환
   * 새 프로필 생성 시 사용
   */
  createRequestToDomain(dto: CreateUserProfileRequestDto): UserProfile {
    return new UserProfile({
      userId: dto.userId,
      nickname: dto.nickname,
      fullName: dto.fullName,
      introduce: dto.introduce,
      profileImageUrl: dto.profileImageUrl,
      // createdAt, updatedAt은 생성자에서 자동 설정
    })
  }

  /**
   * 기존 Domain + UpdateRequest DTO → 업데이트된 Domain
   * 프로필 업데이트 시 사용
   */
  updateRequestToDomain(existingDomain: UserProfile, updateDto: UpdateUserProfileRequestDto): UserProfile {
    // updateProfile 메서드를 사용하여 도메인 로직 활용
    return existingDomain.updateProfile({
      nickname: updateDto.nickname,
      fullName: updateDto.fullName,
      introduce: updateDto.introduce,
      profileImageUrl: updateDto.profileImageUrl,
    })
  }

  /**
   * Domain → ResponseDto 변환
   * Controller 응답을 위한 래핑
   */
  toResponseDto(domain: UserProfile): UserProfileResponseDto {
    return this.toDto(domain) as UserProfileResponseDto
  }

  /**
   * Domain 배열 → DTO 배열 변환
   * 목록 조회 시 사용
   */
  toDtoArray(domains: UserProfile[]): UserProfileDto[] {
    return domains.map((domain) => this.toDto(domain))
  }

  /**
   * DTO 배열 → Domain 배열 변환
   * 배치 처리 시 사용
   */
  toDomainArray(dtos: UserProfileDto[]): UserProfile[] {
    return dtos.map((dto) => this.toDomain(dto))
  }

  /**
   * 업데이트된 필드 추출
   * UpdateResponse에서 변경된 필드 목록을 생성할 때 사용
   */
  extractUpdatedFields(updateDto: UpdateUserProfileRequestDto): string[] {
    const updatedFields: string[] = []

    if (updateDto.nickname !== undefined) updatedFields.push("nickname")
    if (updateDto.fullName !== undefined) updatedFields.push("fullName")
    if (updateDto.introduce !== undefined) updatedFields.push("introduce")
    if (updateDto.profileImageUrl !== undefined) updatedFields.push("profileImageUrl")

    return updatedFields
  }

  /**
   * CreateRequest 검증용 헬퍼
   * 필수 필드가 모두 있는지 확인
   */
  validateCreateRequest(dto: CreateUserProfileRequestDto): boolean {
    return !!(dto.userId && dto.nickname)
  }

  /**
   * 프로필 완성도 확인
   * 도메인 로직을 활용한 완성도 체크
   */
  checkProfileCompleteness(domain: UserProfile): {
    hasBasicInfo: boolean
    isComplete: boolean
    missingFields: string[]
  } {
    const missingFields: string[] = []

    if (!domain.hasBasicInfo()) missingFields.push("nickname")
    if (!domain.fullName) missingFields.push("fullName")

    return {
      hasBasicInfo: domain.hasBasicInfo(),
      isComplete: domain.isComplete(),
      missingFields,
    }
  }

  /**
   * 내 프로필 조회용 Response DTO 생성
   * 멘티 프로필 + 멘토 프로필 보유 여부 포함
   */
  toMyProfileResponseDto(
    menteeProfile: UserProfileDto,
    hasMentorProfile: boolean,
    mentorProfileId?: number,
  ): MyProfileResponseDto {
    return new MyProfileResponseDto(menteeProfile, hasMentorProfile, mentorProfileId)
  }
}
