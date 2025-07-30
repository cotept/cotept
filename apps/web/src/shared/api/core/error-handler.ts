import { AxiosError } from 'axios';

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ProcessedError {
  type: ErrorType;
  message: string;
  originalError: Error;
  statusCode?: number;
  retryable: boolean;
}

export class ApiErrorHandler {
  static process(error: unknown): ProcessedError {
    if (error instanceof AxiosError) {
      return this.processAxiosError(error);
    }
    
    if (error instanceof Error) {
      return {
        type: ErrorType.UNKNOWN_ERROR,
        message: error.message || '알 수 없는 오류가 발생했습니다.',
        originalError: error,
        retryable: false
      };
    }

    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: '알 수 없는 오류가 발생했습니다.',
      originalError: new Error(String(error)),
      retryable: false
    };
  }

  private static processAxiosError(error: AxiosError): ProcessedError {
    const statusCode = error.response?.status;
    
    if (!statusCode) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: '네트워크 연결을 확인해주세요.',
        originalError: error,
        retryable: true
      };
    }

    switch (true) {
      case statusCode === 401:
        return {
          type: ErrorType.AUTHENTICATION_ERROR,
          message: '로그인이 필요합니다.',
          originalError: error,
          statusCode,
          retryable: false
        };

      case statusCode === 403:
        return {
          type: ErrorType.AUTHORIZATION_ERROR,
          message: '접근 권한이 없습니다.',
          originalError: error,
          statusCode,
          retryable: false
        };

      case statusCode >= 400 && statusCode < 500:
        return {
          type: ErrorType.VALIDATION_ERROR,
          message: this.extractErrorMessage(error) || '잘못된 요청입니다.',
          originalError: error,
          statusCode,
          retryable: false
        };

      case statusCode >= 500:
        return {
          type: ErrorType.SERVER_ERROR,
          message: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          originalError: error,
          statusCode,
          retryable: true
        };

      default:
        return {
          type: ErrorType.CLIENT_ERROR,
          message: '요청 처리 중 오류가 발생했습니다.',
          originalError: error,
          statusCode,
          retryable: false
        };
    }
  }

  private static extractErrorMessage(error: AxiosError): string | null {
    const responseData = error.response?.data as any;
    
    if (responseData?.message) {
      return responseData.message;
    }
    
    if (responseData?.error) {
      return responseData.error;
    }
    
    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
      return responseData.errors[0].message || responseData.errors[0];
    }
    
    return null;
  }

  static shouldRetry(error: ProcessedError, retryCount: number): boolean {
    const maxRetries = 3;
    
    if (retryCount >= maxRetries) {
      return false;
    }
    
    if (!error.retryable) {
      return false;
    }
    
    if (error.type === ErrorType.NETWORK_ERROR) {
      return true;
    }
    
    if (error.type === ErrorType.SERVER_ERROR && error.statusCode && error.statusCode >= 500) {
      return true;
    }
    
    return false;
  }

  static getRetryDelay(retryCount: number): number {
    return Math.min(1000 * Math.pow(2, retryCount), 10000);
  }
}

export const handleApiError = (error: unknown): ProcessedError => {
  return ApiErrorHandler.process(error);
};