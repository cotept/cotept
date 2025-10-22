# CotePT 프론트엔드 아키텍처 설계 문서

## 1. 개요

본 문서는 CotePT 프로젝트의 프론트엔드 아키텍처를 정의하고, 확장성, 유지보수성, 개발자 경험을 극대화하기 위한 기술 전략과 패턴을 기술합니다. 대화 형식의 논의를 바탕으로 최종 아키텍처를 체계적으로 정리했습니다.

---

## 2. 코어 원칙 및 ViewModel 전략

### 2.1. 문제 정의

백엔드로부터 받은 데이터(DTO)를 가공하여 뷰에 표시하는 과정에서, 데이터 변환, 상태 관리, 권한 검증 로직이 복잡하게 얽히는 문제를 해결하는 것을 목표로 합니다.

### 2.2. 핵심 원칙: "1-Depth" 규칙

복잡한 데이터 변환 체인을 지양하고, 각 단계를 명시적인 중간 변수로 분리하여 코드의 가독성과 디버깅 용이성을 높입니다.

- **❌ 안티 패턴: 중첩된 함수 체인**
  ```typescript
  const data = transformA(transformB(transformC(rawData)))
  ```
- **✅ 권장 패턴: 단계별 변환**
  ```typescript
  const step1 = transformC(rawData)
  const step2 = transformB(step1)
  const data = transformA(step2)
  ```

### 2.3. 레이어드 아키텍처 (Layered Architecture)

책임 분리 원칙에 따라 프론트엔드 로직을 4개의 명확한 레이어로 분리합니다.

1.  **Layer 1: 순수 유틸리티 (`/packages/shared/src/utils`)**
    - **책임**: 순수 함수(Pure Function)를 통해 데이터 포맷팅, 기본 검증 등 재사용 가능한 로직을 제공합니다.
    - **특징**: 사이드 이펙트가 없으며, 입력과 출력만으로 동작이 보장됩니다.

2.  **Layer 2: ViewModel 생성 (`/apps/web/src/features/[domain]/models`)**
    - **책임**: DTO와 현재 사용자 상태(권한 등)를 입력받아, 뷰에 필요한 데이터와 상태 플래그를 포함하는 `ViewModel` 객체를 생성합니다.
    - **특징**: 복잡한 비즈니스 로직과 권한 계산이 이 레이어에 집중됩니다. 컴포넌트는 `ViewModel`의 boolean 플래그만 확인하면 됩니다.

3.  **Layer 3: 커스텀 훅 (`/apps/web/src/features/[domain]/hooks`)**
    - **책임**: API 호출(TanStack Query), 상태 관리(useState, useReducer), `ViewModel` 생성을 담당하며, 뷰 로직을 컴포넌트로부터 분리합니다.
    - **특징**: `useMemo`를 활용하여 `ViewModel` 생성을 최적화합니다.

4.  **Layer 4: 컴포넌트 (`/apps/web/src/containers` & `components`)**
    - **책임**: 커스텀 훅으로부터 `ViewModel`을 전달받아 UI를 렌더링하는 데 집중합니다.
    - **특징**: 조건문과 비즈니스 로직을 최소화하고, 선언적으로 뷰를 기술합니다.

### 2.4. 아키텍처 예시

#### 2.4.1. 사용자 프로필 예시

