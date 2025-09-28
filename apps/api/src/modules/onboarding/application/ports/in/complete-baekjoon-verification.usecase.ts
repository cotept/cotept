import { VerificationResultResponseDto } from "@/modules/baekjoon/infrastructure/dtos/response/verification-result.response.dto"
import { CompleteBaekjoonVerificationDto } from "@/modules/onboarding/application/dtos/complete-baekjoon-verification.dto"

export abstract class CompleteBaekjoonVerificationUseCase {
  abstract execute(dto: CompleteBaekjoonVerificationDto): Promise<VerificationResultResponseDto>
}
