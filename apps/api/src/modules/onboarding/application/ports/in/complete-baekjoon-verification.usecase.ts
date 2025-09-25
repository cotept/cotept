import { CompleteVerificationOutputDto } from "@/modules/baekjoon/application/dtos"
import { CompleteBaekjoonVerificationDto } from "@/modules/onboarding/application/dtos/complete-baekjoon-verification.dto"

export abstract class CompleteBaekjoonVerificationUseCase {
  abstract execute(dto: CompleteBaekjoonVerificationDto): Promise<CompleteVerificationOutputDto>
}
