/**
 * 인증 모듈 에러 메시지 상수
 */
export const AUTH_ERROR_MESSAGES = {
  // 인증 실패 관련
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.",
  ACCOUNT_DEACTIVATED: "비활성화된 계정입니다. 관리자에게 문의하세요.",
  ACCOUNT_NOT_ACTIVE: "계정이 활성화되지 않았습니다.",
  
  // 토큰 관련
  INVALID_TOKEN: "잘못된 토큰입니다.",
  TOKEN_EXPIRED: "토큰이 만료되었습니다. 다시 로그인해주세요.",
  TOKEN_VALIDATION_FAILED: "토큰 검증에 실패했습니다.",
  INVALID_REFRESH_TOKEN: "유효하지 않은 리프레시 토큰입니다.",
  TOKEN_REUSE_DETECTED: "비정상적인 토큰 사용이 감지되었습니다. 다시 로그인해주세요.",
  TOKEN_THEFT_SUSPECTED: "토큰 도난이 의심됩니다. 모든 세션을 로그아웃 처리하였습니다. 안전한 환경에서 다시 로그인해주세요.",
  
  // 인증 코드 관련
  VERIFICATION_FAILED: "인증 코드 검증에 실패했습니다.",
  VERIFICATION_CODE_EXPIRED: "인증 시간이 만료되었습니다. 다시 시도해주세요.",
  VERIFICATION_CODE_MISMATCH: "인증 코드가 일치하지 않습니다.",
  VERIFICATION_ATTEMPTS_EXCEEDED: "인증 시도 횟수를 초과했습니다. 다시 인증 코드를 요청해주세요.",
  INVALID_VERIFICATION_DATA: "유효하지 않은 인증 정보입니다.",
  
  // 비밀번호 관련
  PASSWORD_UPDATE_FAILED: "비밀번호 재설정에 실패하였습니다. 다시 시도해주세요.",
  INVALID_PASSWORD_FORMAT: "비밀번호 형식이 올바르지 않습니다.",
  
  // 사용자 찾기 관련
  USER_NOT_FOUND: "해당 이메일을 가진 사용자를 찾을 수 없습니다.",
  USER_NOT_FOUND_BY_ID: "해당 ID의 사용자를 찾을 수 없습니다.",
  
  // 중복 확인 관련
  EMAIL_ALREADY_EXISTS: "이미 사용 중인 이메일입니다.",
  USERID_ALREADY_EXISTS: "이미 사용 중인 아이디입니다.",
  NICKNAME_ALREADY_EXISTS: "이미 사용 중인 닉네임입니다.",
  
  // 요청 제한 관련
  RATE_LIMIT_EXCEEDED: "요청 제한을 초과했습니다. 잠시 후 다시 시도해주세요.",
  TOO_MANY_LOGIN_ATTEMPTS: "로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.",
  
  // 소셜 로그인 관련
  SOCIAL_AUTH_FAILED: "소셜 로그인에 실패했습니다.",
  SOCIAL_ACCOUNT_NOT_LINKED: "연결된 소셜 계정이 없습니다.",
  SOCIAL_LINK_CONFIRMATION_REQUIRED: "소셜 계정 연결 확인이 필요합니다.",
  
  // 일반적인 에러
  INVALID_REQUEST_DATA: "잘못된 요청 데이터입니다.",
  AUTHENTICATION_REQUIRED: "인증이 필요합니다.",
  INTERNAL_SERVER_ERROR: "서버 내부 오류가 발생했습니다.",
} as const

export type AuthErrorMessage = typeof AUTH_ERROR_MESSAGES[keyof typeof AUTH_ERROR_MESSAGES]