import { ChangePasswordDto } from "@/modules/user/application/dtos/change-password.dto"

/**
 * 비밀번호 변경 유스케이스 인터페이스
 * 이 포트는 외부에서 사용자 비밀번호를 변경하는 기능을 정의합니다.
 */
export abstract class ChangePasswordUseCase {
  /**
   * 비밀번호 변경
   * @param userId 사용자 ID
   * @param changePasswordDto 비밀번호 변경 정보
   * @returns 비밀번호 변경 성공 여부
   */
  abstract execute(userId: string, changePasswordDto: ChangePasswordDto): Promise<boolean>
}
