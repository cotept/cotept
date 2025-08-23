import { MailAudit } from "../../../domain/model/mail-audit"

/**
 * 메일 감사 리포지토리 포트
 * 메일 감사 데이터의 저장 및 조회를 위한 추상 클래스
 */
export abstract class MailAuditRepositoryPort {
  /**
   * 메일 감사 데이터를 저장합니다.
   * @param mailAudit 저장할 메일 감사 객체
   * @returns 저장된 메일 감사 객체
   */
  abstract save(mailAudit: MailAudit): Promise<MailAudit>

  /**
   * IDX로 메일 감사 데이터를 조회합니다.
   * @param idx 조회할 메일 감사 ID
   * @returns 찾은 메일 감사 객체 또는 undefined
   */
  abstract findByIdx(idx: number): Promise<MailAudit | undefined>

  /**
   * 메일 ID로 메일 감사 데이터를 조회합니다.
   * @param mailId 조회할 메일 ID
   * @returns 찾은 메일 감사 객체 목록
   */
  abstract findByMailId(mailId: string): Promise<MailAudit[]>

  /**
   * 수신자 이메일로 메일 감사 데이터를 조회합니다.
   * @param recipient 조회할 수신자 이메일
   * @returns 찾은 메일 감사 객체 목록
   */
  abstract findByRecipient(recipient: string): Promise<MailAudit[]>

  /**
   * 템플릿 타입으로 메일 감사 데이터를 조회합니다.
   * @param template 조회할 템플릿 타입
   * @returns 찾은 메일 감사 객체 목록
   */
  abstract findByTemplate(template: string): Promise<MailAudit[]>
}
