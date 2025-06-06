import { Injectable } from "@nestjs/common"
import { BaekjoonTagNosqlRepository } from "./repositories/baekjoon-nosql.repository"
import { BojTag } from "./schemas/baekjoon.schema"

/**
 * 백준 태그 캐시 어댑터 - 매우 간단한 구현
 */
@Injectable()
export class BaekjoonTagNosqlAdapter {
  constructor(private readonly repository: BaekjoonTagNosqlRepository) {}

  /**
   * 캐시된 태그 데이터 조회 (solved.ac API 응답 그대로)
   */
  async getTagData(handle: string): Promise<BojTag[] | null> {
    return await this.repository.findByHandle(handle)
  }

  /**
   * solved.ac API 응답 캐시 저장
   */
  async cacheTagData(userId: string, handle: string, apiResponse: BojTag[], responseTime?: number): Promise<void> {
    await this.repository.saveApiResponse(userId, handle, apiResponse, responseTime)
  }

  /**
   * 캐시 유효성 확인
   */
  async isCacheValid(handle: string, maxAgeHours: number = 24): Promise<boolean> {
    return await this.repository.isCacheValid(handle, maxAgeHours)
  }

  /**
   * 캐시 무효화
   */
  async invalidateCache(handle: string): Promise<void> {
    await this.repository.invalidateCache(handle)
  }
}
