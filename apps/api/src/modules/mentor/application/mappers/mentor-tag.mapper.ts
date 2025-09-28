import { Injectable } from "@nestjs/common"

import { MentorTagsResponseDto } from "@/modules/mentor/application/dtos"
import { MentorTagDto } from "@/modules/mentor/application/dtos/mentor-tag.dto"
import MentorTag, { MentorTagCategory } from "@/modules/mentor/domain/model/mentor-tag"

@Injectable()
export class MentorTagMapper {
  /**
   * 도메인 모델을 DTO로 변환
   * @param mentorTag 멘토 태그 도메인 모델
   * @returns 멘토 태그 DTO
   */
  toDto(mentorTag: MentorTag): MentorTagDto {
    return {
      idx: mentorTag.idx!,
      name: mentorTag.name,
      category: mentorTag.category,
      displayOrder: mentorTag.displayOrder,
      isActive: mentorTag.isActive,
      createdAt: mentorTag.createdAt,
      updatedAt: mentorTag.updatedAt,
    }
  }

  /**
   * DTO를 도메인 모델로 변환
   * @param dto 멘토 태그 DTO
   * @returns 멘토 태그 도메인 모델
   */
  toDomain(dto: MentorTagDto): MentorTag {
    return new MentorTag({
      idx: dto.idx,
      name: dto.name,
      category: dto.category,
      displayOrder: dto.displayOrder,
      isActive: dto.isActive,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    })
  }

  /**
   * 도메인 모델 배열을 DTO 배열로 변환
   * @param mentorTags 멘토 태그 도메인 모델 배열
   * @returns 멘토 태그 DTO 배열
   */
  toDtoList(mentorTags: MentorTag[]): MentorTagDto[] {
    return mentorTags.map((tag) => this.toDto(tag))
  }

  /**
   * DTO 배열을 도메인 모델 배열로 변환
   * @param dtos 멘토 태그 DTO 배열
   * @returns 멘토 태그 도메인 모델 배열
   */
  toDomainList(dtos: MentorTagDto[]): MentorTag[] {
    return dtos.map((dto) => this.toDomain(dto))
  }

  toDtoTagsList(mentorTags: MentorTag[]): MentorTagsResponseDto {
    const jobTags = mentorTags.filter((tag) => tag.category === MentorTagCategory.JOB)
    const experienceTags = mentorTags.filter((tag) => tag.category === MentorTagCategory.EXPERIENCE)
    const companyTags = mentorTags.filter((tag) => tag.category === MentorTagCategory.COMPANY)

    return {
      jobTags: this.toDtoList(jobTags),
      experienceTags: this.toDtoList(experienceTags),
      companyTags: this.toDtoList(companyTags),
    }
  }
}
