import { IsBoolean, IsNotEmpty, IsString } from "class-validator"

/**
 * 소셜 계정 연결 확인 처리를 위한 DTO
 */
export class SocialLinkInfoDto {
  /**
   * 임시 연결 토큰
   */
  @IsString({ message: "토큰은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "토큰은 필수 입력 항목입니다." })
  token: string

  /**
   * 계정 연결 승인 여부
   */
  @IsBoolean({ message: "승인 여부는 boolean 값이어야 합니다." })
  @IsNotEmpty({ message: "승인 여부는 필수 입력 항목입니다." })
  approved: boolean

  /**
   * 요청 IP 주소
   */
  @IsString()
  ipAddress: string

  /**
   * 사용자 에이전트
   */
  @IsString()
  userAgent: string
}
