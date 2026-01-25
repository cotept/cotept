import { plainToInstance } from "class-transformer"

import { MailRequestDto } from "../../../dtos/request/mail-request.dto"

import { TemplateContextMap, TemplateNames } from "@/modules/mail/domain/types/template.types"

import { SendMailDto } from "@/modules/mail/application/dtos"

/**
 * MailRequestDto를 SendMailDto로 변환하는 매퍼 클래스
 */
export class MailRequestMapper {
  /**
   * MailRequestDto를 SendMailDto로 변환합니다
   * @param mailRequestDto 변환할 MailRequestDto 객체
   * @returns 변환된 SendMailDto 객체
   */
  static toSendMailDto<T extends TemplateNames>(mailRequestDto: MailRequestDto): SendMailDto<T> {
    // SendMailDto의 생성자를 사용하여 새 객체 생성
    return new SendMailDto<T>(
      mailRequestDto.to,
      mailRequestDto.template as T,
      mailRequestDto.data as TemplateContextMap[T], // 타입 호환성을 위해 any 타입으로 캐스팅
      mailRequestDto.locale,
      mailRequestDto.attachments,
    )
  }

  /**
   * 복잡한 변환 작업이 필요할 경우 class-transformer를 사용한 방법
   * (위 방법보다 더 복잡한 변환이 필요할 때 사용)
   */
  static toSendMailDtoWithTransformer<T extends TemplateNames>(mailRequestDto: MailRequestDto): SendMailDto<T> {
    // 일단 평범한 객체로 변환
    const plainObject = {
      to: mailRequestDto.to,
      template: mailRequestDto.template,
      data: mailRequestDto.data,
      locale: mailRequestDto.locale || "ko",
      attachments: mailRequestDto.attachments,
    }

    // plainToInstance 사용하여 SendMailDto 인스턴스로 변환
    return plainToInstance(SendMailDto, plainObject) as SendMailDto<T>
  }
}
