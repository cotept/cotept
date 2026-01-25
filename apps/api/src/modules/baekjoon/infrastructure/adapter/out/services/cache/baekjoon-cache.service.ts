import { Injectable, Logger } from "@nestjs/common"

import { CachePort } from "@/modules/baekjoon/application/ports/out/cache.port"
import { CacheService } from "@/shared/infrastructure/cache/redis/cache.service"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * 백준 캐시 서비스
 * 백준 모듈 전용 캐시 기능을 제공하는 어댑터
 */
@Injectable()
export class BaekjoonCacheService extends CachePort {
  private readonly logger = new Logger(BaekjoonCacheService.name)

  constructor(private readonly cacheService: CacheService) {
    super()
  }

  /**
   * 백준 프로필 캐시 키 생성
   */
  private createProfileCacheKey(handle: string): string {
    return `baekjoon:profile:${handle}`
  }

  /**
   * 백준 태그 통계 캐시 키 생성
   */
  private createTagStatsCacheKey(handle: string): string {
    return `baekjoon:tag_stats:${handle}`
  }

  /**
   * 인증 세션 캐시 키 생성
   */
  private createVerificationCacheKey(userId: string): string {
    return `baekjoon:verification:${userId}`
  }

  /**
   * 캐시에서 데이터를 조회합니다
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.cacheService.getObject<T>(key)
      return result
    } catch (error) {
      this.logger.error(
        `baekjoon.cache.${BaekjoonCacheService.name}
${ErrorUtils.getErrorMessage(error)}

${ErrorUtils.getErrorStack(error)}`,
      )
      throw error
    }
  }

  /**
   * 캐시에 데이터를 저장합니다
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 2700): Promise<void> {
    try {
      await this.cacheService.setObject(key, value, ttlSeconds)
    } catch (error) {
      this.logger.error(
        `baekjoon.cache.${BaekjoonCacheService.name}
${ErrorUtils.getErrorMessage(error)}

${ErrorUtils.getErrorStack(error)}`,
      )
      throw error
    }
  }

  /**
   * 캐시에서 데이터를 삭제합니다
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cacheService.delete(key)
    } catch (error) {
      this.logger.error(
        `baekjoon.cache.${BaekjoonCacheService.name}
${ErrorUtils.getErrorMessage(error)}

${ErrorUtils.getErrorStack(error)}`,
      )
      throw error
    }
  }

  /**
   * 패턴에 맞는 키들을 삭제합니다
   */
  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.cacheService.keys(pattern)
      if (keys.length > 0) {
        await this.cacheService.deleteMany(keys)
      }
    } catch (error) {
      this.logger.error(
        `baekjoon.cache.${BaekjoonCacheService.name}
${ErrorUtils.getErrorMessage(error)}

${ErrorUtils.getErrorStack(error)}`,
      )
      throw error
    }
  }

  /**
   * 프로필 캐시 조회
   */
  async getProfile<T>(handle: string): Promise<T | null> {
    const key = this.createProfileCacheKey(handle)
    return this.get<T>(key)
  }

  /**
   * 프로필 캐시 저장 (45분)
   */
  async setProfile<T>(handle: string, profile: T): Promise<void> {
    const key = this.createProfileCacheKey(handle)
    await this.set(key, profile, 2700) // 45분
  }

  /**
   * 태그 통계 캐시 조회
   */
  async getTagStatistics<T>(handle: string): Promise<T | null> {
    const key = this.createTagStatsCacheKey(handle)
    return this.get<T>(key)
  }

  /**
   * 태그 통계 캐시 저장 (45분)
   */
  async setTagStatistics<T>(handle: string, stats: T): Promise<void> {
    const key = this.createTagStatsCacheKey(handle)
    await this.set(key, stats, 2700) // 45분
  }

  /**
   * 인증 세션 캐시 조회
   */
  async getVerificationSession<T>(userId: string): Promise<T | null> {
    const key = this.createVerificationCacheKey(userId)
    return this.get<T>(key)
  }

  /**
   * 인증 세션 캐시 저장 (1시간)
   */
  async setVerificationSession<T>(userId: string, session: T): Promise<void> {
    const key = this.createVerificationCacheKey(userId)
    await this.set(key, session, 3600) // 1시간
  }

  /**
   * 사용자의 모든 백준 관련 캐시 삭제
   */
  async clearUserCache(handle: string): Promise<void> {
    await this.deleteByPattern(`baekjoon:*:${handle}`)
  }
}