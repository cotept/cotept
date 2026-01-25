import { AUTH_ERROR_TYPES } from "./types"

import type { AuthErrorInfo } from "./types"

export const AUTH_ERROR_MESSAGES: Record<string, AuthErrorInfo> = {
  [AUTH_ERROR_TYPES.CREDENTIALS_SIGNIN]: {
    message: "로그인에 실패했습니다.",
    description: "이메일 또는 비밀번호를 확인해주세요.",
    action: "다시 시도하거나 비밀번호 재설정을 이용해주세요.",
  },
  [AUTH_ERROR_TYPES.OAUTH_SIGNIN]: {
    message: "소셜 로그인에 실패했습니다.",
    description: "소셜 계정 연동 중 문제가 발생했습니다.",
    action: "잠시 후 다시 시도해주세요.",
  },
  [AUTH_ERROR_TYPES.OAUTH_CALLBACK]: {
    message: "소셜 로그인 처리 중 오류가 발생했습니다.",
    description: "인증 서버에서 오류가 발생했습니다.",
    action: "다시 로그인을 시도해주세요.",
  },
  [AUTH_ERROR_TYPES.ACCESS_DENIED]: {
    message: "접근이 거부되었습니다.",
    description: "로그인 권한이 없거나 계정이 비활성화되었습니다.",
    action: "관리자에게 문의하거나 계정 상태를 확인해주세요.",
  },
  [AUTH_ERROR_TYPES.ACCOUNT_NOT_LINKED]: {
    message: "계정 연결에 실패했습니다.",
    description: "이미 다른 방법으로 가입된 계정입니다.",
    action: "기존 로그인 방법을 사용하거나 계정을 연결해주세요.",
  },
  [AUTH_ERROR_TYPES.EMAIL_SIGNIN]: {
    message: "이메일 로그인에 실패했습니다.",
    description: "이메일 발송 중 문제가 발생했습니다.",
    action: "이메일 주소를 확인하고 다시 시도해주세요.",
  },
  default: {
    message: "인증 중 오류가 발생했습니다.",
    description: "예상치 못한 오류가 발생했습니다.",
    action: "잠시 후 다시 시도해주세요.",
  },
}

export function getAuthErrorMessage(errorType?: string): AuthErrorInfo {
  return AUTH_ERROR_MESSAGES[errorType || ""] || AUTH_ERROR_MESSAGES.default
}
