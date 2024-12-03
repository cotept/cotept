// src/modules/auth/exceptions/auth.exception.ts
import { HttpException, HttpStatus } from "@nestjs/common"

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "TOKEN_INVALID"
  | "TOKEN_EXPIRED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VERIFICATION_FAILED"
  | "RATE_LIMIT_EXCEEDED"
  | "REGISTRATION_ERROR"
  | "VALIDATION_ERROR"

export interface AuthErrorResponse {
  code: AuthErrorCode
  message: string
  details?: Record<string, any>
}

export class AuthException extends HttpException {
  constructor(error: AuthErrorResponse) {
    const statusCode = getHttpStatus(error.code)
    super(
      {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      statusCode,
    )
  }
}

function getHttpStatus(code: AuthErrorCode): HttpStatus {
  switch (code) {
    case "INVALID_CREDENTIALS":
    case "TOKEN_INVALID":
    case "TOKEN_EXPIRED":
    case "UNAUTHORIZED":
      return HttpStatus.UNAUTHORIZED
    case "FORBIDDEN":
      return HttpStatus.FORBIDDEN
    case "RATE_LIMIT_EXCEEDED":
      return HttpStatus.TOO_MANY_REQUESTS
    case "VALIDATION_ERROR":
      return HttpStatus.BAD_REQUEST
    case "REGISTRATION_ERROR":
    case "VERIFICATION_FAILED":
      return HttpStatus.BAD_REQUEST
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR
  }
}
