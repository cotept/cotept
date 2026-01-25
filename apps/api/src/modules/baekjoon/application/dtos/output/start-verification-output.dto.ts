import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsString, IsUrl, Max, Min } from "class-validator"

import { VerificationStatusType } from "@/modules/baekjoon/domain/vo"

/**
 * 인증 시작 응답 DTO
 * 백준 ID 인증을 시작한 결과 데이터
 */
export class StartVerificationOutputDto {
  @ApiProperty({
    description: "인증 세션 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @Expose()
  @IsString({ message: "세션 ID는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "세션 ID는 필수 값입니다." })
  sessionId: string

  @ApiProperty({
    description: "백준 핸들 (아이디)",
    example: "dudtod1596",
  })
  @Expose()
  @IsString({ message: "백준 핸들은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "백준 핸들은 필수 값입니다." })
  handle: string

  @ApiProperty({
    description: "생성된 인증 문자열 (사용자가 bio에 입력해야 할 문자열)",
    example: "배부른고양이847293",
  })
  @Expose()
  @IsString({ message: "인증 문자열은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "인증 문자열은 필수 값입니다." })
  verificationString: string

  @ApiProperty({
    description: "solved.ac 프로필 편집 페이지 URL",
    example: "https://solved.ac/settings/profile",
  })
  @Expose()
  @IsUrl({}, { message: "프로필 편집 URL이 유효하지 않습니다." })
  profileEditUrl: string

  @ApiProperty({
    description: "사용자에게 표시할 안내 메시지",
    example: "프로필 bio를 다음 문자열로 수정해주세요",
  })
  @Expose()
  @IsString({ message: "안내 메시지는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "안내 메시지는 필수 값입니다." })
  message: string

  @ApiProperty({
    description: "인증 상태",
    enum: VerificationStatusType,
    enumName: "VerificationStatusType",
    example: VerificationStatusType.IN_PROGRESS,
  })
  @Expose()
  @IsEnum(VerificationStatusType, { message: "유효하지 않은 인증 상태입니다." })
  status: VerificationStatusType

  @ApiProperty({
    description: "현재 인증 시도 횟수",
    example: 0,
  })
  @Expose()
  @IsInt({ message: "시도 횟수는 정수여야 합니다." })
  @Min(0, { message: "시도 횟수는 0 이상이어야 합니다." })
  attempts: number

  @ApiProperty({
    description: "최대 인증 시도 횟수",
    example: 3,
  })
  @Expose()
  @IsInt({ message: "최대 시도 횟수는 정수여야 합니다." })
  @Min(1, { message: "최대 시도 횟수는 1 이상이어야 합니다." })
  @Max(3, { message: "최대 시도 횟수는 3 이하여야 합니다." })
  maxAttempts: number

  @ApiProperty({
    description: "인증 세션 생성 시간",
    example: "2025-05-31T14:00:00Z",
  })
  @Expose()
  @IsDate({ message: "생성 시간은 유효한 날짜여야 합니다." })
  createdAt: Date

  @ApiProperty({
    description: "인증 세션 만료 시간",
    example: "2025-05-31T14:30:00Z",
  })
  @Expose()
  @IsDate({ message: "만료 시간은 유효한 날짜여야 합니다." })
  expiresAt: Date
}
