---
sidebar_position: 2
---

# 멘토 스케줄 관리

## 스케줄 인터페이스 상세 설명

### 정기 스케줄 (Regular Schedule)

정기적으로 반복되는 멘토의 가용 시간을 요일별로 관리합니다.

```typescript
regularSchedule: {
  [weekday: string]: {
    available: boolean;
    timeSlots: Array<{
      startTime: string;     // "HH:mm" 형식
      endTime: string;       // "HH:mm" 형식
      timezone: string;      // "Asia/Seoul"
    }>;
  };
}
```

예시:

```typescript
{
  "MONDAY": {
    available: true,
    timeSlots: [
      {
        startTime: "19:00",
        endTime: "22:00",
        timezone: "Asia/Seoul"
      }
    ]
  }
}
```

### 예외 일정 (Exceptions)

특별한 날짜에 대한 예외 처리를 관리합니다. 휴가, 공휴일, 특별 세션 등에 사용됩니다.

```typescript
exceptions: {
  [date: string]: {          // "YYYY-MM-DD" 형식
    available: boolean;
    reason?: string;
    timeSlots?: Array<{
      startTime: string;
      endTime: string;
    }>;
  };
}
```

예시:

```typescript
{
  "2024-03-01": {
    available: false,
    reason: "삼일절"
  },
  "2024-03-15": {
    available: true,
    timeSlots: [
      {
        startTime: "10:00",
        endTime: "18:00"
      }
    ]
  }
}
```

### 세션 설정

멘토링 세션과 관련된 기본 설정을 관리합니다.

```typescript
// 선호하는 세션 길이 (분 단위)
preferredSessionLength: number[];

// 예약 제약사항
bookingConstraints: {
  minNoticeHours: number;    // 최소 예약 가능 시간
  maxScheduledMonths: number;   // 최대 예약 가능 기간
};

// 기본 타임존
timezone: string;            // IANA 타임존 형식
```

## 시간대 관리 전략

1. **타임존 처리**

   - 모든 시간은 UTC로 데이터베이스에 저장
   - 멘토의 기본 타임존을 기준으로 표시 시간 계산
   - 클라이언트에서 사용자의 로컬 타임존으로 변환

2. **날짜 경계 처리**

   - 자정을 걸치는 세션의 경우 두 개의 타임슬롯으로 분할
   - 타임존이 다른 경우 예약 가능 시간 중첩 확인 필수

3. **일광절약시간(DST) 고려**
   - IANA 타임존 사용으로 DST 자동 처리
   - 시간 변경 기간 동안의 예약은 추가 검증 필요

## 예약 시스템 연동

1. **가용성 확인 프로세스**

   ```typescript
   async function checkAvailability(
     mentorId: string,
     date: string,
     startTime: string,
     endTime: string,
   ): Promise<boolean> {
     // 1. 정기 스케줄 확인
     // 2. 예외 일정 확인
     // 3. 기존 예약과 중첩 확인
     // 4. 예약 제약사항 검증
   }
   ```

2. **예약 생성 시 검증**

   - 최소 예약 가능 시간 확인
   - 최대 예약 가능 기간 확인
   - 선호 세션 길이와의 일치 여부 확인

3. **알림 시스템 연동**
   - 예약 확정 시 멘토/멘티 양측에 알림
   - 예약 임박 알림 (시작 24시간 전, 1시간 전)
   - 일정 변경/취소 시 즉시 알림

## 유효성 검증 규칙

1. **시간 형식 검증**

   ```typescript
   function validateTimeFormat(time: string): boolean {
     return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
   }
   ```

2. **논리적 유효성 검증**

   - 시작 시간이 종료 시간보다 빠른지 확인
   - 세션 길이가 허용 범위 내인지 확인
   - 타임슬롯 중첩 여부 확인

3. **예외 처리**
   - 과거 날짜에 대한 예외 일정 설정 방지
   - 이미 예약된 시간에 대한 예외 설정 시 경고
   - 잘못된 타임존 설정 방지

## 사용 예시

```typescript
const mentorSchedule: IMentorSchedule = {
  regularSchedule: {
    MONDAY: {
      available: true,
      timeSlots: [
        {
          startTime: "19:00",
          endTime: "22:00",
          timezone: "Asia/Seoul",
        },
      ],
    },
  },
  exceptions: {
    "2024-03-01": {
      available: false,
      reason: "공휴일",
    },
  },
  preferredSessionLength: [30, 60],
  bookingConstraints: {
    minNoticeHours: 24,
    maxScheduledMonths: 2,
  },
  timezone: "Asia/Seoul",
}
```
