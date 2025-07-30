import { MailStatus } from "@/modules/mail/domain/model/mail-audit"
import { LocaleType, TemplateContextMap, TemplateNames } from "@/modules/mail/domain/types/template.types"
import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

/**
 * 메일 감사 엔티티
 * 메일 발송 감사 정보를 저장하는 TypeORM 엔티티
 */
@Entity("MAIL_AUDITS")
export class MailAuditEntity extends BaseEntity<MailAuditEntity> {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "mail_id", type: "varchar2", nullable: true })
  mailId: string

  @Column({ name: "template", type: "varchar2" })
  template: string

  @Column({ name: "recipients", type: "simple-array" })
  recipients: string[]

  @Column({
    name: "status",
    type: "varchar2",
    enum: MailStatus,
    default: MailStatus.PENDING,
  })
  status: MailStatus

  @Column({ name: "sent_at", type: "timestamp", nullable: true })
  sentAt: Date | null

  @Column({ name: "error", type: "varchar2", nullable: true })
  error?: string

  @Column({ name: "context", type: "clob" })
  context: TemplateContextMap[TemplateNames]

  @Column({ name: "locale", type: "varchar2", default: "ko" })
  locale: LocaleType
}
