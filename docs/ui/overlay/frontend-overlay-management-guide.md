# Frontend Overlay Management Guide

## 개요

프론트엔드 개발에서 모달(Modal), 얼럿(Alert), 팝업(Popup), 토스트(Toast), 레이어 팝업 등의 **오버레이(Overlay) 컴포넌트**는 사용자 경험에 중요한 역할을 합니다. 이 문서는 세 가지 주요 접근법을 분석하고 베스트 프랙티스를 제시합니다.

## 3가지 오버레이 관리 접근법 분석

### 1. shadcn/ui 방식

#### 특징
- **Radix UI 기반**: 접근성과 성능이 최적화된 primitive 컴포넌트 활용
- **Compound Component 패턴**: Dialog, AlertDialog, Sheet, Popover 등 세분화된 컴포넌트
- **Context API 기반 상태 관리**: 컴포넌트 간 상태 공유 최적화
- **TypeScript 완전 지원**: 타입 안전성 보장

#### 구현 방식

```tsx
// 기본 Dialog 구조
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function MyModal() {
  return (
    <Dialog>
      <DialogTrigger>Open Modal</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
          <DialogDescription>Modal description</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

// 프로그래매틱 제어
function useDialog() {
  const [open, setOpen] = React.useState(false)
  
  return {
    open,
    onOpenChange: setOpen,
    openDialog: () => setOpen(true),
    closeDialog: () => setOpen(false)
  }
}
```

#### 장점
- **접근성**: WAI-ARIA 표준 완벽 준수
- **일관성**: 디자인 시스템 통합 용이
- **개발 효율성**: 즉시 사용 가능한 고품질 컴포넌트
- **커스터마이징**: Tailwind CSS로 자유로운 스타일링

#### 단점
- **의존성**: Radix UI에 의존
- **번들 크기**: 사용하지 않는 기능도 포함될 수 있음
- **학습 곡선**: Compound Component 패턴 이해 필요

---

### 2. Toss overlay-kit 방식

#### 특징
- **선언적 오버레이 관리**: 함수형 접근으로 오버레이 제어
- **비동기 지원**: Promise 기반 overlay.openAsync로 결과 반환
- **메모리 관리 최적화**: 자동 생명주기 관리
- **간편한 API**: open/close 메서드로 단순한 인터페이스

#### 구현 방식

```tsx
// overlay-kit 기본 사용법
import { overlay } from 'overlay-kit'

function MyComponent() {
  const openModal = () => {
    overlay.open(({ isOpen, close, unmount }) => (
      <Modal 
        open={isOpen} 
        onClose={close}
        onExit={unmount}
      >
        <h2>Modal Content</h2>
      </Modal>
    ))
  }
  
  return <button onClick={openModal}>Open Modal</button>
}

// 비동기 방식으로 사용자 응답 받기
import { overlay } from 'overlay-kit'

function openConfirmDialog() {
  return overlay.openAsync<boolean>(({ isOpen, close }) => (
    <Dialog
      open={isOpen}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  ))
}

// 사용 예시
const handleDelete = async () => {
  const confirmed = await openConfirmDialog()
  if (confirmed) {
    // 삭제 로직 실행
    console.log('Item deleted')
  }
}
```

#### 장점
- **간단한 API**: 직관적인 open/openAsync 메서드
- **비동기 지원**: Promise 기반으로 사용자 응답 처리
- **선언적 관리**: 상태 관리 코드 제거
- **재사용성**: 컴포넌트 독립적 오버레이 관리

#### 단점
- **외부 의존성**: 별도 라이브러리 필요
- **새로운 라이브러리**: 아직 생태계가 작음
- **제한적 커스터마이징**: 정해진 패턴 내에서만 사용

---

### 3. React Portal 직접 구현 방식

#### 특징
- **완전한 제어권**: 모든 동작을 직접 구현
- **DOM 분리**: createPortal로 논리적/물리적 DOM 분리
- **성능 최적화**: 필요한 기능만 구현
- **순수 React**: 외부 의존성 없음

