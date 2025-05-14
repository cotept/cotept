import { SendMailDto } from "@/modules/mail/application/dtos/send-mail.dto"
import { TemplateNames } from "@/modules/mail/domain/types/template.types"

/**
 * 메일 전송 유스케이스 추상 클래스
 * 애플리케이션 계층과 외부 계층 간의 계약을 정의
 */
export abstract class SendMailUseCase {
  /**
   * 메일 전송을 실행합니다.
   * @param dto 메일 전송에 필요한 데이터
   */
  abstract execute<T extends TemplateNames>(dto: SendMailDto<T>): Promise<void>
}
