import { IsNotEmpty, IsString } from "class-validator"

/**
 * 태그 통계 조회 입력 DTO
 * 백준 태그 통계를 조회하기 위한 입력 데이터
 */
export class GetStatisticsInputDto {
  @IsString({ message: "사용자 ID는 문자열이어야 합니다" })
  userId: string

  @IsNotEmpty({ message: "백준 ID는 필수입니다" })
  @IsString({ message: "백준 ID는 문자열이어야 합니다" })
  handle: string
}
