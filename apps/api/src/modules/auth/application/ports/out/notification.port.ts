import { MailRequestDto } from "@/modules/mail/infrastructure/dtos/request/mail-request.dto"

/**
 * 알림 서비스 포트
 * 이메일, SMS 등 알림 발송 기능을 정의하는 인터페이스입니다.
 */
export abstract class NotificationPort {
  /**
   * 이메일 발송
   * @param to 수신자 이메일
   * @param subject 제목
   * @param content 내용
   * @param templateId 템플릿 ID(선택)
   * @returns 발송 성공 여부
   */
  abstract sendEmail(dto: MailRequestDto): Promise<boolean>

  /**
   * SMS 발송
   * @param phoneNumber 수신자 전화번호
   * @param message 메시지 내용
   * @param templateId 템플릿 ID(선택)
   * @returns 발송 성공 여부
   */
  abstract sendSms(phoneNumber: string, message: string, templateId?: string): Promise<boolean>
}
