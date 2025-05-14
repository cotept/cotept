import { MailServicePort } from "@/modules/mail/application/ports/out/mail-service.port"
import { Mail } from "@/modules/mail/domain/model/mail"
import { TEMPLATE_SUBJECT_MAP } from "@/modules/mail/domain/types/template.types"
import { ErrorUtils } from "@/shared/utils/error.util"
import { MailerService } from "@nestjs-modules/mailer"
import { Injectable, Logger } from "@nestjs/common"

@Injectable()
export class MailService extends MailServicePort {
  private readonly logger = new Logger(MailService.name)

  constructor(private readonly mailerService: MailerService) {
    super()
  }

  /**
   * 메일 전송 구현
   */
  async send(mail: Mail): Promise<void> {
    try {
      const options = mail.toEmailOptions()
      const { to, template, data, locale = "kr", attachments = [] } = options
      // const template = options.template as TemplateNames
      console.log({ options })

      await this.mailerService.sendMail({
        to,
        subject: TEMPLATE_SUBJECT_MAP[template], // 템플릿에 맞는 미리 정의된 제목 사용
        template: `${template}`,
        context: { ...data },
      })

      this.logger.log(`Email (${template}) sent to ${Array.isArray(to) ? to.join(", ") : to}`)
    } catch (error) {
      const recipients = mail.getRecipients().join(", ")
      this.logger.error(
        `메일 전송 실패: ${recipients}: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }
}