```typescript
// ====================================
// Layer 1: 순수 데이터 변환 (shared/utils)
// ====================================
export const formatters = {
  toKoreanDate: (iso: string) => new Date(iso).toLocaleDateString('ko-KR'),
  toDisplayName: (firstName: string, lastName: string) => `${lastName} ${firstName}`,
  toProfileImage: (url: string | null) => url || '/default-avatar.png',
} as const;

export const validators = {
  isAdult: (birthDate: string) => {
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    return age >= 19;
  },
} as const;

// ====================================
// Layer 2: 뷰모델 생성 (features/user/models)
// ====================================
import { formatters, validators } from '@/shared/utils';

export interface UserViewModel {
  displayName: string;
  profileImage: string;
  joinedAt: string;
  canEditProfile: boolean;
  canAccessMentoring: boolean;
  _raw: UserDto;
}

export const createUserViewModel = (dto: UserDto, currentUserId: string, currentUserRole: string): UserViewModel => {
  // 1뎁스: 단순 변환
  const displayName = formatters.toDisplayName(dto.firstName, dto.lastName);
  const profileImage = formatters.toProfileImage(dto.profileImageUrl);
  const joinedAt = formatters.toKoreanDate(dto.createdAt);

  // 1뎁스: 권한 계산
  const canEditProfile = dto.id === currentUserId || currentUserRole === 'admin';
  const canAccessMentoring = validators.isAdult(dto.birthDate);

  return {
    displayName,
    profileImage,
    joinedAt,
    canEditProfile,
    canAccessMentoring,
    _raw: dto,
  };
};

// ====================================
// Layer 3: 커스텀 훅 (features/user/hooks)
// ====================================
export function useUserProfile(userId: string) {
  const { data: currentUser } = useAuth();
  const { data: userDto, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.users.getById(userId),
  });

  const viewModel = useMemo(() => {
    if (!userDto || !currentUser) return null;
    return createUserViewModel(userDto, currentUser.id, currentUser.role);
  }, [userDto, currentUser]);

  return {
    user: viewModel,
    isLoading,
  };
}

// ====================================
// Layer 4: 컴포넌트 (containers/user)
// ====================================
export function UserProfileContainer({ userId }: Props) {
  const { user, isLoading } = useUserProfile(userId);

  if (isLoading) return <Skeleton />;
  if (!user) return <ErrorState />;

  return (
    <div>
      <Avatar src={user.profileImage} />
      <h1>{user.displayName}</h1>
      <p>가입일: {user.joinedAt}</p>

      {user.canEditProfile && <Button>프로필 수정</Button>}
      {user.canAccessMentoring && <MentoringSection />}
    </div>
  );
}
```

#### 2.4.2. 온보딩 페이지 리팩토링 예시

```typescript
// ====================================
// features/onboarding/models/onboarding.viewmodel.ts
// ====================================
export interface OnboardingStep {
  id: string;
  title: string;
  isCompleted: boolean;
  isActive: boolean;
  canProceed: boolean;
}

export interface OnboardingViewModel {
  currentStepIndex: number;
  steps: OnboardingStep[];
  progressPercentage: number;
  canGoNext: boolean;
  canGoBack: boolean;
  isLastStep: boolean;
}

export const createOnboardingViewModel = (currentStep: number, formData: Partial<OnboardingFormData>): OnboardingViewModel => {
  const steps: OnboardingStep[] = [
    { id: 'role', title: '역할 선택', isCompleted: !!formData.role, isActive: currentStep === 0, canProceed: !!formData.role },
    { id: 'profile', title: '프로필 설정', isCompleted: !!formData.nickname, isActive: currentStep === 1, canProceed: !!formData.nickname },
    { id: 'baekjoon', title: '백준 연동', isCompleted: !!formData.baekjoonHandle, isActive: currentStep === 2, canProceed: !!formData.baekjoonHandle },
  ];

  const currentStepData = steps[currentStep];
  const canGoNext = currentStepData?.canProceed ?? false;
  const canGoBack = currentStep > 0;
  const isLastStep = currentStep === steps.length - 1;

  return {
    currentStepIndex: currentStep,
    steps,
    progressPercentage: ((currentStep + 1) / steps.length) * 100,
    canGoNext,
    canGoBack,
    isLastStep,
  };
};

// ====================================
// features/onboarding/hooks/useOnboarding.ts
// ====================================
export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OnboardingFormData>>({});

  const viewModel = useMemo(() => createOnboardingViewModel(currentStep, formData), [currentStep, formData]);

  const goNext = useCallback(() => {
    if (viewModel.canGoNext && !viewModel.isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [viewModel]);

  const goBack = useCallback(() => {
    if (viewModel.canGoBack) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [viewModel]);

  const updateFormData = useCallback((data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  return { viewModel, formData, goNext, goBack, updateFormData };
}

// ====================================
// containers/onboarding/OnBoardingContainer.tsx
// ====================================
export function OnBoardingContainer() {
  const { viewModel, formData, goNext, goBack, updateFormData } = useOnboarding();

  return (
    <div>
      <ProgressBar value={viewModel.progressPercentage} />
      <StepIndicator steps={viewModel.steps} />

      {viewModel.currentStepIndex === 0 && <RoleSelectionStep value={formData.role} onChange={(role) => updateFormData({ role })} />}
      {viewModel.currentStepIndex === 1 && <ProfileSetupStep value={{ nickname: formData.nickname }} onChange={(data) => updateFormData(data)} />}

      <div>
        <Button onClick={goBack} disabled={!viewModel.canGoBack}>이전</Button>
        <Button onClick={goNext} disabled={!viewModel.canGoNext}>
          {viewModel.isLastStep ? '완료' : '다음'}
        </Button>
      </div>
    </div>
  );
}
```

