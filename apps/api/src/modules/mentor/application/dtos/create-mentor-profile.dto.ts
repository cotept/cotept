import { ApiProperty, PickType } from "@nestjs/swagger"
import { IsArray, IsInt } from "class-validator"

import { MentorProfileDto } from "./mentor-profile.dto"

export class CreateMentorProfileDto extends PickType(MentorProfileDto, [
  "userId",
  "introductionTitle",
  "introductionContent",
] as const) {
  @ApiProperty({
    description: "멘토의 기술 스택 및 직무 태그 ID 목록",
    type: [Number],
    example: [1, 5, 10],
  })
  @IsArray()
  @IsInt({ each: true })
  tagIds: number[]
}
