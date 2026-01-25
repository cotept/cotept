export abstract class SyncVerificationStatusUseCase {
  /**
   * 세션 완료 후 사용자 프로필 상태 동기화
   */
  abstract syncFromSession(sessionId: string): Promise<void>

  /**
   * 실패한/만료된 세션들 정리 (배치용)
   */
  abstract cleanupFailedSessions(): Promise<number>

  /**
   * 특정 사용자의 인증 상태 강제 동기화
   */
  abstract forceSyncUser(userId: string): Promise<void>
}
