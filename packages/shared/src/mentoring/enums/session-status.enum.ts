//session-status.enum.ts
export enum SessionStatus {
  SCHEDULED = "SCHEDULED", // 예약됨
  IN_PROGRESS = "IN_PROGRESS", // 진행 중
  COMPLETED = "COMPLETED", // 완료됨
  CANCELLED = "CANCELLED", // 취소됨
  NO_SHOW = "NO_SHOW", // 불참
}
