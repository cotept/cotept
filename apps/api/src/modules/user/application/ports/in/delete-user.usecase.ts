import { DeleteUserDto } from "@/modules/user/application/dto/delete-user.dto"

/**
 * 사용자 삭제 유스케이스 인터페이스
 * 이 포트는 외부에서 사용자를 삭제하는 기능을 정의합니다.
 */
export abstract class DeleteUserUseCase {
  /**
   * 사용자 삭제
   * @param idx 삭제할 사용자 ID
   * @param deleteUserDto 삭제 관련 추가 정보 (선택적)
   * @returns 삭제 성공 여부
   */
  abstract execute(idx: number, deleteUserDto?: DeleteUserDto): Promise<boolean>
}
