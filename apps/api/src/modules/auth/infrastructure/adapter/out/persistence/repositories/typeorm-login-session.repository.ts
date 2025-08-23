import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { EntityManager, IsNull, LessThan, Repository } from "typeorm"

import { LoginSessionRepositoryPort } from "@/modules/auth/application/ports/out/login-session-repository.port"
import { LoginSession } from "@/modules/auth/domain/model/login-session"
import { SessionLogEntity } from "@/modules/auth/infrastructure/adapter/out/persistence/entities/session-log.entity"
import { LoginSessionPersistenceMapper } from "@/modules/auth/infrastructure/adapter/out/persistence/mappers/login-session-persistence.mapper"
import { BaseRepository } from "@/shared/infrastructure/persistence/typeorm/repositories/base/base.repository"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * TypeORM을 사용한 로그인 세션 레포지토리 구현
 */
@Injectable()
export class TypeOrmLoginSessionRepository
  extends BaseRepository<SessionLogEntity>
  implements LoginSessionRepositoryPort
{
  constructor(
    @InjectRepository(SessionLogEntity)
    sessionLogRepository: Repository<SessionLogEntity>,
    entityManager: EntityManager,
    private readonly loginSessionMapper: LoginSessionPersistenceMapper,
  ) {
    super(sessionLogRepository, entityManager, "LoginSession")
  }

  /**
   * 로그인 세션 저장
   * @param session 로그인 세션 도메인 엔티티
   * @returns 저장된 로그인 세션 도메인 엔티티
   */
  async save(session: LoginSession): Promise<LoginSession> {
    const entity = this.loginSessionMapper.toEntity(session)
    const savedEntity = await this.create(entity)
    return this.loginSessionMapper.toDomain(savedEntity)
  }

  /**
   * ID로 로그인 세션 찾기
   * @param idx 세션 ID
   * @returns 로그인 세션 도메인 엔티티 또는 null
   */
  async findById(idx: string): Promise<LoginSession | null> {
    try {
      const entity = await this.findOne({ idx })
      return this.loginSessionMapper.toDomain(entity)
    } catch {
      return null
    }
  }

  /**
   * 토큰으로 세션 찾기
   * @param token 토큰 문자열
   * @returns 로그인 세션 도메인 엔티티 또는 null
   */
  async findByToken(token: string): Promise<LoginSession | null> {
    try {
      const entity = await this.findOne({ token })
      return this.loginSessionMapper.toDomain(entity)
    } catch {
      return null
    }
  }

  /**
   * 사용자의 모든 활성 세션 찾기
   * @param userId 사용자 ID
   * @returns 활성 세션 목록
   */
  async findActiveSessionsByUserId(userId: string): Promise<LoginSession[]> {
    const now = new Date()

    const entities = await this.entityRepository.find({
      where: {
        userId,
        endedAt: IsNull(),
        expiresAt: LessThan(now),
      },
      order: { createdAt: "DESC" },
    })

    return this.loginSessionMapper.toDomainList(entities)
  }

  /**
   * 사용자의 모든 세션 찾기
   * @param userId 사용자 ID
   * @returns 전체 세션 목록
   */
  async findAllByUserId(userId: string): Promise<LoginSession[]> {
    const entities = await this.findAll({ userId })
    return this.loginSessionMapper.toDomainList(entities)
  }

  /**
   * 사용자의 모든 활성 세션 종료
   * @param userId 사용자 ID
   * @returns 성공 여부
   */
  async terminateAllUserSessions(userId: string): Promise<boolean> {
    try {
      const now = new Date()

      // 사용자의 모든 활성 세션 찾기
      const activeSessionEntities = await this.entityRepository.find({
        where: {
          userId,
          endedAt: IsNull(),
          expiresAt: LessThan(now),
        },
      })

      if (activeSessionEntities.length === 0) {
        // 활성 세션이 없는 경우 성공으로 처리
        return true
      }

      // 모든 활성 세션을 종료 처리
      const updatePromises = activeSessionEntities.map((session) => {
        session.endedAt = new Date()
        session.endReason = "PASSWORD_CHANGED"
        return this.entityRepository.save(session)
      })

      await Promise.all(updatePromises)

      this.logger.log(`${userId} 사용자의 세션 ${updatePromises.length}개가 종료되었습니다. (사유: 비밀번호 변경)`)

      return true
    } catch (error) {
      this.logger.error(
        `세션 종료 중 오류 발생:  ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      return false
    }
  }
}
