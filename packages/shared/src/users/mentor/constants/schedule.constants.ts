// schedule.constants.ts

export const SCHEDULE_CONSTRAINTS = {
  MIN_NOTICE_HOURS: 24, // 최소 24시간 전 예약 필요
  MAX_SCHEDULED_MONTHS: 2, //최대 2개월 후까지 예약 가능
  MAX_SESSION_LENGTH: 60, //모든 멘토링 세션은 1시간으로 고정
} as const
