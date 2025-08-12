#  Overlay System

`toss/overlay-kit`의 핵심 원칙(External Events, Reducer)과 React Portal을 결합한 선언적 오버레이 관리 시스템입니다.

## 특징

- **선언적 API**: `overlay.open`, `overlay.openAsync`를 통해 어디서든 오버레이를 열 수 있습니다.
- **타입 안전성**: TypeScript 기반으로 모든 API와 컴포넌트의 타입 안전성을 보장합니다.
- **중앙 집중 상태 관리**: 모든 오버레이의 상태는 하나의 Provider 내에서 Reducer를 통해 관리됩니다.
- **자동 Z-Index 관리**: 여러 오버레이가 열릴 때 Z-Index를 자동으로 처리하여 겹침 순서를 보장합니다.
- **사전 정의 컴포넌트**: `Alert`, `Confirm`, `Prompt` 등 자주 사용되는 다이얼로그를 기본 제공합니다.

---

## 시작하기

### 1. Provider 설정

애플리케이션의 최상단 레이아웃에 `DefaultOverlayProvider`와 오버레이가 렌더링될 DOM 컨테이너(`<div id="overlay-root">`)를 추가합니다.

**`app/layout.tsx` 예시:**

```tsx
import { DefaultOverlayProvider } from "@/shared/ui/overlay";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DefaultOverlayProvider>
          {children}
          <div id="overlay-root" />
        </DefaultOverlayProvider>
      </body>
    </html>
  );
}
```

### 2. 기본 사용법

`overlay` 객체를 import하여 사용합니다. `overlay.open`은 동기적으로, `overlay.openAsync`는 비동기적으로 오버레이를 엽니다.

#### SystemAlertDialog (알림)

단순한 알림 메시지를 표시합니다. 사용자 액션을 기다리지 않습니다.

```tsx
import { overlay } from "@/shared/ui/overlay";
import { SystemAlertDialog } from "@/shared/ui/overlay/components";

const showAlert = () => {
  overlay.open(({ isOpen, close, overlayId, unmount }) => (
    <SystemAlertDialog
      isOpen={isOpen}
      close={close}
      overlayId={overlayId}
      unmount={unmount}
      title="저장 완료"
      description="변경사항이 성공적으로 저장되었습니다."
    />
  ));
};
```

#### SystemConfirmDialog (확인/취소)

사용자의 확인(boolean)을 받아야 하는 경우 사용합니다. `Promise`를 반환하므로 `async/await`와 함께 사용합니다.

```tsx
import { overlay } from "@/shared/ui/overlay";
import { SystemConfirmDialog } from "@/shared/ui/overlay/components";

const askForConfirmation = async () => {
  const confirmed = await overlay.openAsync<boolean>(({ isOpen, close, ...props }) => (
    <SystemConfirmDialog
      {...props}
      isOpen={isOpen}
      close={close}
      title="게시글 삭제"
      description="정말로 삭제하시겠습니까?"
      confirmVariant="destructive"
    />
  ));

  if (confirmed) {
    // "삭제" 버튼 클릭 시 로직
  } else {
    // "취소" 버튼 클릭 또는 외부 클릭 시 로직
  }
};
```

#### SystemPromptDialog (입력)

사용자로부터 텍스트 입력을 받아야 하는 경우 사용합니다. `string | null`을 반환하는 `Promise`를 사용합니다.

```tsx
import { overlay } from "@/shared/ui/overlay";
import { SystemPromptDialog } from "@/shared/ui/overlay/components";

const askForInput = async () => {
  const folderName = await overlay.openAsync<string | null>(({ isOpen, close, ...props }) => (
    <SystemPromptDialog
      {...props}
      isOpen={isOpen}
      close={close}
      title="새 폴더 이름"
      placeholder="폴더 이름을 입력하세요"
      validate={(value) => (value.length > 0 ? null : "이름을 입력해야 합니다.")}
    />
  ));

  if (folderName) {
    // 사용자가 값을 입력하고 "확인" 클릭
  } else {
    // 사용자가 입력을 취소
  }
};
```

---

## 커스텀 오버레이 만들기

`OverlayControllerProps` 또는 `OverlayAsyncControllerProps<T>`를 받는 React 컴포넌트를 만들어 `overlay.open` 또는 `overlay.openAsync`로 열 수 있습니다.

**`CustomModal.tsx` 예시:**

```tsx
import type { OverlayControllerProps } from "@/shared/ui/overlay";

interface CustomModalProps {
  message: string;
}

export const CustomModal: React.FC<OverlayControllerProps & CustomModalProps> = ({ isOpen, close, message }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog-content">
        <p>{message}</p>
        <button onClick={close}>닫기</button>
      </div>
    </div>
  );
};
```