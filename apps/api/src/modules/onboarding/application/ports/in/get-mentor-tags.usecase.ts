import { MentorTagsResponseDto } from "@/modules/mentor/application/dtos/mentor-tags.dto"

export abstract class GetMentorTagsUseCase {
  abstract execute(): Promise<MentorTagsResponseDto>
}
