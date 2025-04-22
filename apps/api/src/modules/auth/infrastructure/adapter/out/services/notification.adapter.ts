import { NotificationPort } from "@/modules/auth/application/ports/out"
import { Injectable, Logger } from "@nestjs/common"

// 임시 더미 NotificationService 구현
@Injectable()
export class DummyNotificationService implements NotificationPort {
  private readonly logger = new Logger(DummyNotificationService.name)

  async sendEmail(to: string, subject: string, content: string, templateId?: string): Promise<boolean> {
    this.logger.log(`[더미 이메일 발송] 수신자: ${to}, 제목: ${subject}, 템플릿: ${templateId || "default"}`)
    this.logger.log(`[더미 이메일 내용] ${content}`)
    return true // 항상 성공으로 처리
  }

  async sendSms(phoneNumber: string, message: string, templateId?: string): Promise<boolean> {
    this.logger.log(`[더미 SMS 발송] 수신자: ${phoneNumber}, 템플릿: ${templateId || "default"}`)
    this.logger.log(`[더미 SMS 내용] ${message}`)
    return true // 항상 성공으로 처리
  }
}
