import { Inject, Injectable } from "@nestjs/common"

import { GetMentorTagsUseCase } from "@/modules/mentor/application/ports/in/get-mentor-tags.usecase"
import { MentorTagRepositoryPort } from "@/modules/mentor/application/ports/out/mentor-tag-repository.port"
import MentorTag from "@/modules/mentor/domain/model/mentor-tag"

@Injectable()
export class GetMentorTagsUseCaseImpl implements GetMentorTagsUseCase {
  constructor(
    @Inject("MentorTagRepositoryPort")
    private readonly mentorTagRepository: MentorTagRepositoryPort,
  ) {}

  async execute(): Promise<MentorTag[]> {
    return this.mentorTagRepository.findAll()
  }
}
