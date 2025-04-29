// src/common/utils/error.utils.ts
export class ErrorUtils {
  /**
   * 오류 객체에서 메시지를 안전하게 추출하는 유틸리티 함수
   * @param error 처리할 오류 객체 (unknown 타입)
   * @returns 오류 메시지 문자열
   */
  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
  }

  /**
   * 오류 객체에서 스택 정보를 안전하게 추출하는 유틸리티 함수
   * @param error 처리할 오류 객체 (unknown 타입)
   * @returns 오류 스택 문자열 또는 undefined
   */
  static getErrorStack(error: unknown): string | undefined {
    if (error instanceof Error) return error.stack
    return undefined
  }

  /**
   * 오류 객체가 Error 인스턴스인지 확인하는 타입 가드 함수
   * @param error 확인할 오류 객체
   * @returns Error 인스턴스 여부
   */
  static isError(error: unknown): error is Error {
    return error instanceof Error
  }
}
