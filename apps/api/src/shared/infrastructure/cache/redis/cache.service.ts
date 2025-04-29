import { ErrorUtils } from "@/shared/utils/error.util"
import { Inject, Injectable, Logger } from "@nestjs/common"
import type { Cacheable } from "cacheable"

@Injectable()
export class CacheService {
  constructor(@Inject("CACHE_INSTANCE") private readonly cache: Cacheable) {}

  private readonly logger = new Logger(CacheService.name)
  /**
   * 키 값 조회
   * @param key 키
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cache.get(key)
    } catch (error) {
      this.logger.error(
        `키 조회 중 오류 발생 (${key}): ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 키에 값 설정
   * @param key 키
   * @param value 값
   * @param ttl 만료 시간(초 또는 문자열)
   */
  async set<T>(key: string, value: T, ttl?: number | string): Promise<void> {
    try {
      await this.cache.set(key, value, ttl)
    } catch (error) {
      this.logger.error(
        `키 설정 중 오류 발생 (${key}): ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 키 삭제
   * @param key 키
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cache.delete(key)
    } catch (error) {
      this.logger.error(
        `키 삭제 중 오류 발생 (${key}): ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 키 존재 여부 확인
   * @param key 키
   */
  async exists(key: string): Promise<boolean> {
    try {
      const value = await this.get(key)
      return value !== undefined
    } catch (error) {
      this.logger.error(
        `키 존재 확인 중 오류 발생 (${key}): ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 패턴에 매칭되는 키 조회
   * @param pattern 패턴
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      const client = this.getClient()
      return await client.keys(pattern)
    } catch (error) {
      this.logger.error(
        `키 패턴 검색 중 오류 발생 (${pattern}): ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 여러 키 한번에 삭제
   * @param keys 키 배열
   */
  async deleteMany(keys: string[]): Promise<void> {
    try {
      if (keys.length === 0) return

      const client = this.getClient()
      if (client.del) {
        // Redis 클라이언트에 직접 del 명령어 사용
        await client.del(...keys)
      } else {
        // 대체 방법으로 키를 하나씩 삭제
        for (const key of keys) {
          await this.delete(key)
        }
      }
    } catch (error) {
      this.logger.error(
        `다중 키 삭제 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 객체 저장 (JSON 변환 없이 직접 저장)
   * @param key 키
   * @param value 객체
   * @param ttl 만료 시간(초 또는 문자열)
   */
  async setObject<T>(key: string, value: T, ttl?: number | string): Promise<void> {
    try {
      await this.set(key, value, ttl)
    } catch (error) {
      this.logger.error(
        `객체 저장 중 오류 발생 (${key}): ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 객체 조회
   * @param key 키
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get<T>(key)
      return value !== undefined ? value : null
    } catch (error) {
      this.logger.error(
        `객체 조회 중 오류 발생 (${key}): ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * Redis 클라이언트 직접 접근
   * 복잡한 Redis 작업을 위한 저수준 클라이언트 반환
   * @throws {Error} Redis 클라이언트를 찾을 수 없는 경우
   */
  getClient(): any {
    try {
      const client = (this.cache as any).secondary?.store?.client
      if (!client) {
        throw new Error("Redis 클라이언트에 접근할 수 없습니다. 캐시 구성을 확인하세요.")
      }
      return client
    } catch (error) {
      this.logger.error(
        `Redis 클라이언트 접근 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }
}
