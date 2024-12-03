export const AuthErrorMessage = {
  VALIDATION: {
    EMAIL: {
      INVALID_FORMAT: "올바른 이메일 형식이 아닙니다",
      DUPLICATE: "이미 사용 중인 이메일입니다",
      NOT_FOUND: "등록되지 않은 이메일입니다",
      NOT_VERIFIED: "이메일 인증이 필요합니다",
    },
    PASSWORD: {
      INVALID_FORMAT:
        "비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다",
      MISMATCH: "비밀번호가 일치하지 않습니다",
      WRONG: "잘못된 비밀번호입니다",
    },
    BOJ_ID: {
      INVALID_FORMAT: "백준 ID는 3~20자의 영문과 숫자만 사용 가능합니다",
      DUPLICATE: "이미 사용 중인 백준 ID입니다",
      NOT_FOUND: "존재하지 않는 백준 ID입니다",
      NOT_VERIFIED: "백준 ID 인증이 필요합니다",
    },
    PHONE: {
      INVALID_FORMAT: "올바른 전화번호 형식이 아닙니다",
      DUPLICATE: "이미 사용 중인 전화번호입니다",
      NOT_VERIFIED: "전화번호 인증이 필요합니다",
    },
  },
  AUTH: {
    INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다",
    TOKEN: {
      INVALID: "유효하지 않은 토큰입니다",
      EXPIRED: "만료된 토큰입니다",
      REFRESH_FAILED: "토큰 갱신에 실패했습니다",
    },
    UNAUTHORIZED: "인증이 필요합니다",
    FORBIDDEN: "접근 권한이 없습니다",
  },
  REGISTRATION: {
    INVALID_PROGRESS_ID: "유효하지 않은 회원가입 진행 정보입니다",
    EXPIRED: "회원가입 진행 시간이 만료되었습니다",
    ALREADY_COMPLETED: "이미 완료된 회원가입입니다",
  },
  SOCIAL: {
    INVALID_TOKEN: "유효하지 않은 소셜 토큰입니다",
    PROVIDER_ERROR: "소셜 로그인 제공자 연동 중 오류가 발생했습니다",
    EMAIL_REQUIRED: "이메일 정보 제공 동의가 필요합니다",
  },
  VERIFICATION: {
    CODE: {
      INVALID: "유효하지 않은 인증 코드입니다",
      EXPIRED: "만료된 인증 코드입니다",
      EXCEED_ATTEMPTS: "인증 시도 횟수를 초과했습니다",
      ALREADY_VERIFIED: "이미 인증이 완료되었습니다",
    },
    REQUEST: {
      TOO_MANY_REQUESTS:
        "너무 많은 인증 요청이 있었습니다. 잠시 후 다시 시도해주세요",
      DAILY_LIMIT: "일일 최대 발송 횟수를 초과했습니다",
      FAILED: "인증 코드 발송에 실패했습니다",
    },
  },
} as const
