import { ApiProperty } from "@nestjs/swagger"

import { IsBoolean, IsDate, IsEnum, IsInt, IsNotEmpty, IsString } from "class-validator"

import { MentorTagCategory } from "@/modules/mentor/domain/model/mentor-tag"

export class MentorTagDto {
  @ApiProperty({ description: "태그 IDX", example: 1 })
  @IsInt()
  idx: number

  @ApiProperty({ description: "태그 이름", example: "프론트엔드" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: "태그 카테고리", enum: MentorTagCategory, example: MentorTagCategory.JOB })
  @IsEnum(MentorTagCategory)
  category: MentorTagCategory

  @ApiProperty({ description: "표시 순서", example: 1 })
  @IsInt()
  displayOrder: number

  @ApiProperty({ description: "활성화 여부", example: true })
  @IsBoolean()
  isActive: boolean

  @ApiProperty({ description: "생성일" })
  @IsDate()
  createdAt: Date

  @ApiProperty({ description: "수정일" })
  @IsDate()
  updatedAt: Date
}
