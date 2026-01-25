import { MentorProfileDto } from "@/modules/mentor/application/dtos/mentor-profile.dto"
import { OnboardingCreateMentorProfileDto } from "@/modules/onboarding/application/dtos/create-mentor-profile.dto"

/**
 * 멘토 프로필 생성 유스케이스 인터페이스
 */
export abstract class CreateMentorProfileOnboardingUseCase {
  abstract execute(dto: OnboardingCreateMentorProfileDto): Promise<MentorProfileDto>;
}
