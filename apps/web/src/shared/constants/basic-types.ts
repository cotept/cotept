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

/**
 * 온보딩 단계 상수 정의
 */
export const ONBOARDING_STEPS = {
  PROFILE_SETUP: "profile-setup",
  BAEKJOON_VERIFY: "baekjoon-verify",
  SKILL_ANALYSIS: "skill-analysis",
  MENTOR_TAGS: "mentor-tags",
  MENTOR_INTRO: "mentor-intro",
  COMPLETE: "complete",
} as const

// 타입 추출
export type OnboardingStep = (typeof ONBOARDING_STEPS)[keyof typeof ONBOARDING_STEPS]

// 단계 순서 배열 (상수로 정의)
export const ONBOARDING_STEP_ORDER: OnboardingStep[] = [
  ONBOARDING_STEPS.PROFILE_SETUP,
  ONBOARDING_STEPS.BAEKJOON_VERIFY,
  ONBOARDING_STEPS.SKILL_ANALYSIS,
  ONBOARDING_STEPS.MENTOR_TAGS,
  ONBOARDING_STEPS.MENTOR_INTRO,
  ONBOARDING_STEPS.COMPLETE,
] as const

// 멘토 단계 제외 순서 (뒤로가기용)
export const ONBOARDING_NAVIGABLE_STEPS: OnboardingStep[] = [
  ONBOARDING_STEPS.PROFILE_SETUP,
  ONBOARDING_STEPS.BAEKJOON_VERIFY,
  ONBOARDING_STEPS.SKILL_ANALYSIS,
  ONBOARDING_STEPS.MENTOR_TAGS,
  ONBOARDING_STEPS.MENTOR_INTRO,
] as const

/**
 * solved.ac 티어 값 객체
 * 백준 사용자의 solved.ac 티어 정보를 관리
 */
export const TIER_LEVELS = {
  Unrated: 0,
  BronzeV: 1,
  BronzeIV: 2,
  BronzeIII: 3,
  BronzeII: 4,
  BronzeI: 5,
  SilverV: 6,
  SilverIV: 7,
  SilverIII: 8,
  SilverII: 9,
  SilverI: 10,
  GoldV: 11,
  GoldIV: 12,
  GoldIII: 13,
  GoldII: 14,
  GoldI: 15,
  PlatinumV: 16,
  PlatinumIV: 17,
  PlatinumIII: 18,
  PlatinumII: 19,
  PlatinumI: 20,
  DiamondV: 21,
  DiamondIV: 22,
  DiamondIII: 23,
  DiamondII: 24,
  DiamondI: 25,
  RubyV: 26,
  RubyIV: 27,
  RubyIII: 28,
  RubyII: 29,
  RubyI: 30,
  Master: 31,
} as const

export const TIER_NAMES = {
  Unrated: "Unrated",
  BronzeV: "BronzeV",
  BronzeIV: "BronzeIV",
  BronzeIII: "BronzeIII",
  BronzeII: "BronzeII",
  BronzeI: "BronzeI",
  SilverV: "SilverV",
  SilverIV: "SilverIV",
  SilverIII: "SilverIII",
  SilverII: "SilverII",
  SilverI: "SilverI",
  GoldV: "GoldV",
  GoldIV: "GoldIV",
  GoldIII: "GoldIII",
  GoldII: "GoldII",
  GoldI: "GoldI",
  PlatinumV: "PlatinumV",
  PlatinumIV: "PlatinumIV",
  PlatinumIII: "PlatinumIII",
  PlatinumII: "PlatinumII",
  PlatinumI: "PlatinumI",
  DiamondV: "DiamondV",
  DiamondIV: "DiamondIV",
  DiamondIII: "DiamondIII",
  DiamondII: "DiamondII",
  DiamondI: "DiamondI",
  RubyV: "RubyV",
  RubyIV: "RubyIV",
  RubyIII: "RubyIII",
  RubyII: "RubyII",
  RubyI: "RubyI",
  Master: "Master",
} as const

export const TIER_COLORS = {
  Unrated: "#2D2D2D",
  BronzeV: "#AD5600",
  BronzeIV: "#AD5600",
  BronzeIII: "#AD5600",
  BronzeII: "#AD5600",
  BronzeI: "#AD5600",
  SilverV: "#435F7A",
  SilverIV: "#435F7A",
  SilverIII: "#435F7A",
  SilverII: "#435F7A",
  SilverI: "#435F7A",
  GoldV: "#EC9A00",
  GoldIV: "#EC9A00",
  GoldIII: "#EC9A00",
  GoldII: "#EC9A00",
  GoldI: "#EC9A00",
  PlatinumV: "#27E2A4",
  PlatinumIV: "#27E2A4",
  PlatinumIII: "#27E2A4",
  PlatinumII: "#27E2A4",
  PlatinumI: "#27E2A4",
  DiamondV: "#00D2F0",
  DiamondIV: "#00D2F0",
  DiamondIII: "#00D2F0",
  DiamondII: "#00D2F0",
  DiamondI: "#00D2F0",
  RubyV: "#FF0062",
  RubyIV: "#FF0062",
  RubyIII: "#FF0062",
  RubyII: "#FF0062",
  RubyI: "#FF0062",
  Master: "#B491FF",
} as const