#### 구현 방식

```tsx
// ReactPortal 컴포넌트
import { useState, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

function createWrapperAndAppendToBody(wrapperId: string) {
  const wrapperElement = document.createElement('div')
  wrapperElement.setAttribute("id", wrapperId)
  document.body.appendChild(wrapperElement)
  return wrapperElement
}

function ReactPortal({ 
  children, 
  wrapperId = "react-portal-wrapper" 
}: {
  children: React.ReactNode
  wrapperId?: string
}) {
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    let element = document.getElementById(wrapperId)
    let systemCreated = false

    if (!element) {
      systemCreated = true
      element = createWrapperAndAppendToBody(wrapperId)
    }
    setWrapperElement(element)

    return () => {
      if (systemCreated && element?.parentNode) {
        element.parentNode.removeChild(element)
      }
    }
  }, [wrapperId])

  if (wrapperElement === null) return null

  return createPortal(children, wrapperElement)
}

// Modal 컴포넌트
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const closeOnEscapeKey = (e: KeyboardEvent) => 
      e.key === "Escape" ? onClose() : null
    
    if (isOpen) {
      document.body.addEventListener("keydown", closeOnEscapeKey)
    }
    
    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKey)
    }
  }, [isOpen, onClose])

  return (
    <ReactPortal wrapperId="modal-root">
      <CSSTransition
        in={isOpen}
        timeout={300}
        classNames="modal"
        nodeRef={nodeRef}
        unmountOnExit
      >
        <div ref={nodeRef} className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </div>
      </CSSTransition>
    </ReactPortal>
  )
}

// 사용자 정의 훅
function useModal() {
  const [isOpen, setIsOpen] = useState(false)
  
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  
  return { isOpen, openModal, closeModal }
}
```

#### 장점
- **완전한 제어**: 모든 동작 커스터마이징 가능
- **번들 최적화**: 필요한 코드만 포함
- **성능**: 불필요한 오버헤드 없음
- **학습 가치**: React 심화 이해 향상

#### 단점
- **개발 시간**: 모든 기능을 직접 구현
- **접근성**: WAI-ARIA 표준 수동 구현 필요
- **유지보수**: 버그 수정 및 기능 추가 부담
- **일관성**: 팀 내 표준화 어려움

---

## 베스트 프랙티스 가이드

### 프로젝트 규모별 추천 접근법

#### 대규모 프로덕션 애플리케이션
**shadcn/ui 방식 추천**
- 접근성과 성능이 검증된 솔루션
- 팀 협업과 유지보수성 우수
- 디자인 시스템 통합 용이

#### 빠른 프로토타이핑 & 중규모 프로젝트
**overlay-kit 방식 추천**
- 간단한 API로 빠른 개발
- 비동기 패턴으로 사용자 응답 처리
- 메모리 관리 자동화

#### 고도 커스터마이징 & 학습 목적
**React Portal 직접 구현 추천**
- 완전한 제어권과 최적화
- 특수 요구사항 대응 가능
- React 심화 학습 효과

### 통합 베스트 프랙티스

#### 1. 아키텍처 설계 원칙

```tsx
// 1. 오버레이 타입별 분리
interface OverlayConfig {
  type: 'modal' | 'alert' | 'toast' | 'dropdown' | 'tooltip'
  priority: number
  dismissible: boolean
  persistent: boolean
}

// 2. 상태 관리 계층화
const useOverlayManager = () => {
  const [overlays, setOverlays] = useState<Map<string, OverlayConfig>>(new Map())
  
  const addOverlay = (id: string, config: OverlayConfig) => {
    setOverlays(prev => new Map(prev).set(id, config))
  }
  
  const removeOverlay = (id: string) => {
    setOverlays(prev => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }
  
  return { overlays, addOverlay, removeOverlay }
}

// 3. 컨텍스트 기반 전역 관리
const OverlayContext = createContext<ReturnType<typeof useOverlayManager> | null>(null)

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const overlayManager = useOverlayManager()
  
  return (
    <OverlayContext.Provider value={overlayManager}>
      {children}
      <OverlayRenderer />
    </OverlayContext.Provider>
  )
}
```

