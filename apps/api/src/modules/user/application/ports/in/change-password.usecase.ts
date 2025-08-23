import { ChangePasswordDto } from "@/modules/user/application/dto/change-password.dto"

/**
 * 비밀번호 변경 유스케이스 인터페이스
 * 이 포트는 외부에서 사용자 비밀번호를 변경하는 기능을 정의합니다.
 */
export abstract class ChangePasswordUseCase {
  /**
   * 비밀번호 변경
   * @param idx 사용자 IDX
   * @param changePasswordDto 비밀번호 변경 정보
   * @returns 비밀번호 변경 성공 여부
   */
  abstract execute(idx: number, changePasswordDto: ChangePasswordDto): Promise<boolean>
}
