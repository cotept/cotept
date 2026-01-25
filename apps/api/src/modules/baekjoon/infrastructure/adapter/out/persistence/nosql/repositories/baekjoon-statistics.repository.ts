import { Inject, Injectable } from "@nestjs/common"

import { NoSQLClient } from "oracle-nosqldb"

import { BaekjoonNosqlMapper } from "../mappers/baekjoon.mapper"
import { BaekjoonTagDocument, BojTag, SaveBojTagParam, UpdateBojTagParam } from "../schemas/baekjoon.schema"

import { BaekjoonStatisticsRepositoryPort } from "@/modules/baekjoon/application/ports/out/baekjoon-statistics-repository.port"
import { OCI_NOSQL_CLIENT } from "@/shared/infrastructure/persistence/nosql/client/nosql-client.provider"
import { BaseNoSQLRepository } from "@/shared/infrastructure/persistence/nosql/repositories/base.nosql.repository"

/**
 * 백준 태그 통계 저장소 - Oracle NoSQL 기반 직접 구현
 */
@Injectable()
export class BaekjoonStatisticsRepository
  extends BaseNoSQLRepository<BaekjoonTagDocument>
  implements BaekjoonStatisticsRepositoryPort
{
  constructor(
    @Inject(OCI_NOSQL_CLIENT) client: NoSQLClient,
    private readonly mapper: BaekjoonNosqlMapper,
  ) {
    super(client, "user_activities")
  }

  // ===== Port Interface 구현 =====

  saveTagStatistics(userId: string, handle: string, tags: BojTag[]): Promise<void> {
    return this.saveApiResponse({ userId, handle, apiResponse: tags })
  }

  findTagStatisticsByUserId(userId: string): Promise<BojTag[] | null> {
    return this.findByUserId(userId)
  }

  findTagStatisticsByHandle(handle: string): Promise<BojTag[] | null> {
    return this.findByHandle(handle)
  }

  updateTagStatistics(userId: string, handle: string, tags: BojTag[]): Promise<void> {
    return this.updateTagData({ userId, handle, apiResponse: tags })
  }

  deleteTagStatistics(userId: string, handle: string): Promise<void> {
    return this.deleteByUserId(userId, handle)
  }

  // ===== NoSQL 직접 구현 메서드들 =====

  /**
   * solved.ac API 응답 저장
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
   */
  async findByHandle(handle: string): Promise<BojTag[] | null> {
    try {
      this.logger.debug(`태그 데이터 조회 시작: handle=${handle}`)

      const statement = `
      SELECT * FROM ${this.tableName} 
      WHERE type = $type AND data.handle = $handle
      ORDER BY timestamp DESC 
      LIMIT 1
    `

      const preparedStatement = await this.nosqlClient.prepare(statement)
      preparedStatement.bindings = {
        $type: "baekjoon_tags",
        $handle: handle,
      }
      const result = await this.query(preparedStatement)

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
   * 사용자 ID로 최신 태그 데이터 조회
   */
  async findByUserId(userId: string): Promise<BojTag[] | null> {
    try {
      this.logger.debug(`태그 데이터 조회 시작: userId=${userId}`)

      const statement = `
      SELECT * FROM ${this.tableName} 
      WHERE type = $type AND data.userId = $userId
      ORDER BY timestamp DESC 
      LIMIT 1
    `

      const preparedStatement = await this.nosqlClient.prepare(statement)
      preparedStatement.bindings = {
        $type: "baekjoon_tags",
        $userId: userId,
      }
      const result = await this.query(preparedStatement)

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
   */
  async deleteByUserId(userId: string, handle: string): Promise<void> {
    try {
      this.logger.debug(`사용자 태그 데이터 삭제: userId=${userId}, handle=${handle}`)

      const statement = `
        DELETE FROM ${this.tableName} 
        WHERE userId = $userId AND type = $type AND data.handle = $handle
      `

      const preparedStatement = await this.nosqlClient.prepare(statement)
      preparedStatement.bindings = {
        $userId: userId,
        $type: "baekjoon_tags",
        $handle: handle,
      }
      await this.query(preparedStatement)

      this.logger.debug(`사용자 태그 데이터 삭제 완료: userId=${userId}, handle=${handle}`)
    } catch (error) {
      this.logger.error(`사용자 태그 데이터 삭제 실패: userId=${userId}, handle=${handle}`, error)
      this.handleDBError(error)
    }
  }

  /**
   * 특정 핸들의 태그 데이터 삭제
   */
  async deleteByHandle(handle: string): Promise<void> {
    try {
      this.logger.debug(`핸들별 태그 데이터 삭제: handle=${handle}`)

      const statement = `
          DELETE FROM ${this.tableName} 
          WHERE type = $type AND data.handle = $handle
        `

      const preparedStatement = await this.nosqlClient.prepare(statement)
      preparedStatement.bindings = {
        $type: "baekjoon_tags",
        $handle: handle,
      }
      await this.query(preparedStatement)

      this.logger.debug(`핸들별 태그 데이터 삭제 완료: handle=${handle}`)
    } catch (error) {
      this.logger.error(`핸들별 태그 데이터 삭제 실패: handle=${handle}`, error)
      this.handleDBError(error)
    }
  }
}
