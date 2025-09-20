import MentorTag from "@/modules/mentor/domain/model/mentor-tag"

export interface MentorTagRepositoryPort {
  findByIds(tagIds: number[]): Promise<MentorTag[]>
}
