import { Controller, Get, Logger, Param, Query, UseGuards } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

import { JwtAuthGuard } from "@/modules/auth/infrastructure/common/guards/jwt-auth.guards"
import { MailAuditFacadeService } from "@/modules/mail/application/services/facade/mail-audit-facade.service"
import { GetMailAuditByIdRequestDto, GetMailAuditRequestDto } from "@/modules/mail/infrastructure/dtos/request"
import { MailAuditResponseDto } from "@/modules/mail/infrastructure/dtos/response"
import { ApiOkResponseWrapper } from "@/shared/infrastructure/decorators/api-response.decorator"

@ApiTags("메일 감사")
@Controller("mail-audit")
export class MailAuditController {
  private readonly logger = new Logger(MailAuditController.name)

  constructor(private readonly mailAuditFacadeService: MailAuditFacadeService) {}

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "메일 감사 조회 (ID)" })
  @ApiOkResponseWrapper(MailAuditResponseDto, "메일 감사 조회 성공")
  async getMailAuditById(@Param("id") id: string): Promise<MailAuditResponseDto | null> {
    this.logger.log(`Querying mail audit by ID: ${id}`)
    const request = new GetMailAuditByIdRequestDto()
    request.id = id
    return await this.mailAuditFacadeService.getMailAuditById(request)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "메일 감사 조회 (검색)" })
  @ApiOkResponseWrapper(MailAuditResponseDto, "메일 감사 검색 성공")
  async searchMailAudit(
    @Query("mailId") mailId?: string,
    @Query("recipient") recipient?: string,
    @Query("template") template?: string,
  ): Promise<MailAuditResponseDto[]> {
    this.logger.log(`Searching mail audits with filters: ${JSON.stringify({ mailId, recipient, template })}`)

    const request = new GetMailAuditRequestDto()
    request.mailId = mailId
    request.recipient = recipient
    request.template = template

    return await this.mailAuditFacadeService.searchMailAudit(request)
  }
}
