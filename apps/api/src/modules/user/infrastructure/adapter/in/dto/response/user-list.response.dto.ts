import { ApiProperty } from "@nestjs/swagger"

import { Expose, Type } from "class-transformer"

import { UserDto } from "../../../../../application/dto/user.dto"

/**
 * 사용자 목록 응답 DTO
 * 페이지네이션 정보와 사용자 목록을 포함
 */
export class UserListResponseDto {
  @ApiProperty({
    description: "사용자 목록",
    type: [UserDto],
  })
  @Expose()
  @Type(() => UserDto)
  users: UserDto[]

  @ApiProperty({
    description: "총 사용자 수",
    example: 150,
  })
  @Expose()
  totalCount: number

  @ApiProperty({
    description: "현재 페이지",
    example: 1,
  })
  @Expose()
  currentPage: number

  @ApiProperty({
    description: "페이지당 항목 수",
    example: 10,
  })
  @Expose()
  pageSize: number

  @ApiProperty({
    description: "총 페이지 수",
    example: 15,
  })
  @Expose()
  totalPages: number

  @ApiProperty({
    description: "다음 페이지 존재 여부",
    example: true,
  })
  @Expose()
  hasNext: boolean

  @ApiProperty({
    description: "이전 페이지 존재 여부",
    example: false,
  })
  @Expose()
  hasPrevious: boolean
}
