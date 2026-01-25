import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { EntityManager, Repository } from "typeorm"

import { AuthVerificationRepositoryPort } from "@/modules/auth/application/ports/out/auth-verification-repository.port"
import { AuthType, AuthVerification } from "@/modules/auth/domain/model/auth-verification"
import { AuthVerificationEntity } from "@/modules/auth/infrastructure/adapter/out/persistence/entities/auth-verification.entity"
import { AuthVerificationPersistenceMapper } from "@/modules/auth/infrastructure/adapter/out/persistence/mappers/auth-verification-persistence.mapper"
import { BaseRepository } from "@/shared/infrastructure/persistence/typeorm/repositories/base/base.repository"
import { convertJwtUserIdToNumber } from "@/shared/utils/auth-type-converter.util"

/**
 * TypeORM을 사용한 인증 검증 레포지토리 구현
 */
@Injectable()
export class TypeOrmAuthVerificationRepository
  extends BaseRepository<AuthVerificationEntity>
  implements AuthVerificationRepositoryPort
{
  constructor(
    @InjectRepository(AuthVerificationEntity)
    authVerificationRepository: Repository<AuthVerificationEntity>,
    entityManager: EntityManager,
    private readonly authVerificationMapper: AuthVerificationPersistenceMapper,
  ) {
    super(authVerificationRepository, entityManager, "AuthVerification")
  }

  /**
   * 인증 검증 저장
   * @param verification 인증 검증 도메인 엔티티
   * @returns 저장된 인증 검증 도메인 엔티티
   */
  async save(verification: AuthVerification): Promise<AuthVerification> {
    const entity = this.authVerificationMapper.toEntity(verification)
    const savedEntity = await this.create(entity)
    return this.authVerificationMapper.toDomain(savedEntity)
  }

  /**
   * IDX로 인증 검증 찾기
   * @param userId 인증 검증 ID (JWT string)
   * @returns 인증 검증 도메인 엔티티 또는 null
   */
  async findById(userId: string): Promise<AuthVerification | null> {
    try {
      const numericUserId = convertJwtUserIdToNumber(userId, "AuthVerification findById")
      const entity = await this.findOne({ userId: numericUserId })
      return this.authVerificationMapper.toDomain(entity)
    } catch {
      return null
    }
  }

  /**
   * 인증 유형과 대상으로 가장 최근 인증 검증 찾기
   * @param authType 인증 유형
   * @param target 인증 대상(이메일, 전화번호 등)
   * @returns 인증 검증 도메인 엔티티 또는 null
   */
  async findLatestByTypeAndTarget(authType: AuthType, target: string): Promise<AuthVerification | null> {
    const entity = await this.entityRepository.findOne({
      where: { authType, target },
      order: { createdAt: "DESC" },
    })
    if (!entity) return null
    return this.authVerificationMapper.toDomain(entity)
  }

  /**
   * 사용자 ID로 인증 검증 목록 찾기
   * @param userId 사용자 ID (JWT string)
   * @returns 인증 검증 도메인 엔티티 목록
   */
  async findAllByUserId(userId: string): Promise<AuthVerification[]> {
    const numericUserId = convertJwtUserIdToNumber(userId, "AuthVerification findAllByUserId")
    const entities = await this.entityRepository.find({
      where: { userId: numericUserId },
      order: { createdAt: "DESC" },
    })
    return this.authVerificationMapper.toDomainList(entities)
  }
}
