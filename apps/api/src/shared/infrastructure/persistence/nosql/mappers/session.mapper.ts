import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { 
  EditorDocument, 
  RecordingDocument,
  SessionMetadataDocument, 
  WebRTCDocument, 
  WebRTCStatsDocument
} from '../schemas/session.schema';
import { BaseNoSQLMapper } from './base.mapper';

/**
 * 세션 매퍼 클래스
 * 예시 구현입니다. 실제 도메인 엔티티에 맞게 수정해야 합니다.
 */
@Injectable()
export class SessionMapper extends BaseNoSQLMapper<any, SessionMetadataDocument> {
  private readonly ttlHours: number;

  constructor(private readonly configService: ConfigService) {
    super();
    this.ttlHours = this.configService.get<number>('nosql.ttl.session', 24);
  }

  /**
   * NoSQL 문서들을 도메인 엔티티로 변환
   */
  toDomain(
    metadata: SessionMetadataDocument,
    webrtc?: WebRTCDocument,
    editor?: EditorDocument,
    recording?: RecordingDocument
  ): any {
    // 도메인 엔티티 생성
    // 실제 세션 도메인 엔티티에 맞게 구현해야 합니다.
    const session = {
      id: metadata.sessionId,
      mentorId: metadata.data.mentorId,
      menteeId: metadata.data.menteeId,
      status: metadata.data.status,
      startTime: metadata.data.startTime,
      endTime: metadata.data.endTime,
      lastActivityTimestamp: metadata.data.lastActivityTimestamp,
      problemIds: metadata.data.problemIds || [],
    };

    // WebRTC 상태 추가
    if (webrtc) {
      session['webrtcState'] = {
        connectionState: webrtc.data.connectionState,
        iceConnectionState: webrtc.data.iceConnectionState,
        iceServers: webrtc.data.iceServers
      };
    }

    // 에디터 상태 추가
    if (editor) {
      session['editorState'] = {
        sharedDocumentId: editor.data.sharedDocumentId,
        language: editor.data.language,
        content: editor.data.content,
        lastSyncTimestamp: editor.data.lastSyncTimestamp
      };
    }

    // 녹화 상태 추가
    if (recording) {
      session['recordingState'] = {
        isRecording: recording.data.isRecording,
        startedAt: recording.data.startedAt,
        currentSegment: recording.data.currentSegment
      };
    }

    return session;
  }

  /**
   * 도메인 엔티티를 NoSQL 문서들로 변환
   */
  toDocument(session: any): SessionMetadataDocument {
    const now = this.getCurrentTimestamp();
    
    // 세션 메타데이터 문서
    return {
      sessionId: session.id,
      type: 'metadata',
      timestamp: now,
      data: {
        mentorId: session.mentorId,
        menteeId: session.menteeId,
        status: session.status,
        startTime: session.startTime,
        endTime: session.endTime,
        problemIds: session.problemIds,
        lastActivityTimestamp: session.lastActivityTimestamp || now
      },
      ttl: this.calculateTTL(this.ttlHours)
    };
  }

  /**
   * WebRTC 상태 문서 생성
   */
  toWebRTCDocument(session: any): WebRTCDocument | null {
    if (!session.webrtcState) {
      return null;
    }

    return {
      sessionId: session.id,
      type: 'webrtc',
      timestamp: this.getCurrentTimestamp(),
      data: {
        connectionState: session.webrtcState.connectionState,
        iceConnectionState: session.webrtcState.iceConnectionState,
        iceServers: session.webrtcState.iceServers
      },
      ttl: this.calculateTTL(this.ttlHours)
    };
  }

  /**
   * 에디터 상태 문서 생성
   */
  toEditorDocument(session: any): EditorDocument | null {
    if (!session.editorState) {
      return null;
    }

    return {
      sessionId: session.id,
      type: 'editor',
      timestamp: this.getCurrentTimestamp(),
      data: {
        sharedDocumentId: session.editorState.sharedDocumentId,
        language: session.editorState.language,
        content: session.editorState.content,
        lastSyncTimestamp: session.editorState.lastSyncTimestamp
      },
      ttl: this.calculateTTL(this.ttlHours)
    };
  }

  /**
   * 녹화 상태 문서 생성
   */
  toRecordingDocument(session: any): RecordingDocument | null {
    if (!session.recordingState) {
      return null;
    }

    return {
      sessionId: session.id,
      type: 'recording',
      timestamp: this.getCurrentTimestamp(),
      data: {
        isRecording: session.recordingState.isRecording,
        startedAt: session.recordingState.startedAt,
        currentSegment: session.recordingState.currentSegment
      },
      ttl: this.calculateTTL(this.ttlHours)
    };
  }

  /**
   * WebRTC 통계 문서 생성
   */
  toWebRTCStatsDocument(sessionId: string, stats: Record<string, any>): WebRTCStatsDocument {
    const timestamp = this.getCurrentTimestamp();
    
    return {
      sessionId,
      type: `metrics:${timestamp}`,
      timestamp,
      data: {
        peerConnectionStats: stats
      },
      ttl: this.calculateTTL(this.ttlHours)
    };
  }
}
