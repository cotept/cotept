import { ApiProperty } from "@nestjs/swagger"

import { IsEmail, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator"

import { LocaleType, TemplateContextMap, TemplateNames } from "../../../domain/types/template.types"

/**
 * 메일 요청 DTO
 * 외부에서 메일 전송 요청 시 사용되는 데이터 구조
 */
export class MailRequestDto {
  @ApiProperty({
    description: "수신자 이메일",
    example: "user@example.com",
    oneOf: [
      { type: 'string', format: 'email' },
      { type: 'array', items: { type: 'string', format: 'email' } }
    ],
  })
  @IsEmail({}, { each: true, message: "유효한 이메일 주소를 입력해주세요" })
  @IsNotEmpty({ message: "이메일 주소는 필수입니다" })
  readonly to: string | string[]

  @ApiProperty({
    description: "템플릿 유형",
    example: "email_verification",
    enum: [
      "email_verification",
      "password_recovery",
      "reservation_create",
      "reservation_fix",
      "reservation_cancel",
      "reservation_change",
      "reservation_prenotice",
      "verification_code",
    ],
  })
  @IsString({ message: "템플릿 유형은 문자열이어야 합니다" })
  @IsNotEmpty({ message: "템플릿 유형은 필수입니다" })
  readonly template: TemplateNames

  @ApiProperty({
    description: "템플릿 컨텍스트 (변수)",
    example: { userName: "홍길동", authNumber: "123456" },
    required: true,
  })
  @IsObject({ message: "데이터는 객체여야 합니다" })
  @IsNotEmpty({ message: "데이터는 필수입니다" })
  readonly data: TemplateContextMap[TemplateNames]

  @ApiProperty({
    description: "언어 설정",
    example: "ko",
    enum: ["ko", "en"],
    default: "ko",
    required: false,
  })
  @IsEnum(["ko", "en"], { message: "지원되는 언어는 'ko', 'en'입니다" })
  @IsOptional()
  readonly locale?: LocaleType = "ko"

  @ApiProperty({
    description: "첨부 파일",
    type: "array",
    items: {
      type: "object",
      properties: {
        filename: { type: "string" },
        content: { type: "string", format: "binary" },
      },
    },
    required: false,
  })
  @IsOptional()
  readonly attachments?: any[]
}
