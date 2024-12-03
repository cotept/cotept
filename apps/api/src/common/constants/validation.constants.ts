export const ValidationPatterns = {
  PASSWORD: {
    PATTERN: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
    MESSAGE: "비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다",
  },
  BOJ_ID: {
    PATTERN: /^[A-Za-z0-9]{3,20}$/,
    MESSAGE: "백준 ID는 3~20자의 영문과 숫자만 사용 가능합니다",
  },
  PHONE: {
    PATTERN: /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/,
    MESSAGE: "올바른 전화번호 형식이 아닙니다",
  },
  EMAIL: {
    MESSAGE: "올바른 이메일 형식이 아닙니다",
  },
} as const

export const ValidationRules = {
  EMAIL: {
    MAX_LENGTH: 255,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 20,
  },
  BOJ_ID: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
  },
  LOGIN: {
    MAX_ATTEMPTS: 5,
    LOCK_TIME_MINUTES: 30,
  },
  VERIFICATION: {
    MAX_ATTEMPTS: 5, // 최대 시도 횟수
    EXPIRY_MINUTES: 3, // 인증 코드 만료 시간 (분)
    DAILY_LIMIT: 3, // 일일 최대 발송 횟수
    CODE_LENGTH: 6, // 인증 코드 길이 (생성 시 사용)
    BLOCK_MINUTES: 30, // 시도 초과 시 차단 시간 (분)
    RATE_LIMIT: {
      WINDOW_MS: 60 * 1000, // 시간 창 (1분)
      MAX_REQUESTS: 3, // 시간 창 내 최대 요청 수
    },
  },
} as const
