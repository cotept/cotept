# CotePT 실시간 프로토콜 서비스 가이드

> WebRTC, WebSocket, CRDT, MSE 기반 실시간 멘토링 서비스 구현 가이드

**작성일**: 2025-01-19
**버전**: 1.0.0
**관련 문서**: [Frontend Architecture Guide](./frontend-architecture-guide.md)

---

## 📋 목차

1. [아키텍처 개요](#아키텍처-개요)
2. [WebRTC Service](#webrtc-service)
3. [WebSocket Service](#websocket-service)
4. [CRDT Service (Y.js)](#crdt-service-yjs)
5. [MSE Recording Service](#mse-recording-service)
6. [통합 패턴](#통합-패턴)

---

## 아키텍처 개요

### Service-Hook-Component 패턴

**3계층 구조로 프로토콜 서비스 구현**:

```
┌─────────────────────────────────────┐
│  Component Layer                    │  ← UI만 담당
│  (SessionLiveContainer.tsx)         │
└────────────┬────────────────────────┘
             │ 훅 소비
┌────────────▼────────────────────────┐
│  Hook Layer                         │  ← React State 동기화
│  (useWebRTC, useSessionSocket)      │
└────────────┬────────────────────────┘
             │ Service 인스턴스 관리
┌────────────▼────────────────────────┐
│  Service Layer                      │  ← 순수 비즈니스 로직
│  (WebRTCService, WebSocketService)  │  ← EventEmitter 기반
└─────────────────────────────────────┘
```

### 공통 인터페이스

```typescript
// 모든 프로토콜 서비스가 준수하는 패턴
abstract class ProtocolService extends EventEmitter {
  constructor(config: ServiceConfig) {
    super()
  }

  abstract initialize(): Promise<void>
  abstract dispose(): void
}
```

### 디렉토리 구조

```
features/session/
├── services/
│   ├── webrtc/
│   │   ├── WebRTCService.ts
│   │   ├── types.ts
│   │   └── __tests__/
│   ├── websocket/
│   │   ├── WebSocketService.ts
│   │   ├── types.ts
│   │   └── __tests__/
│   ├── crdt/
│   │   ├── CRDTService.ts
│   │   ├── MonacoBinding.ts
│   │   └── types.ts
│   └── recording/
│       ├── RecordingService.ts
│       └── types.ts
│
├── hooks/
│   ├── useWebRTC.ts
│   ├── useSessionSocket.ts
│   ├── useCollaborativeEditor.ts
│   └── useSessionRecording.ts
│
├── components/
│   ├── SessionVideoStream.tsx
│   ├── SessionChat.tsx
│   ├── CollaborativeEditor.tsx
│   └── RecordingControls.tsx
│
└── containers/
    └── SessionLiveContainer.tsx
```

---

## WebRTC Service

### 역할

**1:1 실시간 영상/음성 통신**:
- PeerConnection 관리
- 로컬/원격 미디어 스트림 처리
- ICE 후보 수집 및 교환
- 연결 상태 모니터링
- 자동 재연결

### Service Layer

```typescript
// ====================================
// features/session/services/webrtc/types.ts
// ====================================
export interface WebRTCConfig {
  iceServers: RTCIceServer[]
  streamConstraints: MediaStreamConstraints
}

export interface WebRTCState {
  connectionState: RTCPeerConnectionState
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isAudioEnabled: boolean
  isVideoEnabled: boolean
}

export type WebRTCEventType =
  | 'connection-state-changed'
  | 'local-stream-ready'
  | 'remote-stream-ready'
  | 'ice-candidate'
  | 'error'

export interface WebRTCEvents {
  'connection-state-changed': RTCPeerConnectionState
  'local-stream-ready': MediaStream
  'remote-stream-ready': MediaStream
  'ice-candidate': RTCIceCandidate
  'error': Error
}

// ====================================
// features/session/services/webrtc/WebRTCService.ts
// ====================================
import { EventEmitter } from 'events'

export class WebRTCService extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private config: WebRTCConfig

  constructor(config: WebRTCConfig) {
    super()
    this.config = config
  }

  async initialize() {
    try {
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers,
      })

      this.setupPeerConnectionListeners()
      await this.startLocalStream()
    } catch (error) {
      this.emit('error', error)
      throw error
    }
  }

  private async startLocalStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        this.config.streamConstraints
      )

      this.localStream = stream
      this.emit('local-stream-ready', stream)

      stream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, stream)
      })
    } catch (error) {
      this.emit('error', new Error('미디어 접근 실패: ' + error))
      throw error
    }
  }

  private setupPeerConnectionListeners() {
    if (!this.peerConnection) return

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('ice-candidate', event.candidate)
      }
    }

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0]
      this.emit('remote-stream-ready', event.streams[0])
    }

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState
      if (state) {
        this.emit('connection-state-changed', state)
      }
    }

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState
      if (state === 'failed' || state === 'disconnected') {
        this.handleReconnection()
      }
    }
  }

  private async handleReconnection() {
    console.log('WebRTC 재연결 시도...')
    try {
      await retry(
        async () => {
          const offer = await this.peerConnection?.createOffer({ iceRestart: true })
          await this.peerConnection?.setLocalDescription(offer!)
        },
        {
          maxAttempts: 3,
          delay: 1000,
          backoff: 2,
          onRetry: (error, attempt) => {
            console.log(`재연결 시도 ${attempt}/3`, error)
            this.emit('reconnecting', attempt)
          },
        }
      )
    } catch (error) {
      this.emit('error', new Error('재연결 실패: ' + error))
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('PeerConnection not initialized')

    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    return offer
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('PeerConnection not initialized')

    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    return answer
  }

  async setRemoteDescription(sdp: RTCSessionDescriptionInit) {
    await this.peerConnection?.setRemoteDescription(sdp)
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    await this.peerConnection?.addIceCandidate(candidate)
  }

  toggleAudio(enabled?: boolean) {
    const audioTrack = this.localStream?.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = enabled ?? !audioTrack.enabled
      return audioTrack.enabled
    }
    return false
  }

  toggleVideo(enabled?: boolean) {
    const videoTrack = this.localStream?.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = enabled ?? !videoTrack.enabled
      return videoTrack.enabled
    }
    return false
  }

  async getStats(): Promise<RTCStatsReport | null> {
    return this.peerConnection?.getStats() ?? null
  }

  dispose() {
    this.localStream?.getTracks().forEach((track) => track.stop())
    this.peerConnection?.close()
    this.removeAllListeners()
  }
}
```

### Hook Layer

```typescript
// ====================================
// features/session/hooks/useWebRTC.ts
// ====================================
import { useEffect, useRef, useState, useCallback } from 'react'
import { WebRTCService } from '../services/webrtc/WebRTCService'
import type { WebRTCConfig, WebRTCState } from '../services/webrtc/types'

export function useWebRTC(config: WebRTCConfig) {
  const serviceRef = useRef<WebRTCService | null>(null)

  const [state, setState] = useState<WebRTCState>({
    connectionState: 'new',
    localStream: null,
    remoteStream: null,
    isAudioEnabled: true,
    isVideoEnabled: true,
  })

  useEffect(() => {
    const service = new WebRTCService(config)
    serviceRef.current = service

    service.on('connection-state-changed', (connectionState) => {
      setState((prev) => ({ ...prev, connectionState }))
    })

    service.on('local-stream-ready', (localStream) => {
      setState((prev) => ({ ...prev, localStream }))
    })

    service.on('remote-stream-ready', (remoteStream) => {
      setState((prev) => ({ ...prev, remoteStream }))
    })

    service.on('error', (error) => {
      console.error('WebRTC Error:', error)
    })

    service.initialize()

    return () => {
      service.dispose()
    }
  }, [config])

  const toggleAudio = useCallback(() => {
    if (serviceRef.current) {
      const enabled = serviceRef.current.toggleAudio()
      setState((prev) => ({ ...prev, isAudioEnabled: enabled }))
    }
  }, [])

  const toggleVideo = useCallback(() => {
    if (serviceRef.current) {
      const enabled = serviceRef.current.toggleVideo()
      setState((prev) => ({ ...prev, isVideoEnabled: enabled }))
    }
  }, [])

  const createOffer = useCallback(async () => {
    return serviceRef.current?.createOffer()
  }, [])

  const createAnswer = useCallback(async () => {
    return serviceRef.current?.createAnswer()
  }, [])

  const setRemoteDescription = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    await serviceRef.current?.setRemoteDescription(sdp)
  }, [])

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    await serviceRef.current?.addIceCandidate(candidate)
  }, [])

  return {
    ...state,
    toggleAudio,
    toggleVideo,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
  }
}
```

### Component Layer

```typescript
// ====================================
// features/session/components/SessionVideoStream.tsx
// ====================================
export function SessionVideoStream({ stream, isMuted, label }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="w-full h-full object-cover"
      />

      {label && (
        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-white text-sm">
          {label}
        </div>
      )}
    </div>
  )
}

// ====================================
// features/session/containers/SessionLiveContainer.tsx
// ====================================
export function SessionLiveContainer({ sessionId }: Props) {
  const { data: session } = useSession(sessionId)
  const socket = useSessionSocket(sessionId)

  const webrtc = useWebRTC({
    iceServers: [
      { urls: 'stun:sfu.cotept.com:3478' },
      { urls: 'turn:sfu.cotept.com:3478', username: 'user', credential: 'pass' },
    ],
    streamConstraints: {
      video: { width: 1280, height: 720 },
      audio: { echoCancellation: true, noiseSuppression: true },
    },
  })

  // WebSocket 시그널링
  useEffect(() => {
    socket.on('offer', async (offer) => {
      await webrtc.setRemoteDescription(offer)
      const answer = await webrtc.createAnswer()
      socket.emit('answer', answer)
    })

    socket.on('answer', async (answer) => {
      await webrtc.setRemoteDescription(answer)
    })

    socket.on('ice-candidate', async (candidate) => {
      await webrtc.addIceCandidate(candidate)
    })
  }, [socket, webrtc])

  return (
    <div className="grid grid-cols-2 gap-4">
      <SessionVideoStream stream={webrtc.localStream} isMuted label="나" />
      <SessionVideoStream stream={webrtc.remoteStream} label={session?.mentorName} />

      <div className="col-span-2 flex justify-center gap-2">
        <Button
          onClick={webrtc.toggleAudio}
          variant={webrtc.isAudioEnabled ? 'default' : 'destructive'}
        >
          {webrtc.isAudioEnabled ? <Mic /> : <MicOff />}
        </Button>

        <Button
          onClick={webrtc.toggleVideo}
          variant={webrtc.isVideoEnabled ? 'default' : 'destructive'}
        >
          {webrtc.isVideoEnabled ? <Video /> : <VideoOff />}
        </Button>
      </div>
    </div>
  )
}
```

**`★ Insight`**:
- **Service**: EventEmitter로 상태 변경 알림
- **Hook**: useRef로 Service 인스턴스 생명주기 관리
- **Component**: 순수 프레젠테이션, 비즈니스 로직 없음

---

## WebSocket Service

### 역할

**실시간 양방향 통신**:
- 채팅 메시지 송수신
- WebRTC 시그널링 (SDP, ICE Candidate)
- 참가자 상태 동기화
- 자동 재연결 (Exponential Backoff)

### Service Layer

```typescript
// ====================================
// features/session/services/websocket/WebSocketService.ts
// ====================================
import { io, Socket } from 'socket.io-client'
import { EventEmitter } from 'events'

export class WebSocketService extends EventEmitter {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(private url: string) {
    super()
  }

  connect(sessionId: string, token: string) {
    this.socket = io(this.url, {
      auth: { sessionId, token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    })

    this.setupSocketListeners()
  }

  private setupSocketListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('WebSocket 연결됨')
      this.reconnectAttempts = 0
      this.emit('connected')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket 연결 끊김:', reason)
      this.emit('disconnected', reason)
    })

    this.socket.on('reconnect_attempt', (attempt) => {
      this.reconnectAttempts = attempt
      this.emit('reconnecting', attempt)
    })

    this.socket.on('reconnect_failed', () => {
      this.emit('reconnect-failed')
    })

    this.socket.on('chat-message', (message) => {
      this.emit('chat-message', message)
    })

    this.socket.on('participant-joined', (participant) => {
      this.emit('participant-joined', participant)
    })

    this.socket.on('participant-left', (participantId) => {
      this.emit('participant-left', participantId)
    })

    this.socket.on('offer', (offer) => this.emit('offer', offer))
    this.socket.on('answer', (answer) => this.emit('answer', answer))
    this.socket.on('ice-candidate', (candidate) => this.emit('ice-candidate', candidate))
  }

  sendMessage(content: string) {
    this.socket?.emit('chat-message', { content })
  }

  sendOffer(offer: RTCSessionDescriptionInit) {
    this.socket?.emit('offer', offer)
  }

  sendAnswer(answer: RTCSessionDescriptionInit) {
    this.socket?.emit('answer', answer)
  }

  sendIceCandidate(candidate: RTCIceCandidate) {
    this.socket?.emit('ice-candidate', candidate)
  }

  disconnect() {
    this.socket?.disconnect()
    this.removeAllListeners()
  }
}
```

### Hook Layer

```typescript
// ====================================
// features/session/hooks/useSessionSocket.ts
// ====================================
export function useSessionSocket(sessionId: string) {
  const serviceRef = useRef<WebSocketService | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [connectionState, setConnectionState] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected')

  useEffect(() => {
    const service = new WebSocketService('wss://api.cotept.com/ws')
    serviceRef.current = service

    service.on('connected', () => setConnectionState('connected'))
    service.on('disconnected', () => setConnectionState('disconnected'))
    service.on('reconnecting', () => setConnectionState('reconnecting'))

    service.on('chat-message', (message) => {
      setMessages((prev) => [...prev, message])
    })

    service.on('participant-joined', (participant) => {
      setParticipants((prev) => [...prev, participant])
    })

    service.on('participant-left', (participantId) => {
      setParticipants((prev) => prev.filter((p) => p.id !== participantId))
    })

    service.connect(sessionId, 'token')

    return () => {
      service.disconnect()
    }
  }, [sessionId])

  const sendMessage = useCallback((content: string) => {
    serviceRef.current?.sendMessage(content)
  }, [])

  return {
    messages,
    participants,
    connectionState,
    sendMessage,
    service: serviceRef.current,
  }
}
```

---

## CRDT Service (Y.js)

### 역할

**실시간 협업 코드 에디터**:
- Conflict-free Replicated Data Type
- Monaco Editor 바인딩
- 다중 사용자 동시 편집
- Operational Transform

### Service Layer

```typescript
// ====================================
// features/session/services/crdt/CRDTService.ts
// ====================================
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export class CRDTService {
  private ydoc: Y.Doc
  private provider: WebsocketProvider
  private ytext: Y.Text

  constructor(sessionId: string) {
    this.ydoc = new Y.Doc()
    this.ytext = this.ydoc.getText('monaco')

    this.provider = new WebsocketProvider(
      'wss://api.cotept.com/yjs',
      `session-${sessionId}`,
      this.ydoc
    )
  }

  getYText() {
    return this.ytext
  }

  getProvider() {
    return this.provider
  }

  dispose() {
    this.provider.destroy()
    this.ydoc.destroy()
  }
}

// ====================================
// features/session/services/crdt/MonacoBinding.ts
// ====================================
import { MonacoBinding } from 'y-monaco'
import type * as monaco from 'monaco-editor'
import { CRDTService } from './CRDTService'

export function createMonacoBinding(
  editor: monaco.editor.IStandaloneCodeEditor,
  crdtService: CRDTService
) {
  return new MonacoBinding(
    crdtService.getYText(),
    editor.getModel()!,
    new Set([editor]),
    crdtService.getProvider().awareness
  )
}
```

### Hook Layer

```typescript
// ====================================
// features/session/hooks/useCollaborativeEditor.ts
// ====================================
export function useCollaborativeEditor(sessionId: string) {
  const serviceRef = useRef<CRDTService | null>(null)
  const bindingRef = useRef<MonacoBinding | null>(null)
  const [awareness, setAwareness] = useState<any>(null)

  useEffect(() => {
    const service = new CRDTService(sessionId)
    serviceRef.current = service

    setAwareness(service.getProvider().awareness)

    return () => {
      bindingRef.current?.destroy()
      service.dispose()
    }
  }, [sessionId])

  const bindEditor = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    if (serviceRef.current && !bindingRef.current) {
      bindingRef.current = createMonacoBinding(editor, serviceRef.current)
    }
  }, [])

  // 자동 저장 (Debounce)
  const debouncedSave = useMemo(
    () =>
      debounce((content: string) => {
        apiClient.sessions.saveContent(sessionId, content)
      }, 2000),
    [sessionId]
  )

  return {
    bindEditor,
    awareness,
    debouncedSave,
  }
}
```

---

## MSE Recording Service

### 역할

**세션 녹화 및 VOD 생성**:
- MediaRecorder API
- 청크 단위 업로드
- HLS 변환 준비

### Service Layer

```typescript
// ====================================
// features/session/services/recording/RecordingService.ts
// ====================================
export class RecordingService extends EventEmitter {
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []

  constructor(private stream: MediaStream) {
    super()
  }

  async start() {
    try {
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'video/webm;codecs=vp9',
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data)
          this.emit('chunk-ready', event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' })
        this.emit('recording-complete', blob)
      }

      this.mediaRecorder.start(10000) // 10초마다 청크 생성
      this.emit('started')
    } catch (error) {
      this.emit('error', error)
    }
  }

  stop() {
    this.mediaRecorder?.stop()
    this.emit('stopped')
  }

  dispose() {
    this.recordedChunks = []
    this.removeAllListeners()
  }
}
```

---

## 통합 패턴

### 전체 플로우

```typescript
// ====================================
// features/session/containers/SessionLiveContainer.tsx
// ====================================
export function SessionLiveContainer({ sessionId }: Props) {
  // 1. WebSocket (시그널링 + 채팅)
  const socket = useSessionSocket(sessionId)

  // 2. WebRTC (영상/음성)
  const webrtc = useWebRTC({
    iceServers: [{ urls: 'stun:sfu.cotept.com:3478' }],
    streamConstraints: { video: true, audio: true },
  })

  // 3. CRDT (협업 에디터)
  const editor = useCollaborativeEditor(sessionId)

  // 4. Recording (녹화)
  const recording = useSessionRecording(webrtc.localStream)

  // WebRTC 시그널링 (WebSocket 통합)
  useEffect(() => {
    if (!socket.service) return

    socket.service.on('offer', async (offer) => {
      await webrtc.setRemoteDescription(offer)
      const answer = await webrtc.createAnswer()
      socket.service?.sendAnswer(answer)
    })

    webrtc.service?.on('ice-candidate', (candidate) => {
      socket.service?.sendIceCandidate(candidate)
    })
  }, [socket, webrtc])

  return (
    <div>
      <SessionVideoStream stream={webrtc.localStream} />
      <SessionChat messages={socket.messages} onSend={socket.sendMessage} />
      <CollaborativeEditor onMount={editor.bindEditor} />
      <RecordingControls recording={recording} />
    </div>
  )
}
```

**`★ Insight`**:
- **모든 프로토콜 서비스가 동일 패턴**
- **Service는 React 독립적** (테스트 용이)
- **Hook으로 React State 브릿지**
- **Component는 훅만 소비**

---

## 테스트 전략

### Service Layer 테스트 (Vitest)

```typescript
// ====================================
// features/session/services/webrtc/__tests__/WebRTCService.test.ts
// ====================================
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WebRTCService } from '../WebRTCService'

global.RTCPeerConnection = vi.fn().mockImplementation(() => ({
  addTrack: vi.fn(),
  createOffer: vi.fn().mockResolvedValue({}),
  close: vi.fn(),
}))

global.navigator.mediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: () => [],
  }),
} as any

describe('WebRTCService', () => {
  let service: WebRTCService

  beforeEach(() => {
    service = new WebRTCService({
      iceServers: [{ urls: 'stun:test.com' }],
      streamConstraints: { video: true, audio: true },
    })
  })

  it('초기화 시 로컬 스트림 획득', async () => {
    const spy = vi.fn()
    service.on('local-stream-ready', spy)

    await service.initialize()

    expect(spy).toHaveBeenCalled()
  })

  it('Offer 생성 가능', async () => {
    await service.initialize()
    const offer = await service.createOffer()

    expect(offer).toBeDefined()
  })
})
```

### MSW (WebSocket 모킹)

```typescript
// ====================================
// mocks/handlers/websocket.ts
// ====================================
import { ws } from 'msw'

export const websocketHandlers = [
  ws.link('wss://api.cotept.com/ws'),
  ws.addEventListener('connection', ({ client }) => {
    client.addEventListener('message', (event) => {
      if (event.data === 'chat-message') {
        client.send(JSON.stringify({ type: 'chat-message', content: 'Mock' }))
      }
    })
  }),
]
```

---

## 참조

### 라이브러리
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Socket.IO](https://socket.io/)
- [Y.js](https://yjs.dev/)
- [y-monaco](https://github.com/yjs/y-monaco)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

### 내부 문서
- [Frontend Architecture Guide](./frontend-architecture-guide.md)
- [Shared Utils](../../packages/shared/src/lib/utils.ts)

---

**마지막 업데이트**: 2025-01-19
**작성자**: CotePT Development Team
**버전**: 1.0.0
