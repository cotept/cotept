import { Inject, Injectable } from "@nestjs/common"

import { MentorTagsResponseDto } from "../../dtos/mentor-tags.dto"
import { GetMentorTagsUseCase } from "../../ports/in/get-mentor-tags.usecase"

import { MentorTagMapper } from "@/modules/mentor/application/mappers/mentor-tag.mapper"
import { GetMentorTagsUseCase as MentorGetMentorTagsUseCase } from "@/modules/mentor/application/ports/in/get-mentor-tags.usecase"
import { MentorTagCategory } from "@/modules/mentor/domain/model/mentor-tag"

@Injectable()
export class GetMentorTagsUseCaseImpl implements GetMentorTagsUseCase {
  constructor(
    @Inject("GetMentorTagsUseCase")
    private readonly mentorTagsUseCase: MentorGetMentorTagsUseCase,
    private readonly mentorTagMapper: MentorTagMapper,
  ) {}

  async execute(): Promise<MentorTagsResponseDto> {
    const allTags = await this.mentorTagsUseCase.execute()

    const jobTags = allTags.filter((tag) => tag.category === MentorTagCategory.JOB)
    const experienceTags = allTags.filter((tag) => tag.category === MentorTagCategory.EXPERIENCE)
    const companyTags = allTags.filter((tag) => tag.category === MentorTagCategory.COMPANY)

    return {
      jobTags: this.mentorTagMapper.toDtoList(jobTags),
      experienceTags: this.mentorTagMapper.toDtoList(experienceTags),
      companyTags: this.mentorTagMapper.toDtoList(companyTags),
    }
  }
}
