import { CheckMentorEligibilityDto } from "@/modules/onboarding/application/dtos/check-mentor-eligibility.dto"
import { MentorEligibilityDto } from "@/modules/onboarding/application/dtos/mentor-eligibility.dto"

/**
 * 멘토 자격 요건 확인 유스케이스 인터페이스
 */
export abstract class CheckMentorEligibilityUseCase {
  abstract execute(dto: CheckMentorEligibilityDto): Promise<MentorEligibilityDto>
}
