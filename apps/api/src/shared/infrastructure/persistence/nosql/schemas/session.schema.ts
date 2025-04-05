import { RealtimeCommunicationDocument } from './base.schema';

/**
 * 세션 메타데이터 문서 인터페이스
 */
export interface SessionMetadataDocument extends RealtimeCommunicationDocument {
  type: 'metadata';
  data: {
    mentorId: string;
    menteeId: string;
    status: string;
    startTime?: string;
    endTime?: string;
    problemIds?: string[];
    lastActivityTimestamp: string;
  };
}

/**
 * WebRTC 상태 문서 인터페이스
 */
export interface WebRTCDocument extends RealtimeCommunicationDocument {
  type: 'webrtc';
  data: {
    connectionState: string;
    iceConnectionState?: string;
    iceServers?: Array<{
      urls: string;
      username?: string;
      credential?: string;
    }>;
  };
}

/**
 * 에디터 상태 문서 인터페이스
 */
export interface EditorDocument extends RealtimeCommunicationDocument {
  type: 'editor';
  data: {
    sharedDocumentId: string;
    language: string;
    content: string;
    lastSyncTimestamp: string;
  };
}

/**
 * 녹화 상태 문서 인터페이스
 */
export interface RecordingDocument extends RealtimeCommunicationDocument {
  type: 'recording';
  data: {
    isRecording: boolean;
    startedAt?: string;
    currentSegment?: string;
  };
}

/**
 * WebRTC 통계 문서 인터페이스
 */
export interface WebRTCStatsDocument extends RealtimeCommunicationDocument {
  type: string; // 'metrics:timestamp' 형식
  data: {
    peerConnectionStats: Record<string, any>;
  };
}
