// 코드에서도 의미가 명확해짐
export const SIGNUP_STEPS = {
  ENTER_EMAIL: "enter-email",
  SET_PASSWORD: "set-password",
  TERMS_AGREEMENT: "terms-agreement",
  VERIFY_EMAIL: "verify-email",
  PROFILE_SETUP: "profile-setup",
} as const

// 타입 안전성도 확보
export type SignupStep = (typeof SIGNUP_STEPS)[keyof typeof SIGNUP_STEPS]
