import { IMentorSchedule } from "./mentor-schedule.interface"

export interface IMentorProfile {
  occupation: string // 직무
  experience: number // 경력 연차
  introduction: string // 자기소개
  hourlyRate: number // 시간당 멘토링 비용
  schedule: IMentorSchedule // 가능 시간 스케줄
}
