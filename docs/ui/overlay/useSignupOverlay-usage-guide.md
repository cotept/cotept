# `useSignupOverlay` 및 전역 오버레이 시스템 사용 가이드

## 1. 개요

이 문서는 CotePT 프로젝트의 `useSignupOverlay` 훅과 이를 뒷받침하는 전역 오버레이 시스템의 사용법을 상세히 안내합니다.

- **`useSignupOverlay`**: 회원가입 과정에 특화된 피드백(성공, 실패, 확인)을 제공하는 커스텀 훅입니다.
- **전역 오버레이 시스템**: `toss/overlay-kit`의 아키텍처와 React Portal을 결합하여, 애플리케이션 어디서든 `Alert`, `Confirm`, `Sheet` 등의 오버레이를 선언적으로 열 수 있는 강력한 기반 시스템입니다.

## 2. `useSignupOverlay` API 상세

`useSignupOverlay`는 회원가입 플로우에서 필요한 모든 UI 피드백을 일관된 방식으로 제공하기 위해 만들어졌습니다.

**기본 사용법:**

```tsx
import { useSignupOverlay } from "@/features/auth/hooks/signup/useSignupOverlay";

function MySignupComponent() {
  const signupOverlay = useSignupOverlay();

  const handleSomething = () => {
    // 훅에서 반환된 함수들을 호출하여 오버레이 표시
    signupOverlay.showSuccess(SIGNUP_STEPS.ENTER_EMAIL);
  };

  // ...
}
```

---

### 2.1. `showSuccess`

단계별 성공 알림을 표시합니다. 잠시 후 자동으로 닫히며, 다음 단계로 자동 이동시킬 수 있습니다.

- **`showSuccess(step: SignupStep, options?: FeedbackOptions)`**
  - `step`: `SIGNUP_STEPS`에 정의된 회원가입 단계. 단계별 기본 메시지가 출력됩니다.
  - `options.autoClose`: 자동 닫기 시간 (ms). 기본값 `3000`.
  - `options.navigateToStep`: 알림이 닫힌 후 이동할 다음 단계.

**예시:**

```tsx
// 이메일 입력 완료 후, 2초 뒤 인증 단계로 자동 이동
signupOverlay.showSuccess(SIGNUP_STEPS.ENTER_EMAIL, {
  autoClose: 2000,
  navigateToStep: SIGNUP_STEPS.VERIFY_EMAIL,
});
```

---

### 2.2. `showError`

단계별 실패 알림을 표시합니다. `customMessage`로 기본 메시지를 덮어쓸 수 있습니다.

- **`showError(step: SignupStep, options?: FeedbackOptions & { customMessage?: string })`**
  - `step`: 오류가 발생한 단계.
  - `options.customMessage`: 기본 오류 메시지를 대체할 사용자 정의 메시지.
  - `options.autoClose`: 자동 닫기 시간 (ms). 기본값 `5000`.
  - `options.fallbackStep`: 알림이 닫힌 후 이동할 이전 단계 (e.g., 비밀번호 설정 실패 시 다시 설정 단계로).

**예시:**

```tsx
// API 에러 발생 시, 커스텀 메시지와 함께 이전 단계로 이동
signupUser(data, {
  onError: (error) => {
    signupOverlay.showError(SIGNUP_STEPS.SIGNUP_COMPLETE, {
      customMessage: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      fallbackStep: SIGNUP_STEPS.SET_PASSWORD,
    });
  },
});
```

---

### 2.3. `showWarning`

사용자의 확인이 필요한 경고 메시지를 표시합니다. 자동으로 닫히지 않습니다.

- **`showWarning(message: string)`**
  - `message`: 표시할 경고 메시지.

**예시:**

```tsx
// 특정 조건에서 사용자에게 경고 알림
if (isWeakPassword(password)) {
  signupOverlay.showWarning("보안에 취약한 비밀번호입니다. 다른 비밀번호를 사용해주세요.");
}
```

---

### 2.4. `showConfirm`

사용자에게 '확인' 또는 '취소'를 선택하게 하는 다이얼로그를 표시합니다. `Promise<boolean>`을 반환하여 사용자의 선택을 비동기적으로 처리할 수 있습니다.

- **`async showConfirm(title: string, message: string, options?: {...})`**
  - `title`: 다이얼로그 제목.
  - `message`: 다이얼로그 내용.
  - `options.confirmText`: 확인 버튼 텍스트 (기본값: "확인").
  - `options.cancelText`: 취소 버튼 텍스트 (기본값: "취소").
  - `options.variant`: `'default'` 또는 `'destructive'`. 확인 버튼의 색상을 결정합니다.

**예시:**

```tsx
const handleCancelSignup = async () => {
  const confirmed = await signupOverlay.showConfirm(
    "회원가입 취소",
    "정말 취소하시겠습니까? 입력한 정보가 모두 사라집니다.",
    {
      confirmText: "나가기",
      cancelText: "계속하기",
      variant: "destructive",
    }
  );

  if (confirmed) {
    router.push("/");
  }
};
```

---

### 2.5. 특화된 확인 함수

`showConfirm`을 래핑하여 특정 시나리오에 맞게 미리 설정된 확인 다이얼로그 함수들입니다.

- **`confirmStepNavigation(targetStep: SignupStep, reason?: string)`**: 다른 단계로 이동하기 전에 사용자에게 확인을 받습니다.
- **`confirmSignupCancellation()`**: 회원가입 전체를 취소하기 전에 확인을 받습니다.

**예시:**

