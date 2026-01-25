import { Injectable } from "@nestjs/common"

import { plainToInstance } from "class-transformer"

import { GetMailAuditByIdDto, GetMailAuditDto } from "@/modules/mail/application/dtos"
import { GetMailAuditByIdRequestDto, GetMailAuditRequestDto } from "@/modules/mail/infrastructure/dtos/request"

/**
 * 메일 감사 요청 매퍼
 * Infrastructure Request DTO → Application DTO 변환
 */
@Injectable()
export class MailAuditRequestMapper {
  /**
   * 메일 감사 조회 요청 DTO를 Application DTO로 변환
   */
  toGetMailAuditDto(request: GetMailAuditRequestDto): GetMailAuditDto {
    return plainToInstance(GetMailAuditDto, request, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * ID로 메일 감사 조회 요청 DTO를 Application DTO로 변환
   */
  toGetMailAuditByIdDto(request: GetMailAuditByIdRequestDto): GetMailAuditByIdDto {
    return plainToInstance(GetMailAuditByIdDto, request, {
      excludeExtraneousValues: true,
    })
  }
}
