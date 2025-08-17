import { Email } from "../vo/email.vo"
import { Locale } from "../vo/locale.vo"
import { TemplateType } from "../vo/template-type.vo"

import { LocaleType, TemplateContextMap, TemplateNames } from "../types/template.types"

/**
 * 메일 도메인 모델
 * 이메일 메시지의 핵심 비즈니스 로직과 속성을 담당
 */
export class Mail {
  private readonly id?: string
  private readonly to: Email | Email[]
  private readonly locale: Locale
  private readonly templateType: TemplateType
  private readonly context: Record<string, any>
  private readonly attachments?: any[]

  private constructor(
    to: Email | Email[],
    templateType: TemplateType,
    context: Record<string, any>,
    locale: Locale,
    attachments?: any[],
    id?: string,
  ) {
    this.id = id
    this.to = to
    this.templateType = templateType
    this.context = context
    this.locale = locale
    this.attachments = attachments
  }

  /**
   * 메일 객체 생성 팩토리 메서드
   */
  public static create<T extends TemplateNames>(
    to: Email | Email[] | string | string[],
    templateType: TemplateType | string,
    context: TemplateContextMap[T],
    locale?: Locale | string,
    attachments?: any[],
    id?: string,
  ): Mail {
    // 이메일 주소 변환
    const toEmails = Array.isArray(to)
      ? to.map((email) => (email instanceof Email ? email : Email.of(email)))
      : to instanceof Email
        ? to
        : Email.of(to)

    // 템플릿 타입 변환
    const templateTypeVo = templateType instanceof TemplateType ? templateType : TemplateType.of(templateType)

    // 언어 설정 변환
    const localeVo =
      locale instanceof Locale ? locale : typeof locale === "string" ? Locale.of(locale as any) : Locale.of()

    return new Mail(toEmails, templateTypeVo, context, localeVo, attachments, id)
  }

  /**
   * 수신자 이메일 주소 배열 반환
   */
  public getRecipients(): string[] {
    if (Array.isArray(this.to)) {
      return this.to.map((email) => email.toString())
    }
    return [this.to.toString()]
  }

  /**
   * 템플릿 타입 문자열 반환
   */
  public getTemplateType(): TemplateNames {
    return this.templateType.getValue()
  }

  /**
   * 컨텍스트 데이터 반환
   */
  public getContext(): Record<string, any> {
    return this.context
  }

  /**
   * 언어 설정 반환
   */
  public getLocale(): LocaleType {
    return this.locale.getValue()
  }

  /**
   * 첨부 파일 반환
   */
  public getAttachments(): any[] | undefined {
    return this.attachments
  }

  /**
   * ID 반환
   */
  public getId(): string | undefined {
    return this.id
  }

  /**
   * 이메일 발송에 필요한 데이터 반환
   */
  public toEmailOptions<T extends TemplateNames>(): {
    to: string | string[]
    template: T
    data: TemplateContextMap[T]
    locale: LocaleType
    attachments?: any[]
  } {
    return {
      to: Array.isArray(this.to) ? this.to.map((email) => email.toString()) : this.to.toString(),
      template: this.templateType.getValue() as T,
      data: this.context as TemplateContextMap[T],
      locale: this.locale.getValue(),
      attachments: this.attachments,
    }
  }
}
