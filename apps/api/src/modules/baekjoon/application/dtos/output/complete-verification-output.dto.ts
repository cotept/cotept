import { ApiProperty } from "@nestjs/swagger"

import { Expose, Transform } from "class-transformer"
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator"

/**
 * 인증 완료 응답 DTO
 * 백준 ID 인증 완료 결과를 담는 DTO
 */
export class CompleteVerificationOutputDto {
  @ApiProperty({
    description: "인증 성공 여부",
    example: true,
  })
  @Expose()
  @IsBoolean({ message: "인증 성공 여부는 불리언 값이어야 합니다." })
  success: boolean

  @ApiProperty({
    description: "인증 세션 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @Expose()
  @IsString({ message: "세션 ID는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "세션 ID는 필수 값입니다." })
  sessionId: string

  @ApiProperty({
    description: "인증 결과 메시지",
    example: "백준 ID 인증이 완료되었습니다",
  })
  @Expose()
  @IsString({ message: "인증 결과 메시지는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 결과 메시지는 필수 값입니다." })
  message: string

  @ApiProperty({
    description: "인증된 백준 핸들",
    example: "dudtod1596",
  })
  @Expose()
  @IsString({ message: "백준 핸들은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "백준 핸들은 필수 값입니다." })
  @Transform(({ value }) => value?.trim().toLowerCase())
  handle: string

  @ApiProperty({
    description: "현재 시도 횟수",
    example: 2,
  })
  @Expose()
  @IsNumber({}, { message: "시도 횟수는 숫자여야 합니다." })
  attempts: number
}