---

## 3. 기술 스택 및 패턴 상세

### 3.1. Validation: Zod

- **전략**: 3-Layer Validation 구조를 통해 타입 안정성과 재사용성을 확보합니다.

```typescript
// ✅ 3-Layer Validation Structure

// Layer 1: Atomic Rules (packages/shared/src/rules)
export const commonRules = {
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "영문 대소문자, 숫자 포함 필수"),
  nickname: z.string().min(2, "닉네임은 2자 이상").max(20, "닉네임은 20자 이하"),
} as const

// Layer 2: Domain Schemas (features/[domain]/lib/validations)
export const userProfileSchema = z.object({
  nickname: commonRules.nickname,
  bio: z.string().max(500, "소개는 500자 이하").optional(),
})

export const mentorOnboardingSchema = z.object({
  role: z.literal("mentor"),
  profile: userProfileSchema,
  specialties: z.array(z.string()).min(1, "전문 분야를 1개 이상 선택하세요"),
})

// Layer 3: Runtime Validation (hooks/utils)
export function validateWithZod<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    errors: result.error.errors.map((e) => e.message),
  }
}
```

### 3.2. Authorization: CASL

- **전략**: RBAC(역할 기반)과 ABAC(속성 기반)을 통합하여 복잡한 권한 시나리오를 선언적으로 관리합니다.

```typescript
// ====================================
// shared/abilities/types.ts
// ====================================
export type Role = 'admin' | 'mentor' | 'mentee';
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'start' | 'join';
export type Subjects = 'Session' | 'User' | 'MentorProfile' | 'Recording' | 'all';

// ABAC용 리소스 타입
export interface SessionResource {
  __typename: 'Session';
  mentorId: string;
  menteeId: string;
  status: 'scheduled' | 'ongoing' | 'finished';
}

// ====================================
// shared/abilities/defineAbilities.ts
// ====================================
import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export function defineAbilitiesFor(user: { id: string; role: Role; isPremium?: boolean }) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (user.role === 'admin') {
    can('manage', 'all');
  } else if (user.role === 'mentor') {
    can('create', 'Session');
    // ABAC: 자신의 세션만 제어
    can('update', 'Session', { mentorId: user.id });
    can('start', 'Session', { mentorId: user.id, status: 'scheduled' });
    // ABAC: 프리미엄 멘토 추가 권한
    if (user.isPremium) {
      can('create', 'Session', { isPrivate: true });
    }
  } else if (user.role === 'mentee') {
    // ABAC: 진행 중인 세션만 참여 가능
    can('join', 'Session', { menteeId: user.id, status: 'ongoing' });
    cannot('create', 'Session');
  }

  return build();
}

// ====================================
// shared/abilities/hooks/useAbility.ts
// ====================================
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export function useAbility() {
  const { data: session } = useSession();
  return useMemo(() => {
    if (!session?.user) return null;
    return defineAbilitiesFor(session.user);
  }, [session]);
}

// ====================================
// 컴포넌트 레벨 사용 예시
// ====================================
import { Can } from '@casl/react';

export function SessionCard({ session }: { session: SessionResource }) {
  const ability = useAbility();

  return (
    <Can I="start" this={session} ability={ability}>
      <Button>세션 시작</Button>
    </Can>
  );
}
```

- **중요**: 프론트엔드 권한은 UX 최적화용이며, 모든 민감한 작업은 **반드시 백엔드에서 재검증**되어야 합니다.

### 3.3. UI 구성: Compound Component

- **전략**: UI 컴포넌트의 유연성과 재사용성을 극대화하기 위해 Compound Component 패턴을 적극적으로 사용합니다.

