import { Injectable } from "@nestjs/common"

import { MailAudit } from "@/modules/mail/domain/model/mail-audit"
import { MailAuditResponseDto } from "@/modules/mail/infrastructure/dtos/response"

/**
 * 메일 감사 응답 매퍼
 * Domain Model → Infrastructure Response DTO 변환
 */
@Injectable()
export class MailAuditResponseMapper {
  /**
   * MailAudit 도메인 모델을 응답 DTO로 변환
   */
  toMailAuditResponse(mailAudit: MailAudit): MailAuditResponseDto {
    return {
      id: mailAudit.getId(),
      mailId: mailAudit.getMailId(),
      template: mailAudit.getTemplate(),
      recipients: mailAudit.getRecipients(),
      status: mailAudit.getStatus() as any, // enum 타입 변환
      sentAt: mailAudit.getSentAt()?.toISOString() || null,
      error: mailAudit.getError(),
      createdAt: mailAudit.getCreatedAt().toISOString(),
      context: mailAudit.getContext(),
      locale: mailAudit.getLocale(),
    }
  }

  /**
   * MailAudit 배열을 응답 DTO 배열로 변환
   */
  toMailAuditResponseArray(mailAudits: MailAudit[]): MailAuditResponseDto[] {
    return mailAudits.map((mailAudit) => this.toMailAuditResponse(mailAudit))
  }
}
