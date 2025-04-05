import { SystemOperationsDocument } from './base.schema';

/**
 * 시스템 이벤트 문서 인터페이스
 */
export interface SystemEventDocument extends SystemOperationsDocument {
  type: 'event';
  data: {
    id: string;
    eventType: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * 시스템 메트릭 문서 인터페이스
 */
export interface SystemMetricDocument extends SystemOperationsDocument {
  type: 'metric';
  data: {
    metricName: string;
    value: number;
    unit: string;
    dimensions?: Record<string, string>;
  };
}

/**
 * 일별 통계 문서 인터페이스
 */
export interface DailyStatsDocument extends SystemOperationsDocument {
  type: 'dailyStats';
  data: {
    date: string;
    activeUsers: number;
    newUsers: number;
    completedSessions: number;
    avgSessionDuration: number;
    totalRevenue?: number;
    // 기타 통계 데이터...
  };
}
