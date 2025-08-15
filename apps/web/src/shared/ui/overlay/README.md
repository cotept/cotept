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

---

## 제공되는 Overlay 컴포넌트

CotePT Overlay 시스템에서는 shadcn/ui 기반의 사전 정의된 컴포넌트들을 제공합니다.

### SystemAlert (전역 알림)

전역에서 호출 가능한 알림 메시지입니다. 성공, 오류, 정보, 경고 등 다양한 타입을 지원합니다.

```tsx
import { overlay } from "@/shared/ui/overlay";
import { SystemAlert } from "@/shared/ui/overlay/components/SystemAlert";

// 성공 알림
const showSuccess = () => {
  overlay.open(({ isOpen, close, overlayId, unmount }) => (
    <SystemAlert
      isOpen={isOpen}
      close={close}
      overlayId={overlayId}
      unmount={unmount}
      variant="success"
      title="저장 완료"
      description="변경사항이 성공적으로 저장되었습니다."
      autoClose={3000}
    />
  ));
};

// 오류 알림
const showError = () => {
  overlay.open(({ isOpen, close, overlayId, unmount }) => (
    <SystemAlert
      isOpen={isOpen}
      close={close}
      overlayId={overlayId}
      unmount={unmount}
      variant="destructive"
      title="오류 발생"
      description="요청을 처리하는 중 오류가 발생했습니다."
    />
  ));
};

// 전역 에러 핸들러 예시
axios.interceptors.response.use(
  response => response,
  error => {
    overlay.open(({ isOpen, close, overlayId, unmount }) => (
      <SystemAlert
        isOpen={isOpen}
        close={close}
        overlayId={overlayId}
        unmount={unmount}
        variant="destructive"
        title="요청 실패"
        description={error.response?.data?.message || "알 수 없는 오류가 발생했습니다."}
        autoClose={5000}
      />
    ));
    return Promise.reject(error);
  }
);
```

### SystemConfirm (확인 다이얼로그)

사용자의 확인을 받아야 하는 중요한 액션에 사용합니다. `Promise<boolean>`을 반환합니다.

```tsx
import { overlay } from "@/shared/ui/overlay";
import { SystemConfirm } from "@/shared/ui/overlay/components/SystemConfirm";

// 삭제 확인
const handleDelete = async (itemId: string) => {
  const confirmed = await overlay.openAsync<boolean>(({ isOpen, close, ...props }) => (
    <SystemConfirm
      {...props}
      isOpen={isOpen}
      close={close}
      title="항목 삭제"
      description="이 항목을 삭제하시겠습니까? 삭제된 항목은 복구할 수 없습니다."
      confirmText="삭제"
      cancelText="취소"
      confirmVariant="destructive"
      variant="destructive"
    />
  ));

  if (confirmed) {
    await deleteItem(itemId);
    // 삭제 완료 알림
    overlay.open(({ isOpen, close, overlayId, unmount }) => (
      <SystemAlert
        isOpen={isOpen}
        close={close}
        overlayId={overlayId}
        unmount={unmount}
        variant="success"
        description="항목이 삭제되었습니다."
        autoClose={2000}
      />
    ));
  }
};

// 권한 확인
const requireAuth = async () => {
  if (!user) {
    const shouldLogin = await overlay.openAsync<boolean>(({ isOpen, close, ...props }) => (
      <SystemConfirm
        {...props}
        isOpen={isOpen}
        close={close}
        title="로그인이 필요합니다"
        description="이 기능을 사용하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
        confirmText="로그인하기"
        cancelText="취소"
        variant="info"
      />
    ));
    
    if (shouldLogin) {
      router.push('/auth/login');
    }
    return false;
  }
  return true;
};
```

### SystemSheet (전역 사이드 패널)

전역에서 접근 가능한 사이드 패널입니다. 설정, 알림, 프로필 편집 등에 사용합니다.

```tsx
import { overlay } from "@/shared/ui/overlay";
import { SystemSheet } from "@/shared/ui/overlay/components/SystemSheet";

// 사용자 설정 패널
const openUserSettings = () => {
  overlay.open(({ isOpen, close, overlayId, unmount }) => (
    <SystemSheet
      isOpen={isOpen}
      close={close}
      overlayId={overlayId}
      unmount={unmount}
      title="계정 설정"
      description="계정 정보와 환경설정을 관리하세요."
      side="right"
    >
      <UserSettingsForm />
    </SystemSheet>
  ));
};

// 알림 센터
const openNotifications = () => {
  overlay.open(({ isOpen, close, overlayId, unmount }) => (
    <SystemSheet
      isOpen={isOpen}
      close={close}
      overlayId={overlayId}
      unmount={unmount}
      title="알림"
      side="right"
      footer={
        <Button variant="outline" onClick={close}>
          닫기
        </Button>
      }
    >
      <NotificationList />
    </SystemSheet>
  ));
};

// 프로필 편집
const openProfileEdit = () => {
  overlay.open(({ isOpen, close, overlayId, unmount }) => (
    <SystemSheet
      isOpen={isOpen}
      close={close}
      overlayId={overlayId}
      unmount={unmount}
      title="프로필 편집"
      description="프로필 정보를 수정하세요."
      side="right"
    >
      <ProfileEditForm 
        onSave={(data) => {
          // 저장 로직
          close();
          // 저장 완료 알림
          overlay.open(({ isOpen, close, overlayId, unmount }) => (
            <SystemAlert
              isOpen={isOpen}
              close={close}
              overlayId={overlayId}
              unmount={unmount}
              variant="success"
              description="프로필이 업데이트되었습니다."
              autoClose={2000}
            />
          ));
        }}
      />
    </SystemSheet>
  ));
};
```

