import { SendMailDto } from "@/modules/mail/application/dtos/send-mail.dto"
import { MailMapper } from "@/modules/mail/application/mappers/mail.mapper"
import { SendMailUseCase } from "@/modules/mail/application/ports/in/send-mail.usecase"
import { MailServicePort } from "@/modules/mail/application/ports/out/mail-service.port"
import { TemplateNames } from "@/modules/mail/domain/types/template.types"
import { Injectable, Logger } from "@nestjs/common"

@Injectable()
export class SendMailUseCaseImpl extends SendMailUseCase {
  private readonly logger = new Logger(SendMailUseCaseImpl.name)

  constructor(
    private readonly mailMapper: MailMapper,
    private readonly mailService: MailServicePort,
  ) {
    super();
  }

  async execute<T extends TemplateNames>(dto: SendMailDto<T>): Promise<void> {
    this.logger.log(`Sending ${dto.template} email to ${Array.isArray(dto.to) ? dto.to.join(", ") : dto.to}`)

    const mail = this.mailMapper.toDomain(dto)
    await this.mailService.send(mail)

    this.logger.log(`Email sent successfully to ${Array.isArray(dto.to) ? dto.to.join(", ") : dto.to}`)
  }
}
