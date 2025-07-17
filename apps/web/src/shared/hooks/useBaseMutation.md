# `useBaseMutation` Hook

`useBaseMutation`은 React Query의 `useMutation`을 한번 더 감싸, 우리 프로젝트에서 반복적으로 사용되는 로직들을 추상화한 커스텀 훅입니다. 이 훅을 사용함으로써 코드의 중복을 줄이고, 일관성을 유지하며, 생산성을 높일 수 있습니다.

## 목적 (Purpose)

- **코드 중복 제거**: `toast` 알림, `queryClient.invalidateQueries` 호출 등 모든 뮤테이션 훅에서 반복되는 상용구 코드를 제거합니다.
- **일관성 유지**: 프로젝트 전체의 뮤테이션 동작(성공, 에러 처리 방식)을 통일하여 예측 가능하고 안정적인 코드를 작성합니다.
- **개발 경험 향상**: 복잡한 로직은 훅 내부에 캡슐화하고, 개발자는 비즈니스 로직에만 집중할 수 있도록 돕습니다.

## 주요 기능 (Key Features)

- **자동 토스트 알림**: `successMessage`, `errorMessage` 옵션을 통해 뮤테이션 성공/실패 시 자동으로 `sonner` 토스트를 띄웁니다.
- **자동 쿼리 무효화**: `onSettled` 콜백에서 `queryKey`를 사용하여 관련 쿼리를 자동으로 무효화(invalidate)하여 서버와 클라이언트의 데이터 상태를 동기화합니다.
- **간편한 낙관적 업데이트(Optimistic Updates)**: `onMutate` 콜백을 지원하며, 에러 발생 시 자동으로 이전 상태로 롤백하는 로직이 내장되어 있습니다.

## API

`useBaseMutation`은 React Query의 `useMutation`과 거의 동일한 옵션을 받으며, 몇 가지 추가적인 옵션을 제공합니다.

### 추가 옵션 (`BaseMutationOptions`)

| 옵션명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `mutationFn` | `(variables: TVariables) => Promise<TData>` | **Yes** | 실제 API 요청을 수행하는 비동기 함수입니다. `useMutation`의 `mutationFn`과 동일합니다. |
| `queryKey` | `QueryKey` | **Yes** | 뮤테이션과 관련된 쿼리를 식별하는 키입니다. 쿼리 무효화 및 낙관적 업데이트에 사용됩니다. |
| `successMessage` | `string` | No | 뮤테이션 성공 시 표시될 토스트 메시지입니다. |
| `errorMessage` | `string` | No | 실패 시 표시될 기본 에러 메시지입니다. 서버에서 에러 메시지를 보내주면 해당 메시지가 우선적으로 표시됩니다. |

### 콜백 함수

`useMutation`의 `onMutate`, `onSuccess`, `onError`, `onSettled` 콜백을 그대로 사용할 수 있습니다. `useBaseMutation`이 공통 로직을 처리한 후, 사용자가 제공한 콜백 함수를 실행해 줍니다.

## 사용 예제 (Usage Examples)

### 1. 기본 사용법 (데이터 생성)

가장 간단한 형태로, 성공 메시지와 쿼리 키만 지정하면 됩니다.

```tsx
// features/users/apis/mutations.ts

import { useBaseMutation } from "@/shared/hooks/useBaseMutation";
import { userService } from "./client/service";
import { queryKeys } from "./queryKeyFactory";

export function useCreateUser(config?: MutationConfig) {
  return useBaseMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    queryKey: queryKeys.users.lists().queryKey, // 성공 시 사용자 목록 쿼리를 무효화
    successMessage: "사용자가 성공적으로 생성되었습니다.",
    // onSuccess, onError 콜백을 추가하여 개별 로직 처리 가능
    onSuccess: (response) => {
      console.log("User created:", response.data);
      config?.onSuccess?.(response.data);
    },
  });
}

// Component.tsx
const { mutate: createUser } = useCreateUser();
createUser({ name: "John Doe", email: "john@example.com" });
```

### 2. 낙관적 업데이트 (데이터 수정)

`onMutate` 콜백을 사용하여 서버 응답 전에 UI를 미리 업데이트합니다. 에러가 발생하면 `useBaseMutation`이 자동으로 롤백을 처리합니다.

```tsx
// features/users/apis/mutations.ts

export function useUpdateUser(id: string, config?: MutationConfig) {
  const queryClient = useQueryClient();

  return useBaseMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateUser(id, data),
    queryKey: queryKeys.users.detail(id).queryKey, // 해당 유저의 상세 정보 쿼리를 관리
    successMessage: "사용자 정보가 성공적으로 수정되었습니다.",
    onMutate: (updatedData) => {
      // 낙관적 업데이트 로직: 캐시를 직접 수정
      queryClient.setQueryData(queryKeys.users.detail(id).queryKey, (old: any) =>
        old ? { ...old, data: { ...old.data, ...updatedData } } : undefined
      );
    },
    onSettled: () => {
      // 수정 후에는 목록 데이터도 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists().queryKey });
    }
  });
}
```

### 3. 동적 메시지 처리 (커스텀 토스트)

`successMessage`를 생략하고 `onSuccess` 콜백에서 직접 `toast`를 호출하여 동적인 메시지를 만들 수 있습니다.

```tsx
// features/users/apis/mutations.ts

export function useToggleUserStatus(config?: MutationConfig) {
  return useBaseMutation({
    mutationFn: ({ id, status }) => userService.updateUser(id, { status }),
    queryKey: queryKeys.users.all.queryKey, // user 관련 모든 쿼리 무효화
    // successMessage를 생략
    onSuccess: (response, variables) => {
      const statusText = variables.status === "ACTIVE" ? "활성화" : "비활성화";
      toast.success(`사용자가 성공적으로 ${statusText}되었습니다.`);
      config?.onSuccess?.(response.data);
    },
  });
}
```
