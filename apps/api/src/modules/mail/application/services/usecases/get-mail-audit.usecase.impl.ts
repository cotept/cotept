import { Injectable } from "@nestjs/common"

import { GetMailAuditUseCase } from "@/modules/mail/application/ports/in/get-mail-audit.usecase"
import { MailAuditRepositoryPort } from "@/modules/mail/application/ports/out/mail-audit-repository.port"
import { MailAudit } from "@/modules/mail/domain/model/mail-audit"

@Injectable()
export class GetMailAuditUseCaseImpl extends GetMailAuditUseCase {
  constructor(private readonly mailAuditRepository: MailAuditRepositoryPort) {
    super()
  }

  async getById(id: string): Promise<MailAudit | undefined> {
    return this.mailAuditRepository.findById(id)
  }

  async getByMailId(mailId: string): Promise<MailAudit[]> {
    return this.mailAuditRepository.findByMailId(mailId)
  }

  async getByRecipient(recipient: string): Promise<MailAudit[]> {
    return this.mailAuditRepository.findByRecipient(recipient)
  }

  async getByTemplate(template: string): Promise<MailAudit[]> {
    return this.mailAuditRepository.findByTemplate(template)
  }
}
