import { Injectable, Logger } from "@nestjs/common"

import { TokenStoragePort } from "@/modules/auth/application/ports/out/token-storage.port"
import { PendingLinkInfo } from "@/modules/auth/domain/model/pending-link-info"
import { CacheService } from "@/shared/infrastructure/cache/redis"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * Redis를 사용한 토큰 저장소 구현
 */
@Injectable()
export class RedisTokenStorageRepository implements TokenStoragePort {
  private readonly logger = new Logger(RedisTokenStorageRepository.name)

  // 토큰 관련 Redis 키 접두사
  private readonly BLACKLIST_PREFIX = "bl:"
  private readonly REFRESH_FAMILY_PREFIX = "refresh:"
  private readonly AUTH_CODE_PREFIX = "auth_code:"
  private readonly PENDING_LINK_PREFIX = "pending_link:"

  constructor(private readonly redisService: CacheService) {}

  /**
   * 토큰 블랙리스트에 추가
   * @param tokenId 토큰 ID
   * @param expiresIn 만료 시간(초)
   */
  async addToBlacklist(tokenId: string, expiresIn: number): Promise<void> {
    try {
      const key = `${this.BLACKLIST_PREFIX}${tokenId}`
      await this.redisService.set(key, "1", expiresIn)
    } catch (error) {
      this.logger.error(
        `Failed to add token to blacklist: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 토큰이 블랙리스트에 있는지 확인
   * @param tokenId 토큰 ID
   * @returns 블랙리스트 포함 여부
   */
  async isBlacklisted(tokenId: string): Promise<boolean> {
    try {
      const key = `${this.BLACKLIST_PREFIX}${tokenId}`
      return await this.redisService.exists(key)
    } catch (error) {
      this.logger.error(
        `Failed to check blacklist: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 리프레시 토큰 패밀리 저장
   * @param userId 사용자 ID
   * @param familyId 패밀리 ID
   * @param tokenId 토큰 ID
   * @param expiresIn 만료 시간(초)
   */
  async saveRefreshTokenFamily(userId: string, familyId: string, tokenId: string, expiresIn: number): Promise<void> {
    try {
      const key = `${this.REFRESH_FAMILY_PREFIX}${userId}:${familyId}`
      await this.redisService.set(key, tokenId, expiresIn)
    } catch (error) {
      this.logger.error(
        `Failed to save refresh token family: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 리프레시 토큰 패밀리 확인
   * @param userId 사용자 ID
   * @param familyId 패밀리 ID
   * @returns 유효한 패밀리인 경우 토큰 ID, 아니면 null
   */
  async getRefreshTokenFamily(userId: string, familyId: string): Promise<string | null | undefined> {
    try {
      const key = `${this.REFRESH_FAMILY_PREFIX}${userId}:${familyId}`
      return this.redisService.get<string>(key)
    } catch (error) {
      this.logger.error(
        `Failed to get refresh token family: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 리프레시 토큰 패밀리 삭제
   * @param userId 사용자 ID
   * @param familyId 패밀리 ID
   */
  async deleteRefreshTokenFamily(userId: string, familyId: string): Promise<void> {
    try {
      const key = `${this.REFRESH_FAMILY_PREFIX}${userId}:${familyId}`
      await this.redisService.delete(key)
    } catch (error) {
      this.logger.error(
        `Failed to delete refresh token family: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 사용자의 모든 리프레시 토큰 패밀리 삭제
   * @param userId 사용자 ID
   */
  async deleteAllRefreshTokenFamilies(userId: string): Promise<void> {
    try {
      const pattern = `${this.REFRESH_FAMILY_PREFIX}${userId}:*`
      const keys = await this.redisService.keys(pattern)

      if (keys.length > 0) {
        await this.redisService.deleteMany(keys)
      }
    } catch (error) {
      this.logger.error(
        `Failed to delete all refresh token families: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 인증 코드 저장
   * @param code 인증 코드
   * @param userId 사용자 ID
   * @param expiresIn 만료 시간(초)
   */
  async saveAuthCode(code: string, userId: string, expiresIn: number): Promise<void> {
    try {
      const key = `${this.AUTH_CODE_PREFIX}${code}`
      await this.redisService.set(key, userId, expiresIn)
      this.logger.debug(`Auth code saved for user ${userId} with expiration ${expiresIn}s`)
    } catch (error) {
      this.logger.error(
        `Failed to save auth code: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 인증 코드로 사용자 ID 조회
   * @param code 인증 코드
   * @returns 사용자 ID 또는 null
   */
  async getUserIdByAuthCode(code: string): Promise<string | undefined> {
    try {
      const key = `${this.AUTH_CODE_PREFIX}${code}`
      const userId = await this.redisService.get<string>(key)
      this.logger.debug(`Auth code lookup result for ${key}: ${userId || "not found"}`)
      return userId
    } catch (error) {
      this.logger.error(
        `Failed to get user by auth code: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 인증 코드 삭제
   * @param code 인증 코드
   */
  async deleteAuthCode(code: string): Promise<void> {
    try {
      const key = `${this.AUTH_CODE_PREFIX}${code}`
      await this.redisService.delete(key)
      this.logger.debug(`Auth code deleted: ${key}`)
    } catch (error) {
      this.logger.error(
        `Failed to delete auth code: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 소셜 계정 연결 대기 정보 저장
   * @param token 임시 토큰
   * @param pendingInfo 대기 중인 소셜 연결 정보
   * @param expiresIn 만료 시간(초)
   */
  async savePendingLinkInfo(token: string, pendingInfo: PendingLinkInfo, expiresIn: number): Promise<void> {
    try {
      const key = `${this.PENDING_LINK_PREFIX}${token}`
      await this.redisService.set(key, JSON.stringify(pendingInfo), expiresIn)
      this.logger.debug(`Pending link info saved for token ${token} with expiration ${expiresIn}s`)
    } catch (error) {
      this.logger.error(
        `Failed to save pending link info: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 소셜 계정 연결 대기 정보 조회
   * @param token 임시 토큰
   * @returns 대기 중인 연결 정보 또는 null
   */
  async getPendingLinkInfo(token: string): Promise<PendingLinkInfo | null> {
    try {
      const key = `${this.PENDING_LINK_PREFIX}${token}`
      const data = await this.redisService.get<string>(key)

      if (!data) {
        return null
      }

      return JSON.parse(data) as PendingLinkInfo
    } catch (error) {
      this.logger.error(
        `Failed to get pending link info: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 소셜 계정 연결 대기 정보 삭제
   * @param token 임시 토큰
   */
  async deletePendingLinkInfo(token: string): Promise<void> {
    try {
      const key = `${this.PENDING_LINK_PREFIX}${token}`
      await this.redisService.delete(key)
      this.logger.debug(`Pending link info deleted: ${key}`)
    } catch (error) {
      this.logger.error(
        `Failed to delete pending link info: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }
}
