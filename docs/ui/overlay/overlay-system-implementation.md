# CotePT Overlay System 구현 계획서

## 개요

toss/overlay-kit의 검증된 아키텍처와 Portal의 Z-index 관리 편의성을 결합한 **하이브리드 overlay 시스템**을 구축합니다. overlay-kit의 상태 관리 방식을 그대로 사용하되, 렌더링은 Portal을 통해 처리하여 최고의 개발자 경험을 제공합니다.

## 목표

- **검증된 API**: toss/overlay-kit과 100% 호환되는 API 제공
- **Z-index 관리 편의성**: Portal을 통한 자동 레이어 관리
- **상태 관리 안정성**: overlay-kit의 검증된 Reducer 패턴 사용
- **External Events**: 컴포넌트 외부에서 오버레이 제어 가능
- **타입 안전성**: 완전한 TypeScript 지원

## 아키텍처 설계

### 하이브리드 방식 개요

**overlay-kit의 상태 관리 + Portal의 렌더링** = 최고의 조합

```
상태 관리 (overlay-kit 방식)    렌더링 (Portal 방식)
┌─────────────────────────┐    ┌──────────────────────┐
│ External Events         │ -> │ createPortal         │
│ useReducer             │ -> │ Z-index 자동 관리     │
│ Context                │ -> │ DOM 분리             │
└─────────────────────────┘    └──────────────────────┘
```

### 전체 구조

```
src/shared/ui/overlay/
├── types/
│   ├── overlay.types.ts           # Controller, Reducer 관련 타입
│   └── index.ts
├── utils/
│   ├── createUseExternalEvents.ts # 외부 이벤트 시스템
│   ├── emitter.ts                 # 이벤트 발송
│   ├── randomId.ts               # 고유 ID 생성
│   ├── createSafeContext.ts      # 타입 안전한 Context
│   └── index.ts
├── context/
│   ├── context.ts                # 오버레이 Context 정의
│   ├── reducer.ts                # 오버레이 상태 관리 리듀서
│   └── index.ts
├── provider/
│   ├── OverlayProvider.tsx       # 메인 Provider (하이브리드)
│   ├── OverlayRenderer.tsx       # Portal 기반 렌더러
│   ├── ContentOverlayController.tsx # 개별 오버레이 컨트롤러
│   ├── createOverlayProvider.ts  # Factory 함수
│   └── index.ts
├── event/
│   ├── event.ts                  # overlay.open, overlay.openAsync API
│   └── index.ts
├── components/
│   ├── SystemConfirmDialog.tsx   # 시스템 확인 대화상자
│   ├── SystemAlertDialog.tsx     # 시스템 알림 대화상자
│   ├── SystemPromptDialog.tsx    # 시스템 입력 대화상자
│   ├── SystemToast.tsx          # 시스템 토스트 알림
│   └── index.ts
├── createOverlayContext.tsx      # 기본 overlay 인스턴스 생성
├── Overlay.stories.tsx           # Storybook 문서
└── index.ts                      # 전체 export
```

## 단계별 구현 계획

### 1단계: 핵심 타입 정의 (overlay-kit 기반)

```typescript
// types/overlay.types.ts - overlay-kit 스타일 타입 정의
type OverlayControllerProps = {
  overlayId: string;
  isOpen: boolean;
  close: () => void;
  unmount: () => void;
};

type OverlayAsyncControllerProps<T> = Omit<OverlayControllerProps, 'close'> & {
  close: (param: T) => void;
};

export type OverlayControllerComponent = FC<OverlayControllerProps>;
export type OverlayAsyncControllerComponent<T> = FC<OverlayAsyncControllerProps<T>>;

// Reducer 관련 타입
export type OverlayItem = {
  id: string;
  componentKey: string;
  isOpen: boolean;
  isMounted: boolean;
  controller: OverlayControllerComponent;
};

export type OverlayData = {
  current: string | null;
  overlayOrderList: string[];
  overlayData: Record<string, OverlayItem>;
};

export type OverlayReducerAction =
  | { type: 'ADD'; overlay: OverlayItem }
  | { type: 'OPEN'; overlayId: string }
  | { type: 'CLOSE'; overlayId: string }
  | { type: 'REMOVE'; overlayId: string }
  | { type: 'CLOSE_ALL' }
  | { type: 'REMOVE_ALL' };
```

### 2단계: External Events 시스템 (overlay-kit 방식)

