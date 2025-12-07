import { IsNotEmpty, IsString } from "class-validator"

/**
 * 인증 시작 입력 DTO
 * 백준 ID 인증을 시작하기 위한 입력 데이터
 */
export class StartVerificationInputDto {
  @IsString({ message: "사용자 ID는 문자열이어야 합니다" })
  @IsNotEmpty({ message: "사용자 ID는 필수 값입니다." })
  userId: string

  @IsNotEmpty({ message: "백준 ID는 필수입니다" })
  @IsString({ message: "백준 ID는 문자열이어야 합니다" })
  handle: string
}
