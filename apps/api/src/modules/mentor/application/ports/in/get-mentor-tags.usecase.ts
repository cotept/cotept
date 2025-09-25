import MentorTag from "@/modules/mentor/domain/model/mentor-tag"

export abstract class GetMentorTagsUseCase {
  abstract execute(): Promise<MentorTag[]>
}