```typescript
// utils/createUseExternalEvents.ts - overlay-kit의 핵심 시스템
export function createUseExternalEvents<T extends Record<string, (...args: any[]) => void>>(
  namespace: string
) {
  const emitterInstance = createEmitter<T>(namespace);
  
  const useExternalEvents = (events: T) => {
    useEffect(() => {
      Object.entries(events).forEach(([eventName, handler]) => {
        emitterInstance.on(eventName, handler);
      });
      
      return () => {
        Object.entries(events).forEach(([eventName, handler]) => {
          emitterInstance.off(eventName, handler);
        });
      };
    }, [events]);
  };
  
  const createEvent = <K extends keyof T>(eventName: K) => {
    return (...args: Parameters<T[K]>) => {
      emitterInstance.emit(eventName as string, ...args);
    };
  };
  
  return [useExternalEvents, createEvent] as const;
}

// event/event.ts - overlay.open, overlay.openAsync API
export function createOverlay(overlayId: string) {
  const [useOverlayEvent, createEvent] = createUseExternalEvents<OverlayEvent>(`${overlayId}/overlay-kit`);

  const open = (controller: OverlayControllerComponent, options?: OpenOverlayOptions) => {
    const overlayId = options?.overlayId ?? randomId();
    const componentKey = randomId();
    const dispatchOpenEvent = createEvent('open');

    dispatchOpenEvent({ controller, overlayId, componentKey });
    return overlayId;
  };

  const openAsync = async <T>(controller: OverlayAsyncControllerComponent<T>) => {
    return new Promise<T>((resolve) => {
      open((overlayProps) => {
        const close = (param: T) => {
          resolve(param);
          overlayProps.close();
        };
        return controller({ ...overlayProps, close });
      });
    });
  };

  return { open, openAsync, close: createEvent('close'), useOverlayEvent };
}
```

### 3단계: Context & Reducer (overlay-kit 방식)

```typescript
// context/reducer.ts - overlay-kit의 상태 관리 로직
export function overlayReducer(state: OverlayData, action: OverlayReducerAction): OverlayData {
  switch (action.type) {
    case 'ADD': {
      const isExisted = state.overlayOrderList.includes(action.overlay.id);
      
      return {
        current: action.overlay.id,
        overlayOrderList: [...state.overlayOrderList.filter(item => item !== action.overlay.id), action.overlay.id],
        overlayData: isExisted
          ? state.overlayData
          : { ...state.overlayData, [action.overlay.id]: action.overlay },
      };
    }
    case 'OPEN': {
      const overlay = state.overlayData[action.overlayId];
      if (!overlay || overlay.isOpen) return state;
      
      return {
        ...state,
        overlayData: {
          ...state.overlayData,
          [action.overlayId]: { ...overlay, isOpen: true, isMounted: true },
        },
      };
    }
    case 'CLOSE': {
      const overlay = state.overlayData[action.overlayId];
      if (!overlay || !overlay.isOpen) return state;
      
      return {
        ...state,
        current: determineCurrentOverlayId(state.overlayOrderList, state.overlayData, action.overlayId),
        overlayData: {
          ...state.overlayData,
          [action.overlayId]: { ...overlay, isOpen: false },
        },
      };
    }
    // ... 나머지 액션들
  }
}

// context/context.ts - 타입 안전한 Context 생성
export const { OverlayContextProvider, useCurrentOverlay, useOverlayData } = createOverlaySafeContext();
```

### 4단계: Provider & Controller (하이브리드 방식)

