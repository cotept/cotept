import { Injectable } from "@nestjs/common"
import { Mail } from "../../domain/model/mail"
import { TemplateNames } from "../../domain/types/template.types"
import { MailDto } from "../dtos/mail.dto"
import { SendMailDto } from "../dtos/send-mail.dto"

@Injectable()
export class MailMapper {
  /**
   * DTO에서 도메인 모델로 변환
   */
  toDomain<T extends TemplateNames>(dto: SendMailDto<T> | MailDto<T>): Mail {
    return Mail.create(dto.to, dto.template, dto.data, dto.locale, dto.attachments)
  }

  /**
   * 도메인 모델에서 DTO로 변환
   */
  toDto<T extends TemplateNames>(domain: Mail): MailDto<T> {
    const options = domain.toEmailOptions<T>()

    return new MailDto<T>(options.to, options.template, options.data, options.locale, options.attachments)
  }
}
