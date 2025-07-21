import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

/**
 * API 공통 응답 형식
 */
export class ApiResponse<T> {
  @ApiPropertyOptional({ description: "응답 메시지", example: "성공적으로 처리되었습니다." })
  message?: string

  @ApiPropertyOptional({ description: "응답 데이터" })
  data?: T

  constructor(message?: string, data?: T) {
    this.message = message
    this.data = data
  }

  static success<T>(
    data: T,
    message?: string,
  ): ApiResponse<T> {
    return new ApiResponse<T>(message, data)
  }
}

/**
 * API 에러 응답 형식
 */
export class ErrorResponse {
  @ApiProperty({ description: "HTTP 상태 코드", example: 400 })
  statusCode: number

  @ApiProperty({ description: "에러 메시지", example: "잘못된 요청입니다." })
  message: string

  @ApiPropertyOptional({ description: "에러 코드", example: "VALIDATION_ERROR" })
  code?: string

  @ApiPropertyOptional({ description: "에러 상세 정보" })
  details?: any[]

  constructor(statusCode: number, message: string, code?: string, details?: any[]) {
    this.statusCode = statusCode
    this.message = message
    this.code = code
    this.details = details
  }

  static create(
    statusCode: number, 
    message: string, 
    code?: string, 
    details?: any[]
  ): ErrorResponse {
    return new ErrorResponse(statusCode, message, code, details)
  }
}

export class ListData<T> {
  @ApiProperty({ description: "총 항목 수", example: 100 })
  total: number

  @ApiProperty({ description: "현재 페이지", example: 1 })
  page: number

  @ApiProperty({ description: "총 페이지 수", example: 10 })
  totalPages: number

  @ApiProperty({ description: "페이지당 항목 수", example: 10 })
  pageSize: number

  @ApiProperty({ description: "항목 목록", isArray: true })
  items: T[]

  constructor(items: T[], total: number, page: number, pageSize: number) {
    this.items = items
    this.total = total
    this.page = page
    this.pageSize = pageSize
    this.totalPages = Math.ceil(total / pageSize)
  }
}

// base.repository.ts 호환용 별칭
export class PaginatedResult<T> {
  @ApiProperty({ description: "항목 목록", isArray: true })
  items: T[]

  @ApiProperty({ description: "총 항목 수", example: 100 })
  totalItemCount: number

  @ApiProperty({ description: "현재 페이지", example: 1 })
  currentPage: number

  @ApiProperty({ description: "페이지당 항목 수", example: 10 })
  limit: number

  @ApiProperty({ description: "총 페이지 수", example: 10 })
  totalPageCount: number

  constructor(items: T[], totalItemCount: number, currentPage: number, limit: number) {
    this.items = items
    this.totalItemCount = totalItemCount
    this.currentPage = currentPage
    this.limit = limit
    this.totalPageCount = Math.ceil(totalItemCount / limit)
  }
}

export class PaginationOptions {
  @ApiProperty({ description: "현재 페이지", example: 1 })
  currentPage: number

  @ApiProperty({ description: "페이지당 항목 수", example: 10 })
  limit: number

  constructor(currentPage: number = 1, limit: number = 10) {
    this.currentPage = currentPage
    this.limit = limit
  }
}

// 생성 응답 데이터
export class CreateData {
  @ApiProperty({ description: "생성된 리소스 ID", example: "123e4567-e89b-12d3-a456-426614174000" })
  id: string
}

// 업데이트 응답 데이터
export class UpdateData {
  @ApiProperty({ description: "수정된 항목 수", example: 1 })
  affected: number
}

// 삭제 응답 데이터
export class DeleteData {
  @ApiProperty({ description: "삭제된 항목 수", example: 1 })
  affected: number
}