#### 2. Z-Index 및 스택 관리

```css
/* CSS 변수를 활용한 Z-Index 스케일 */
:root {
  --z-dropdown: 1000;
  --z-sticky: 1010;
  --z-fixed: 1020;
  --z-modal-backdrop: 1030;
  --z-modal: 1040;
  --z-popover: 1050;
  --z-tooltip: 1060;
  --z-toast: 1070;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal-backdrop);
}

.modal-content {
  position: relative;
  z-index: var(--z-modal);
  background: white;
  border-radius: 8px;
  /* 중앙 정렬 */
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

#### 3. 성능 최적화 패턴

```tsx
// 1. Lazy Loading으로 번들 크기 최적화
const HeavyModal = lazy(() => import('./HeavyModal'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyModal />
    </Suspense>
  )
}

// 2. 메모이제이션으로 리렌더링 방지
const Modal = memo(({ isOpen, children, onClose }: ModalProps) => {
  if (!isOpen) return null
  
  return (
    <ReactPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </ReactPortal>
  )
})

// 3. 가상화로 많은 오버레이 처리
function OverlayManager() {
  const visibleOverlays = useMemo(() => 
    overlays.slice(-MAX_VISIBLE_OVERLAYS), 
    [overlays]
  )
  
  return (
    <>
      {visibleOverlays.map(overlay => (
        <OverlayRenderer key={overlay.id} config={overlay} />
      ))}
    </>
  )
}
```

#### 4. 접근성 보장

```tsx
// Focus Trap 구현
function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return
    
    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()
    
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])
  
  return containerRef
}

// ARIA 속성 자동 관리
function Modal({ isOpen, title, children, onClose }: ModalProps) {
  const modalRef = useFocusTrap(isOpen)
  const titleId = useId()
  const descriptionId = useId()
  
  return (
    <ReactPortal>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="modal"
      >
        <h2 id={titleId}>{title}</h2>
        <div id={descriptionId}>{children}</div>
        <button onClick={onClose} aria-label="Close modal">×</button>
      </div>
    </ReactPortal>
  )
}
```

---

## 중첩 상황 및 제어 순서 관리

### 중첩 시나리오별 대응 전략

#### 1. 스택 기반 계층 관리

```tsx
interface OverlayStackItem {
  id: string
  component: React.ComponentType
  props: any
  priority: number
  zIndex: number
  dismissible: boolean
}

class OverlayStack {
  private stack: OverlayStackItem[] = []
  private baseZIndex = 1000
  
  push(item: Omit<OverlayStackItem, 'zIndex'>) {
    const zIndex = this.baseZIndex + this.stack.length * 10
    this.stack.push({ ...item, zIndex })
    this.updateDOM()
  }
  
  pop() {
    const item = this.stack.pop()
    this.updateDOM()
    return item
  }
  
  remove(id: string) {
    this.stack = this.stack.filter(item => item.id !== id)
    this.recalculateZIndex()
    this.updateDOM()
  }
  
  private recalculateZIndex() {
    this.stack.forEach((item, index) => {
      item.zIndex = this.baseZIndex + index * 10
    })
  }
  
  getTopItem() {
    return this.stack[this.stack.length - 1]
  }
  
  private updateDOM() {
    // DOM 업데이트 로직
  }
}
```

#### 2. 우선순위 기반 제어

```tsx
enum OverlayPriority {
  LOW = 1,      // 일반 팝업, 드롭다운
  NORMAL = 5,   // 모달, 다이얼로그
  HIGH = 8,     // 확인 대화상자, 오류 알림
  CRITICAL = 10 // 시스템 알림, 긴급 메시지
}

