import { HttpStatus } from "@nestjs/common"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

/**
 * API 공통 응답 형식
 */
export class ApiResponse<T> {
  @ApiProperty({ description: "HTTP 상태 코드", example: 200 })
  statusCode: HttpStatus

  @ApiProperty({ description: "성공 여부", example: true })
  success: boolean

  @ApiPropertyOptional({ description: "응답 메시지", example: "성공적으로 처리되었습니다." })
  message?: string

  @ApiPropertyOptional({ description: "응답 데이터" })
  data?: T

  constructor(statusCode: HttpStatus, success: boolean, message?: string, data?: T) {
    this.statusCode = statusCode
    this.success = success
    this.message = message
    this.data = data
  }

  static success<T>(
    statusCode: HttpStatus = HttpStatus.OK,
    data: T,
    message: string = "성공적으로 처리되었습니다.",
  ): ApiResponse<T> {
    return new ApiResponse<T>(statusCode, true, message, data)
  }
  static fail<T>(statusCode: HttpStatus, message: string): ApiResponse<T> {
    return new ApiResponse<T>(statusCode, false, message)
  }
}

// 단일 리소스 응답을 위한 제네릭 클래스
export class GetOneResponse<T> {
  @ApiProperty()
  data: T
}

// 리소스 페이지네이션 목록 응답을 위한 제네릭 클래스
export class GetListResponse<T> {
  @ApiProperty({ description: "총 항목 수", example: 100 })
  total: number

  @ApiProperty({ description: "현재 페이지", example: 1 })
  page: number

  @ApiProperty({ description: "총 페이지 수", example: 10 })
  totalPages: number

  @ApiProperty({ description: "페이지당 항목 수", example: 10 })
  pageSize: number

  @ApiProperty({ isArray: true })
  items: T[]
}

// 생성 응답
export class PostOneResponse {
  @ApiProperty({ description: "생성된 리소스 ID", example: "123e4567-e89b-12d3-a456-426614174000" })
  id: string
}

// 업데이트 성공 응답
export class PutOneResponse {
  @ApiProperty({ description: "수정된 항목 수", example: 1 })
  affected: number
}

// 삭제 성공 응답
export class DeletOneResponse {
  @ApiProperty({ description: "삭제된 항목 수", example: 1 })
  affected: number
}
