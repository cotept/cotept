import { OCI_NOSQL_CLIENT } from "@/shared/infrastructure/persistence/nosql/client/nosql-client.provider"
import { BaseNoSQLRepository } from "@/shared/infrastructure/persistence/nosql/repositories/base.nosql.repository"
import { Inject, Injectable } from "@nestjs/common"
import { NoSQLClient } from "oracle-nosqldb"
import { BaekjoonNosqlMapper } from "../mappers/baekjoon.mapper"
import { BaekjoonTagCacheDocument, BojTag } from "../schemas/baekjoon.schema"

/**
 * 백준 태그 캐시 레포지토리 - Oracle NoSQL 기반 구현
 */
@Injectable()
export class BaekjoonTagNosqlRepository extends BaseNoSQLRepository<BaekjoonTagCacheDocument> {
  constructor(
    @Inject(OCI_NOSQL_CLIENT) client: NoSQLClient,
    private readonly mapper: BaekjoonNosqlMapper,
  ) {
    super(client, "user_activities")
  }

  /**
   * 핸들로 태그 데이터 조회
   */
  async findByHandle(handle: string): Promise<BojTag[] | null> {
    try {
      const query = `SELECT * FROM user_activities WHERE type = "tag_cache" AND data.handle = "${handle}" ORDER BY timestamp DESC LIMIT 1`
      const result = await this.query(query)

      if (!result.rows || result.rows.length === 0) {
        return null
      }

      return this.mapper.toDomain(result.rows[0] as BaekjoonTagCacheDocument)
    } catch (error) {
      this.handleDBError(error)
    }
  }

  /**
   * solved.ac API 응답 저장
   */
  async saveApiResponse(userId: string, handle: string, apiResponse: BojTag[], responseTime?: number): Promise<void> {
    try {
      const document = this.mapper.fromApiResponse(userId, handle, apiResponse, responseTime)
      await this.create(document)
    } catch (error) {
      this.handleDBError(error)
    }
  }

  /**
   * 캐시 유효성 확인 (24시간 기준)
   */
  async isCacheValid(handle: string, maxAgeHours: number = 24): Promise<boolean> {
    try {
      const query = `SELECT timestamp FROM user_activities WHERE type = "tag_cache" AND data.handle = "${handle}" ORDER BY timestamp DESC LIMIT 1`
      const result = await this.query(query)

      if (!result.rows || result.rows.length === 0) {
        return false
      }

      const cacheTime = new Date(result.rows[0].timestamp).getTime()
      const now = Date.now()
      const maxAge = maxAgeHours * 60 * 60 * 1000

      return now - cacheTime < maxAge
    } catch (error) {
      this.handleDBError(error)
    }
  }

  /**
   * 캐시 무효화
   */
  async invalidateCache(handle: string): Promise<void> {
    try {
      const query = `SELECT userId FROM user_activities WHERE type = "tag_cache" AND data.handle = "${handle}"`
      const result = await this.query(query)

      if (!result.rows) return

      for (const row of result.rows) {
        await this.delete(this.getKeyObject(row.userId))
      }
    } catch (error) {
      this.handleDBError(error)
    }
  }

  protected getKeyObject(userId: string): Record<string, any> {
    return { userId, type: "tag_cache" }
  }
}