```typescript
// shared/ui/FormStep/FormStep.tsx
const FormStepContext = createContext<{
  currentStep: number;
  goNext: () => void;
  goBack: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
} | null>(null);

// Hook to contain logic
const useFormStep = (props) => {
  // ... state and logic for steps
  return { ... };
}

export function FormStep({ children, ...props }) {
  const value = useFormStep(props);
  return <FormStepContext.Provider value={value}>{children}</FormStepContext.Provider>;
}

FormStep.Header = function Header({ children }) {
  return <div className="form-step-header">{children}</div>;
};

FormStep.Content = function Content({ step, children }) {
  const ctx = useContext(FormStepContext);
  if (ctx!.currentStep !== step) return null;
  return <div className="form-step-content">{children}</div>;
};

FormStep.NextButton = function NextButton(props) {
  const ctx = useContext(FormStepContext);
  return <Button {...props} onClick={ctx!.goNext} disabled={!ctx!.canGoNext} />;
};

// 사용 예시
<FormStep>
  <FormStep.Header><h1>온보딩</h1></FormStep.Header>
  <FormStep.Content step={0}><RoleSelectionStep /></FormStep.Content>
  <FormStep.Content step={1}><ProfileSetupStep /></FormStep.Content>
  <FormStep.NextButton>다음</FormStep.NextButton>
</FormStep>
```

### 3.4. Styling: CVA + Tailwind CSS

- **전략**: `class-variance-authority` (CVA)를 사용하여 타입 안전하고 재사용 가능한 스타일 변형(variants)을 관리합니다.

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border border-gray-300",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

### 3.5. TypeScript: 고급 유틸리티

- **전략**: `Object.keys`, `Array.map` 등에서 발생하는 타입 손실을 방지하고, 중첩된 객체를 안전하게 다루기 위해 타입 유틸리티 라이브러리를 구축합니다.
- **위치**: `/packages/shared/src/types` 및 `/packages/shared/src/lib/utils`

```typescript
// packages/shared/src/types/types.ts

// 재귀적으로 모든 속성을 optional로 만듭니다.
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T

// 중첩 객체의 모든 경로를 "a.b.c" 형태의 문자열 리터럴로 추출합니다.
export type PathsToProps<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T]-?: K extends string
        ? T[K] extends object
          ? `${Prefix}${K}` | PathsToProps<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`
        : never
    }[keyof T]
  : never

// 경로 문자열로부터 값의 타입을 추론합니다.
export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never

// packages/shared/src/lib/utils.ts

// Object.keys의 타입 안전 버전
export function typedKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

// null 또는 undefined를 배열에서 필터링하고 타입을 좁힙니다.
export function filterNotNull<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((item): item is T => item !== null && item !== undefined)
}

// 중첩 객체 값을 경로 문자열로 안전하게 가져옵니다.
export function getByPath<T extends object, P extends PathsToProps<T>>(obj: T, path: P): PathValue<T, P> | undefined {
  return path.split(".").reduce((acc: any, key) => acc?.[key], obj) as any
}

// 두 객체를 깊게 병합합니다.
export function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const output = { ...target } as any
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = (source as any)[key]
      const targetValue = (target as any)[key]
      if (isObject(sourceValue) && isObject(targetValue)) {
        output[key] = deepMerge(targetValue, sourceValue)
      } else {
        output[key] = sourceValue
      }
    })
  }
  return output
}
```

---

## 4. Overlay (모달/다이얼로그) UI 전략

### 4.1. 현황 분석 및 결론

- 현재 `/apps/web/src/shared/ui/overlay`에 구현된 시스템은 Toss의 `overlay-kit` 핵심 패턴(External Events, Reducer, Promise API)을 완벽하게 구현한 **매우 훌륭한 시스템**입니다.
- **결론**: 현재의 견고한 구현을 유지하되, 사용 편의성을 높이는 헬퍼(Helper)를 추가하는 것이 최선입니다.

### 4.2. 개선 전략: 헬퍼 함수

보일러플레이트를 줄이기 위해, `createOverlayHelper` 또는 `overlayPresets` 같은 헬퍼 함수를 도입합니다.

```typescript
// shared/ui/overlay/helpers/createOverlayHelper.ts
export function createOverlayHelper<TProps, TResult = boolean>(
  Component: React.ComponentType<OverlayAsyncControllerProps<TResult> & TProps>
) {
  return (props: TProps): Promise<TResult> => {
    return overlay.openAsync<TResult>((controllerProps) => (
      <Component {...controllerProps} {...props} />
    ));
  };
}

