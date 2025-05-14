import { MailAudit } from "@/modules/mail/domain/model/mail-audit"

/**
 * 메일 감사 조회 유스케이스
 * 메일 감사 데이터 조회를 위한 추상 클래스
 */
export abstract class GetMailAuditUseCase {
  /**
   * ID로 메일 감사 데이터를 조회합니다.
   * @param id 조회할 메일 감사 ID
   * @returns 찾은 메일 감사 객체 또는 undefined
   */
  abstract getById(id: string): Promise<MailAudit | undefined>

  /**
   * 메일 ID로 메일 감사 데이터를 조회합니다.
   * @param mailId 조회할 메일 ID
   * @returns 찾은 메일 감사 객체 목록
   */
  abstract getByMailId(mailId: string): Promise<MailAudit[]>

  /**
   * 수신자 이메일로 메일 감사 데이터를 조회합니다.
   * @param recipient 조회할 수신자 이메일
   * @returns 찾은 메일 감사 객체 목록
   */
  abstract getByRecipient(recipient: string): Promise<MailAudit[]>

  /**
   * 템플릿 타입으로 메일 감사 데이터를 조회합니다.
   * @param template 조회할 템플릿 타입
   * @returns 찾은 메일 감사 객체 목록
   */
  abstract getByTemplate(template: string): Promise<MailAudit[]>
}
