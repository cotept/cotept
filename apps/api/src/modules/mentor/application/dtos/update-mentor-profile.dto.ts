import { ApiProperty, PickType } from "@nestjs/swagger"
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, MaxLength } from "class-validator"

import { MentorProfileDto } from "./mentor-profile.dto"

/**
 * 멘토 프로필 업데이트 DTO (PUT)
 * 리소스 전체 교체를 위해 대부분의 필드를 포함합니다.
 */
export class UpdateMentorProfileDto {
  @ApiProperty({
    description: "멘토링 소개 제목",
    example: "실전처럼 배우는 프론트엔드 테스트 코드 작성법",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  introductionTitle?: string

  @ApiProperty({
    description: "멘토링 소개 내용 (마크다운)",
    required: false,
  })
  @IsString()
  @IsOptional()
  introductionContent?: string

  @ApiProperty({ description: "백준 티어 표시 여부", example: true })
  @IsBoolean()
  baekjoonTierDisplay: boolean

  @ApiProperty({
    description: "멘토의 기술 스택 및 직무 태그 ID 목록",
    type: [Number],
    example: [1, 5, 10],
  })
  @IsArray()
  @IsInt({ each: true })
  tagIds: number[]
}
