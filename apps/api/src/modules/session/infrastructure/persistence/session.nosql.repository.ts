import { INoSQLClient } from "@/shared/infrastructure/persistence/nosql/client/nosql-client.interface"
import { OCI_NOSQL_CLIENT } from "@/shared/infrastructure/persistence/nosql/client/nosql-client.provider"
import { SessionMapper } from "@/shared/infrastructure/persistence/nosql/mappers/session.mapper"
import { BaseNoSQLRepository } from "@/shared/infrastructure/persistence/nosql/repositories/base.nosql.repository"
import { SessionMetadataDocument } from "@/shared/infrastructure/persistence/nosql/schemas/session.schema"
import { Inject, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

/**
 * NoSQL 세션 레포지토리 구현체
 *
 * @description
 * 실제 엔티티 타입은 프로젝트의 도메인 모델에 따라 변경해야 합니다.
 * 여기서는 예시로 `any` 타입을 사용합니다.
 */
@Injectable()
export class SessionNoSQLRepository extends BaseNoSQLRepository<any, SessionMetadataDocument, SessionMapper> {
  constructor(@Inject(OCI_NOSQL_CLIENT) client: INoSQLClient, configService: ConfigService, mapper: SessionMapper) {
    // 테이블 이름은 설정에서 가져옴
    const tableName = configService.get<string>(
      "nosql.tables.realtimeCommunication",
      "cotept_dev_realtime_communication",
    )
    super(client, configService, mapper, tableName)
  }

  /**
   * 세션 ID로 문서 조회 (오버라이드)
   */
  protected override async getDocumentById(sessionId: string): Promise<SessionMetadataDocument | null> {
    const result = await this.client.get(this.tableName, {
      sessionId,
      type: "metadata",
    })

    return result?.row ? (result.row as SessionMetadataDocument) : null
  }

  /**
   * 현재 활성 상태인 세션 목록 조회
   */
  async findActiveSessions(): Promise<any[]> {
    const query = `SELECT * FROM ${this.tableName} t 
                   WHERE t.type = 'metadata' 
                   AND t.data.status = 'active'`

    try {
      const result = await this.client.query(query)

      if (!result || !result.rows || result.rows.length === 0) {
        return []
      }

      // 각 세션에 대한 상세 정보 조회
      const sessions = await Promise.all(result.rows.map((row) => this.findById(row.sessionId)))

      // null 값 필터링
      return sessions.filter((session): session is any => session !== null)
    } catch (error) {
      this.logger.error("Error finding active sessions:", error)
      throw error
    }
  }

  /**
   * 특정 사용자의 모든 세션 조회
   */
  async findByUserId(userId: string, role?: "mentor" | "mentee"): Promise<any[]> {
    let query = `SELECT * FROM ${this.tableName} t WHERE t.type = 'metadata'`

    if (role === "mentor") {
      query += ` AND t.data.mentorId = '${userId}'`
    } else if (role === "mentee") {
      query += ` AND t.data.menteeId = '${userId}'`
    } else {
      query += ` AND (t.data.mentorId = '${userId}' OR t.data.menteeId = '${userId}')`
    }

    try {
      const result = await this.client.query(query)

      if (!result || !result.rows || result.rows.length === 0) {
        return []
      }

      // 각 세션에 대한 상세 정보 조회
      const sessions = await Promise.all(result.rows.map((row) => this.findById(row.sessionId)))

      // null 값 필터링
      return sessions.filter((session): session is any => session !== null)
    } catch (error) {
      this.logger.error(`Error finding sessions for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * WebRTC 상태 업데이트
   */
  async updateWebRTCState(sessionId: string, webrtcState: any): Promise<void> {
    try {
      const session = await this.findById(sessionId)

      if (!session) {
        throw new Error(`Session not found: ${sessionId}`)
      }

      // WebRTC 상태 업데이트
      session.webrtcState = webrtcState

      // WebRTC 문서 변환 및 저장
      const webrtcDocument = this.mapper.toWebRTCDocument(session)

      if (webrtcDocument) {
        await this.client.put(this.tableName, webrtcDocument)
      }
    } catch (error) {
      this.logger.error(`Error updating WebRTC state for session ${sessionId}:`, error)
      throw error
    }
  }

  /**
   * 에디터 상태 업데이트
   */
  async updateEditorState(sessionId: string, editorState: any): Promise<void> {
    try {
      const session = await this.findById(sessionId)

      if (!session) {
        throw new Error(`Session not found: ${sessionId}`)
      }

      // 에디터 상태 업데이트
      session.editorState = editorState

      // 에디터 문서 변환 및 저장
      const editorDocument = this.mapper.toEditorDocument(session)

      if (editorDocument) {
        await this.client.put(this.tableName, editorDocument)
      }
    } catch (error) {
      this.logger.error(`Error updating editor state for session ${sessionId}:`, error)
      throw error
    }
  }

  /**
   * WebRTC 통계 저장
   */
  async saveWebRTCStats(sessionId: string, stats: Record<string, any>): Promise<void> {
    try {
      const statsDocument = this.mapper.toWebRTCStatsDocument(sessionId, stats)
      await this.client.put(this.tableName, statsDocument)
    } catch (error) {
      this.logger.error(`Error saving WebRTC stats for session ${sessionId}:`, error)
      throw error
    }
  }

  /**
   * 세션 삭제 (오버라이드)
   */
  protected override async deleteEntity(sessionId: string): Promise<boolean> {
    try {
      // 세션 관련 모든 레코드 조회
      const query = `SELECT * FROM ${this.tableName} t WHERE t.sessionId = '${sessionId}'`
      const result = await this.client.query(query)

      if (!result || !result.rows || result.rows.length === 0) {
        return false
      }

      // 모든 레코드 삭제
      await Promise.all(
        result.rows.map((row) =>
          this.client.delete(this.tableName, {
            sessionId: row.sessionId,
            type: row.type,
          }),
        ),
      )

      return true
    } catch (error) {
      this.logger.error(`Error deleting session ${sessionId}:`, error)
      throw error
    }
  }
}
