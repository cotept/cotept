import { ApiProperty } from "@nestjs/swagger"

import { Expose } from "class-transformer"
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"

/**
 * 온보딩 중 멘토 프로필 생성을 위한 DTO
 */
export class CreateMentorProfileDto {
  @ApiProperty({ description: "사용자 ID", example: "user123" })
  @Expose()
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty({ description: "멘토 태그 ID 목록", example: [1, 2, 3], type: [Number] })
  @Expose()
  @IsArray()
  @IsInt({ each: true })
  tagIds: number[]

  @ApiProperty({ description: "멘토 소개 제목", example: "10년차 개발자의 노하우", required: false, maxLength: 100 })
  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  introductionTitle?: string

  @ApiProperty({ description: "멘토 소개 내용", example: "실전에서 사용하는...", required: false })
  @Expose()
  @IsString()
  @IsOptional()
  introductionContent?: string
}
