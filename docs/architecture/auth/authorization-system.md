# 인가(Authorization) 시스템 상세 설계

> **버전**: v1.0
> **작성일**: 2026-02-02

본 문서는 `@repo/common-lib/src/auth`에 구현된 인가 시스템의 아키텍처와 사용법을 설명합니다.
이 시스템은 **RBAC**(Role-Based)와 **ABAC**(Attribute-Based)가 결합된 하이브리드 모델이며, 프론트엔드와 백엔드에서 동일한 로직을 공유합니다.

---

## 1. 주요 기능

1.  **계층형 리소스 & 와일드카드**: `mentoring:post`, `mentoring:*`와 같은 패턴 매칭 지원.
2.  **조건부 권한 (Conditional Access)**: 단순 역할 확인을 넘어, 데이터 속성(소유자, 시간, 상태 등)에 따른 정밀 제어.
3.  **타입 안정성 (Type Safety)**: 리소스별 데이터 타입을 강제하여 개발 실수 방지.
4.  **디버깅 지원**: 개발 모드에서 권한 거부 사유(Reason) 로깅.

---

## 2. 아키텍처 레이어

```
[Policy Definition] (policy.ts)
   │ "멘토는 본인의 세션만 승인할 수 있다"
   │ "관리자는 모든 것을 할 수 있다"
   ▼
[Condition Logic] (conditions.ts)
   │ isOwner(), isFuture(), isPublic()
   │ 순수 함수로 로직 분리
   ▼
[Core Engine] (ability.ts)
   │ can(user, action, resource, data)
   │ 와일드카드 매칭, 조건 평가, 로깅 수행
   ▼
[Usage] (Frontend/Backend)
   │ UI: <PermissionGate>, useAbility()
   │ API: @RequirePermission() Guard
```

---

## 3. 데이터 구조

### 3.1 UserRole (역할)

- **GUEST**: 비로그인 사용자
- **MENTEE**: 기본 회원 (로그인 됨)
- **MENTOR**: 검증된 멘토
- **ADMIN**: 시스템 관리자

### 3.2 Resource (리소스)

계층형 구조를 가지며 `:`로 구분합니다.

- `page:admin`: 관리자 페이지
- `mentoring:post`: 멘토링 모집글
- `mentoring:session`: 멘토링 세션
- `user:profile`: 사용자 프로필

### 3.3 Action (행위)

- **CRUD**: `create`, `read`, `update`, `delete`
- **Business**: `cancel`, `approve`, `reject`, `complete`
- **Manage**: `manage` (모든 권한)

---

## 4. 사용 예시

### 4.1 기본 권한 검사

```typescript
import { can, Action, Resource } from '@repo/common-lib/auth';

// 단순히 읽기 권한이 있는지?
if (can(user, Action.READ, Resource.MENTORING_POST)) {
  // ...
}
```

### 4.2 소유권 및 조건 검사

데이터(`data`)를 전달하면 정책에 정의된 조건 함수(`isOwner` 등)가 실행됩니다.

```typescript
const post = { id: '1', mentorId: 'user-123', ... };

// 내 포스트인지 확인 (isOwner 조건 실행됨)
if (can(user, Action.UPDATE, Resource.MENTORING_POST, post)) {
  console.log('수정 가능');
} else {
  console.log('수정 권한 없음');
}
```

---

## 5. 정책 확장 가이드

새로운 권한 규칙을 추가하려면 `packages/common-lib/src/auth/policy.ts`를 수정하세요.

### 예시: "멘토링 세션은 시작 24시간 전까지만 취소 가능"

1.  `conditions.ts`에 조건 함수 추가
    ```typescript
    export const isCancellableTime = (data: SessionData) => {
      return data.startsAt > Date.now() + 24 * 60 * 60 * 1000;
    };
    ```
2.  `policy.ts`에 규칙 등록
    ```typescript
    [UserRole.MENTEE]: {
      'mentoring:session': [
        { action: Action.CANCEL, conditions: [isOwner, isCancellableTime] }
      ]
    }
    ```
