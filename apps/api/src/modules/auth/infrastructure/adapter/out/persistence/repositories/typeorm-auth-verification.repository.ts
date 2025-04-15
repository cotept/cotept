import { AuthVerificationRepositoryPort } from "@/modules/auth/application/ports/out/auth-verification-repository.port"
import { AuthType, AuthVerification } from "@/modules/auth/domain/model/auth-verification"
import { AuthVerificationEntity } from "@/modules/auth/infrastructure/adapter/out/persistence/entities/auth-verification.entity"
import { AuthVerificationPersistenceMapper } from "@/modules/auth/infrastructure/adapter/out/persistence/mappers/auth-verification-persistence.mapper"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

/**
 * TypeORM을 사용한 인증 검증 레포지토리 구현
 */
@Injectable()
export class TypeOrmAuthVerificationRepository implements AuthVerificationRepositoryPort {
  constructor(
    @InjectRepository(AuthVerificationEntity)
    private readonly authVerificationRepository: Repository<AuthVerificationEntity>,
    private readonly authVerificationMapper: AuthVerificationPersistenceMapper,
  ) {}

  /**
   * 인증 검증 저장
   * @param verification 인증 검증 도메인 엔티티
   * @returns 저장된 인증 검증 도메인 엔티티
   */
  async save(verification: AuthVerification): Promise<AuthVerification> {
    const entity = this.authVerificationMapper.toEntity(verification)
    const savedEntity = await this.authVerificationRepository.save(entity)
    return this.authVerificationMapper.toDomain(savedEntity)
  }

  /**
   * ID로 인증 검증 찾기
   * @param id 인증 검증 ID
   * @returns 인증 검증 도메인 엔티티 또는 null
   */
  async findById(id: string): Promise<AuthVerification | null> {
    const entity = await this.authVerificationRepository.findOne({ where: { id } })
    if (!entity) return null
    return this.authVerificationMapper.toDomain(entity)
  }

  /**
   * 인증 유형과 대상으로 가장 최근 인증 검증 찾기
   * @param authType 인증 유형
   * @param target 인증 대상(이메일, 전화번호 등)
   * @returns 인증 검증 도메인 엔티티 또는 null
   */
  async findLatestByTypeAndTarget(authType: AuthType, target: string): Promise<AuthVerification | null> {
    const entity = await this.authVerificationRepository.findOne({
      where: { authType, target },
      order: { createdAt: "DESC" },
    })
    if (!entity) return null
    return this.authVerificationMapper.toDomain(entity)
  }

  /**
   * 사용자 ID로 인증 검증 목록 찾기
   * @param userId 사용자 ID
   * @returns 인증 검증 도메인 엔티티 목록
   */
  async findAllByUserId(userId: string): Promise<AuthVerification[]> {
    const entities = await this.authVerificationRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    })
    return this.authVerificationMapper.toDomainList(entities)
  }
}