---

## 일반 컴포넌트

Overlay 시스템과 별도로 사용할 수 있는 일반 컴포넌트들입니다.

### SystemPopover

trigger prop을 받아서 팝오버를 표시하는 재사용 가능한 컴포넌트입니다.

```tsx
import { SystemPopover } from "@/shared/ui/overlay/components/SystemPopover";
import { Button } from "@repo/shared/components/button";

// 설정 메뉴
<SystemPopover
  trigger={
    <Button variant="ghost" size="icon">
      <Settings className="h-4 w-4" />
    </Button>
  }
  align="end"
  className="w-56"
>
  <div className="grid gap-4">
    <div className="space-y-2">
      <h4 className="font-medium leading-none">설정</h4>
      <p className="text-sm text-muted-foreground">
        계정 설정을 관리하세요.
      </p>
    </div>
    <div className="grid gap-2">
      <Button variant="ghost" className="justify-start">
        프로필 편집
      </Button>
      <Button variant="ghost" className="justify-start">
        알림 설정
      </Button>
      <Button variant="ghost" className="justify-start">
        로그아웃
      </Button>
    </div>
  </div>
</SystemPopover>

// 사용자 아바타 메뉴
<SystemPopover
  trigger={
    <Avatar className="h-8 w-8 cursor-pointer">
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback>{user.name[0]}</AvatarFallback>
    </Avatar>
  }
  align="end"
  side="bottom"
  className="w-64"
>
  <div className="flex flex-col space-y-4">
    <div className="flex items-center space-x-2">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
    <Separator />
    <div className="grid gap-1">
      <Button variant="ghost" className="justify-start">
        내 프로필
      </Button>
      <Button variant="ghost" className="justify-start">
        설정
      </Button>
      <Button variant="ghost" className="justify-start text-destructive">
        로그아웃
      </Button>
    </div>
  </div>
</SystemPopover>
```

---

## Toast 알림

전역 토스트 알림은 `sonner`의 `toast()` 함수를 직접 사용합니다.

```tsx
import { toast } from "sonner";

// 기본 토스트
const showToast = () => {
  toast("이벤트가 생성되었습니다", {
    description: "2023년 12월 3일 일요일 오전 9:00",
    action: {
      label: "실행 취소",
      onClick: () => console.log("실행 취소"),
    },
  });
};

// 성공 토스트
const showSuccess = () => {
  toast.success("파일이 업로드되었습니다");
};

// 오류 토스트
const showError = () => {
  toast.error("파일 업로드에 실패했습니다", {
    description: "파일 크기가 너무 큽니다. 5MB 이하의 파일을 선택해주세요.",
  });
};

// 경고 토스트
const showWarning = () => {
  toast.warning("세션이 곧 만료됩니다", {
    description: "5분 후 자동으로 로그아웃됩니다.",
    action: {
      label: "연장하기",
      onClick: () => extendSession(),
    },
  });
};

// 정보 토스트
const showInfo = () => {
  toast.info("새로운 기능이 추가되었습니다", {
    description: "설정에서 새 기능을 확인해보세요.",
  });
};
```

**중요**: 토스트를 사용하려면 앱의 루트 레이아웃에 `Toaster` 컴포넌트를 추가해야 합니다.

```tsx
// app/layout.tsx
import { Toaster } from "@repo/shared/components/sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <DefaultOverlayProvider>
          {children}
          <div id="overlay-root" />
          <Toaster />
        </DefaultOverlayProvider>
      </body>
    </html>
  );
}
```

---

## 중첩 모달 예시

복잡한 워크플로우에서 여러 모달을 순차적으로 열 수 있습니다.

```tsx
// CotePT 멘토링 세션 예약 플로우
const bookMentoringSession = async (mentorId: string) => {
  // 1단계: 세션 설정
  overlay.open(({ isOpen, close, overlayId, unmount }) => (
    <SystemSheet
      isOpen={isOpen}
      close={close}
      overlayId={overlayId}
      unmount={unmount}
      title="멘토링 세션 예약"
      description="세션 정보를 입력하세요."
    >
      <SessionBookingForm
        mentorId={mentorId}
        onSubmit={async (sessionData) => {
          close(); // 첫 번째 모달 닫기
          
          // 2단계: 결제 확인
          const shouldPay = await overlay.openAsync<boolean>(({ isOpen, close, ...props }) => (
            <SystemConfirm
              {...props}
              isOpen={isOpen}
              close={close}
              title="결제 확인"
              description={`멘토링 세션 비용 ${sessionData.price.toLocaleString()}원을 결제하시겠습니까?`}
              confirmText="결제하기"
              cancelText="취소"
            />
          ));

          if (shouldPay) {
            try {
              // 결제 처리
              await processPayment(sessionData);
              
              // 3단계: 성공 알림
              overlay.open(({ isOpen, close, overlayId, unmount }) => (
                <SystemAlert
                  isOpen={isOpen}
                  close={close}
                  overlayId={overlayId}
                  unmount={unmount}
                  variant="success"
                  title="예약 완료"
                  description="멘토링 세션이 성공적으로 예약되었습니다. 예약 확인 메일을 발송했습니다."
                  autoClose={5000}
                />
              ));
              
              // 예약 목록 페이지로 이동
              router.push('/dashboard/sessions');
            } catch (error) {
              // 3단계: 실패 알림
              overlay.open(({ isOpen, close, overlayId, unmount }) => (
                <SystemAlert
                  isOpen={isOpen}
                  close={close}
                  overlayId={overlayId}
                  unmount={unmount}
                  variant="destructive"
                  title="결제 실패"
                  description="결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
                />
              ));
            }
          }
        }}
      />
    </SystemSheet>
  ));
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