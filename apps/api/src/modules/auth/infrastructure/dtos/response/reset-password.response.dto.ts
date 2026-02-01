import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"

/**
 * 비밀번호 재설정 응답 DTO
 *
 * 주의: message 필드는 HttpResponseInterceptor가 ApiResponse로 래핑할 때
 * 이미 래핑된 응답으로 오인하는 문제가 있어 제거됨.
 * 메시지는 ApiResponse.message를 통해 전달됨.
 */
export class ResetPasswordResponseDto {
  @ApiProperty({
    description: "비밀번호 재설정 성공 여부",
    example: true,
  })
  @Expose()
  success: boolean

  @ApiProperty({
    description: "재설정 완료 시간",
    example: "2023-01-01T00:00:00Z",
  })
  @Expose()
  resetAt: string
}