import { LocaleType, TemplateContextMap, TemplateNames } from "../../domain/types/template.types"

/**
 * 이메일 전송 DTO
 * 이메일 전송 요청 시 사용되는 데이터 전송 객체
 * @template T 템플릿 이름 타입
 */
export class SendMailDto<T extends TemplateNames> {
  readonly to: string | string[]
  readonly locale?: LocaleType
  readonly template: T
  readonly data: TemplateContextMap[T]
  readonly attachments?: any[]

  constructor(
    to: string | string[],
    template: T,
    data: TemplateContextMap[T],
    locale: LocaleType = "ko",
    attachments?: any[],
  ) {
    this.to = to
    this.locale = locale
    this.template = template
    this.data = data
    this.attachments = attachments
  }
}
