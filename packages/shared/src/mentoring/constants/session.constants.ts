//session.constants.ts
export const SESSION_CONSTRAINTS = {
  MIN_DURATION: 30,
  MAX_DURATION: 60,
  MIN_RATING: 1,
  MAX_RATING: 5,
  MAX_SCHEDULE_MONTHS: 2, // 최대 2개월 후까지 예약 가능
} as const