// 사용 예시
const confirmDelete = createOverlayHelper(SystemConfirm);
const result = await confirmDelete({ title: "삭제 확인" });
```

### 4.3. 애니메이션

- **전략**: 기본 애니메이션은 **Tailwind CSS**(`data-[state=open]:animate-in`)를, 드래그 제스처 등 복잡한 상호작용이 필요한 경우에만 **Framer Motion**을 선택적으로 적용합니다.

---

## 5. 실시간 통신 아키텍처

CotePT의 핵심인 실시간 멘토링 기능을 위해, 프로토콜별 서비스 모듈 아키텍처를 도입합니다.

### 5.1. 구조

1.  **Service Layer (`/features/session/services`)**: WebRTC, WebSocket, Y.js(CRDT) 등 각 프로토콜의 로직을 담당하는 순수 TypeScript 클래스. React에 독립적입니다.
2.  **Hook Layer (`/features/session/hooks`)**: Service 인스턴스를 관리하고, Service의 이벤트를 React 상태와 동기화하는 브릿지 역할.
3.  **Component/Container Layer**: 훅이 제공하는 상태와 함수를 사용하여 UI를 렌더링합니다.

### 5.2. 예시: WebRTCService와 useWebRTC

```typescript
// ====================================
// features/session/services/webrtc/WebRTCService.ts
// ====================================
import { EventEmitter } from 'events';

export class WebRTCService extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;

  async initialize() {
    // PeerConnection 생성 및 이벤트 리스너 등록
    this.peerConnection = new RTCPeerConnection(...);
    this.peerConnection.onicecandidate = (event) => this.emit('ice-candidate', event.candidate);
    this.peerConnection.ontrack = (event) => this.emit('remote-stream-ready', event.streams[0]);
    // ...
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  toggleAudio(enabled?: boolean) {
    // ...
  }

  dispose() {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.peerConnection?.close();
    this.removeAllListeners();
  }
}

// ====================================
// features/session/hooks/useWebRTC.ts
// ====================================
import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebRTC(config: WebRTCConfig) {
  const serviceRef = useRef<WebRTCService | null>(null);
  const [state, setState] = useState<WebRTCState>({ ... });

  useEffect(() => {
    const service = new WebRTCService(config);
    serviceRef.current = service;

    service.on('connection-state-changed', (connectionState) => setState((prev) => ({ ...prev, connectionState })));
    service.on('local-stream-ready', (localStream) => setState((prev) => ({ ...prev, localStream })));
    // ...

    service.initialize();
    return () => service.dispose();
  }, [config]);

  const createOffer = useCallback(() => serviceRef.current?.createOffer(), []);
  const toggleAudio = useCallback(() => serviceRef.current?.toggleAudio(), []);

  return { ...state, createOffer, toggleAudio };
}
```

### 5.3. 예시: CRDT Service (Y.js)와 협업 에디터

WebRTC와 동일한 서비스-훅-컴포넌트 패턴을 적용하여 Y.js 기반의 실시간 협업 에디터 기능을 구현합니다.

```typescript
// ====================================
// features/session/services/crdt/CRDTService.ts
// ====================================
import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"

export class CRDTService {
  private ydoc: Y.Doc
  private provider: WebsocketProvider
  private ytext: Y.Text

