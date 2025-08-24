import { Injectable, Logger } from "@nestjs/common"

import { GetMailAuditUseCase } from "@/modules/mail/application/ports/in/get-mail-audit.usecase"
import { MailAudit } from "@/modules/mail/domain/model/mail-audit"
import { MailAuditRequestMapper } from "@/modules/mail/infrastructure/adapter/in/mappers/mail-audit-request.mapper"
import { MailAuditResponseMapper } from "@/modules/mail/infrastructure/adapter/in/mappers/mail-audit-response.mapper"
import { GetMailAuditByIdRequestDto, GetMailAuditRequestDto } from "@/modules/mail/infrastructure/dtos/request"
import { MailAuditResponseDto } from "@/modules/mail/infrastructure/dtos/response"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * 메일 감사 파사드 서비스
 * 컨트롤러와 유스케이스 사이의 중간 레이어로 동작하며 컨트롤러의 복잡성을 줄이는 역할을 합니다.
 */
@Injectable()
export class MailAuditFacadeService {
  private readonly logger = new Logger(MailAuditFacadeService.name)

  constructor(
    private readonly getMailAuditUseCase: GetMailAuditUseCase,
    private readonly mailAuditRequestMapper: MailAuditRequestMapper,
    private readonly mailAuditResponseMapper: MailAuditResponseMapper,
  ) {}

  /**
   * ID로 메일 감사 조회
   */
  async getMailAuditById(request: GetMailAuditByIdRequestDto): Promise<MailAuditResponseDto | null> {
    try {
      const getMailAuditByIdDto = this.mailAuditRequestMapper.toGetMailAuditByIdDto(request)

      const mailAudit = await this.getMailAuditUseCase.getByIdx(getMailAuditByIdDto.idx)

      if (!mailAudit) {
        return null
      }

      return this.mailAuditResponseMapper.toMailAuditResponse(mailAudit)
    } catch (error) {
      this.logger.error(
        `ID로 메일 감사 조회 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 조건으로 메일 감사 검색
   */
  async searchMailAudit(request: GetMailAuditRequestDto): Promise<MailAuditResponseDto[]> {
    try {
      const getMailAuditDto = this.mailAuditRequestMapper.toGetMailAuditDto(request)

      let mailAudits: MailAudit[] = []

      if (getMailAuditDto.mailId) {
        mailAudits = await this.getMailAuditUseCase.getByMailId(getMailAuditDto.mailId)
      } else if (getMailAuditDto.recipient) {
        mailAudits = await this.getMailAuditUseCase.getByRecipient(getMailAuditDto.recipient)
      } else if (getMailAuditDto.template) {
        mailAudits = await this.getMailAuditUseCase.getByTemplate(getMailAuditDto.template)
      }

      return this.mailAuditResponseMapper.toMailAuditResponseArray(mailAudits)
    } catch (error) {
      this.logger.error(
        `메일 감사 검색 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }
}
