import { NotificationPort } from "@/modules/auth/application/ports/out"
import { MailFacadeService } from "@/modules/mail/application/services/facade/mail-facade.service"
import { MailRequestDto } from "@/modules/mail/infrastructure/adapter/in/dtos/mail-request.dto"
import { Injectable, Logger } from "@nestjs/common"

// 임시 더미 NotificationService 구현
@Injectable()
export class NotificationService implements NotificationPort {
  private readonly logger = new Logger(NotificationService.name)

  constructor(private readonly mailService: MailFacadeService) {}

  async sendEmail(dto: MailRequestDto): Promise<boolean> {
    const { to, template, data } = dto
    this.logger.log(`[이메일 발송] 수신자: ${to},  템플릿: ${template}`)
    this.logger.log(`[이메일 내용] ${data}`)
    this.mailService.sendMail(dto)
    return true // 항상 성공으로 처리
  }

  async sendSms(phoneNumber: string, message: string, templateId?: string): Promise<boolean> {
    this.logger.log(`[더미 SMS 발송] 수신자: ${phoneNumber}, 템플릿: ${templateId || "default"}`)
    this.logger.log(`[더미 SMS 내용] ${message}`)
    return true // 항상 성공으로 처리
  }
}

// oci smtp 인증서 사용
