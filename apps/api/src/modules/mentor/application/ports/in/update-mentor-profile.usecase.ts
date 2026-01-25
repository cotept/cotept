import { UpdateMentorProfileDto } from "@/modules/mentor/application/dtos/update-mentor-profile.dto"
import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"

export abstract class UpdateMentorProfileUseCase {
  abstract execute(idx: number, dto: UpdateMentorProfileDto): Promise<MentorProfile>
}
