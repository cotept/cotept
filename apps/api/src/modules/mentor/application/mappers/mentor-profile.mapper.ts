import { Injectable } from "@nestjs/common"

import { MentorTagMapper } from "./mentor-tag.mapper"

import { MentorProfileDto } from "@/modules/mentor/application/dtos/mentor-profile.dto"
import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"

@Injectable()
export class MentorProfileMapper {
  constructor(private readonly mentorTagMapper: MentorTagMapper) {}

  /**
   * 도메인 모델을 DTO로 변환
   * @param mentorProfile 멘토 프로필 도메인 모델
   * @returns 멘토 프로필 DTO
   */
  toDto(mentorProfile: MentorProfile): MentorProfileDto {
    const dto = new MentorProfileDto()
    dto.idx = mentorProfile.idx!
    dto.userId = mentorProfile.userId
    dto.introductionTitle = mentorProfile.introductionTitle
    dto.introductionContent = mentorProfile.introductionContent
    dto.baekjoonTierDisplay = mentorProfile.baekjoonTierDisplay
    dto.mentoringCount = mentorProfile.mentoringCount
    dto.totalReviewCount = mentorProfile.totalReviewCount
    dto.averageRating = mentorProfile.averageRating
    dto.isVerified = mentorProfile.isVerified
    dto.isActive = mentorProfile.isActive
    dto.profileCompletion = mentorProfile.profileCompletion
    dto.tags = this.mentorTagMapper.toDtoList(mentorProfile.tags)
    dto.createdAt = mentorProfile.createdAt
    dto.updatedAt = mentorProfile.updatedAt
    return dto
  }

  /**
   * DTO를 도메인 모델로 변환
   * @param dto 멘토 프로필 DTO
   * @returns 멘토 프로필 도메인 모델
   */
  toDomain(dto: MentorProfileDto): MentorProfile {
    return new MentorProfile({
      idx: dto.idx,
      userId: dto.userId,
      introductionTitle: dto.introductionTitle,
      introductionContent: dto.introductionContent,
      baekjoonTierDisplay: dto.baekjoonTierDisplay,
      mentoringCount: dto.mentoringCount,
      totalReviewCount: dto.totalReviewCount,
      averageRating: dto.averageRating,
      isVerified: dto.isVerified,
      isActive: dto.isActive,
      profileCompletion: dto.profileCompletion,
      tags: this.mentorTagMapper.toDomainList(dto.tags),
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    })
  }

  /**
   * 도메인 모델 배열을 DTO 배열로 변환
   * @param mentorProfiles 멘토 프로필 도메인 모델 배열
   * @returns 멘토 프로필 DTO 배열
   */
  toDtoList(mentorProfiles: MentorProfile[]): MentorProfileDto[] {
    return mentorProfiles.map((profile) => this.toDto(profile))
  }

  /**
   * DTO 배열을 도메인 모델 배열로 변환
   * @param dtos 멘토 프로필 DTO 배열
   * @returns 멘토 프로필 도메인 모델 배열
   */
  toDomainList(dtos: MentorProfileDto[]): MentorProfile[] {
    return dtos.map((dto) => this.toDomain(dto))
  }
}
