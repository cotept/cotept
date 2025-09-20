import { ApiProperty } from "@nestjs/swagger"

import { Type } from "class-transformer"
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator"

import { MentorTagDto } from "./mentor-tag.dto"

export class MentorProfileDto {
  @ApiProperty({ description: "멘토 프로필 IDX", example: 1 })
  @IsInt()
  idx: number

  @ApiProperty({ description: "연결된 유저의 고유 ID", example: "cld2clvaw00003575n5da3kch" })
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty({
    description: "멘토링 소개 제목",
    example: "실전처럼 배우는 프론트엔드 테스트 코드 작성법",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  introductionTitle?: string

  @ApiProperty({ description: "멘토링 소개 내용 (마크다운)", required: false })
  @IsString()
  @IsOptional()
  introductionContent?: string

  @ApiProperty({ description: "백준 티어 표시 여부", example: true })
  @IsBoolean()
  baekjoonTierDisplay: boolean

  @ApiProperty({ description: "총 멘토링 횟수", example: 15 })
  @IsInt()
  @Min(0)
  mentoringCount: number

  @ApiProperty({ description: "총 리뷰 개수", example: 12 })
  @IsInt()
  @Min(0)
  totalReviewCount: number

  @ApiProperty({ description: "평균 평점 (0.0 ~ 5.0)", example: 4.8 })
  @IsNumber()
  @Min(0)
  @Max(5)
  averageRating: number

  @ApiProperty({ description: "멘토 인증 여부", example: true })
  @IsBoolean()
  isVerified: boolean

  @ApiProperty({ description: "멘토 활동 여부", example: true })
  @IsBoolean()
  isActive: boolean

  @ApiProperty({ description: "프로필 완성도 (0 ~ 100)", example: 95 })
  @IsInt()
  @Min(0)
  @Max(100)
  profileCompletion: number

  @ApiProperty({ description: "멘토 태그 목록", type: () => [MentorTagDto] })
  @Type(() => MentorTagDto)
  tags: MentorTagDto[]

  @ApiProperty({ description: "생성일" })
  @IsDate()
  createdAt: Date

  @ApiProperty({ description: "수정일" })
  @IsDate()
  updatedAt: Date
}
