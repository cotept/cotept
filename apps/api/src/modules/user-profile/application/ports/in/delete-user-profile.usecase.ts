/**
 * 사용자 프로필 삭제 유스케이스 인터페이스
 * 이 포트는 사용자 프로필을 삭제하는 기능을 정의합니다.
 */
export abstract class DeleteUserProfileUseCase {
  /**
   * 사용자 프로필 삭제
   * @param userId 삭제할 사용자 ID
   * @returns 삭제 성공 여부
   */
  abstract execute(userId: string): Promise<boolean>
}
