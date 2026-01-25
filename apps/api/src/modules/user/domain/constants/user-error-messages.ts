/**
 * 사용자 모듈 에러 메시지 상수
 */
export const USER_ERROR_MESSAGES = {
  // 사용자 조회 관련
  USER_NOT_FOUND: "요청하신 사용자를 찾을 수 없습니다.",
  USER_NOT_FOUND_BY_ID: "ID에 해당하는 사용자를 찾을 수 없습니다.",
  USER_NOT_FOUND_BY_EMAIL: "해당 이메일의 사용자를 찾을 수 없습니다.",
  
  // 사용자 생성 관련
  EMAIL_ALREADY_EXISTS: "이미 사용중인 이메일입니다.",
  PHONE_NUMBER_ALREADY_EXISTS: "이미 사용중인 전화번호입니다.",
  USER_CREATION_FAILED: "사용자 생성에 실패했습니다.",
  
  // 사용자 수정 관련
  USER_UPDATE_FAILED: "사용자 정보 수정에 실패했습니다.",
  CANNOT_UPDATE_EMAIL: "이메일은 변경할 수 없습니다.",
  CANNOT_UPDATE_USER_ID: "사용자 ID는 변경할 수 없습니다.",
  
  // 사용자 삭제 관련
  USER_DELETE_FAILED: "사용자 삭제에 실패했습니다.",
  CANNOT_DELETE_SELF: "자신의 계정은 삭제할 수 없습니다.",
  CANNOT_DELETE_ADMIN: "관리자 계정은 삭제할 수 없습니다.",
  
  // 비밀번호 관련
  PASSWORD_CHANGE_FAILED: "비밀번호 변경에 실패했습니다.",
  CURRENT_PASSWORD_INCORRECT: "현재 비밀번호가 올바르지 않습니다.",
  PASSWORD_SAME_AS_CURRENT: "새 비밀번호가 현재 비밀번호와 동일합니다.",
  
  // 유효성 검사 관련
  INVALID_EMAIL_FORMAT: "유효한 이메일 형식이 아닙니다.",
  INVALID_PHONE_NUMBER: "유효한 전화번호 형식이 아닙니다.",
  INVALID_NAME_FORMAT: "이름은 한글과 영문자만 허용됩니다.",
  NAME_TOO_SHORT: "이름은 2자 이상이어야 합니다.",
  NAME_TOO_LONG: "이름은 50자 이하여야 합니다.",
  
  // 권한 관련
  INSUFFICIENT_PERMISSION: "해당 작업을 수행할 권한이 없습니다.",
  ADMIN_ROLE_REQUIRED: "관리자 권한이 필요합니다.",
  CANNOT_MODIFY_OTHER_USER: "다른 사용자의 정보는 수정할 수 없습니다.",
  
  // 계정 상태 관련
  ACCOUNT_SUSPENDED: "정지된 계정입니다.",
  ACCOUNT_INACTIVE: "비활성화된 계정입니다.",
  EMAIL_NOT_VERIFIED: "이메일 인증이 완료되지 않았습니다.",
  
  // 페이징 관련
  INVALID_PAGE_NUMBER: "유효하지 않은 페이지 번호입니다.",
  INVALID_PAGE_SIZE: "유효하지 않은 페이지 크기입니다.",
  PAGE_SIZE_TOO_LARGE: "페이지 크기가 너무 큽니다. 최대 100개까지 조회 가능합니다.",
  
  // 일반적인 에러
  INVALID_REQUEST_DATA: "잘못된 요청 데이터입니다.",
  INTERNAL_SERVER_ERROR: "서버 내부 오류가 발생했습니다.",
  DATABASE_ERROR: "데이터베이스 오류가 발생했습니다.",
} as const

export type UserErrorMessage = typeof USER_ERROR_MESSAGES[keyof typeof USER_ERROR_MESSAGES]