function OverlayManager() {
  const [overlays, setOverlays] = useState<OverlayStackItem[]>([])
  
  const addOverlay = (overlay: Omit<OverlayStackItem, 'zIndex'>) => {
    setOverlays(prev => {
      // 우선순위에 따른 정렬
      const sorted = [...prev, { ...overlay, zIndex: 0 }]
        .sort((a, b) => a.priority - b.priority)
      
      // Z-Index 재계산
      return sorted.map((item, index) => ({
        ...item,
        zIndex: 1000 + index * 10
      }))
    })
  }
  
  const closeTopOverlay = () => {
    setOverlays(prev => {
      const topOverlay = prev[prev.length - 1]
      if (topOverlay?.dismissible) {
        return prev.slice(0, -1)
      }
      return prev
    })
  }
  
  return { overlays, addOverlay, closeTopOverlay }
}
```

#### 3. 상황별 제어 전략

```tsx
// 1. 모달 내 모달 (중첩 모달)
function NestedModalExample() {
  const [parentOpen, setParentOpen] = useState(false)
  const [childOpen, setChildOpen] = useState(false)
  
  return (
    <>
      <Dialog open={parentOpen} onOpenChange={setParentOpen}>
        <DialogContent>
          <h2>Parent Modal</h2>
          <Button onClick={() => setChildOpen(true)}>
            Open Child Modal
          </Button>
        </DialogContent>
      </Dialog>
      
      <Dialog open={childOpen} onOpenChange={setChildOpen}>
        <DialogContent style={{ zIndex: 1050 }}>
          <h2>Child Modal</h2>
          <p>This modal is on top</p>
        </DialogContent>
      </Dialog>
    </>
  )
}

// 2. 토스트와 모달 동시 표시
function ToastWithModal() {
  const { toast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  
  const showSuccessWithModal = () => {
    setModalOpen(true)
    toast({
      title: "Success!",
      description: "Modal opened successfully",
      duration: 3000
    })
  }
  
  return (
    <>
      <Button onClick={showSuccessWithModal}>
        Open Modal with Toast
      </Button>
      
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <h2>Modal Content</h2>
        </DialogContent>
      </Dialog>
    </>
  )
}

// 3. 조건부 오버레이 제어
function ConditionalOverlay() {
  const [overlayQueue, setOverlayQueue] = useState<string[]>([])
  
  const addToQueue = (overlayId: string) => {
    setOverlayQueue(prev => [...prev, overlayId])
  }
  
  const processQueue = () => {
    if (overlayQueue.length > 0) {
      const [next, ...rest] = overlayQueue
      setOverlayQueue(rest)
      // 다음 오버레이 표시
      showOverlay(next)
    }
  }
  
  return (
    <div>
      {overlayQueue.map((overlayId, index) => (
        <OverlayComponent 
          key={overlayId}
          id={overlayId}
          zIndex={1000 + index * 10}
          onClose={processQueue}
        />
      ))}
    </div>
  )
}
```

### 키보드 및 이벤트 제어

```tsx
// ESC 키 처리 계층화
function useEscapeKeyHandler(overlays: OverlayStackItem[]) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      
      // 가장 위쪽 dismissible 오버레이 찾기
      for (let i = overlays.length - 1; i >= 0; i--) {
        if (overlays[i].dismissible) {
          overlays[i].onClose?.()
          break
        }
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [overlays])
}

// 클릭 외부 영역 처리
function useOutsideClick(overlays: OverlayStackItem[]) {
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const topOverlay = overlays[overlays.length - 1]
      if (!topOverlay?.dismissible) return
      
      const overlayElement = document.getElementById(topOverlay.id)
      if (overlayElement && !overlayElement.contains(e.target as Node)) {
        topOverlay.onClose?.()
      }
    }
    
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [overlays])
}
```

---

## 실제 프로젝트 적용 가이드

### CotePT 프로젝트 맞춤 권장사항

#### 기본 아키텍처: shadcn/ui + 커스텀 확장

```tsx
// features/shared/components/overlay/OverlayManager.tsx
export function OverlayManager() {
  return (
    <>
      <Dialog />
      <AlertDialog />
      <Sheet />
      <Toaster /> {/* 토스트 알림 */}
    </>
  )
}

