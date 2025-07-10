import { Injectable, Logger } from "@nestjs/common"

import { RateLimitInfo, RateLimitPort } from "@/modules/baekjoon/application/ports/out/rate-limit.port"
import { CacheService } from "@/shared/infrastructure/cache/redis/cache.service"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * 백준 Rate Limit 서비스
 * 백준 모듈 전용 API 호출 제한 기능을 제공하는 어댑터
 */
@Injectable()
export class BaekjoonRateLimitService extends RateLimitPort {
  private readonly logger = new Logger(BaekjoonRateLimitService.name)

  constructor(private readonly cacheService: CacheService) {
    super()
  }

  /**
   * Rate Limit 키 생성
   */
  private createRateLimitKey(key: string): string {
    return `rate_limit:baekjoon:${key}`
  }

  /**
   * Rate Limit 정보 키 생성
   */
  private createRateLimitInfoKey(key: string): string {
    return `rate_limit_info:baekjoon:${key}`
  }

  /**
   * 속도 제한 확인 및 적용
   * @param key 속도 제한 키 (사용자 식별자)
   * @param limit 제한 횟수
   * @param windowSeconds 시간 창 (초)
   * @returns 요청이 허용되는지 여부
   */
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    try {
      const rateLimitKey = this.createRateLimitKey(key)
      const infoKey = this.createRateLimitInfoKey(key)
      
      const client = this.cacheService.getClient()
      const now = Date.now()
      const windowStart = now - windowSeconds * 1000

      // Sliding window 방식으로 구현
      const pipeline = client.pipeline()
      
      // 만료된 항목들 제거
      pipeline.zremrangebyscore(rateLimitKey, 0, windowStart)
      
      // 현재 시간 추가
      pipeline.zadd(rateLimitKey, now, `${now}-${Math.random()}`)
      
      // 현재 요청 수 조회
      pipeline.zcard(rateLimitKey)
      
      // TTL 설정
      pipeline.expire(rateLimitKey, windowSeconds)

      const results = await pipeline.exec()
      const currentCount = results[2][1] as number

      const isAllowed = currentCount <= limit
      const remaining = Math.max(0, limit - currentCount)
      const resetTime = new Date(now + windowSeconds * 1000)

      // Rate Limit 정보 저장
      const rateLimitInfo = new RateLimitInfo(limit, remaining, resetTime, !isAllowed)
      await this.cacheService.setObject(infoKey, rateLimitInfo, windowSeconds)

      if (!isAllowed) {
        this.logger.warn(
          `Rate limit exceeded for key: ${key}, limit: ${limit}, current: ${currentCount}`
        )
      }

      return isAllowed
    } catch (error) {
      this.logger.error(
        `baekjoon.rateLimit.${BaekjoonRateLimitService.name}
${ErrorUtils.getErrorMessage(error)}

${ErrorUtils.getErrorStack(error)}`,
      )
      // Rate Limit 확인 실패 시 허용으로 처리 (fail-open)
      return true
    }
  }

  /**
   * 속도 제한 정보 조회
   * @param key 속도 제한 키
   * @returns 현재 상태 정보
   */
  async getRateLimitInfo(key: string): Promise<RateLimitInfo> {
    try {
      const infoKey = this.createRateLimitInfoKey(key)
      const info = await this.cacheService.getObject<RateLimitInfo>(infoKey)
      
      if (info) {
        return new RateLimitInfo(info.limit, info.remaining, new Date(info.resetTime), info.isBlocked)
      }

      // 정보가 없으면 기본값 반환
      return new RateLimitInfo(0, 0, new Date(), false)
    } catch (error) {
      this.logger.error(
        `baekjoon.rateLimit.${BaekjoonRateLimitService.name}
${ErrorUtils.getErrorMessage(error)}

${ErrorUtils.getErrorStack(error)}`,
      )
      return new RateLimitInfo(0, 0, new Date(), false)
    }
  }

  /**
   * 속도 제한 초기화
   * @param key 속도 제한 키
   */
  async resetRateLimit(key: string): Promise<void> {
    try {
      const rateLimitKey = this.createRateLimitKey(key)
      const infoKey = this.createRateLimitInfoKey(key)
      
      await Promise.all([
        this.cacheService.delete(rateLimitKey),
        this.cacheService.delete(infoKey)
      ])
    } catch (error) {
      this.logger.error(
        `baekjoon.rateLimit.${BaekjoonRateLimitService.name}
${ErrorUtils.getErrorMessage(error)}

${ErrorUtils.getErrorStack(error)}`,
      )
      throw error
    }
  }

  /**
   * 시도 기록 (통계 목적)
   * @param key 속도 제한 키
   */
  async recordAttempt(key: string): Promise<void> {
    try {
      const attemptKey = `attempts:baekjoon:${key}`
      const client = this.cacheService.getClient()
      const now = Date.now()
      
      // 시도 기록 (24시간 보관)
      await client.zadd(attemptKey, now, `${now}-${Math.random()}`)
      await client.expire(attemptKey, 24 * 60 * 60) // 24시간
    } catch (error) {
      this.logger.error(
        `baekjoon.rateLimit.${BaekjoonRateLimitService.name}
${ErrorUtils.getErrorMessage(error)}

${ErrorUtils.getErrorStack(error)}`,
      )
      // 시도 기록 실패는 무시 (비중요)
    }
  }

  /**
   * 백준 API 호출 제한 확인 (30분/1회)
   */
  async checkBaekjoonApiLimit(userId: string): Promise<boolean> {
    const key = `api:${userId}`
    return this.checkRateLimit(key, 1, 30 * 60) // 30분에 1회
  }

  /**
   * 인증 시도 제한 확인 (10분/3회)
   */
  async checkVerificationLimit(userId: string): Promise<boolean> {
    const key = `verification:${userId}`
    return this.checkRateLimit(key, 3, 10 * 60) // 10분에 3회
  }

  /**
   * IP 기반 제한 확인 (5분/10회)
   */
  async checkIpLimit(ip: string): Promise<boolean> {
    const key = `ip:${ip}`
    return this.checkRateLimit(key, 10, 5 * 60) // 5분에 10회
  }
}