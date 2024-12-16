// mentor-schedule.interface.ts
export interface IMentorSchedule {
  regularSchedule: {
    [weekday: string]: {
      available: boolean
      timeSlots: Array<{
        startTime: string // "HH:mm"
        endTime: string // "HH:mm"
        timezone: string // "Asia/Seoul"
      }>
    }
  }
  exceptions: {
    [date: string]: {
      // "YYYY-MM-DD" 형식
      available: boolean
      reason?: string
      timeSlots?: Array<{
        startTime: string
        endTime: string
      }>
    }
  }
  preferredSessionLength: number[]
  bookingConstraints: {
    minNoticeHours: number
    maxScheduledMonths: number
  }
  timezone: string
}
