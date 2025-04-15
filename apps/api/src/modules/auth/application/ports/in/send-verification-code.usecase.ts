import { SendVerificationCodeDto } from "@/modules/auth/application/dtos/send-verification-code.dto"

/**
 * 인증 코드 발송 유스케이스 인터페이스
 * 이메일 또는 SMS로 인증 코드를 발송하는 기능을 정의합니다.
 */
export abstract class SendVerificationCodeUseCase {
  /**
   * 이메일 또는 SMS로 인증 코드 발송
   * @param sendVerificationCodeDto 인증 코드 발송 정보(인증 타입, 대상, IP)
   * @returns 인증 ID
   */
  abstract execute(
    sendVerificationCodeDto: SendVerificationCodeDto,
  ): Promise<{ verificationId: string; expiresAt: Date }>
}
