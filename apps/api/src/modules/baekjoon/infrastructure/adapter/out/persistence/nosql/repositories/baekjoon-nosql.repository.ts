import { OCI_NOSQL_CLIENT } from "@/shared/infrastructure/persistence/nosql/client/nosql-client.provider"
import { BaseNoSQLRepository } from "@/shared/infrastructure/persistence/nosql/repositories/base.nosql.repository"
import { Inject, Injectable } from "@nestjs/common"
import { NoSQLClient } from "oracle-nosqldb"
import { BaekjoonNosqlMapper } from "../mappers/baekjoon.mapper"
import { BaekjoonTagDocument, BojTag, SaveBojTagParam, UpdateBojTagParam } from "../schemas/baekjoon.schema"

/**
 * 백준 태그 캐시 레포지토리 - Oracle NoSQL 기반 구현
 */
@Injectable()
export class BaekjoonTagNosqlRepository extends BaseNoSQLRepository<BaekjoonTagDocument> {
  constructor(
    @Inject(OCI_NOSQL_CLIENT) client: NoSQLClient,
    private readonly mapper: BaekjoonNosqlMapper,
  ) {
    super(client, "user_activities")
  }

  /**
   * solved.ac API 응답 저장
   *
   * @param userId - 사용자 ID
   * @param handle - solved.ac 핸들
   * @param apiResponse - API 응답 데이터
   */
  async saveApiResponse({ userId, handle, apiResponse }: SaveBojTagParam): Promise<void> {
    try {
      this.logger.debug(`태그 데이터 저장: userId=${userId}, handle=${handle}, 태그수=${apiResponse.length}`)

      const document = this.mapper.fromApiResponse(userId, handle, apiResponse)
      await this.create(document)

      this.logger.debug(`태그 데이터 저장 완료: userId=${userId}, handle=${handle}`)
    } catch (error) {
      this.logger.error(`태그 데이터 저장 실패: userId=${userId}, handle=${handle}`, error)
      this.handleDBError(error)
    }
  }

  /**
   * 핸들로 최신 태그 데이터 조회
   *
   * @param handle - solved.ac 핸들
   * @returns 태그 배열 또는 null (데이터가 없는 경우)
   */
  async findByHandle(handle: string): Promise<BojTag[] | null> {
    try {
      this.logger.debug(`태그 데이터 조회 시작: handle=${handle}`)

      // NoSQL 쿼리 - 가장 최신 데이터 1건 조회
      const query = `
      SELECT * FROM baekjoon_tags 
      WHERE type = "bog_tags" AND data.handle = ${handle}
      ORDER BY timestamp DESC 
      LIMIT 1
    `

      const result = await this.query(query)

      if (!result.rows || result.rows.length === 0) {
        this.logger.debug(`태그 데이터 없음: handle=${handle}`)
        return null
      }

      const document = result.rows[0] as BaekjoonTagDocument
      const tags = this.mapper.toDomain(document)

      this.logger.debug(`태그 데이터 조회 완료: handle=${handle}, 태그수=${tags.length}`)
      return tags
    } catch (error) {
      this.logger.error(`태그 데이터 조회 실패: handle=${handle}`, error)
      this.handleDBError(error)
    }
  }

  /**
   * 핸들로 최신 태그 데이터 조회
   *
   * @param userId - solved.ac 핸들
   * @returns 태그 배열 또는 null (데이터가 없는 경우)
   */
  async findByUserId(userId: string): Promise<BojTag[] | null> {
    try {
      this.logger.debug(`태그 데이터 조회 시작: userId=${userId}`)

      // NoSQL 쿼리 - 가장 최신 데이터 1건 조회
      const query = `
      SELECT * FROM baekjoon_tags 
      WHERE type = "bog_tags" AND data.userId = ${userId}
      ORDER BY timestamp DESC 
      LIMIT 1
    `

      const result = await this.query(query)

      if (!result.rows || result.rows.length === 0) {
        this.logger.debug(`태그 데이터 없음: userId=${userId}`)
        return null
      }

      const document = result.rows[0] as BaekjoonTagDocument
      const tags = this.mapper.toDomain(document)

      this.logger.debug(`태그 데이터 조회 완료: userId=${userId}, 태그수=${tags.length}`)
      return tags
    } catch (error) {
      this.logger.error(`태그 데이터 조회 실패: userId=${userId}`, error)
      this.handleDBError(error)
    }
  }

  /**
   * 태그 데이터 업데이트
   * 새로운 API 응답으로 기존 데이터를 업데이트합니다.
   *
   * @param userId - 사용자 ID
   * @param handle - solved.ac 핸들
   * @param apiResponse - 새로운 API 응답 데이터
   */
  async updateTagData({ userId, handle, apiResponse }: UpdateBojTagParam): Promise<void> {
    try {
      this.logger.debug(`태그 데이터 업데이트: userId=${userId}, handle=${handle}`)

      const document = this.mapper.fromApiResponse(userId, handle, apiResponse)
      await this.create(document)

      this.logger.debug(`태그 데이터 업데이트 완료: userId=${userId}, handle=${handle}`)
    } catch (error) {
      this.logger.error(`태그 데이터 업데이트 실패: userId=${userId}, handle=${handle}`, error)
      this.handleDBError(error)
    }
  }

  /**
   * 사용자별 태그 데이터 삭제
   *
   * @param userId - 사용자 ID
   */
  async deleteByUserId(userId: string): Promise<void> {
    try {
      this.logger.debug(`사용자 태그 데이터 삭제: userId=${userId}`)

      const deleteQuery = `
        DELETE FROM user_activities 
        WHERE userId = ${userId} AND type = "bog_tags"
      `

      await this.query(deleteQuery)

      this.logger.debug(`사용자 태그 데이터 삭제 완료: userId=${userId}`)
    } catch (error) {
      this.logger.error(`사용자 태그 데이터 삭제 실패: userId=${userId}`, error)
      this.handleDBError(error)
    }
  }

  /**
   * 특정 핸들의 태그 데이터 삭제
   *
   * @param handle - solved.ac 핸들
   */
  async deleteByHandle(handle: string): Promise<void> {
    try {
      this.logger.debug(`핸들별 태그 데이터 삭제: handle=${handle}`)

      const deleteQuery = `
          DELETE FROM user_activities 
          WHERE type = "bog_tags" AND data.handle = ${handle}
        `

      await this.query(deleteQuery)

      this.logger.debug(`핸들별 태그 데이터 삭제 완료: handle=${handle}`)
    } catch (error) {
      this.logger.error(`핸들별 태그 데이터 삭제 실패: handle=${handle}`, error)
      this.handleDBError(error)
    }
  }
}
