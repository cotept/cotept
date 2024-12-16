---
sidebar_position: 1
---

# 멘토 Mentor

## 개요

멘토는 코딩테스트 멘토링을 제공하는 사용자로, 기본 사용자(BaseUser) 속성에 더해 멘토 특화 기능을 가집니다.

## 멘토 인터페이스

```typescript
interface IMentor extends IBaseUser {
  currentTier: string
  approvalStatus: MentorApprovalStatus
  profile: IMentorProfile
  approvedAt?: Date
  approvedBy?: string
}
```

## 멘토 승인 상태

```typescript
enum MentorApprovalStatus {
  PENDING = "PENDING", // 승인 대기
  APPROVED = "APPROVED", // 승인됨
  REJECTED = "REJECTED", // 거절됨
}
```

## 멘토 프로필

```typescript
interface IMentorProfile {
  occupation: string // 직무
  experience: number // 경력 연차
  introduction: string // 자기소개
  hourlyRate: number // 시간당 멘토링 비용
  schedule: IMentorSchedule // 가능 시간 스케줄
}
```

## 멘토 스케줄

멘토의 스케줄 관리를 위한 인터페이스

정기적인 가능 시간과 예외 일정을 모두 관리합니다.

```typescript
interface IMentorSchedule {
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
```

## 사용 예시

```typescript
@Entity("mentors")
export class Mentor extends BaseUser implements IMentor {
  @Column()
  currentTier: string

  @Column({
    type: "enum",
    enum: MentorApprovalStatus,
    default: MentorApprovalStatus.PENDING,
  })
  approvalStatus: MentorApprovalStatus

  @Column("jsonb", { nullable: true })
  profile: IMentorProfile

  @Column({ nullable: true })
  approvedAt?: Date

  @Column({ nullable: true })
  approvedBy?: string
}
```
