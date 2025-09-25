import { StartVerificationOutputDto } from "@/modules/baekjoon/application/dtos"
import { StartBaekjoonVerificationDto } from "@/modules/onboarding/application/dtos/start-baekjoon-verification.dto"

/**
 * 백준 인증 시작 유스케이스 인터페이스
 */
export abstract class StartBaekjoonVerificationUseCase {
  abstract execute(dto: StartBaekjoonVerificationDto): Promise<StartVerificationOutputDto>
}
