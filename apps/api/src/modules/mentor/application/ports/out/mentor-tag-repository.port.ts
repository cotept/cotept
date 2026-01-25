import MentorTag from "@/modules/mentor/domain/model/mentor-tag"

export abstract class MentorTagRepositoryPort {
  abstract findByIds(tagIds: number[]): Promise<MentorTag[]>
  abstract findAll(): Promise<MentorTag[]>
}
