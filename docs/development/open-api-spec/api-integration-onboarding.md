# API Integration 온보딩 가이드

> 새로운 개발자가 CotePT의 API 통합 아키텍처를 빠르게 이해할 수 있도록 작성된 가이드입니다.

## 🎯 학습 목표

이 가이드를 완료하면 다음을 할 수 있습니다:

- API Client부터 Feature까지의 전체 데이터 플로우 이해
- 새로운 API 엔드포인트를 Feature에 통합
- 타입 안전한 쿼리와 뮤테이션 작성
- 도메인간 쿼리 무효화 구현

## 🗺️ 전체 여정 개요

```
📦 packages/api-client        # 1. OpenAPI 자동 생성 코드
    ↓
🔧 shared/api/services        # 2. 공통 래퍼 & 에러 처리
    ↓
🏠 features/user/api          # 3. 도메인별 쿼리/뮤테이션
    ↓
⚛️ React Components          # 4. UI에서 사용
```

## 📚 Step-by-Step 학습

### Step 1: API Client 이해하기 (5분)

**위치**: `packages/api-client/src/services/user-api.ts`

```typescript
// 자동 생성된 Factory 패턴
export const UserApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
  return {
    createUser(requestParameters: UserApiCreateUserRequest, options?: any): AxiosPromise<UserResponseWrapper> {
      return UserApiFp(configuration).createUser(requestParameters, options)(axios, basePath)
    },
    // ... 다른 메서드들
  }
}
```

**🔍 확인해보기**:

1. `packages/api-client/src/services/user-api.ts` 파일 열기
2. `UserApiFactory`가 어떤 메서드들을 제공하는지 확인
3. 각 메서드의 파라미터와 반환 타입 살펴보기

### Step 2: Shared API Services 이해하기 (10분)

**위치**: `shared/api/services/user-api-service.ts`

```typescript
// 공통 래퍼로 감싸진 서비스
export const userApiService = createApiService(UserApiFactory(apiConfiguration, undefined, axiosInstance))

// 타입 유틸리티들
export type UserApiServiceMethodReturnType<T extends keyof ReturnType<typeof UserApiFactory>> = Awaited<
  ReturnType<ReturnType<typeof UserApiFactory>[T]>
>

export type UserApiServiceMethodParameters<T extends keyof ReturnType<typeof UserApiFactory>> = Parameters<
  ReturnType<typeof UserApiFactory>[T]
>
```

**🔍 실습해보기**:

```typescript
// 1. 서비스 사용해보기
const result = await userApiService.createUser({
  createUserRequestDto: { name: "test", email: "test@example.com" },
})
console.log(result) // UserResponseWrapper 타입

// 2. 타입 추출해보기
type CreateUserReturn = UserApiServiceMethodReturnType<"createUser">
type CreateUserParams = UserApiServiceMethodParameters<"createUser">
```

### Step 3: Feature Domain API 구조 이해하기 (15분)

**위치**: `features/user/api/`

#### 3-1. Query Key 관리 (`queryKey.ts`)

```typescript
// 도메인별 쿼리 키와 유틸리티를 한 곳에서 관리
export const userKeys = createQueryKeys("users", {
  all: null,
  lists: () => ["list"],
  detail: (id: string) => [id],
})

export const userQueryUtils = {
  invalidateAll: (queryClient: QueryClient) => {
    /* ... */
  },
  invalidateLists: (queryClient: QueryClient) => {
    /* ... */
  },
  // ...
}
```

#### 3-2. 쿼리 정의 (`queries.ts`)

```typescript
// React Query hooks
export function useUsers(params?: ListParams) {
  const query = userQueries.list(params)
  return useQuery({ ...query })
}

export function useUser(id: string) {
  const query = userQueries.detail(id)
  return useQuery({ ...query })
}
```

#### 3-3. 뮤테이션 정의 (`mutations.ts`)

