# API Integration 실용적 가이드

> 실제 개발에서 자주 발생하는 상황과 그 해결책을 제시하는 실무 중심 가이드입니다.

## 📚 목차

1. [빠른 참조](#빠른-참조)
2. [일반적인 패턴](#일반적인-패턴)
3. [자주 하는 작업](#자주-하는-작업)
4. [트러블슈팅](#트러블슈팅)
5. [성능 최적화](#성능-최적화)
6. [테스팅 가이드](#테스팅-가이드)

## ⚡ 빠른 참조

### 새로운 API 추가 (5분 체크리스트)

```typescript
// 1. API 클라이언트 생성 확인 (자동)
// packages/api-client/src/services/[domain]-api.ts

// 2. Shared 서비스 생성
// shared/api/services/[domain]-api-service.ts
export const domainApiService = createApiService(DomainApiFactory(apiConfiguration, undefined, axiosInstance))

// 3. Feature 구조 생성
// features/[domain]/api/queryKey.ts
export const domainKeys = createQueryKeys("domain", {
  /* ... */
})
export const domainQueryUtils = {
  /* ... */
}

// features/[domain]/api/queries.ts
export function useDomainList() {
  /* ... */
}

// features/[domain]/api/mutations.ts
export function useCreateDomain() {
  /* ... */
}
```

### 타입 추출 패턴

```typescript
// 자주 사용하는 타입 추출 패턴들
type CreateReturnType = DomainApiServiceMethodReturnType<"create">
type CreateParams = DomainApiServiceMethodParameters<"create">
type UpdateRequestData = UpdateParams[0]["updateRequestDto"]

// 컴포넌트에서 사용할 데이터 타입
type DomainData = CreateReturnType["data"]
```

## 🎯 일반적인 패턴

### 1. 기본 CRUD 패턴

```typescript
// features/product/api/mutations.ts
export function useCreateProduct(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<CreateProductReturnType, ApiError, CreateProductParams>({
    mutationFn: (data) => productApiService.createProduct(...data),
    queryKey: productKeys.lists().queryKey,
    successMessage: "상품이 생성되었습니다.",
    onSuccess: (response) => {
      // 1. 목록 무효화
      productQueryUtils.invalidateLists(queryClient)

      // 2. 새로 생성된 상품 캐시에 추가 (선택적)
      productQueryUtils.setProductData(queryClient, response.data.id, response.data)

      // 3. 커스텀 콜백
      config?.onSuccess?.(response.data)
    },
  })
}

export function useUpdateProduct(id: string, config?: MutationConfig) {
  const queryClient = useQueryClient()
  const optimisticUpdate = createOptimisticUpdate<UpdateProductReturnType, UpdateProductRequestData>(queryClient)

  return useBaseMutation<UpdateProductReturnType, ApiError, UpdateProductParams>({
    mutationFn: (data) => productApiService.updateProduct(...data),
    queryKey: productKeys.detail(id).queryKey,
    successMessage: "상품이 수정되었습니다.",
    onMutate: (data, previousData) => {
      // 옵티미스틱 업데이트
      optimisticUpdate(productKeys.detail(id).queryKey, data[0].updateProductRequestDto, previousData)
      return { previousData }
    },
    onSettled: () => {
      // 관련 쿼리 무효화
      productQueryUtils.invalidateLists(queryClient)
      productQueryUtils.invalidateDetail(queryClient, id)
    },
    onSuccess: (response) => {
      config?.onSuccess?.(response.data)
    },
  })
}

export function useDeleteProduct(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation<DeleteProductReturnType, ApiError, DeleteProductParams>({
    mutationFn: (data) => productApiService.deleteProduct(...data),
    queryKey: productKeys.lists().queryKey,
    successMessage: "상품이 삭제되었습니다.",
    onSuccess: (response, data) => {
      // 캐시에서 제거
      queryClient.removeQueries({ queryKey: productKeys.detail(data[0].id).queryKey })
      productQueryUtils.invalidateLists(queryClient)
      config?.onSuccess?.(response.data)
    },
  })
}
```

### 2. 무한 스크롤 패턴

```typescript
// features/product/api/queries.ts
export function useInfiniteProducts(params: ProductListParams) {
  return useInfiniteQuery({
    queryKey: productKeys.list(params).queryKey,
    queryFn: ({ pageParam = 1 }) =>
      productApiService.getAllProducts({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const hasMore = lastPage.data.hasNextPage
      return hasMore ? allPages.length + 1 : undefined
    },
    getPreviousPageParam: (firstPage, allPages) => {
      return allPages.length > 1 ? allPages.length - 1 : undefined
    }
  })
}

// 컴포넌트에서 사용
function ProductInfiniteList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteProducts({ category: 'electronics' })

  const products = data?.pages.flatMap(page => page.data.items) ?? []

  return (
    <InfiniteScroll
      dataLength={products.length}
      next={fetchNextPage}
      hasMore={hasNextPage}
      loader={<ProductSkeleton />}
    >
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </InfiniteScroll>
  )
}
```

### 3. 크로스 도메인 무효화 패턴

```typescript
// features/order/api/mutations.ts
import { userQueryUtils } from "@/features/user/api/queryKey"
import { productQueryUtils } from "@/features/product/api/queryKey"

export function useCreateOrder(config?: MutationConfig) {
  const queryClient = useQueryClient()

  return useBaseMutation({
    mutationFn: (data) => orderApiService.createOrder(...data),
    onSuccess: (response, variables) => {
      // 자체 도메인
      orderQueryUtils.invalidateLists(queryClient)

      // 크로스 도메인 무효화
      userQueryUtils.invalidateUserRelated(queryClient, variables.userId)

      // 주문한 상품들의 재고 정보 무효화
      variables.productIds.forEach((productId) => {
        productQueryUtils.invalidateDetail(queryClient, productId)
      })

      config?.onSuccess?.(response.data)
    },
  })
}
```

### 4. 조건부 쿼리 패턴

```typescript
// features/user/api/queries.ts
export function useUserProfile(userId?: string, options?: UseQueryOptions) {
  return useQuery({
    ...userQueries.detail(userId!),
    enabled: !!userId, // userId가 있을 때만 실행
    ...options,
  })
}

export function useUserPermissions(user?: User) {
  return useQuery({
    queryKey: userKeys.permissions(user?.id).queryKey,
    queryFn: () => userApiService.getUserPermissions({ id: user!.id }),
    enabled: !!user && user.role !== "guest", // 조건부 실행
    staleTime: 10 * 60 * 1000, // 10분간 캐시 유지
  })
}
```

## 🔧 자주 하는 작업

### 새로운 도메인 추가하기

```bash
# 1. 백엔드에서 OpenAPI 스펙 추가 후
pnpm gen:api

# 2. Shared 서비스 생성
```

```typescript
// shared/api/services/mentoring-api-service.ts
import { MentoringApiFactory } from "@repo/api-client"
import { createApiService } from "../core/base-api-service"
import { apiConfiguration, axiosInstance } from "../core/axios"

export const mentoringApiService = createApiService(MentoringApiFactory(apiConfiguration, undefined, axiosInstance))

export type MentoringApiServiceMethodReturnType<T extends keyof ReturnType<typeof MentoringApiFactory>> = Awaited<
  ReturnType<ReturnType<typeof MentoringApiFactory>[T]>
>

export type MentoringApiServiceMethodParameters<T extends keyof ReturnType<typeof MentoringApiFactory>> = Parameters<
  ReturnType<typeof MentoringApiFactory>[T]
>
```

```typescript
// 3. Feature 구조 생성
// features/mentoring/api/queryKey.ts
export const mentoringKeys = createQueryKeys("mentoring", {
  all: null,
  lists: () => ["list"],
  list: (filters: MentoringListParams) => [filters],
  detail: (id: string) => [id],
  sessions: () => ["sessions"],
  session: (id: string) => ["session", id],
})

export const mentoringQueryUtils = {
  invalidateAll: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: mentoringKeys.all.queryKey })
  },
  // ... 기타 유틸리티들
}
```

### 기존 API에 새 엔드포인트 추가하기

```typescript
// 1. 백엔드에서 API 추가 후 클라이언트 재생성
pnpm gen:api

// 2. 새로운 쿼리/뮤테이션 추가
// features/user/api/queries.ts
export function useUserStatistics(userId: string) {
  return useQuery({
    queryKey: userKeys.statistics(userId).queryKey,
    queryFn: () => userApiService.getUserStatistics({ id: userId }),
    staleTime: 5 * 60 * 1000, // 5분간 캐시
  })
}

// 3. 쿼리 키에 새 키 추가
// features/user/api/queryKey.ts
export const userKeys = createQueryKeys("users", {
  // ... 기존 키들
  statistics: (userId: string) => ["statistics", userId],
})
```

### 실시간 업데이트 구현하기

```typescript
// features/chat/api/queries.ts
export function useChatMessages(roomId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: chatKeys.messages(roomId).queryKey,
    queryFn: () => chatApiService.getMessages({ roomId }),
  })

  // WebSocket으로 실시간 업데이트
  useEffect(() => {
    if (!roomId) return

    const socket = io("/chat")

    socket.emit("join-room", roomId)

    socket.on("new-message", (message: ChatMessage) => {
      queryClient.setQueryData(chatKeys.messages(roomId).queryKey, (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          data: [...oldData.data, message],
        }
      })
    })

    return () => {
      socket.emit("leave-room", roomId)
      socket.disconnect()
    }
  }, [roomId, queryClient])

  return query
}
```

## 🔍 트러블슈팅

### 자주 발생하는 에러와 해결법

#### 1. 타입 에러: "Property does not exist"

```typescript
// ❌ 문제: 생성된 타입을 직접 사용
import { UserResponseWrapper } from "@repo/api-client"

// ✅ 해결: 타입 유틸리티 사용
type CreateUserResponse = UserApiServiceMethodReturnType<"createUser">
```

#### 2. 쿼리가 무효화되지 않는 문제

```typescript
// ❌ 문제: 잘못된 쿼리 키 사용
queryClient.invalidateQueries({ queryKey: ["users"] })

// ✅ 해결: 정확한 쿼리 키 사용
userQueryUtils.invalidateLists(queryClient)

// 또는 직접 사용 시
queryClient.invalidateQueries({ queryKey: userKeys.lists().queryKey })
```

#### 3. 옵티미스틱 업데이트가 동작하지 않는 문제

```typescript
// ❌ 문제: 잘못된 데이터 구조 가정
const optimisticUpdate = (queryKey, newData) => {
  queryClient.setQueryData(queryKey, newData)
}

// ✅ 해결: 올바른 데이터 구조 사용
const optimisticUpdate = createOptimisticUpdate<ReturnType, RequestData>(queryClient)

// 사용 시
onMutate: (data, previousData) => {
  optimisticUpdate(userKeys.detail(id).queryKey, data[0].updateUserRequestDto, previousData)
  return { previousData }
}
```

#### 4. 번들 크기 증가 문제

```typescript
// ❌ 문제: 전체 API 클라이언트 import
import * as UserApi from "@repo/api-client"

// ✅ 해결: 필요한 것만 import
import { userApiService } from "@/shared/api/services/user-api-service"
```

### 디버깅 팁

```typescript
// 1. React Query Devtools 활용
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <>
      <Router />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}

// 2. 쿼리 상태 로깅
export function useDebugQuery<T>(queryResult: UseQueryResult<T>) {
  useEffect(() => {
    console.log('Query State:', {
      data: queryResult.data,
      isLoading: queryResult.isLoading,
      error: queryResult.error,
      dataUpdatedAt: new Date(queryResult.dataUpdatedAt),
    })
  }, [queryResult])

  return queryResult
}

// 사용법
const users = useDebugQuery(useUsers())
```

## ⚡ 성능 최적화

### 1. 쿼리 최적화

```typescript
// 자주 변하지 않는 데이터는 staleTime 설정
export function useUserProfile(id: string) {
  return useQuery({
    ...userQueries.detail(id),
    staleTime: 10 * 60 * 1000, // 10분
    cacheTime: 30 * 60 * 1000, // 30분
  })
}

// 중요하지 않은 데이터는 백그라운드 갱신
export function useUserStatistics(id: string) {
  return useQuery({
    ...userQueries.statistics(id),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity, // 수동 갱신만
  })
}
```

### 2. 선택적 쿼리 무효화

```typescript
// ❌ 비효율적: 모든 사용자 쿼리 무효화
userQueryUtils.invalidateAll(queryClient)

// ✅ 효율적: 필요한 부분만 무효화
userQueryUtils.invalidateDetail(queryClient, userId)
userQueryUtils.invalidateLists(queryClient) // 목록만
```

### 3. 데이터 전처리

```typescript
// API 응답을 컴포넌트에 최적화된 형태로 변환
export function useUsersForSelect() {
  return useQuery({
    ...userQueries.list({}),
    select: (data) =>
      data.data.map((user) => ({
        value: user.id,
        label: user.name,
        avatar: user.avatar,
      })),
  })
}
```

## 🧪 테스팅 가이드

### 1. API 서비스 모킹

```typescript
// __tests__/setup.ts
import { vi } from "vitest"

vi.mock("@/shared/api/services/user-api-service", () => ({
  userApiService: {
    createUser: vi.fn(),
    getUserById: vi.fn(),
    getAllUsers: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}))
```

### 2. React Query 테스트

```typescript
// __tests__/useCreateUser.test.tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCreateUser } from '../mutations'
import { userApiService } from '@/shared/api/services/user-api-service'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useCreateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create user successfully', async () => {
    const mockUser = { id: '1', name: 'Test User' }
    vi.mocked(userApiService.createUser).mockResolvedValue({
      data: mockUser,
      success: true
    })

    const { result } = renderHook(() => useCreateUser(), { wrapper: createWrapper() })

    result.current.mutate([{
      createUserRequestDto: { name: 'Test User', email: 'test@example.com' }
    }])

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(userApiService.createUser).toHaveBeenCalledWith({
      createUserRequestDto: { name: 'Test User', email: 'test@example.com' }
    })
  })
})
```

### 3. 통합 테스트

```typescript
// __tests__/user-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserManagementPage } from '../UserManagementPage'

describe('User Management Flow', () => {
  it('should create and display new user', async () => {
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <UserManagementPage />
      </QueryClientProvider>
    )

    // 사용자 생성
    fireEvent.click(screen.getByText('새 사용자 추가'))
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: 'Test User' } })
    fireEvent.click(screen.getByText('생성'))

    // 목록에 추가되었는지 확인
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })
  })
})
```

## 📋 체크리스트

### 새 기능 개발 전

- [ ] OpenAPI 스펙이 최신인가?
- [ ] 필요한 타입들이 생성되었는가?
- [ ] Shared 서비스가 설정되었는가?

### 코드 작성 후

- [ ] 타입 에러가 없는가?
- [ ] 쿼리 키가 올바르게 설정되었는가?
- [ ] 무효화 로직이 적절한가?
- [ ] 에러 처리가 포함되었는가?

### 배포 전

- [ ] 테스트가 모두 통과하는가?
- [ ] 번들 크기 증가가 합리적인가?
- [ ] React Query DevTools로 동작 확인했는가?

이 가이드를 북마크하여 개발 중 참고하세요! 🚀
