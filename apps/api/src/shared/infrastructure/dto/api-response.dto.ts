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
 * 모든 HTTP 예외에 대한 표준화된 에러 응답 구조
 */
export class ErrorResponse {
  @ApiProperty({ 
    description: "HTTP 상태 코드", 
    example: 400,
    examples: {
      badRequest: { value: 400, description: "잘못된 요청" },
      unauthorized: { value: 401, description: "인증 실패" },
      forbidden: { value: 403, description: "권한 없음" },
      notFound: { value: 404, description: "리소스 없음" },
      conflict: { value: 409, description: "리소스 충돌" },
      unprocessableEntity: { value: 422, description: "처리 불가능한 엔티티" },
      tooManyRequests: { value: 429, description: "요청 한도 초과" },
      internalServerError: { value: 500, description: "서버 내부 오류" },
      serviceUnavailable: { value: 503, description: "서비스 사용 불가" }
    }
  })
  statusCode: number

  @ApiProperty({ 
    description: "에러 메시지 (사용자에게 표시할 수 있는 메시지)", 
    example: "잘못된 요청입니다.",
    examples: {
      validation: { value: "입력 데이터의 유효성 검사에 실패했습니다.", description: "유효성 검사 실패" },
      authentication: { value: "인증이 필요합니다.", description: "인증 실패" },
      authorization: { value: "해당 작업을 수행할 권한이 없습니다.", description: "권한 부족" },
      notFound: { value: "요청한 리소스를 찾을 수 없습니다.", description: "리소스 없음" },
      conflict: { value: "이미 존재하는 데이터입니다.", description: "데이터 충돌" },
      rateLimit: { value: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.", description: "Rate Limit" },
      serverError: { value: "서버 내부 오류가 발생했습니다.", description: "서버 오류" },
      serviceUnavailable: { value: "서비스를 일시적으로 사용할 수 없습니다.", description: "서비스 장애" }
    }
  })
  message: string

  @ApiPropertyOptional({ 
    description: "에러 코드 (프로그래밍적 처리를 위한 고유 식별자)", 
    example: "VALIDATION_ERROR",
    examples: {
      validation: { value: "VALIDATION_ERROR", description: "유효성 검사 오류" },
      emailExists: { value: "EMAIL_ALREADY_EXISTS", description: "이메일 중복" },
      userNotFound: { value: "USER_NOT_FOUND", description: "사용자 없음" },
      invalidCredentials: { value: "INVALID_CREDENTIALS", description: "잘못된 인증 정보" },
      insufficientPermissions: { value: "INSUFFICIENT_PERMISSIONS", description: "권한 부족" },
      rateLimitExceeded: { value: "RATE_LIMIT_EXCEEDED", description: "요청 한도 초과" },
      externalApiError: { value: "EXTERNAL_API_ERROR", description: "외부 API 오류" },
      mailServiceError: { value: "MAIL_SERVICE_ERROR", description: "메일 서비스 오류" }
    }
  })
  code?: string

  @ApiPropertyOptional({ 
    description: "에러 상세 정보 (필드별 유효성 검사 오류, 추가 컨텍스트 등)",
    example: [
      { field: "email", message: "올바른 이메일 형식이 아닙니다." },
      { field: "password", message: "비밀번호는 8자 이상이어야 합니다." }
    ],
    examples: {
      validationErrors: {
        value: [
          { field: "email", message: "올바른 이메일 형식이 아닙니다." },
          { field: "password", message: "비밀번호는 8자 이상이어야 합니다." }
        ],
        description: "필드별 유효성 검사 오류"
      },
      conflictDetails: {
        value: [
          { resource: "email", value: "user@example.com", reason: "이미 사용 중인 이메일입니다." }
        ],
        description: "리소스 충돌 상세 정보"
      },
      rateLimitDetails: {
        value: [
          { 
            limit: 5, 
            remaining: 0, 
            resetTime: "2024-01-01T12:30:00Z", 
            retryAfter: 1800 
          }
        ],
        description: "Rate Limit 상세 정보"
      }
    }
  })
  details?: any[]

  @ApiPropertyOptional({
    description: "에러 발생 시각 (ISO 8601 형식)",
    example: "2024-01-01T12:00:00Z"
  })
  timestamp?: string

  @ApiPropertyOptional({
    description: "요청 경로",
    example: "/api/v1/users"
  })
  path?: string

  @ApiPropertyOptional({
    description: "요청 추적 ID (디버깅 목적)",
    example: "req_123e4567-e89b-12d3-a456-426614174000"
  })
  traceId?: string

  constructor(
    statusCode: number, 
    message: string, 
    code?: string, 
    details?: any[], 
    timestamp?: string, 
    path?: string, 
    traceId?: string
  ) {
    this.statusCode = statusCode
    this.message = message
    this.code = code
    this.details = details
    this.timestamp = timestamp || new Date().toISOString()
    this.path = path
    this.traceId = traceId
  }

  static create(
    statusCode: number, 
    message: string, 
    code?: string, 
    details?: any[],
    path?: string,
    traceId?: string
  ): ErrorResponse {
    return new ErrorResponse(statusCode, message, code, details, undefined, path, traceId)
  }

  /**
   * 유효성 검사 오류를 위한 팩토리 메서드
   */
  static createValidationError(
    message: string = "입력 데이터의 유효성 검사에 실패했습니다.",
    validationErrors: Array<{ field: string; message: string }> = [],
    path?: string
  ): ErrorResponse {
    return new ErrorResponse(
      400,
      message,
      "VALIDATION_ERROR",
      validationErrors,
      new Date().toISOString(),
      path
    )
  }

  /**
   * 인증 오류를 위한 팩토리 메서드
   */
  static createAuthenticationError(
    message: string = "인증이 필요합니다.",
    path?: string
  ): ErrorResponse {
    return new ErrorResponse(
      401,
      message,
      "AUTHENTICATION_REQUIRED",
      undefined,
      new Date().toISOString(),
      path
    )
  }

  /**
   * 권한 오류를 위한 팩토리 메서드
   */
  static createAuthorizationError(
    message: string = "해당 작업을 수행할 권한이 없습니다.",
    path?: string
  ): ErrorResponse {
    return new ErrorResponse(
      403,
      message,
      "INSUFFICIENT_PERMISSIONS",
      undefined,
      new Date().toISOString(),
      path
    )
  }

  /**
   * 리소스 없음 오류를 위한 팩토리 메서드
   */
  static createNotFoundError(
    message: string = "요청한 리소스를 찾을 수 없습니다.",
    resourceType?: string,
    resourceId?: string,
    path?: string
  ): ErrorResponse {
    const details = resourceType && resourceId 
      ? [{ resourceType, resourceId }] 
      : undefined

    return new ErrorResponse(
      404,
      message,
      "RESOURCE_NOT_FOUND",
      details,
      new Date().toISOString(),
      path
    )
  }

  /**
   * 리소스 충돌 오류를 위한 팩토리 메서드
   */
  static createConflictError(
    message: string = "요청한 작업이 현재 리소스 상태와 충돌합니다.",
    conflictDetails?: Array<{ resource: string; value: any; reason: string }>,
    path?: string
  ): ErrorResponse {
    return new ErrorResponse(
      409,
      message,
      "RESOURCE_CONFLICT",
      conflictDetails,
      new Date().toISOString(),
      path
    )
  }

  /**
   * Rate Limit 오류를 위한 팩토리 메서드
   */
  static createRateLimitError(
    message: string = "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
    limit?: number,
    remaining?: number,
    resetTime?: string,
    retryAfter?: number,
    path?: string
  ): ErrorResponse {
    const details = limit !== undefined 
      ? [{ limit, remaining, resetTime, retryAfter }] 
      : undefined

    return new ErrorResponse(
      429,
      message,
      "RATE_LIMIT_EXCEEDED",
      details,
      new Date().toISOString(),
      path
    )
  }

  /**
   * 서버 내부 오류를 위한 팩토리 메서드
   */
  static createInternalServerError(
    message: string = "서버 내부 오류가 발생했습니다.",
    path?: string,
    traceId?: string
  ): ErrorResponse {
    return new ErrorResponse(
      500,
      message,
      "INTERNAL_SERVER_ERROR",
      undefined,
      new Date().toISOString(),
      path,
      traceId
    )
  }

  /**
   * 서비스 사용 불가 오류를 위한 팩토리 메서드
   */
  static createServiceUnavailableError(
    message: string = "서비스를 일시적으로 사용할 수 없습니다.",
    serviceName?: string,
    estimatedRecoveryTime?: string,
    path?: string
  ): ErrorResponse {
    const details = serviceName 
      ? [{ serviceName, estimatedRecoveryTime }] 
      : undefined

    return new ErrorResponse(
      503,
      message,
      "SERVICE_UNAVAILABLE",
      details,
      new Date().toISOString(),
      path
    )
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
