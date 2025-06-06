import { StartVerificationDto } from "@/modules/baekjoon/application/dtos"
import { StartVerificationRequestDto } from "@/modules/baekjoon/infrastructure/dtos/request"

/**
 * 인증 시작 유스케이스 포트
 * 백준 ID 인증 프로세스를 시작하는 인바운드 포트
 */
export abstract class StartVerificationUseCase {
  /**
   * 백준 ID 인증을 시작합니다
   */
  abstract execute(requestDto: StartVerificationRequestDto): Promise<StartVerificationDto & { sessionId: string }>
}
