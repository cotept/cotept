import { LoginSessionRepositoryPort } from "@/modules/auth/application/ports/out/login-session-repository.port"
import { LoginSession } from "@/modules/auth/domain/model/login-session"
import { SessionLogEntity } from "@/modules/auth/infrastructure/adapter/out/persistence/entities/session-log.entity"
import { LoginSessionPersistenceMapper } from "@/modules/auth/infrastructure/adapter/out/persistence/mappers/login-session-persistence.mapper"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { IsNull, LessThan, Repository } from "typeorm"

/**
 * TypeORM을 사용한 로그인 세션 레포지토리 구현
 */
@Injectable()
export class TypeOrmLoginSessionRepository implements LoginSessionRepositoryPort {
  constructor(
    @InjectRepository(SessionLogEntity)
    private readonly sessionLogRepository: Repository<SessionLogEntity>,
    private readonly loginSessionMapper: LoginSessionPersistenceMapper,
  ) {}

  /**
   * 로그인 세션 저장
   * @param session 로그인 세션 도메인 엔티티
   * @returns 저장된 로그인 세션 도메인 엔티티
   */
  async save(session: LoginSession): Promise<LoginSession> {
    const entity = this.loginSessionMapper.toEntity(session)
    const savedEntity = await this.sessionLogRepository.save(entity)
    return this.loginSessionMapper.toDomain(savedEntity)
  }

  /**
   * ID로 로그인 세션 찾기
   * @param id 세션 ID
   * @returns 로그인 세션 도메인 엔티티 또는 null
   */
  async findById(id: string): Promise<LoginSession | null> {
    const entity = await this.sessionLogRepository.findOne({ where: { id } })
    if (!entity) return null
    return this.loginSessionMapper.toDomain(entity)
  }

  /**
   * 토큰으로 세션 찾기
   * @param token 토큰 문자열
   * @returns 로그인 세션 도메인 엔티티 또는 null
   */
  async findByToken(token: string): Promise<LoginSession | null> {
    const entity = await this.sessionLogRepository.findOne({ where: { token } })
    if (!entity) return null
    return this.loginSessionMapper.toDomain(entity)
  }
  /**
   * 사용자의 모든 활성 세션 찾기
   * @param userId 사용자 ID
   * @returns 활성 세션 목록
   */
  async findActiveSessionsByUserId(userId: string): Promise<LoginSession[]> {
    const now = new Date()

    const entities = await this.sessionLogRepository.find({
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
    const entities = await this.sessionLogRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    })

    return this.loginSessionMapper.toDomainList(entities)
  }
}
