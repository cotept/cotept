# CotePT 프론트엔드 아키텍처 가이드

> CotePT 실시간 멘토링 서비스의 프론트엔드 아키텍처 설계 원칙 및 구현 가이드

**작성일**: 2025-01-19
**버전**: 1.0.0
**관련 문서**: [CLAUDE.md](../../CLAUDE.md), [Backend Endpoint Workflow](./BACKEND_ENDPOINT_WORKFLOW.md)

---

## 📋 목차

1. [아키텍처 개요](#아키텍처-개요)
2. [View & ViewModel 패턴](#view--viewmodel-패턴)
3. [Compound Component 패턴](#compound-component-패턴)
4. [Overlay 시스템](#overlay-시스템)
5. [스타일링 전략](#스타일링-전략)
6. [타입 안전성](#타입-안전성)
7. [권한 관리 (CASL)](#권한-관리-casl)
8. [유효성 검증 (Zod)](#유효성-검증-zod)
9. [실시간 프로토콜 서비스](#실시간-프로토콜-서비스)
10. [테스트 전략](#테스트-전략)
11. [성능 최적화](#성능-최적화)
12. [에러 핸들링](#에러-핸들링)

---

## 아키텍처 개요

### 핵심 원칙

```
Evidence > assumptions | Code > documentation | Efficiency > verbosity
```

**설계 철학**:
- **1뎁스 유지**: 복잡한 데이터 변환 체인을 중간 변수로 명시
- **레이어 분리**: Utils → Models → Hooks → Components → Containers
- **응집성 최우선**: 관련 로직은 한 곳에 모음
- **타입 안전성**: TypeScript strict 모드 + 고급 유틸리티 타입

### 디렉토리 구조

```
apps/web/src/
├── shared/
│   ├── validators/        # Zod 공통 규칙
│   ├── abilities/         # CASL 권한 정의
│   ├── utils/
│   │   ├── typescript.ts  # 타입 안전 유틸리티
│   │   ├── cn.ts          # clsx + twMerge
│   │   └── async.ts       # 비동기 헬퍼
│   └── ui/                # Compound Components (CVA)
│
├── features/[domain]/
│   ├── services/          # 프로토콜 서비스 (WebRTC, WebSocket, CRDT)
│   ├── schemas/           # Zod 스키마
│   ├── abilities/         # 도메인별 CASL 규칙
│   ├── models/            # ViewModel 팩토리
│   ├── hooks/             # 커스텀 훅
│   └── components/        # 도메인 컴포넌트
│
└── containers/[domain]/   # 페이지 레벨 컨테이너
```

---

## View & ViewModel 패턴

### 원칙

**데이터 가공의 3단계 분리**:
1. **Layer 1**: 순수 함수 (Utils) - 입력 → 출력
2. **Layer 2**: ViewModel 생성 (Models) - 권한 계산 포함
3. **Layer 3**: 커스텀 훅 (Hooks) - 상태 관리 + API 연동

### 구현 예시

```typescript
// ====================================
// Layer 1: 순수 데이터 변환 (shared/utils)
// ====================================
export const formatters = {
  toKoreanDate: (iso: string) => new Date(iso).toLocaleDateString('ko-KR'),
  toDisplayName: (firstName: string, lastName: string) => `${lastName} ${firstName}`,
  toProfileImage: (url: string | null) => url || '/default-avatar.png',
} as const

export const validators = {
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isAdult: (birthDate: string) => {
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear()
    return age >= 19
  },
} as const

// ====================================
// Layer 2: ViewModel 생성 (features/[domain]/models)
// ====================================
export interface UserViewModel {
  displayName: string
  profileImage: string
  joinedAt: string

  // 권한 플래그 (미리 계산)
  canEditProfile: boolean
  canAccessMentoring: boolean

  _raw: UserDto
}

export const createUserViewModel = (
  dto: UserDto,
  currentUserRole: UserRole
): UserViewModel => {
  // 1뎁스: 단순 변환
  const displayName = formatters.toDisplayName(dto.firstName, dto.lastName)
  const profileImage = formatters.toProfileImage(dto.profileImageUrl)
  const joinedAt = formatters.toKoreanDate(dto.createdAt)

  // 1뎁스: 권한 계산
  const canEditProfile = dto.id === currentUserRole || currentUserRole === 'admin'
  const canAccessMentoring = validators.isAdult(dto.birthDate)

  return {
    displayName,
    profileImage,
    joinedAt,
    canEditProfile,
    canAccessMentoring,
    _raw: dto,
  }
}

// ====================================
// Layer 3: 커스텀 훅 (features/[domain]/hooks)
// ====================================
export function useUserProfile(userId: string) {
  const { data: currentUser } = useAuth()
  const { data: userDto, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.users.getById(userId),
  })

  const viewModel = useMemo(() => {
    if (!userDto || !currentUser) return null
    return createUserViewModel(userDto, currentUser.role)
  }, [userDto, currentUser])

  return { user: viewModel, isLoading }
}

// ====================================
// Layer 4: 컴포넌트 (containers/[domain])
// ====================================
export function UserProfileContainer({ userId }: Props) {
  const { user, isLoading } = useUserProfile(userId)

  if (isLoading) return <Skeleton />
  if (!user) return <ErrorState />

  return (
    <div>
      <Avatar src={user.profileImage} />
      <h1>{user.displayName}</h1>
      <p>가입일: {user.joinedAt}</p>

      {user.canEditProfile && <Button>프로필 수정</Button>}
      {user.canAccessMentoring && <MentoringSection />}
    </div>
  )
}
```

**`★ Insight`**:
- **1뎁스 원칙**: 각 단계에서 중간 변수로 명시적 표현
- **권한 사전 계산**: ViewModel에서 boolean 플래그로 제공
- **컴포넌트 단순화**: `if (viewModel.canX)` 조건문만 사용

---

## Compound Component 패턴

### 원칙

**유연한 UI 구성을 위한 조합 가능한 컴포넌트**:
- Context API로 상태 공유
- 서브 컴포넌트로 UI 조립
- 디자이너가 수정하기 쉬운 구조

### 구현 예시

```typescript
// ====================================
// shared/ui/FormStep/FormStep.tsx
// ====================================
const FormStepContext = createContext<{
  currentStep: number
  totalSteps: number
  goNext: () => void
  goBack: () => void
  canGoNext: boolean
  canGoBack: boolean
} | null>(null)

export function FormStep({ children, ...props }: FormStepProps) {
  const value = useFormStepLogic(props)

  return (
    <FormStepContext.Provider value={value}>
      <div className="form-step">{children}</div>
    </FormStepContext.Provider>
  )
}

FormStep.Header = function Header({ children }: { children: ReactNode }) {
  return <div className="form-step-header">{children}</div>
}

FormStep.Progress = function Progress() {
  const ctx = useContext(FormStepContext)
  return <ProgressBar value={(ctx!.currentStep / ctx!.totalSteps) * 100} />
}

FormStep.Content = function Content({ step, children }: ContentProps) {
  const ctx = useContext(FormStepContext)
  if (ctx!.currentStep !== step) return null
  return <div className="form-step-content">{children}</div>
}

FormStep.BackButton = function BackButton(props: ButtonProps) {
  const ctx = useContext(FormStepContext)
  return <Button {...props} onClick={ctx!.goBack} disabled={!ctx!.canGoBack} />
}

FormStep.NextButton = function NextButton(props: ButtonProps) {
  const ctx = useContext(FormStepContext)
  return <Button {...props} onClick={ctx!.goNext} disabled={!ctx!.canGoNext} />
}

// ====================================
// 사용 예시
// ====================================
<FormStep currentStep={0} totalSteps={3}>
  <FormStep.Header>
    <h1>온보딩</h1>
    <FormStep.Progress />
  </FormStep.Header>

  <FormStep.Content step={0}>
    <RoleSelectionStep />
  </FormStep.Content>

  <FormStep.Content step={1}>
    <ProfileSetupStep />
  </FormStep.Content>

  <FormStep.Actions>
    <FormStep.BackButton>이전</FormStep.BackButton>
    <FormStep.NextButton>다음</FormStep.NextButton>
  </FormStep.Actions>
</FormStep>
```

**`★ Insight`**:
- **유연성**: UI 순서/구조를 컴포넌트 외부에서 제어
- **재사용성**: 동일한 로직으로 다양한 UI 조합 가능
- **타입 안전성**: Context API로 props 자동 전파

---

## Overlay 시스템

### 아키텍처

**Toss Overlay Kit 패턴 기반**:
- External Events로 전역 제어
- Promise 기반 비동기 API
- Reducer로 중앙 상태 관리
- shadcn/ui 통합 (접근성 보장)

### 핵심 API

```typescript
// ====================================
// 동기 방식 (알림)
// ====================================
overlay.open(({ isOpen, close, overlayId, unmount }) => (
  <SystemAlert
    isOpen={isOpen}
    close={close}
    overlayId={overlayId}
    unmount={unmount}
    variant="success"
    description="저장되었습니다"
    autoClose={3000}
  />
))

// ====================================
// 비동기 방식 (확인/취소)
// ====================================
const confirmed = await overlay.openAsync<boolean>(({ isOpen, close, ...props }) => (
  <SystemConfirm
    {...props}
    isOpen={isOpen}
    close={close}
    title="삭제 확인"
    description="정말 삭제하시겠습니까?"
    confirmVariant="destructive"
  />
))

if (confirmed) {
  await deleteItem(itemId)
}
```

### 편의성 헬퍼

```typescript
// ====================================
// shared/ui/overlay/helpers/createOverlayHelper.ts
// ====================================
export function createOverlayHelper<TProps, TResult = boolean>(
  Component: React.ComponentType<OverlayAsyncControllerProps<TResult> & TProps>
) {
  return (props: TProps): Promise<TResult> => {
    return overlay.openAsync<TResult>((controllerProps) => (
      <Component {...controllerProps} {...props} />
    ))
  }
}

// ====================================
// 사용
// ====================================
const confirm = createOverlayHelper(SystemConfirm)

const result = await confirm({
  title: "세션 삭제",
  description: "정말 삭제하시겠습니까?",
})
```

**참조**: [Overlay 시스템 상세 문서](../web/src/shared/ui/overlay/README.md)

---

## 스타일링 전략

### CVA + Tailwind CSS 조합

**선택 이유**:
- 타입 안전성 (Variant 타입 자동 생성)
- 조건부 스타일 (cva 함수)
- 디자인 토큰 통합 (Tailwind config)
- 번들 최적화 (PurgeCSS)

### 구현 예시

```typescript
// ====================================
// shared/ui/button/Button.tsx
// ====================================
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border border-gray-300 hover:bg-gray-50",
        ghost: "hover:bg-gray-100",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

---

## 타입 안전성

### Deep 타입 유틸리티

```typescript
// ====================================
// packages/shared/src/types/types.ts
// ====================================

// 재귀적 Partial
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

// 재귀적 Required
export type DeepRequired<T> = T extends object
  ? { [P in keyof T]-?: DeepRequired<T[P]> }
  : T

// 재귀적 Readonly
export type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T

// 재귀적 NonNullable
export type DeepNonNullable<T> = T extends object
  ? { [P in keyof T]: DeepNonNullable<NonNullable<T[P]>> }
  : NonNullable<T>

// 중첩 객체 경로 추출
export type PathsToProps<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]-?: K extends string
        ? T[K] extends object
          ? `${Prefix}${K}` | PathsToProps<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`
        : never
    }[keyof T]
  : never
```

### 타입 안전 유틸리티

```typescript
// ====================================
// packages/shared/src/lib/utils.ts
// ====================================

// Type-Safe Object.keys
export function typedKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

// Type-Safe Object.entries
export function typedEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

// 깊은 병합 (DeepPartial 업데이트용)
export function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const output = { ...target } as any

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key]) && isObject(target[key])) {
        output[key] = deepMerge(target[key], source[key])
      } else {
        output[key] = source[key]
      }
    })
  }

  return output
}

// 중첩 객체 경로 접근
export function getByPath<T extends object, P extends PathsToProps<T>>(
  obj: T,
  path: P
): PathValue<T, P> | undefined {
  return path.split('.').reduce((acc: any, key) => acc?.[key], obj) as any
}
```

**`★ Insight`**:
- **DeepPartial**: 뷰모델 부분 업데이트에 필수
- **typedKeys**: Object.keys 타입 손실 방지
- **deepMerge**: 중첩 객체 안전 병합

---

## 권한 관리 (CASL)

### RBAC + ABAC 통합

**Role-Based Access Control + Attribute-Based Access Control**

```typescript
// ====================================
// shared/abilities/defineAbilities.ts
// ====================================
import { AbilityBuilder, createMongoAbility } from '@casl/ability'

export type Role = 'admin' | 'mentor' | 'mentee'
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'start' | 'join'
export type Subjects = 'Session' | 'User' | 'Recording' | 'all'

export function defineAbilitiesFor(user: { id: string; role: Role; isPremium?: boolean }) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

  if (user.role === 'admin') {
    can('manage', 'all')
    return build()
  }

  if (user.role === 'mentor') {
    // Role 기반
    can('create', 'Session')

    // Attribute 기반 (자신의 세션만)
    can('update', 'Session', { mentorId: user.id })
    can('delete', 'Session', { mentorId: user.id, status: 'scheduled' })
    can('start', 'Session', { mentorId: user.id, status: 'scheduled' })

    // Premium 멘토 추가 권한
    if (user.isPremium) {
      can('record', 'Session', { mentorId: user.id })
    }
  }

  if (user.role === 'mentee') {
    can('read', 'Session', { menteeId: user.id })
    can('join', 'Session', { menteeId: user.id, status: 'ongoing' })

    cannot('create', 'Session')
    cannot('delete', 'Session')
  }

  return build()
}

// ====================================
// 사용 예시
// ====================================
import { Can } from '@casl/react'

export function SessionCard({ session }: Props) {
  const ability = useAbility()

  return (
    <Card>
      <Can I="start" this={session} ability={ability}>
        <Button onClick={handleStart}>세션 시작</Button>
      </Can>

      <Can I="join" this={session} ability={ability}>
        <Button onClick={handleJoin}>세션 참여</Button>
      </Can>
    </Card>
  )
}
```

**`★ Insight`**:
- **RBAC**: Role 기반 기본 권한
- **ABAC**: 리소스 속성 기반 조건부 권한
- **선언적 UI**: `<Can>` 컴포넌트로 권한 제어

**참조**: [CASL 공식 문서](https://casl.js.org/)

---

## 유효성 검증 (Zod)

### 3-Layer Validation

```typescript
// ====================================
// Layer 1: Atomic Rules (packages/shared/validators)
// ====================================
export const commonRules = {
  email: z.string().email("올바른 이메일 형식이 아닙니다"),

  password: z.string()
    .min(8, "비밀번호는 8자 이상")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "영문 대소문자, 숫자 포함 필수"),

  nickname: z.string()
    .min(2, "닉네임은 2자 이상")
    .max(20, "닉네임은 20자 이하")
    .regex(/^[가-힣a-zA-Z0-9_]+$/, "한글, 영문, 숫자, _ 만 가능"),
} as const

// ====================================
// Layer 2: Domain Schemas (features/[domain]/schemas)
// ====================================
export const userProfileSchema = z.object({
  nickname: commonRules.nickname,
  bio: z.string().max(500, "소개는 500자 이하").optional(),
  profileImageUrl: z.string().url().optional(),
})

export const mentorOnboardingSchema = z.object({
  role: z.literal('mentor'),
  profile: userProfileSchema,
  baekjoonHandle: commonRules.baekjoonHandle,
  specialties: z.array(z.string()).min(1, "전문 분야를 1개 이상 선택"),
})

// ====================================
// Layer 3: React Hook Form 통합
// ====================================
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

export function useSignupForm() {
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      nickname: '',
    },
  })

  return form
}
```

**`★ Insight`**:
- **재사용성**: commonRules로 규칙 공유
- **타입 추론**: `z.infer<typeof schema>` 자동 타입 생성
- **에러 메시지**: 한글화된 유효성 검증 메시지

**참조**: [packages/shared/src/rules/rule-helper.ts](../../packages/shared/src/rules/rule-helper.ts)

---

## 실시간 프로토콜 서비스

### Service-Hook-Component 패턴

**프로토콜별 독립 모듈** (WebRTC, WebSocket, CRDT, MSE):

```typescript
// ====================================
// 1. Service Layer (순수 TypeScript)
// ====================================
export class WebRTCService extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null

  constructor(private config: WebRTCConfig) {
    super()
  }

  async initialize() {
    this.peerConnection = new RTCPeerConnection(this.config.iceServers)
    this.setupPeerConnectionListeners()
    await this.startLocalStream()
  }

  private setupPeerConnectionListeners() {
    this.peerConnection!.ontrack = (event) => {
      this.emit('remote-stream-ready', event.streams[0])
    }

    this.peerConnection!.onicecandidate = (event) => {
      if (event.candidate) this.emit('ice-candidate', event.candidate)
    }
  }

  toggleAudio(enabled?: boolean) {
    const audioTrack = this.localStream?.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = enabled ?? !audioTrack.enabled
      return audioTrack.enabled
    }
    return false
  }

  dispose() {
    this.localStream?.getTracks().forEach(track => track.stop())
    this.peerConnection?.close()
    this.removeAllListeners()
  }
}

// ====================================
// 2. Hook Layer (React 브릿지)
// ====================================
export function useWebRTC(config: WebRTCConfig) {
  const serviceRef = useRef<WebRTCService | null>(null)
  const [state, setState] = useState({
    localStream: null,
    remoteStream: null,
    isAudioEnabled: true,
  })

  useEffect(() => {
    const service = new WebRTCService(config)
    serviceRef.current = service

    service.on('local-stream-ready', (stream) => {
      setState(prev => ({ ...prev, localStream: stream }))
    })

    service.on('remote-stream-ready', (stream) => {
      setState(prev => ({ ...prev, remoteStream: stream }))
    })

    service.initialize()

    return () => service.dispose()
  }, [config])

  const toggleAudio = useCallback(() => {
    if (serviceRef.current) {
      const enabled = serviceRef.current.toggleAudio()
      setState(prev => ({ ...prev, isAudioEnabled: enabled }))
    }
  }, [])

  return { ...state, toggleAudio }
}

// ====================================
// 3. Component Layer
// ====================================
export function SessionLiveContainer({ sessionId }: Props) {
  const webrtc = useWebRTC({
    iceServers: [{ urls: 'stun:sfu.cotept.com:3478' }],
    streamConstraints: { video: true, audio: true },
  })

  return (
    <div>
      <video ref={localVideoRef} srcObject={webrtc.localStream} />
      <video ref={remoteVideoRef} srcObject={webrtc.remoteStream} />

      <Button onClick={webrtc.toggleAudio}>
        {webrtc.isAudioEnabled ? <Mic /> : <MicOff />}
      </Button>
    </div>
  )
}
```

**`★ Insight`**:
- **Service**: EventEmitter 기반, React 독립적
- **Hook**: useRef로 Service 인스턴스 유지
- **Component**: Hook만 소비, 비즈니스 로직 없음

**상세**: [실시간 프로토콜 서비스 가이드](./realtime-protocol-services.md)

---

## 테스트 전략

### 3-Layer 테스트

**1. Vitest** (Service Layer):
```typescript
// Service 단위 테스트
describe('WebRTCService', () => {
  it('로컬 스트림을 획득해야 함', async () => {
    const service = new WebRTCService(config)
    const spy = vi.fn()

    service.on('local-stream-ready', spy)
    await service.initialize()

    expect(spy).toHaveBeenCalled()
  })
})
```

**2. MSW** (API/WebSocket 모킹):
```typescript
// WebSocket 핸들러
export const websocketHandlers = [
  ws.link('wss://api.cotept.com/ws'),
  ws.addEventListener('connection', ({ client }) => {
    client.send(JSON.stringify({ type: 'chat-message' }))
  }),
]
```

**3. Storybook** (컴포넌트 문서화):
```typescript
export const Default: Story = {
  args: {
    session: mockSession,
    canStart: true,
  },
}
```

**`★ Insight`**:
- **Vitest**: 순수 로직 테스트 (Service)
- **MSW**: 네트워크 모킹 (API, WebSocket)
- **Storybook**: UI 문서화 및 시각적 테스트

---

## 성능 최적화

### 핵심 전략

```typescript
// 1. 코드 스플리팅
const SessionLiveView = dynamic(
  () => import('@/features/session/components/SessionLiveView'),
  { ssr: false }
)

// 2. 메모이제이션
const sessionsWithPermissions = useMemo(
  () => sessions.map(session => ({
    ...session,
    canStart: ability?.can('start', 'Session', session),
  })),
  [sessions, ability]
)

// 3. Virtual Scrolling
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: sessions.length,
  estimateSize: () => 120,
  overscan: 5,
})

// 4. Debounce (실시간 이벤트)
const debouncedSave = useMemo(
  () => debounce((content: string) => {
    apiClient.sessions.saveContent(sessionId, content)
  }, 2000),
  [sessionId]
)
```

**`★ Insight`**:
- **Dynamic Import**: WebRTC는 클라이언트만 실행
- **Memoization**: 권한 계산 캐싱
- **Virtual Scroll**: 대량 리스트 최적화

---

## 에러 핸들링

### 계층별 에러 처리

```typescript
// 1. React Error Boundary
export class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('React Error', { error, errorInfo })
    Sentry.captureException(error)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}

// 2. API Error Handler
export class ApiErrorHandler {
  handle(error: ApiError) {
    switch (error.status) {
      case 401:
        router.push('/auth/login')
        overlayPresets.showError('세션이 만료되었습니다')
        break
      case 403:
        overlayPresets.showError('접근 권한이 없습니다')
        break
      case 500:
        overlayPresets.showError('서버 오류가 발생했습니다')
        logger.error('Server Error', error)
        break
    }
  }
}

// 3. TanStack Query 통합
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error.status === 401 || error.status === 403) return false
        return failureCount < 3
      },
      onError: (error) => new ApiErrorHandler().handle(error),
    },
  },
})

// 4. WebRTC 재연결
private async handleReconnection() {
  try {
    await retry(
      async () => {
        const offer = await this.createOffer()
        await this.sendSignaling(offer)
      },
      { maxAttempts: 3, delay: 1000, backoff: 2 }
    )
  } catch (error) {
    this.emit('error', new Error('재연결 실패'))
  }
}
```

**`★ Insight`**:
- **ErrorBoundary**: React 컴포넌트 에러 catch
- **ApiErrorHandler**: 네트워크 에러 중앙 처리
- **Retry**: Exponential Backoff 재시도

---

## 참조 문서

### 핵심 문서
- [CLAUDE.md](../../CLAUDE.md) - 프로젝트 전체 가이드
- [Backend Endpoint Workflow](./BACKEND_ENDPOINT_WORKFLOW.md) - 백엔드 개발 워크플로우
- [Overlay 시스템](../web/src/shared/ui/overlay/README.md) - Overlay 상세 문서

### 외부 라이브러리
- [Zod](https://zod.dev/) - TypeScript 스키마 검증
- [CASL](https://casl.js.org/) - 권한 관리
- [TanStack Query](https://tanstack.com/query/latest) - 서버 상태 관리
- [CVA](https://cva.style/) - Variant 기반 스타일링
- [Radix UI](https://www.radix-ui.com/) - Headless UI 컴포넌트
- [Framer Motion](https://www.framer.com/motion/) - 애니메이션

---

## 체크리스트

### 개발 전 확인
- [ ] ViewModel 패턴 적용 (권한 사전 계산)
- [ ] Compound Component 패턴 검토
- [ ] Zod 스키마 정의
- [ ] CASL 권한 규칙 정의
- [ ] 타입 유틸리티 활용 (DeepPartial, typedKeys)

### 개발 중 확인
- [ ] 1뎁스 원칙 준수
- [ ] 커스텀 훅으로 로직 분리
- [ ] 프로토콜 서비스 패턴 준수
- [ ] 에러 핸들링 구현
- [ ] TypeScript strict 모드 통과

### 개발 후 확인
- [ ] 단위 테스트 작성 (Vitest)
- [ ] 컴포넌트 문서화 (Storybook)
- [ ] 성능 최적화 (메모이제이션, 코드 스플리팅)
- [ ] 접근성 검증 (WCAG 2.1 AA)
- [ ] 린트 및 타입 체크 통과

---

**마지막 업데이트**: 2025-01-19
**작성자**: CotePT Development Team
**버전**: 1.0.0