```typescript
// provider/createOverlayProvider.ts - Factory 함수 (overlay-kit 방식)
export function createOverlayProvider() {
  const overlayId = randomId();
  const { useOverlayEvent, ...overlay } = createOverlay(overlayId);
  const { OverlayContextProvider, useCurrentOverlay, useOverlayData } = createOverlaySafeContext();

  function OverlayProvider({ children }: PropsWithChildren) {
    const [overlayState, overlayDispatch] = useReducer(overlayReducer, {
      current: null,
      overlayOrderList: [],
      overlayData: {},
    });

    // overlay-kit의 Event Handler 구현
    const open: OverlayEvent['open'] = useCallback(({ controller, overlayId, componentKey }) => {
      overlayDispatch({
        type: 'ADD',
        overlay: {
          id: overlayId,
          componentKey,
          isOpen: false,
          isMounted: false,
          controller: controller,
        },
      });
    }, []);

    const close: OverlayEvent['close'] = useCallback((overlayId: string) => {
      overlayDispatch({ type: 'CLOSE', overlayId });
    }, []);

    const unmount: OverlayEvent['unmount'] = useCallback((overlayId: string) => {
      overlayDispatch({ type: 'REMOVE', overlayId });
    }, []);

    const closeAll: OverlayEvent['closeAll'] = useCallback(() => {
      overlayDispatch({ type: 'CLOSE_ALL' });
    }, []);

    const unmountAll: OverlayEvent['unmountAll'] = useCallback(() => {
      overlayDispatch({ type: 'REMOVE_ALL' });
    }, []);

    // External Events 처리 (overlay-kit 방식)
    useOverlayEvent({ open, close, unmount, closeAll, unmountAll });

    return (
      <OverlayContextProvider value={overlayState}>
        {children}
        
        {/* Portal로 Z-index 관리 (하이브리드 개선점) */}
        {createPortal(
          <OverlayRenderer overlayState={overlayState} dispatch={overlayDispatch} />,
          document.getElementById('overlay-root')!
        )}
      </OverlayContextProvider>
    );
  }

  return { overlay, OverlayProvider, useCurrentOverlay, useOverlayData };
}

// provider/OverlayRenderer.tsx - Portal 기반 렌더러 (하이브리드)
function OverlayRenderer({ overlayState, dispatch }) {
  return (
    <>
      {overlayState.overlayOrderList.map((overlayId, index) => {
        const overlay = overlayState.overlayData[overlayId];
        return (
          <div key={overlay.componentKey} style={{ zIndex: 1000 + index }}>
            <ContentOverlayController
              isOpen={overlay.isOpen}
              controller={overlay.controller}
              overlayId={overlayId}
              overlayDispatch={dispatch}
            />
          </div>
        );
      })}
    </>
  );
}

// provider/ContentOverlayController.tsx - overlay-kit 방식
export const ContentOverlayController = memo(
  ({ isOpen, overlayId, overlayDispatch, controller: Controller }: ContentOverlayControllerProps) => {
    useEffect(() => {
      requestAnimationFrame(() => {
        overlayDispatch({ type: 'OPEN', overlayId });
      });
    }, [overlayDispatch, overlayId]);

    return (
      <Controller
        isOpen={isOpen}
        overlayId={overlayId}
        close={() => overlayDispatch({ type: 'CLOSE', overlayId })}
        unmount={() => overlayDispatch({ type: 'REMOVE', overlayId })}
      />
    );
  }
);
```

### 5단계: 메인 API 구현 (overlay-kit 방식)

```typescript
// createOverlayContext.tsx - 기본 overlay 인스턴스 생성
export const {
  overlay,
  OverlayProvider: DefaultOverlayProvider,
  useCurrentOverlay,
  useOverlayData,
} = createOverlayProvider();

// 전역 API 제공
export { overlay };
```

### 6단계: 시스템 사전 정의 컴포넌트

#### SystemConfirmDialog

```typescript
// components/SystemConfirmDialog.tsx
interface SystemConfirmDialogProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export const SystemConfirmDialog = (props: SystemConfirmDialogProps): OverlayComponent<boolean> => {
  return ({ isOpen, close }) => {
    // shadcn/ui Dialog 컴포넌트 사용
    // true/false 반환
  };
};
```

#### SystemAlertDialog

```typescript
// components/SystemAlertDialog.tsx
interface SystemAlertDialogProps {
  title?: string;
  message: string;
  confirmText?: string;
  variant?: "default" | "destructive" | "secondary";
}

export const SystemAlertDialog = (props: SystemAlertDialogProps): OverlayComponent<void> => {
  return ({ isOpen, close }) => {
    // shadcn/ui Dialog 컴포넌트 사용
    // void 반환
  };
};
```

#### SystemPromptDialog

```typescript
// components/SystemPromptDialog.tsx
interface SystemPromptDialogProps {
  title?: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    message?: string;
  };
}

export const SystemPromptDialog = (props: SystemPromptDialogProps): OverlayComponent<string | null> => {
  return ({ isOpen, close }) => {
    // react-hook-form + zod 검증
    // shadcn/ui Form 컴포넌트 사용
    // 문자열 또는 null 반환
  };
};
```

#### SystemToast

```typescript
// components/SystemToast.tsx
interface SystemToastProps {
  message: string;
  type?: "default" | "success" | "error" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
}

export const SystemToast = (props: SystemToastProps): OverlayComponent<void> => {
  // Sonner toast 즉시 호출
  // OverlayComponent 호환성을 위한 더미 컴포넌트 반환
};
```

### 7단계: 고급 기능 구현

#### Focus Management

```typescript
// utils/focusManager.ts - Portal 환경에서의 Focus 관리
export function useFocusTrap(isOpen: boolean) {
  const elementRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const element = elementRef.current;
    if (!element) return;
    
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);
  
  return elementRef;
}
```

#### History Integration

```typescript
// utils/historyManager.ts - Portal과 브라우저 히스토리 연동
export function useOverlayHistory(overlayId: string, isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    
    const handlePopState = () => {
      onClose();
    };
    
    // 히스토리에 상태 추가
    window.history.pushState({ overlayId }, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [overlayId, isOpen, onClose]);
}
```

### 8단계: Provider 통합