// features/shared/hooks/useOverlay.ts
export function useOverlay() {
  const [dialogs, setDialogs] = useState<DialogConfig[]>([])
  
  const openDialog = useCallback((config: DialogConfig) => {
    setDialogs(prev => [...prev, { ...config, id: nanoid() }])
  }, [])
  
  const closeDialog = useCallback((id: string) => {
    setDialogs(prev => prev.filter(dialog => dialog.id !== id))
  }, [])
  
  return { dialogs, openDialog, closeDialog }
}

// containers/layout/AppLayout.tsx
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      {children}
      <OverlayManager />
    </div>
  )
}
```

#### 멘토링 세션 특화 오버레이

```tsx
// features/mentoring/components/SessionOverlays.tsx
export function SessionOverlays() {
  const { sessionState } = useMentoringSession()
  
  return (
    <>
      {/* 연결 상태 확인 모달 */}
      <ConnectionStatusModal 
        isOpen={sessionState === 'connecting'}
        onRetry={retryConnection}
      />
      
      {/* 세션 종료 확인 다이얼로그 */}
      <EndSessionDialog
        isOpen={showEndConfirm}
        onConfirm={endSession}
        onCancel={() => setShowEndConfirm(false)}
      />
      
      {/* 화면 공유 권한 요청 */}
      <ScreenSharePermissionDialog
        isOpen={needsScreenSharePermission}
        onAllow={allowScreenShare}
        onDeny={denyScreenShare}
      />
      
      {/* 실시간 알림 토스트 */}
      <Toast 
        position="top-right"
        duration={3000}
      />
    </>
  )
}
```

---

## 체크리스트

### 개발 시 확인사항

#### 기본 구현
- [ ] 접근성 속성 (role, aria-*) 구현
- [ ] 키보드 내비게이션 (Tab, Escape) 지원
- [ ] Focus trap 및 focus 복귀 처리
- [ ] 반응형 디자인 적용

#### 성능 최적화
- [ ] 필요할 때만 렌더링 (조건부 렌더링)
- [ ] 무거운 컴포넌트 lazy loading
- [ ] 메모이제이션으로 리렌더링 방지
- [ ] 메모리 누수 방지 (이벤트 리스너 정리)

#### 사용자 경험
- [ ] 적절한 애니메이션 및 전환 효과
- [ ] 로딩 상태 표시
- [ ] 오류 상황 처리
- [ ] 다중 오버레이 스택 관리

#### 테스트 및 품질
- [ ] 단위 테스트 작성
- [ ] 접근성 테스트 (axe-core)
- [ ] 크로스 브라우저 호환성 확인
- [ ] 모바일 환경 최적화

### 성공 지표

- **개발 효율성**: 새 오버레이 추가 시간 < 30분
- **성능**: 오버레이 열기/닫기 < 100ms
- **접근성**: WCAG 2.1 AA 등급 달성
- **사용자 만족도**: 오버레이 관련 사용성 이슈 < 5%

---

## 추가 학습 자료

### 공식 문서
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [React Portal Documentation](https://react.dev/reference/react-dom/createPortal)
- [overlay-kit GitHub](https://github.com/toss/overlay-kit)

### 접근성 가이드
- [WAI-ARIA Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WebAIM Accessibility Guidelines](https://webaim.org/articles/modal/)

### 성능 최적화
- [React Performance Best Practices](https://react.dev/learn/render-and-commit)
- [Web Vitals Optimization](https://web.dev/vitals/)

---

*이 문서는 지속적으로 업데이트되며, 실제 프로젝트 경험을 바탕으로 개선됩니다.*