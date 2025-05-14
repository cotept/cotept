import { MailAudit } from "@/modules/mail/domain/model/mail-audit"
import { TemplateContextMap, TemplateNames } from "@/modules/mail/domain/types/template.types"
import { MailAuditEntity } from "../entities/mail-audit.entity"

/**
 * 메일 감사 영속성 매퍼
 * 도메인 모델과 엔티티 간의 변환을 담당
 */
export class MailAuditPersistenceMapper {
  /**
   * 도메인 모델을 엔티티로 변환
   */
  static toEntity(domainModel: MailAudit): MailAuditEntity {
    const entity = new MailAuditEntity()
    const data = domainModel.toData()

    entity.id = data.id
    entity.mailId = data.mailId
    entity.template = data.template
    entity.recipients = data.recipients
    entity.status = data.status
    entity.sentAt = data.sentAt
    entity.error = data.error
    entity.context = data.context as TemplateContextMap[TemplateNames]
    entity.locale = data.locale

    // createdAt은 엔티티에서 자동 생성되므로 설정하지 않음

    return entity
  }

  /**
   * 엔티티를 도메인 모델로 변환
   */
  static toDomain(entity: MailAuditEntity): MailAudit {
    return MailAudit.create(
      entity.id,
      entity.mailId,
      entity.template as any,
      entity.recipients,
      entity.status,
      entity.context,
      entity.locale,
      entity.sentAt,
      entity.error,
    )
  }
}
