import { ApiProperty } from "@nestjs/swagger"

import { Expose, Type } from "class-transformer"

import { MentorTagDto } from "@/modules/mentor/application/dtos"

export class MentorTagsResponseDto {
  @ApiProperty({ description: "직무 태그 목록", type: [MentorTagDto] })
  @Expose()
  @Type(() => MentorTagDto)
  jobTags: MentorTagDto[]

  @ApiProperty({ description: "연차 태그 목록", type: [MentorTagDto] })
  @Expose()
  @Type(() => MentorTagDto)
  experienceTags: MentorTagDto[]

  @ApiProperty({ description: "회사 태그 목록", type: [MentorTagDto] })
  @Expose()
  @Type(() => MentorTagDto)
  companyTags: MentorTagDto[]
}
