import { Inject, Injectable, Logger } from "@nestjs/common"

import { SyncVerificationStatusUseCase } from "../../ports/in/sync-verification-status.usecase"
import { BaekjoonProfileRepositoryPort } from "../../ports/out/baekjoon-profile-repository.port"
import { CachePort } from "../../ports/out/cache.port"

import { VerificationSession } from "@/modules/baekjoon/domain/model"
import { ErrorUtils } from "@/shared/utils/error.util"

@Injectable()
export class SyncVerificationStatusUseCaseImpl implements SyncVerificationStatusUseCase {
  private readonly logger = new Logger(SyncVerificationStatusUseCaseImpl.name)

  constructor(
    @Inject("BaekjoonProfileRepositoryPort")
    private readonly profileRepository: BaekjoonProfileRepositoryPort,
    @Inject("CachePort")
    private readonly cacheAdapter: CachePort,
  ) {}

  async syncFromSession(sessionId: string): Promise<void> {
    try {
      // 1단계: 세션 조회
      const session = await this.getSession(sessionId)
      if (!session) return

      // 2단계: 사용자 조회
      const user = await this.getUser(session.getUserId())
      if (!user) return

      // 3단계: 상태 동기화 필요성 확인 및 처리
      const syncResult = await this.performSync(user, session)

      if (syncResult.updated) {
        this.logger.log(
          `✅ Synced verification status: user=${session.getUserId()}, session=${sessionId}, result=${syncResult.action}`,
        )
      }
    } catch (error) {
      this.logger.error(
        `❌ Failed to sync verification status for session ${sessionId}:`,
        ErrorUtils.getErrorMessage(error),
      )
      // 에러 발생해도 메인 플로우는 계속 진행 (throw 하지 않음)
    }
  }

  async cleanupFailedSessions(): Promise<number> {
    let cleanedCount = 0

    try {
      this.logger.log("🧹 Starting cleanup of failed verification sessions...")

      // 실제 구현에서는 Redis SCAN으로 패턴 매칭하여 만료된 세션들 찾기
      // 여기서는 간단한 예시로 구현

      // TODO: Redis에서 만료된 세션들 찾는 로직 구현
      // const expiredSessions = await this.findExpiredSessions()

      // for (const session of expiredSessions) {
      //   try {
      //     await this.syncFromSession(session.getSessionId())
      //     cleanedCount++
      //   } catch (error) {
      //     this.logger.warn(`Failed to cleanup session ${session.getSessionId()}:`, error)
      //   }
      // }

      this.logger.log(`🧹 Cleanup completed: ${cleanedCount} sessions processed`)
      return cleanedCount
    } catch (error) {
      this.logger.error("❌ Failed to cleanup failed sessions:", ErrorUtils.getErrorMessage(error))
      return cleanedCount
    }
  }

  async forceSyncUser(userId: string): Promise<void> {
    try {
      this.logger.log(`🔄 Force syncing user: ${userId}`)

      // 사용자 조회
      const user = await this.getUser(userId)
      if (!user) {
        this.logger.warn(`User not found for force sync: ${userId}`)
        return
      }

      // 해당 사용자의 활성 세션 찾기
      const activeSession = await this.findActiveSessionForUser(userId)
      if (!activeSession) {
        this.logger.log(`No active session found for user: ${userId}`)
        return
      }

      // 동기화 수행
      const syncResult = await this.performSync(user, activeSession)

      if (syncResult.updated) {
        this.logger.log(`✅ Force sync completed: user=${userId}, action=${syncResult.action}`)
      } else {
        this.logger.log(`ℹ️ No sync needed for user: ${userId}`)
      }
    } catch (error) {
      this.logger.error(`❌ Failed to force sync user ${userId}:`, ErrorUtils.getErrorMessage(error))
      throw error // force sync는 에러를 던짐 (배치 작업에서 재시도 가능)
    }
  }

  // === Private 헬퍼 메서드들 ===

  /**
   * 세션 조회
   */
  private async getSession(sessionId: string): Promise<VerificationSession | null> {
    try {
      const session = await this.cacheAdapter.get<VerificationSession>(sessionId)
      if (!session) {
        this.logger.warn(`Session not found: ${sessionId}`)
        return null
      }
      return session
    } catch (error) {
      this.logger.error(`Failed to get session ${sessionId}:`, error)
      return null
    }
  }

  /**
   * 사용자 조회
   */
  private async getUser(userId: string) {
    try {
      const user = await this.profileRepository.findByUserId(userId)
      if (!user) {
        this.logger.warn(`User not found: ${userId}`)
        return null
      }
      return user
    } catch (error) {
      this.logger.error(`Failed to get user ${userId}:`, error)
      return null
    }
  }

  /**
   * 실제 동기화 수행
   */
  private async performSync(
    user: any,
    session: VerificationSession,
  ): Promise<{
    updated: boolean
    action: string
  }> {
    let shouldUpdate = false
    let action = "no_change"

    // 세션이 완료되었는데 사용자가 인증되지 않은 경우
    if (session.isCompleted() && !user.isVerified()) {
      user.markAsVerified()
      shouldUpdate = true
      action = "marked_verified"
    }
    // 세션이 실패/만료되었는데 사용자가 아직 PENDING인 경우
    else if ((session.isFailed() || session.isExpired()) && user.isPending()) {
      user.updateVerificationResult("REJECTED")
      shouldUpdate = true
      action = "marked_rejected"
    }

    // 변경사항이 있으면 저장
    if (shouldUpdate) {
      await this.profileRepository.save(user)
    }

    return { updated: shouldUpdate, action }
  }

  /**
   * 사용자의 활성 세션 찾기
   */
  private async findActiveSessionForUser(userId: string): Promise<VerificationSession | null> {
    try {
      // TODO: Redis에서 패턴 매칭으로 해당 사용자의 세션들 찾기
      // 실제 구현에서는 Redis SCAN 명령어 사용
      // const sessionKeys = await this.cacheAdapter.keys(`*${userId}*`)

      return null // 임시로 null 반환
    } catch (error) {
      this.logger.error(`Failed to find active session for user ${userId}:`, error)
      return null
    }
  }
}
