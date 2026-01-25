import { IsNotEmpty, IsString } from "class-validator"

/**
 * 프로필 조회 입력 DTO
 * 백준 프로필을 조회하기 위한 입력 데이터
 */
export class GetProfileInputDto {
  @IsString({ message: "사용자 ID는 문자열이어야 합니다" })
  userId: string

  @IsNotEmpty({ message: "백준 ID는 필수입니다" })
  @IsString({ message: "백준 ID는 문자열이어야 합니다" })
  handle: string
}
