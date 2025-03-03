import { INoSQLClient } from "@/shared/infrastructure/persistence/nosql/client/nosql-client.interface"
import { OCI_NOSQL_CLIENT } from "@/shared/infrastructure/persistence/nosql/client/nosql-client.provider"
import { BaseNoSQLRepository } from "@/shared/infrastructure/persistence/nosql/repositories/base.nosql.repository"
import { Inject, Injectable } from "@nestjs/common"
import { Session, SessionStatus } from "../../domain/entities/session.entity"
import { ISessionRepository } from "../../domain/repositories/session.repository.interface"

/**
 * OCI NoSQL 기반 세션 레포지토리 구현체
 */
@Injectable()
export class SessionRepository extends BaseNoSQLRepository<Session> implements ISessionRepository {
  constructor(@Inject(OCI_NOSQL_CLIENT) client: INoSQLClient) {
    super(client, "mentoring_sessions")
  }

  /**
   * 세션 업데이트
   * 도메인 객체를 직접 받아 업데이트
   */
  async update(session: Session): Promise<Session> {
    await this.saveEntity(session)
    return session
  }

  /**
   * 멘토 ID로 세션 조회
   */
  async findByMentorId(mentorId: string): Promise<Session[]> {
    return this.findAll({ mentorId })
  }

  /**
   * 멘티 ID로 세션 조회
   */
  async findByMenteeId(menteeId: string): Promise<Session[]> {
    return this.findAll({ menteeId })
  }

  /**
   * 세션 상태로 조회
   */
  async findByStatus(status: SessionStatus): Promise<Session[]> {
    return this.findAll({ status })
  }

  /**
   * 날짜 범위로 세션 조회
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Session[]> {
    const startStr = startDate.toISOString()
    const endStr = endDate.toISOString()

    // 날짜 범위 쿼리 작성
    const statement = `
      SELECT * FROM ${this.tableName}
      WHERE scheduled_start_time >= '${startStr}'
      AND scheduled_start_time <= '${endStr}'
    `

    try {
      const result = await this.client.query(statement)
      return result.rows.map((row) => this.mapToEntity(row))
    } catch (error) {
      this.logger.error(`날짜 범위로 세션 조회 실패: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * NoSQL 로우를 세션 엔티티로 변환
   */
  protected mapToEntity(row: Record<string, any>): Session {
    const session = new Session()

    session.id = row.id
    session.mentorId = row.mentor_id
    session.menteeId = row.mentee_id
    session.title = row.title
    session.description = row.description
    session.status = row.status as SessionStatus
    session.scheduledStartTime = new Date(row.scheduled_start_time)
    session.scheduledEndTime = new Date(row.scheduled_end_time)

    if (row.actual_start_time) {
      session.actualStartTime = new Date(row.actual_start_time)
    }

    if (row.actual_end_time) {
      session.actualEndTime = new Date(row.actual_end_time)
    }

    session.recordingUrl = row.recording_url
    session.problemIds = row.problem_ids
    session.tags = row.tags
    session.metadata = row.metadata
    session.createdAt = new Date(row.created_at)
    session.updatedAt = new Date(row.updated_at)

    return session
  }

  /**
   * 세션 엔티티를 NoSQL 로우로 변환
   */
  protected mapToRow(entity: Session): Record<string, any> {
    return {
      id: entity.id,
      mentor_id: entity.mentorId,
      mentee_id: entity.menteeId,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      scheduled_start_time: entity.scheduledStartTime.toISOString(),
      scheduled_end_time: entity.scheduledEndTime.toISOString(),
      actual_start_time: entity.actualStartTime?.toISOString(),
      actual_end_time: entity.actualEndTime?.toISOString(),
      recording_url: entity.recordingUrl,
      problem_ids: entity.problemIds,
      tags: entity.tags,
      metadata: entity.metadata,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
    }
  }
}
