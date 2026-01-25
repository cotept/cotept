import { CreateMentorProfileDto } from "@/modules/mentor/application/dtos/create-mentor-profile.dto"
import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"

export abstract class CreateMentorProfileUseCase {
  abstract execute(dto: CreateMentorProfileDto): Promise<MentorProfile>
}
