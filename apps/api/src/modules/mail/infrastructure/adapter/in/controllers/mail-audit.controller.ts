import { Controller, Get, Logger, Param, Query } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { GetMailAuditUseCase } from "@/modules/mail/application/ports/in/get-mail-audit.usecase"

@ApiTags("메일 감사")
@Controller("mail-audit")
export class MailAuditController {
  private readonly logger = new Logger(MailAuditController.name)

  constructor(private readonly getMailAuditUseCase: GetMailAuditUseCase) {}

  @Get(":id")
  @ApiOperation({ summary: "메일 감사 조회 (ID)" })
  async getMailAuditById(@Param("id") id: string) {
    this.logger.log(`Querying mail audit by ID: ${id}`)
    const mailAudit = await this.getMailAuditUseCase.getById(id)
    return mailAudit ? mailAudit.toData() : null
  }

  @Get()
  @ApiOperation({ summary: "메일 감사 조회 (검색)" })
  async searchMailAudit(
    @Query("mailId") mailId?: string,
    @Query("recipient") recipient?: string,
    @Query("template") template?: string,
  ) {
    this.logger.log(`Searching mail audits with filters: ${JSON.stringify({ mailId, recipient, template })}`)
    
    if (mailId) {
      const audits = await this.getMailAuditUseCase.getByMailId(mailId)
      return audits.map(audit => audit.toData())
    }
    
    if (recipient) {
      const audits = await this.getMailAuditUseCase.getByRecipient(recipient)
      return audits.map(audit => audit.toData())
    }
    
    if (template) {
      const audits = await this.getMailAuditUseCase.getByTemplate(template)
      return audits.map(audit => audit.toData())
    }
    
    return []
  }
}
