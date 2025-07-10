import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"

/**
 * 인증 상태 DTO
 * 백준 ID 인증 진행 상태를 담는 DTO
 */
export class VerificationStatusOutputDto {
  @ApiProperty({
    description: "인증 진행 중 여부",
    example: true,
  })
  @Expose()
  @IsBoolean({ message: "인증 진행 여부는 불리언 값이어야 합니다." })
  inProgress: boolean

  @ApiProperty({
    description: "인증 상태",
    enum: ["PENDING", "VERIFIED", "FAILED", "EXPIRED"],
    example: "PENDING",
  })
  @Expose()
  @IsEnum(["PENDING", "VERIFIED", "FAILED", "EXPIRED"], {
    message: "유효한 인증 상태가 아닙니다.",
  })
  status: string

  @ApiProperty({
    description: "현재 인증 문자열 (진행 중인 경우)",
    example: "배부른고양이847293",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString({ message: "인증 문자열은 문자열이어야 합니다." })
  verificationString?: string

  @ApiProperty({
    description: "인증 세션 만료 시간 (진행 중인 경우)",
    example: "2025-05-31T14:30:00Z",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsDate({ message: "만료 시간은 유효한 날짜여야 합니다." })
  expiresAt?: Date

  @ApiProperty({
    description: "인증된 백준 핸들 (인증 완료된 경우)",
    example: "dudtod1596",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString({ message: "백준 핸들은 문자열이어야 합니다." })
  verifiedHandle?: string

  @ApiProperty({
    description: "인증 완료 시간 (인증 완료된 경우)",
    example: "2025-05-31T14:00:00Z",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsDate({ message: "인증 완료 시간은 유효한 날짜여야 합니다." })
  verifiedAt?: Date

  @ApiProperty({
    description: "상태 메시지",
    example: "인증이 진행 중입니다. bio를 확인해주세요.",
  })
  @Expose()
  @IsString({ message: "상태 메시지는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "상태 메시지는 필수 값입니다." })
  message: string
}
