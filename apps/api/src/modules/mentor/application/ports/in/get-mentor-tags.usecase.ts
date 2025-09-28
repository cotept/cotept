import MentorTag from "@/modules/mentor/domain/model/mentor-tag"

export abstract class GetMentorTagsUseCase {
  abstract execute(tagIds: number[]): Promise<MentorTag[]>
  abstract executeAllTags(): Promise<MentorTag[]>
}
