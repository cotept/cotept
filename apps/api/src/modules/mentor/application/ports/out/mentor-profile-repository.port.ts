import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"

export interface MentorProfileRepositoryPort {
  findByUserId(userId: string): Promise<MentorProfile | null>
  findByIdx(idx: number): Promise<MentorProfile | null>
  save(mentorProfile: MentorProfile): Promise<MentorProfile>
  delete(idx: number): Promise<boolean>
  hardDelete(idx: number): Promise<boolean>
}