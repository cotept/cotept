import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { MailAuditRepositoryPort } from "@/modules/mail/application/ports/out/mail-audit-repository.port"
import { MailAudit } from "@/modules/mail/domain/model/mail-audit"
import { MailAuditEntity } from "../entities/mail-audit.entity"
import { MailAuditPersistenceMapper } from "../mappers/mail-audit-persistence.mapper"

/**
 * TypeORM 기반 메일 감사 리포지토리
 * 데이터베이스를 사용하여 메일 감사 데이터를 영구 저장
 */
@Injectable()
export class TypeOrmMailAuditRepository extends MailAuditRepositoryPort {
  private readonly logger = new Logger(TypeOrmMailAuditRepository.name)

  constructor(
    @InjectRepository(MailAuditEntity)
    private readonly mailAuditRepository: Repository<MailAuditEntity>
  ) {
    super();
  }

  async save(mailAudit: MailAudit): Promise<MailAudit> {
    const entity = MailAuditPersistenceMapper.toEntity(mailAudit)
    const savedEntity = await this.mailAuditRepository.save(entity)
    this.logger.debug(`MailAudit saved with ID: ${savedEntity.id}`)
    return MailAuditPersistenceMapper.toDomain(savedEntity)
  }

  async findById(id: string): Promise<MailAudit | undefined> {
    const entity = await this.mailAuditRepository.findOne({ where: { id } })
    return entity ? MailAuditPersistenceMapper.toDomain(entity) : undefined
  }

  async findByMailId(mailId: string): Promise<MailAudit[]> {
    const entities = await this.mailAuditRepository.find({ where: { mailId } })
    return entities.map(entity => MailAuditPersistenceMapper.toDomain(entity))
  }

  async findByRecipient(recipient: string): Promise<MailAudit[]> {
    // TypeORM에서 simple-array 타입으로 저장된 필드를 검색하는 방법
    // 참고: 실제 DB에 따라 쿼리 방식이 달라질 수 있음
    const entities = await this.mailAuditRepository
      .createQueryBuilder("mailAudit")
      .where("mailAudit.recipients LIKE :recipient", { recipient: `%${recipient}%` })
      .getMany()
    
    // 후처리: 실제로 해당 수신자가 포함된 항목만 필터링
    const filteredEntities = entities.filter(entity => 
      entity.recipients.includes(recipient)
    )
    
    return filteredEntities.map(entity => MailAuditPersistenceMapper.toDomain(entity))
  }

  async findByTemplate(template: string): Promise<MailAudit[]> {
    const entities = await this.mailAuditRepository.find({ where: { template } })
    return entities.map(entity => MailAuditPersistenceMapper.toDomain(entity))
  }
}