```tsx
// 단계 이동 아이콘 클릭 시
const onStepIconClick = async (step: SignupStep) => {
  const confirmed = await signupOverlay.confirmStepNavigation(step);
  if (confirmed) {
    router.push(`/auth/signup?step=${step}`);
  }
}

// 회원가입 취소 버튼 클릭 시
const onCancelButtonClick = async () => {
    const confirmed = await signupOverlay.confirmSignupCancellation();
    if(confirmed) {
        router.push("/");
    }
}
```

---

### 2.6. `showValidationError`

폼 유효성 검사 실패 시, 여러 오류 메시지를 조합하여 보여주고 필요한 단계로 자동 이동시킵니다.

- **`showValidationError(errors: Record<string, string>, requiredStep?: SignupStep)`**
  - `errors`: `react-hook-form` 등에서 반환된 에러 객체.
  - `requiredStep`: 알림이 닫힌 후 이동할 필수 단계.

**예시:**

```tsx
// 최종 제출 전 데이터 검증
const finalValidation = validateFinalCompletion(signupData);
if (!finalValidation.isValid) {
  signupOverlay.showValidationError(
    finalValidation.errors,
    finalValidation.nextRequiredStep
  );
  return;
}
```

---

### 2.7. `showFinalSuccess`

회원가입 최종 완료 시 호출하는 전용 성공 알림입니다.

**예시:**

```tsx
// API 호출 성공 시
signupUser(data, {
  onSuccess: () => {
    signupOverlay.showFinalSuccess();
    // .then()으로 연결되어 있어, 알림이 닫힌 후 자동으로 /onboarding 페이지로 이동합니다.
  },
});
```

## 3. 전역 오버레이 시스템 (`overlay` 객체)

`useSignupOverlay`는 전역 `overlay` 객체를 기반으로 만들어졌습니다. 더 일반적인 상황에서는 `overlay` 객체를 직접 사용하여 `Alert`, `Confirm`, `Sheet` 등을 열 수 있습니다.

### 3.1. 핵심 API

- **`overlay.open(Component)`**: 동기적으로 오버레이를 엽니다. `Promise`를 반환하지 않으며, 주로 단순 알림이나 `Sheet`처럼 결과값을 기다릴 필요 없는 UI에 사용됩니다.
- **`overlay.openAsync<T>(Component)`**: 비동기적으로 오버레이를 엽니다. `Promise<T>`를 반환하며, 사용자의 액션(e.g., 확인/취소) 결과값을 받아야 하는 `Confirm` 다이얼로그 등에 사용됩니다.

### 3.2. `overlay.open` 사용 예시

`useSignupOverlay`의 `showWarning`은 `overlay.open`을 사용합니다.

```tsx
// showWarning의 내부 구현
const showWarning = useCallback((message: string) => {
  // overlay.open은 오버레이 ID(string)를 반환하고 바로 종료됩니다.
  overlay.open(({ isOpen, close, overlayId, unmount }) => (
    <SystemAlert
      isOpen={isOpen}
      close={close}
      overlayId={overlayId}
      unmount={unmount}
      title="확인 필요"
      description={message}
      variant="default"
      autoClose={0} // 수동 닫기
      showIcon
    />
  ));
}, []);
```

### 3.3. `overlay.openAsync` 사용 예시

`useSignupOverlay`의 `showConfirm`은 `overlay.openAsync`를 사용합니다.

```tsx
// showConfirm의 내부 구현
const showConfirm = useCallback(
  async (title: string, message: string, ...): Promise<boolean> => {
    // overlay.openAsync는 Promise를 반환하므로 await 키워드로 결과를 기다립니다.
    return overlay.openAsync<boolean>(({ isOpen, close, ... }) => (
      <SystemConfirm
        isOpen={isOpen}
        // 여기서 close(true) 또는 close(false)가 호출되면 Promise가 resolve됩니다.
        close={close} 
        title={title}
        description={message}
        ...
      />
    ));
  },
  [],
);
```

## 4. 제공되는 시스템 컴포넌트

전역 오버레이 시스템은 `shadcn/ui` 기반의 사전 정의된 컴포넌트들을 제공합니다. `overlay.open` 또는 `overlay.openAsync`의 인자로 이 컴포넌트들을 전달하여 사용합니다.

- **`SystemAlert`**: `Alert`와 유사. 성공, 오류, 정보 등 간단한 메시지를 표시.
- **`SystemConfirm`**: `AlertDialog`와 유사. `Promise<boolean>`을 반환하는 확인/취소 다이얼로그.
- **`SystemSheet`**: 화면 측면에서 나타나는 패널.

이 외에도 `SystemPopover` 등 다양한 컴포넌트가 `shared/ui/overlay/components`에 준비되어 있습니다.

## 5. 아키텍처와 모범 사례

- **Provider 설정**: 앱의 최상단(`app/layout.tsx`)에 `DefaultOverlayProvider`가 설정되어 있고, `<body>` 태그 내에 `<div id="overlay-root" />`가 있는지 항상 확인해야 합니다.
- **훅 재사용**: `useSignupOverlay`처럼 특정 도메인에 맞는 훅을 만들면 코드의 재사용성과 일관성이 크게 향상됩니다.
- **비동기 처리**: `async/await`와 `overlay.openAsync`를 적극적으로 활용하여 복잡한 사용자 인터랙션 플로우를 명료하게 작성할 수 있습니다.

더 자세한 아키텍처 정보는 `docs/ui/overlay/overlay-system-implementation.md` 와 `docs/ui/overlay/frontend-overlay-management-guide.md` 문서를 참고하세요.
