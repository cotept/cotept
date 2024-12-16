//oauth.constants.ts
export const OAUTH_SETTINGS = {
  GOOGLE: {
    SCOPE: ["email", "profile"],
    STATE_EXPIRY: 300, // 5분
    TOKEN_EXPIRY: 3600, // 1시간
  },
  NAVER: {
    SCOPE: ["email", "name", "profile_image"],
    STATE_EXPIRY: 300,
    TOKEN_EXPIRY: 3600,
  },
  KAKAO: {
    SCOPE: ["account_email", "profile_nickname", "profile_image"],
    STATE_EXPIRY: 300,
    TOKEN_EXPIRY: 3600,
  },
} as const
