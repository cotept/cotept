import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"

export abstract class MentorProfileRepositoryPort {
  abstract findByUserId(userId: string): Promise<MentorProfile | null>
  abstract findByIdx(idx: number): Promise<MentorProfile | null>
  abstract save(mentorProfile: MentorProfile): Promise<MentorProfile>
  abstract delete(idx: number): Promise<boolean>
  abstract hardDelete(idx: number): Promise<boolean>
}
