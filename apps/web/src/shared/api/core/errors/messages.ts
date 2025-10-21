import { ApiErrorInfo, ErrorType } from "@/shared/api/core/types"

export const API_ERROR_MESSAGES: Record<ErrorType, ApiErrorInfo> = {
  [ErrorType.NETWORK_ERROR]: {
    message: "네트워크 연결을 확인해주세요.",
    description: "인터넷 연결이 불안정하거나 서버에 접근할 수 없습니다.",
    action: "네트워크 상태를 확인하고 다시 시도해주세요.",
  },
  [ErrorType.AUTHENTICATION_ERROR]: {
    message: "로그인이 필요합니다.",
    description: "인증 정보가 만료되었거나 유효하지 않습니다.",
    action: "다시 로그인해주세요.",
  },
  [ErrorType.AUTHORIZATION_ERROR]: {
    message: "접근 권한이 없습니다.",
    description: "해당 리소스에 접근할 권한이 없습니다.",
    action: "관리자에게 문의하거나 권한을 요청해주세요.",
  },
  [ErrorType.VALIDATION_ERROR]: {
    message: "잘못된 요청입니다.",
    description: "입력한 정보가 올바르지 않습니다.",
    action: "입력 내용을 확인하고 다시 시도해주세요.",
  },
  [ErrorType.SERVER_ERROR]: {
    message: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
    description: "일시적인 서버 오류입니다.",
    action: "잠시 후 다시 시도해주세요.",
  },
  [ErrorType.CLIENT_ERROR]: {
    message: "요청 처리 중 오류가 발생했습니다.",
    description: "클라이언트 요청에 문제가 있습니다.",
    action: "요청 내용을 확인하고 다시 시도해주세요.",
  },
  [ErrorType.UNKNOWN_ERROR]: {
    message: "알 수 없는 오류가 발생했습니다.",
    description: "예상치 못한 오류가 발생했습니다.",
    action: "문제가 지속되면 관리자에게 문의해주세요.",
  },
}

export function getApiErrorMessage(errorType: ErrorType): ApiErrorInfo {
  return API_ERROR_MESSAGES[errorType]
}
