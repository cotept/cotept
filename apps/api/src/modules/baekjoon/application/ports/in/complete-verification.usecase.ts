import { CompleteVerificationDto } from "@/modules/baekjoon/application/dtos"
import { CompleteVerificationRequestDto } from "@/modules/baekjoon/infrastructure/dtos/request"

/**
 * 인증 완료 유스케이스 포트
 * 백준 ID 인증을 완료하는 인바운드 포트
 */
export abstract class CompleteVerificationUseCase {
  /**
   * 백준 ID 인증을 완료합니다
   */
  abstract execute(requestDto: CompleteVerificationRequestDto): Promise<CompleteVerificationDto>
}
