// 표준 회원가입 플로우 순서: 약관 → 이메일 → 인증 → ID → 비밀번호 → 완료
export const SIGNUP_STEPS = {
  TERMS_AGREEMENT: "terms-agreement",
  ENTER_EMAIL: "enter-email",
  VERIFY_EMAIL: "verify-email", 
  SET_USERID: "set-userid",
  SET_PASSWORD: "set-password",
  SIGNUP_COMPLETE: "signup-complete",
} as const

// 타입 안전성도 확보
export type SignupStep = (typeof SIGNUP_STEPS)[keyof typeof SIGNUP_STEPS]