```typescript
// 타입 안전한 뮤테이션
export function useCreateUser(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<CreateUserResponse, ApiError, CreateUserParams>({
    mutationFn: (data) => userApiService.createUser(...data),
    queryKey: userKeys.lists().queryKey,
    onSuccess: (response) => {
      userQueryUtils.invalidateLists(queryClient)
      config?.onSuccess?.(response.data)
    },
  })
}
```

**🔍 실습해보기**:

1. `features/user/api/queries.ts`에서 `useUsers` 훅 찾기
2. `features/user/api/mutations.ts`에서 `useCreateUser` 훅 찾기
3. 각각이 어떻게 `queryKey.ts`를 import하는지 확인

### Step 4: React Component에서 사용하기 (10분)

```typescript
// 컴포넌트에서 사용
function UserListPage() {
  // 쿼리 사용
  const { data: users, isLoading } = useUsers({ page: 1, limit: 10 })

  // 뮤테이션 사용
  const createUserMutation = useCreateUser({
    onSuccess: (userData) => {
      toast.success('사용자가 생성되었습니다')
      // 자동으로 목록이 무효화됨 (userQueryUtils.invalidateLists)
    }
  })

  const handleCreateUser = (formData: CreateUserForm) => {
    createUserMutation.mutate([{ createUserRequestDto: formData }])
  }

  return (
    <div>
      {isLoading ? <Spinner /> : <UserList users={users?.data} />}
      <CreateUserForm onSubmit={handleCreateUser} />
    </div>
  )
}
```

## 🎓 퀴즈: 이해도 체크

### Q1: 타입 추출하기

다음 코드의 빈 칸을 채워보세요:

```typescript
// updateUser API의 반환 타입을 추출하세요
type UpdateUserReturn = ______________________<"updateUser">

// updateUser API의 파라미터 타입을 추출하세요
type UpdateUserParams = ______________________<"updateUser">
```

<details>
<summary>정답 보기</summary>

```typescript
type UpdateUserReturn = UserApiServiceMethodReturnType<"updateUser">
type UpdateUserParams = UserApiServiceMethodParameters<"updateUser">
```

</details>

### Q2: 쿼리 무효화하기

사용자 정보를 수정한 후 어떤 쿼리들을 무효화해야 할까요?

<details>
<summary>정답 보기</summary>

```typescript
// 사용자 수정 후
userQueryUtils.invalidateDetail(queryClient, userId) // 해당 사용자 상세
userQueryUtils.invalidateLists(queryClient) // 사용자 목록
```

</details>

### Q3: 크로스 도메인 무효화

사용자가 멘토링 세션을 생성했을 때, 사용자 관련 쿼리도 무효화하려면?

<details>
<summary>정답 보기</summary>

```typescript
// mentoring/api/mutations.ts에서
import { userQueryUtils } from "@/features/user/api/queryKey"

export function useCreateMentoringSession() {
  return useBaseMutation({
    onSuccess: () => {
      // 자체 도메인
      mentoringQueryUtils.invalidateLists(queryClient)
      // 크로스 도메인
      userQueryUtils.invalidateUserRelated(queryClient, mentorId)
    },
  })
}
```

</details>

## 🚀 다음 단계

축하합니다! 기본적인 API 통합 구조를 이해하셨습니다.

**더 깊이 학습하려면**:

1. **아키텍처 설계 문서**: 왜 이런 구조를 선택했는지 배경과 트레이드오프 이해
2. **실용적 가이드**: 실제 개발에서 자주 사용하는 패턴과 예시들
3. **고급 패턴**: 옵티미스틱 업데이트, 무한 스크롤, 실시간 업데이트 등

## 🆘 도움이 필요할 때

**일반적인 질문들**:

- Q: 새로운 API 엔드포인트를 추가하려면? → 실용적 가이드 참조
- Q: 타입 에러가 발생한다면? → 타입 플로우 다이어그램 확인
- Q: 쿼리가 무효화되지 않는다면? → 쿼리 키 구조 점검

**더 많은 도움**: `#frontend-help` 채널에서 질문하거나 시니어 개발자에게 페어 프로그래밍 요청하세요.
