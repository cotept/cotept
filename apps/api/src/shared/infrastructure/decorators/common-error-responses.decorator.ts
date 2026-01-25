import { applyDecorators } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiRequestTimeoutResponse,
  ApiServiceUnavailableResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger"

/**
 * 모든 API에서 공통으로 발생할 수 있는 에러 응답
 */
export function CommonErrorResponses() {
  return applyDecorators(
    ApiInternalServerErrorResponse({
      description: "서버 내부 오류",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 500 },
          message: { type: "string", example: "서버 내부 오류가 발생했습니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
  )
}

/**
 * 인증이 필요한 API에서 발생할 수 있는 에러 응답
 */
export function AuthErrorResponses() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: "인증 실패",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 401 },
          message: { type: "string", example: "인증이 필요합니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
    ApiForbiddenResponse({
      description: "권한 없음",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 403 },
          message: { type: "string", example: "해당 작업을 수행할 권한이 없습니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
  )
}

/**
 * 입력 검증 관련 에러 응답
 */
export function ValidationErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: "잘못된 요청 데이터",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 400 },
          message: { type: "string", example: "잘못된 요청 데이터입니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
    ApiUnprocessableEntityResponse({
      description: "처리할 수 없는 요청",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 422 },
          message: { type: "string", example: "요청은 형식이 맞으나 처리할 수 없습니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
  )
}

/**
 * 리소스 조회 관련 에러 응답
 */
export function ResourceErrorResponses() {
  return applyDecorators(
    ApiNotFoundResponse({
      description: "리소스를 찾을 수 없음",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 404 },
          message: { type: "string", example: "요청한 리소스를 찾을 수 없습니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
  )
}

/**
 * 중복 데이터 관련 에러 응답
 */
export function ConflictErrorResponses() {
  return applyDecorators(
    ApiConflictResponse({
      description: "데이터 충돌",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 409 },
          message: { type: "string", example: "데이터 충돌이 발생했습니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
  )
}

/**
 * 요청 제한 관련 에러 응답
 */
export function RateLimitErrorResponses() {
  return applyDecorators(
    ApiTooManyRequestsResponse({
      description: "요청 제한 초과",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 429 },
          message: { type: "string", example: "요청 제한을 초과했습니다. 잠시 후 다시 시도해주세요." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
  )
}

/**
 * CRUD 작업에서 공통으로 발생하는 에러 응답
 */
export function CrudErrorResponses() {
  return applyDecorators(
    ValidationErrorResponses(),
    ResourceErrorResponses(),
    CommonErrorResponses(),
  )
}

/**
 * 인증이 필요한 CRUD 작업에서 발생하는 에러 응답
 */
export function AuthenticatedCrudErrorResponses() {
  return applyDecorators(
    AuthErrorResponses(),
    ValidationErrorResponses(),
    ResourceErrorResponses(),
    CommonErrorResponses(),
  )
}

/**
 * 생성 작업에서 발생하는 에러 응답
 */
export function CreateErrorResponses() {
  return applyDecorators(
    ValidationErrorResponses(),
    ConflictErrorResponses(),
    CommonErrorResponses(),
  )
}

/**
 * 인증이 필요한 생성 작업에서 발생하는 에러 응답
 */
export function AuthenticatedCreateErrorResponses() {
  return applyDecorators(
    AuthErrorResponses(),
    ValidationErrorResponses(),
    ConflictErrorResponses(),
    CommonErrorResponses(),
  )
}

/**
 * 외부 API 호출이 있는 작업에서 발생하는 에러 응답
 */
export function ExternalApiErrorResponses() {
  return applyDecorators(
    ValidationErrorResponses(),
    ResourceErrorResponses(),
    RateLimitErrorResponses(),
    CommonErrorResponses(),
    {
      apply: (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        // 503 Service Unavailable 응답 추가
        const existingDecorators = Reflect.getMetadata('swagger/apiResponse', target, propertyKey) || []
        existingDecorators.push({
          status: 503,
          description: '외부 서비스 일시적 사용 불가',
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number', example: 503 },
              message: { type: 'string', example: '외부 서비스가 일시적으로 사용할 수 없습니다.' },
              timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            },
          },
        })
        Reflect.defineMetadata('swagger/apiResponse', existingDecorators, target, propertyKey)
      },
    } as any,
  )
}

/**
 * ===== 새로운 통합 데코레이터들 =====
 * 점진적 개선을 위한 실용적 접근
 */

/**
 * 모든 API 엔드포인트에서 발생할 수 있는 표준 에러 응답
 * - 400 Bad Request: 잘못된 요청 데이터
 * - 500 Internal Server Error: 서버 내부 오류
 */
export function ApiStandardErrors() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: "잘못된 요청 데이터",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 400 },
          message: { type: "string", example: "잘못된 요청 데이터입니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: "서버 내부 오류",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 500 },
          message: { type: "string", example: "서버 내부 오류가 발생했습니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
  )
}

/**
 * 인증이 필요한 API 엔드포인트에서 발생할 수 있는 에러 응답
 * - 401 Unauthorized: 인증 실패
 * - 403 Forbidden: 권한 없음
 */
export function ApiAuthRequiredErrors() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: "인증이 필요합니다",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 401 },
          message: { type: "string", example: "인증이 필요합니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
    ApiForbiddenResponse({
      description: "접근 권한이 없습니다",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 403 },
          message: { type: "string", example: "해당 작업을 수행할 권한이 없습니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
  )
}

/**
 * ===== 도메인별 특화 데코레이터들 =====
 */

/**
 * User CRUD 작업에서 자주 발생하는 에러 응답
 * - 404 Not Found: 사용자를 찾을 수 없음
 * - 409 Conflict: 이메일 중복 등
 * - 422 Unprocessable Entity: 처리할 수 없는 요청
 */
export function ApiUserCrudErrors() {
  return applyDecorators(
    ApiNotFoundResponse({
      description: "사용자를 찾을 수 없습니다",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 404 },
          message: { type: "string", example: "요청하신 사용자를 찾을 수 없습니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
    ApiConflictResponse({
      description: "사용자 데이터 충돌",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 409 },
          message: { type: "string", example: "이미 사용 중인 이메일 또는 전화번호입니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
    ApiUnprocessableEntityResponse({
      description: "처리할 수 없는 요청",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 422 },
          message: { type: "string", example: "요청은 형식이 맞으나 처리할 수 없습니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
  )
}

/**
 * Mail 서비스 관련 에러 응답
 * - 429 Too Many Requests: 메일 발송 제한 초과
 * - 503 Service Unavailable: 메일 서비스 사용 불가
 */
export function ApiMailServiceErrors() {
  return applyDecorators(
    ApiTooManyRequestsResponse({
      description: "메일 발송 제한을 초과했습니다",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 429 },
          message: { type: "string", example: "메일 발송 제한을 초과했습니다. 잠시 후 다시 시도해주세요." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
    ApiServiceUnavailableResponse({
      description: "메일 서비스를 사용할 수 없습니다",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 503 },
          message: { type: "string", example: "메일 서비스를 사용할 수 없습니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
  )
}

/**
 * 외부 API 연동 서비스 관련 에러 응답 (Baekjoon/Solved.ac 등)
 * - 408 Request Timeout: 외부 API 응답 시간 초과
 * - 429 Too Many Requests: API 호출 한도 초과
 * - 503 Service Unavailable: 외부 서비스 사용 불가
 */
export function ApiExternalServiceErrors() {
  return applyDecorators(
    ApiRequestTimeoutResponse({
      description: "외부 API 응답 시간이 초과되었습니다",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 408 },
          message: { type: "string", example: "외부 API 응답 시간이 초과되었습니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
    ApiTooManyRequestsResponse({
      description: "API 호출 한도를 초과했습니다",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 429 },
          message: { type: "string", example: "API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
    ApiServiceUnavailableResponse({
      description: "외부 서비스를 사용할 수 없습니다",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 503 },
          message: { type: "string", example: "외부 서비스를 일시적으로 사용할 수 없습니다." },
          timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        },
      },
    }),
  )
}