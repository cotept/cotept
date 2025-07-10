import { ApiProperty } from "@nestjs/swagger"

import { Expose, Transform } from "class-transformer"
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from "class-validator"

/**
 * 백준 프로필 응답 DTO
 * solved.ac API에서 가져온 사용자 프로필 정보를 담는 DTO
 */
export class BaekjoonProfileOutputDto {
  @ApiProperty({
    description: "백준 사용자 핸들(ID)",
    example: "dudtod1596",
  })
  @Expose()
  @IsString({ message: "백준 핸들은 문자열이어야 합니다." })
  @IsNotEmpty({ message: "백준 핸들은 필수 값입니다." })
  @Transform(({ value }) => value?.trim().toLowerCase())
  handle: string

  @ApiProperty({
    description: "solved.ac 티어",
    example: "Diamond V",
  })
  @Expose()
  @IsString({ message: "티어는 문자열이어야 합니다." })
  @IsNotEmpty({ message: "티어는 필수 값입니다." })
  tier: string

  @ApiProperty({
    description: "solved.ac 레이팅",
    example: 2145,
    minimum: 0,
    maximum: 4000,
  })
  @Expose()
  @IsNumber({}, { message: "레이팅은 숫자여야 합니다." })
  @Min(0, { message: "레이팅은 0 이상이어야 합니다." })
  rating: number

  @ApiProperty({
    description: "해결한 문제 수",
    example: 150,
    minimum: 0,
  })
  @Expose()
  @IsNumber({}, { message: "해결한 문제 수는 숫자여야 합니다." })
  @Min(0, { message: "해결한 문제 수는 0 이상이어야 합니다." })
  solvedCount: number

  @ApiProperty({
    description: "전체 순위",
    example: 1234,
    minimum: 1,
  })
  @Expose()
  @IsNumber({}, { message: "순위는 숫자여야 합니다." })
  @Min(1, { message: "순위는 1 이상이어야 합니다." })
  rank: number

  @ApiProperty({
    description: "프로필 이미지 URL",
    example: "https://static.solved.ac/uploads/profile/20230101-abcd1234/picture.png",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsUrl({}, { message: "프로필 이미지 URL이 유효하지 않습니다." })
  profileImageUrl?: string

  @ApiProperty({
    description: "사용자 bio (인증용)",
    example: "배부른고양이847293",
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsString({ message: "bio는 문자열이어야 합니다." })
  bio?: string

  @ApiProperty({
    description: "프로필 정보가 마지막으로 업데이트된 시간",
    example: "2025-05-31T13:00:00Z",
  })
  @Expose()
  @IsDate({ message: "마지막 업데이트 시간은 유효한 날짜여야 합니다." })
  lastUpdated: Date
}
