import { MentorTagsResponseDto } from "@/modules/onboarding/application/dtos/mentor-tags.dto"

export abstract class GetMentorTagsUseCase {
  abstract execute(): Promise<MentorTagsResponseDto>
}
