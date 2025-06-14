import { VerificationSession } from "@/modules/baekjoon/domain/model"

/**
 * 백준 인증 세션 레포지토리 포트 (Redis Cache)
 * 임시 인증 세션, Rate Limiting 등을 관리
 */
export abstract class BaekjoonVerificationRepositoryPort {
  // === 인증 세션 관리 ===
  abstract saveVerificationSession(session: VerificationSession, ttlSeconds?: number): Promise<void>
  abstract findVerificationSessionById(sessionId: string): Promise<VerificationSession | null>
  abstract findActiveVerificationSessionByUserId(userId: string): Promise<VerificationSession | null>
  abstract deleteVerificationSession(sessionId: string): Promise<void>

  // === Rate Limiting ===
  abstract checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean>
  abstract recordAttempt(key: string): Promise<void>
  abstract getRemainingAttempts(key: string, limit: number): Promise<number>

  // === 임시 데이터 저장 ===
  abstract setTemporaryData(key: string, data: any, ttlSeconds: number): Promise<void>
  abstract getTemporaryData<T>(key: string): Promise<T | null>
  abstract deleteTemporaryData(key: string): Promise<void>
}