```typescript
// app/_provider/Providers.tsx에 추가
import { DefaultOverlayProvider as OverlayProvider } from "@/shared/ui/overlay";
import { Toaster } from "@repo/shared/components/sonner";

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ReactQueryProvider>
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <OverlayProvider>
            {children}
            <Toaster />
          </OverlayProvider>
        </ThemeProvider>
      </SessionProvider>
    </ReactQueryProvider>
  );
};

// app/layout.tsx body에 추가
<body>
  <div id="overlay-root"></div>
  <Providers>{children}</Providers>
</body>
```

### 9단계: 사용 예시

#### 시스템 사전 정의 컴포넌트 사용법

```typescript
// 시스템 확인 대화상자
const confirmed = await overlay.openAsync(SystemConfirmDialog({
  title: "삭제 확인",
  message: "정말 삭제하시겠습니까?",
  variant: "destructive"
}));

if (confirmed) {
  // 삭제 로직
}

// 시스템 알림 대화상자
await overlay.openAsync(SystemAlertDialog({
  title: "작업 완료",
  message: "성공적으로 저장되었습니다!",
  variant: "default"
}));

// 시스템 입력 대화상자
const filename = await overlay.openAsync(SystemPromptDialog({
  title: "파일명 입력",
  message: "저장할 파일명을 입력하세요",
  placeholder: "solution.py",
  required: true,
  validation: {
    pattern: /^[a-zA-Z0-9._-]+$/,
    message: "파일명은 영문, 숫자, ., _, - 만 사용 가능합니다"
  }
}));

// 시스템 토스트 알림
overlay.open(SystemToast({
  message: "저장되었습니다!",
  type: "success"
}));

overlay.open(SystemToast({
  message: "오류가 발생했습니다.",
  type: "error",
  action: {
    label: "재시도",
    onClick: () => retryFunction()
  }
}));
```

#### 커스텀 오버레이 사용법

```typescript
// 복잡한 커스텀 모달 - System 접두사 없음
const result = await overlay.openAsync<SignupData>(({ isOpen, close }) => (
  <LaftelStyleSignupModal
    isOpen={isOpen}
    onComplete={(data) => close(data)}
    onCancel={() => close(null)}
  />
));

// 멘토링 세션 모달 - System 접두사 없음
const sessionResult = await overlay.openAsync<SessionResult>(({ isOpen, close }) => (
  <MentoringSessionModal
    isOpen={isOpen}
    onEndSession={(result) => close(result)}
    onCancel={() => close(null)}
    participants={participants}
  />
));
```

## 성능 최적화 방안

### 1. 메모리 누수 방지
- External Events 시스템의 자동 이벤트 해제
- Portal DOM 노드 자동 정리
- useReducer 기반 상태 관리로 메모리 효율성 확보

### 2. 리렌더링 최소화
- overlay-kit의 검증된 상태 관리 패턴 활용
- memo()와 useCallback()으로 불필요한 렌더링 방지
- Portal을 통한 DOM 분리로 Context Provider 영향도 최소화

### 3. Portal + Z-index 최적화
- createPortal로 DOM 트리 분리
- 자동 Z-index 스택 관리로 레이어 충돌 방지
- 필요한 오버레이만 DOM에 유지

### 4. 번들 크기 최적화
- Tree shaking 지원
- 동적 import로 필요한 시스템 컴포넌트만 로드
- overlay-kit 패턴을 통한 코드 재사용성 향상

## 테스트 계획

### Unit Tests
- OverlayManager 로직 테스트
- 각 사전 정의 컴포넌트 테스트
- 유틸리티 함수 테스트

### Integration Tests
- Context와 Hook 연동 테스트
- Portal 렌더링 테스트
- 브라우저 히스토리 연동 테스트

### E2E Tests
- Storybook을 통한 사용자 시나리오 테스트
- 접근성 테스트
- 성능 테스트

## 마일스톤

### 1주차
- [ ] 핵심 타입 정의
- [ ] OverlayManager 구현
- [ ] Context 및 Hook 구현

### 2주차
- [ ] createPortal 기반 렌더러
- [ ] 스택 관리 시스템
- [ ] 기본 사전 정의 컴포넌트

### 3주차
- [ ] 고급 기능 (Focus trap, 히스토리 연동)
- [ ] Provider 통합
- [ ] 성능 최적화

### 4주차
- [ ] Storybook 문서화
- [ ] 테스트 작성
- [ ] 최종 검증 및 배포

## 참고 자료

- [toss/overlay-kit](https://github.com/toss/overlay-kit)
- [React createPortal](https://react.dev/reference/react-dom/createPortal)
- [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog)
- [Sonner Toast](https://sonner.emilkowal.ski/)