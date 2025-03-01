/**
 * 세션 상태 열거형
 */
export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * 세션 엔티티
 * 도메인 모델은 기술적 세부 사항과 분리됨
 */
export class Session {
  id: string;
  mentorId: string;
  menteeId: string;
  title: string;
  description?: string;
  status: SessionStatus;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  recordingUrl?: string;
  problemIds?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  /**
   * 세션 시작
   */
  start(): void {
    if (this.status !== SessionStatus.SCHEDULED) {
      throw new Error('세션을 시작할 수 없습니다: 올바른 상태가 아닙니다.');
    }

    this.status = SessionStatus.ACTIVE;
    this.actualStartTime = new Date();
    this.updatedAt = new Date();
  }

  /**
   * 세션 종료
   */
  complete(): void {
    if (this.status !== SessionStatus.ACTIVE) {
      throw new Error('세션을 종료할 수 없습니다: 세션이 활성 상태가 아닙니다.');
    }

    this.status = SessionStatus.COMPLETED;
    this.actualEndTime = new Date();
    this.updatedAt = new Date();
  }

  /**
   * 세션 취소
   */
  cancel(): void {
    if (this.status === SessionStatus.COMPLETED) {
      throw new Error('이미 완료된 세션은 취소할 수 없습니다.');
    }

    this.status = SessionStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  /**
   * 녹화 URL 추가
   */
  addRecording(url: string): void {
    if (this.status !== SessionStatus.COMPLETED) {
      throw new Error('완료되지 않은 세션에는 녹화 URL을 추가할 수 없습니다.');
    }

    this.recordingUrl = url;
    this.updatedAt = new Date();
  }

  /**
   * 세션 일정 변경
   */
  reschedule(startTime: Date, endTime: Date): void {
    if (this.status !== SessionStatus.SCHEDULED) {
      throw new Error('이미 시작되었거나 종료된 세션의 일정을 변경할 수 없습니다.');
    }

    this.scheduledStartTime = startTime;
    this.scheduledEndTime = endTime;
    this.updatedAt = new Date();
  }
}
