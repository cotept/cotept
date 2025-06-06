import { ApiProperty } from "@nestjs/swagger"
import { Expose } from "class-transformer"
import { IsDate, IsNotEmpty, IsString, IsUrl } from "class-validator"

/**
 * 인증 시작 DTO
 * 백준 ID 인증을 시작할 때 사용되는 DTO
 */
export class StartVerificationDto {
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
    description: "인증 세션 만료 시간",
    example: "2025-05-31T14:30:00Z",
  })
  @Expose()
  @IsDate({ message: "만료 시간은 유효한 날짜여야 합니다." })
  expiresAt: Date
}
