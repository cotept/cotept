// session.interface.ts
import { SessionStatus } from "../enums/session-status.enum"

export interface ISession {
  id: string
  mentorId: string
  menteeId: string
  scheduledStartTime: Date // 예약된 시작 시간
  scheduledEndTime: Date // 예약된 종료 시간
  actualStartTime?: Date // 실제 시작 시간
  actualEndTime?: Date // 실제 종료 시간
  status: SessionStatus
  problemId?: string // 다룰 문제 ID (백준)
  price: number // 세션 가격
  recordingUrl?: string // 녹화 영상 URL
  createdAt: Date
  updatedAt: Date
}
