import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { EntityManager, Repository } from "typeorm"

import { MailAuditEntity } from "../entities/mail-audit.entity"
import { MailAuditPersistenceMapper } from "../mappers/mail-audit-persistence.mapper"

import { MailAuditRepositoryPort } from "@/modules/mail/application/ports/out/mail-audit-repository.port"
import { MailAudit } from "@/modules/mail/domain/model/mail-audit"
import { BaseRepository } from "@/shared/infrastructure/persistence/typeorm/repositories/base/base.repository"

/**
 * TypeORM 기반 메일 감사 리포지토리
 * 데이터베이스를 사용하여 메일 감사 데이터를 영구 저장
 */
@Injectable()
export class TypeOrmMailAuditRepository extends BaseRepository<MailAuditEntity> implements MailAuditRepositoryPort {
  constructor(
    @InjectRepository(MailAuditEntity)
    mailAuditRepository: Repository<MailAuditEntity>,
    entityManager: EntityManager,
    private readonly mailAuditMapper: MailAuditPersistenceMapper,
  ) {
    super(mailAuditRepository, entityManager, "MailAudit")
  }

  async save(mailAudit: MailAudit): Promise<MailAudit> {
    const entity = this.mailAuditMapper.toEntity(mailAudit)
    const savedEntity = await this.create(entity)
    return this.mailAuditMapper.toDomain(savedEntity)
  }

  async findByIdx(idx: number): Promise<MailAudit | undefined> {
    try {
      const entity = await this.findOne({ idx })
      return this.mailAuditMapper.toDomain(entity)
    } catch {
      return undefined
    }
  }

  async findByMailId(mailId: string): Promise<MailAudit[]> {
    const entities = await this.findAll({ mailId })
    return entities.map((entity) => this.mailAuditMapper.toDomain(entity))
  }

  async findByRecipient(recipient: string): Promise<MailAudit[]> {
    // TypeORM에서 simple-array 타입으로 저장된 필드를 검색하는 방법
    // 참고: 실제 DB에 따라 쿼리 방식이 달라질 수 있음
    const entities = await this.entityRepository
      .createQueryBuilder("mailAudit")
      .where("mailAudit.recipients LIKE :recipient", { recipient: `%${recipient}%` })
      .getMany()

    // 후처리: 실제로 해당 수신자가 포함된 항목만 필터링
    const filteredEntities = entities.filter((entity) => entity.recipients.includes(recipient))

    return filteredEntities.map((entity) => this.mailAuditMapper.toDomain(entity))
  }

  async findByTemplate(template: string): Promise<MailAudit[]> {
    const entities = await this.findAll({ template })
    return entities.map((entity) => this.mailAuditMapper.toDomain(entity))
  }
}
