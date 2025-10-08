import { Inject, Injectable } from "@nestjs/common"

import { GetMentorTagsUseCase } from "../../ports/in/get-mentor-tags.usecase"

import { MentorTagsResponseDto } from "@/modules/mentor/application/dtos"
import { GetMentorTagsUseCase as MentorGetMentorTagsUseCase } from "@/modules/mentor/application/ports/in/get-mentor-tags.usecase"
import { MentorFacadeService } from "@/modules/mentor/application/services/facade/mentor-facade.service"

@Injectable()
export class GetMentorTagsUseCaseImpl implements GetMentorTagsUseCase {
  constructor(
    @Inject(MentorGetMentorTagsUseCase)
    private readonly mentorService: MentorFacadeService,
  ) {}

  async execute(): Promise<MentorTagsResponseDto> {
    return await this.mentorService.getAllMentorTags()
  }
}
