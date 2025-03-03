import { UserActivityDocument } from './base.schema';

/**
 * 사용자 상태 문서 인터페이스
 */
export interface UserStatusDocument extends UserActivityDocument {
  type: 'status';
  data: {
    isOnline: boolean;
    lastActiveAt: string;
    deviceInfo?: Record<string, any>;
  };
}

/**
 * 알림 문서 인터페이스
 */
export interface NotificationDocument extends UserActivityDocument {
  type: string; // 'notification:timestamp' 형식
  data: {
    id: string;
    notificationType: string;
    message: string;
    relatedData?: Record<string, any>;
    isRead: boolean;
  };
}

/**
 * 백준 프로필 캐시 문서 인터페이스
 */
export interface BojProfileCacheDocument extends UserActivityDocument {
  type: 'cache:bojProfile';
  data: {
    bojId: string;
    tier: string;
    solvedCount: number;
    recentProblems?: Array<{
      id: string;
      title: string;
      tier: string;
      solvedAt: string;
    }>;
    lastUpdated: string;
    expiresAt: string;
  };
}
