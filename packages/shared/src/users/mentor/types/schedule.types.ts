// schedule.types.ts
export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY"
export type TimeSlot = {
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
}