  constructor(sessionId: string) {
    this.ydoc = new Y.Doc()
    this.ytext = this.ydoc.getText("monaco")

    this.provider = new WebsocketProvider("wss://api.cotept.com/yjs", `session-${sessionId}`, this.ydoc)
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
import { MonacoBinding } from "y-monaco"
import type * as monaco from "monaco-editor"
import { CRDTService } from "./CRDTService"

export function createMonacoBinding(editor: monaco.editor.IStandaloneCodeEditor, crdtService: CRDTService) {
  return new MonacoBinding(
    crdtService.getYText(),
    editor.getModel()!,
    new Set([editor]),
    crdtService.getProvider().awareness,
  )
}

// ====================================
// features/session/hooks/useCollaborativeEditor.ts
// ====================================
import { useEffect, useRef, useState, useCallback } from "react"
import { CRDTService } from "../services/crdt/CRDTService"
import { createMonacoBinding } from "../services/crdt/MonacoBinding"
import type { MonacoBinding } from "y-monaco"
import type * as monaco from "monaco-editor"

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

  return {
    bindEditor,
    awareness,
  }
}
```

---

## 6. 프론트엔드 아키텍처 최종 체크리스트

### 6.1. 논의 완료 및 정립된 영역 (8가지)

- [x] **View & ViewModel**: 레이어드 아키텍처 및 타입 유틸리티
- [x] **Compound Component**: UI 유연성 확보
- [x] **Overlay**: 현재 구현(Overlay Kit 패턴) 유지 및 헬퍼 추가
- [x] **Styling**: CVA + Tailwind CSS
- [x] **Type Safety**: 고급 TypeScript 유틸리티
- [x] **Authorization**: CASL (RBAC + ABAC)
- [x] **Animation**: Tailwind + Framer Motion (선택적)
- [x] **Validation**: Zod 스키마 체계

### 6.2. 추가로 설계 및 구축이 필요한 중요 영역 (7가지)

- [ ] **실시간 통신 (P0)**: WebRTC, WebSocket, Y.js 서비스 모듈 설계 (가장 중요)
- [ ] **에러 핸들링 (P0)**: `ErrorBoundary`, API 에러 핸들러, TanStack Query 연동
- [ ] **상태 관리 (P0)**: TanStack Query 중심 전략, `Zustand` 최소 사용
- [ ] **라우팅 (P0)**: Next.js App Router 기반 인증/인가 가드(Middleware)
- [ ] **성능 최적화 (P1)**: Code Splitting, Virtual Scrolling, Bundle Analyzer 도입
- [ ] **테스트 (P1)**: Vitest, MSW, Playwright를 활용한 테스트 인프라 구축
- [ ] **접근성 (P1)**: `eslint-plugin-jsx-a11y`, `axe-devtools`를 통한 WCAG 2.1 AA 준수

---

## 7. 테스트 전략

- **Unit Tests (Vitest)**: Service Layer, 유틸리티 함수 등 순수 로직을 테스트합니다.
- **Component Tests (Vitest + Testing Library)**: 컴포넌트가 props에 따라 올바르게 렌더링되고 상호작용하는지 테스트합니다.
- **API/WebSocket Mocking (MSW)**: 네트워크 요청을 모킹하여 외부 의존성 없이 테스트 환경을 제어합니다.
- **Visual Tests (Storybook)**: 컴포넌트를 시각적으로 문서화하고 다양한 상태를 시뮬레이션합니다.
- **E2E Tests (Playwright)**: 사용자 시나리오(회원가입, 세션 예약 등) 전체를 자동화하여 테스트합니다.

```typescript
// e2e/session-booking.spec.ts
import { test, expect } from "@playwright/test"

test("멘토링 세션 예약 플로우", async ({ page }) => {
  await page.goto("/dashboard/mentors")
  await page.click("text=홍길동 멘토")
  await page.click('button:has-text("세션 예약")')
  await page.fill('input[name="date"]', "2025-01-20")
  await page.click('button:has-text("결제하기")')
  await expect(page.locator("text=예약 완료")).toBeVisible()
})
```

---

## 8. 결론 및 다음 단계

본 아키텍처는 CotePT가 복잡한 실시간 상호작용을 처리하면서도 유지보수 가능하고 확장 가능한 애플리케이션으로 성장할 수 있는 견고한 기반을 제공합니다.

### 권장 다음 단계:

1.  **P0 - 기반 구축**:
    - **실시간 통신**: WebRTC 서비스 모듈 아키텍처 구현을 시작합니다.
    - **에러 핸들링**: 전역 `ErrorBoundary`와 API 에러 처리기를 구현합니다.
    - **상태 관리**: TanStack Query의 `QueryClient`를 설정하고 전역 상태 관리 전략을 확정합니다.
2.  **P1 - 인프라 및 품질**:
    - **테스트**: Vitest와 MSW를 설정하여 서비스 및 훅에 대한 단위/통합 테스트 작성을 시작합니다.
    - **성능**: `next/bundle-analyzer`를 도입하여 초기 번들 크기를 분석하고 최적화합니다.
