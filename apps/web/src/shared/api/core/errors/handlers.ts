import { AxiosError } from "axios"

import { getApiErrorMessage } from "./messages"

import { ErrorType, ProcessedError } from "@/shared/api/core/types"

export class ApiErrorHandler {
  static process(error: unknown): ProcessedError {
    if (error instanceof AxiosError) {
      return this.processAxiosError(error)
    }

    if (error instanceof Error) {
      return {
        type: ErrorType.UNKNOWN_ERROR,
        message: error.message || getApiErrorMessage(ErrorType.UNKNOWN_ERROR).message,
        originalError: error,
        retryable: false,
      }
    }

    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: getApiErrorMessage(ErrorType.UNKNOWN_ERROR).message,
      originalError: new Error(String(error)),
      retryable: false,
    }
  }

  private static processAxiosError(error: AxiosError): ProcessedError {
    const statusCode = error.response?.status

    if (!statusCode) {
      const errorInfo = getApiErrorMessage(ErrorType.NETWORK_ERROR)
      return {
        type: ErrorType.NETWORK_ERROR,
        message: errorInfo.message,
        originalError: error,
        retryable: true,
      }
    }

    const errorType = this.getErrorTypeFromStatus(statusCode)
    const customMessage = this.extractErrorMessage(error)
    const defaultMessage = getApiErrorMessage(errorType).message

    return {
      type: errorType,
      message: customMessage || defaultMessage,
      originalError: error,
      statusCode,
      retryable: this.isRetryable(errorType),
    }
  }

  private static getErrorTypeFromStatus(statusCode: number): ErrorType {
    switch (true) {
      case statusCode === 401:
        return ErrorType.AUTHENTICATION_ERROR
      case statusCode === 403:
        return ErrorType.AUTHORIZATION_ERROR
      case statusCode === 409:
        return ErrorType.VALIDATION_ERROR
      case statusCode >= 400 && statusCode < 500:
        return ErrorType.VALIDATION_ERROR
      case statusCode >= 500:
        return ErrorType.SERVER_ERROR
      default:
        return ErrorType.CLIENT_ERROR
    }
  }

  private static isRetryable(errorType: ErrorType): boolean {
    return [ErrorType.NETWORK_ERROR, ErrorType.SERVER_ERROR].includes(errorType)
  }

  private static extractErrorMessage(error: AxiosError): string | null {
    const responseData = error.response?.data as any

    if (responseData?.message) {
      return responseData.message
    }

    if (responseData?.error) {
      return responseData.error
    }

    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
      return responseData.errors[0].message || responseData.errors[0]
    }

    return null
  }

  static shouldRetry(error: ProcessedError, retryCount: number): boolean {
    const maxRetries = 3

    if (retryCount >= maxRetries || !error.retryable) {
      return false
    }

    return [ErrorType.NETWORK_ERROR, ErrorType.SERVER_ERROR].includes(error.type)
  }

  static getRetryDelay(retryCount: number): number {
    return Math.min(1000 * Math.pow(2, retryCount), 10000)
  }

  static logError(error: ProcessedError, context?: string) {
    console.error(`[ApiError${context ? ` - ${context}` : ""}]:`, {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      stack: error.originalError.stack,
    })
  }
}

export const handleApiError = (error: unknown): ProcessedError => {
  return ApiErrorHandler.process(error)
}
