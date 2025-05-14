import { TemplateNames, LocaleType } from "../types/template.types"

/**
 * 메일 상태 열거형
 */
export enum MailStatus {
  PENDING = 'PENDING',     // 대기 중
  SENT = 'SENT',           // 발송 완료
  FAILED = 'FAILED'        // 발송 실패
}

/**
 * 메일 감사 도메인 모델
 * 이메일 발송 내역 추적 및 감사를 위한 모델
 */
export class MailAudit {
  private readonly id: string
  private readonly mailId: string
  private readonly template: TemplateNames
  private readonly recipients: string[]
  private status: MailStatus
  private sentAt: Date | null
  private error?: string
  private readonly createdAt: Date
  private readonly context: Record<string, any>
  private readonly locale: LocaleType

  private constructor(
    id: string,
    mailId: string,
    template: TemplateNames,
    recipients: string[],
    status: MailStatus,
    sentAt: Date | null,
    createdAt: Date,
    context: Record<string, any>,
    locale: LocaleType,
    error?: string,
  ) {
    this.id = id
    this.mailId = mailId
    this.template = template
    this.recipients = recipients
    this.status = status
    this.sentAt = sentAt
    this.createdAt = createdAt
    this.context = context
    this.locale = locale
    this.error = error
  }

  /**
   * 새로운 메일 감사 객체를 생성합니다.
   */
  public static create(
    id: string,
    mailId: string,
    template: TemplateNames,
    recipients: string[],
    status: MailStatus,
    context: Record<string, any>,
    locale: LocaleType,
    sentAt: Date | null = null,
    error?: string,
  ): MailAudit {
    return new MailAudit(
      id,
      mailId,
      template,
      recipients,
      status,
      sentAt,
      new Date(),
      context,
      locale,
      error,
    )
  }

  /**
   * 발송 성공으로 상태를 업데이트합니다.
   */
  public markAsSent(): void {
    this.status = MailStatus.SENT
    this.sentAt = new Date()
    this.error = undefined
  }

  /**
   * 발송 실패로 상태를 업데이트합니다.
   */
  public markAsFailed(error: string): void {
    this.status = MailStatus.FAILED
    this.sentAt = new Date()
    this.error = error
  }

  /**
   * ID를 반환합니다.
   */
  public getId(): string {
    return this.id
  }

  /**
   * 메일 ID를 반환합니다.
   */
  public getMailId(): string {
    return this.mailId
  }

  /**
   * 템플릿 타입을 반환합니다.
   */
  public getTemplate(): TemplateNames {
    return this.template
  }

  /**
   * 수신자 목록을 반환합니다.
   */
  public getRecipients(): string[] {
    return this.recipients
  }

  /**
   * 상태를 반환합니다.
   */
  public getStatus(): MailStatus {
    return this.status
  }

  /**
   * 발송 시간을 반환합니다.
   */
  public getSentAt(): Date | null {
    return this.sentAt
  }

  /**
   * 오류 메시지를 반환합니다.
   */
  public getError(): string | undefined {
    return this.error
  }

  /**
   * 생성 시간을 반환합니다.
   */
  public getCreatedAt(): Date {
    return this.createdAt
  }

  /**
   * 컨텍스트 데이터를 반환합니다.
   */
  public getContext(): Record<string, any> {
    return this.context
  }

  /**
   * 언어 설정을 반환합니다.
   */
  public getLocale(): LocaleType {
    return this.locale
  }

  /**
   * 메일 감사 객체의 데이터를 반환합니다.
   */
  public toData(): {
    id: string
    mailId: string
    template: TemplateNames
    recipients: string[]
    status: MailStatus
    sentAt: Date | null
    error?: string
    createdAt: Date
    context: Record<string, any>
    locale: LocaleType
  } {
    return {
      id: this.id,
      mailId: this.mailId,
      template: this.template,
      recipients: this.recipients,
      status: this.status,
      sentAt: this.sentAt,
      error: this.error,
      createdAt: this.createdAt,
      context: this.context,
      locale: this.locale,
    }
  }
}
