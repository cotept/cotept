import { ResetPasswordDto } from "@/modules/auth/application/dtos/reset-password.dto"

/**
 * 비밀번호 재설정 유스케이스 인터페이스
 * 인증된 사용자의 비밀번호를 재설정하는 기능을 정의합니다.
 */
export abstract class ResetPasswordUseCase {
  /**
   * 사용자 비밀번호 재설정
   * @param resetPasswordDto 비밀번호 재설정 정보(이메일, 인증 ID, 새 비밀번호 등)
   * @returns 성공 여부
   */
  abstract execute(resetPasswordDto: ResetPasswordDto): Promise<boolean>
}
