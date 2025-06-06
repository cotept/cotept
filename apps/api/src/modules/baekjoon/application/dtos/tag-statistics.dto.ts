import { ApiProperty } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsObject, IsString, Min, ValidateNested } from "class-validator"

/**
 * 태그 정보 DTO
 */
export class TagDto {
  @ApiProperty({
    description: "태그 키",
    example: "implementation",
  })
  @Expose()
  @IsString({ message: "태그 키는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "태그 키는 필수 값입니다." })
  key: string

  @ApiProperty({
    description: "태그 이름",
    example: "구현",
  })
  @Expose()
  @IsString({ message: "태그 이름은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "태그 이름은 필수 값입니다." })
  name: string
}

/**
 * 상위 태그 정보 DTO
 */
export class TopTagDto {
  @ApiProperty({
    description: "태그 정보",
    type: TagDto,
  })
  @Expose()
  @ValidateNested()
  @Type(() => TagDto)
  tag: TagDto

  @ApiProperty({
    description: "해당 태그로 해결한 문제 수",
    example: 25,
    minimum: 0,
  })
  @Expose()
  @IsNumber({}, { message: "해결한 문제 수는 숫자여야 합니다." })
  @Min(0, { message: "해결한 문제 수는 0 이상이어야 합니다." })
  solvedCount: number
}

/**
 * 태그 통계 DTO
 * 백준 사용자의 태그별 문제 풀이 통계를 담는 DTO
 */
export class TagStatisticsDto {
  @ApiProperty({
    description: "총 해결한 문제 수",
    example: 150,
    minimum: 0,
  })
  @Expose()
  @IsNumber({}, { message: "총 문제 수는 숫자여야 합니다." })
  @Min(0, { message: "총 문제 수는 0 이상이어야 합니다." })
  totalCount: number

  @ApiProperty({
    description: "티어별 통계 (티어명: 문제 수)",
    example: {
      "Bronze V": 10,
      "Bronze IV": 15,
      "Silver I": 20,
      "Gold III": 30,
    },
  })
  @Expose()
  @IsObject({ message: "티어별 통계는 객체여야 합니다." })
  tierStats: Record<string, number>

  @ApiProperty({
    description: "상위 태그 목록 (해결한 문제 수 기준)",
    type: [TopTagDto],
  })
  @Expose()
  @IsArray({ message: "상위 태그 목록은 배열이어야 합니다." })
  @ValidateNested({ each: true })
  @Type(() => TopTagDto)
  topTags: TopTagDto[]

  @ApiProperty({
    description: "통계 데이터가 마지막으로 동기화된 시간",
    example: "2025-05-31T13:00:00Z",
  })
  @Expose()
  @IsDate({ message: "마지막 동기화 시간은 유효한 날짜여야 합니다." })
  lastSynced: Date
}
