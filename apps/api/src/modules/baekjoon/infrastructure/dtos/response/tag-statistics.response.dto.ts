import { ApiProperty } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"

/**
 * 태그 정보 DTO
 */
export class TagInfoDto {
  @ApiProperty({
    description: "태그 ID",
    example: 1,
  })
  @Expose()
  tagId: number

  @ApiProperty({
    description: "태그 키 (영문)",
    example: "implementation",
  })
  @Expose()
  key: string

  @ApiProperty({
    description: "태그 이름 (한국어)",
    example: "구현",
  })
  @Expose()
  nameKo: string

  @ApiProperty({
    description: "해결한 문제 수",
    example: 25,
  })
  @Expose()
  problemCount: number

  @ApiProperty({
    description: "태그별 레이팅",
    example: 1200,
  })
  @Expose()
  rating: number

  @ApiProperty({
    description: "문제별 레이팅 합계",
    example: 15000,
  })
  @Expose()
  ratingByProblemsSum: number

  @ApiProperty({
    description: "클래스별 레이팅",
    example: 1100,
  })
  @Expose()
  ratingByClass: number

  @ApiProperty({
    description: "해결 수별 레이팅",
    example: 1300,
  })
  @Expose()
  ratingBySolvedCount: number
}

/**
 * 태그 통계 응답 DTO
 */
export class TagStatisticsResponseDto {
  @ApiProperty({
    description: "사용자 ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @Expose()
  userId: string

  @ApiProperty({
    description: "백준 ID",
    example: "solved_user123",
  })
  @Expose()
  handle: string

  @ApiProperty({
    description: "태그별 통계 목록",
    type: [TagInfoDto],
  })
  @Expose()
  @Type(() => TagInfoDto)
  tags: TagInfoDto[]

  @ApiProperty({
    description: "총 태그 수",
    example: 15,
  })
  @Expose()
  totalTagCount: number

  @ApiProperty({
    description: "평균 레이팅",
    example: 1250,
  })
  @Expose()
  averageRating: number

  @ApiProperty({
    description: "마지막 업데이트 시간",
    example: "2025-06-01T12:00:00.000Z",
  })
  @Expose()
  lastUpdated: string
}
