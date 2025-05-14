import { Mail } from "@/modules/mail/domain/model/mail"

/**
 * 메일 서비스 포트 추상 클래스
 * 애플리케이션 계층에서 외부 메일 서비스와의 인터페이스 정의
 */
export abstract class MailServicePort {
  /**
   * 메일을 전송합니다.
   * @param mail 전송할 메일 객체
   */
  abstract send(mail: Mail): Promise<void>
}
