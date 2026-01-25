# 에러 처리 파이프라인 (Error Handling Pipeline)

> **최종 수정일**: 2025-11-28
> **작성자**: Claude Code
> **관련 문서**: [Frontend Architecture Guide](./frontend-architecture-guide.md), [API Project Architecture](./api-project-architecture.md)

## 목차

- [개요](#개요)
- [아키텍처 다이어그램](#아키텍처-다이어그램)
- [Backend 에러 처리](#backend-에러-처리)
- [Frontend 에러 처리 파이프라인](#frontend-에러-처리-파이프라인)
  - [Layer 1: Network/Axios Layer](#layer-1-networkaxios-layer)
  - [Layer 2: React Query Layer](#layer-2-react-query-layer)
  - [Layer 3: Feature/Hook Layer](#layer-3-featurehook-layer)
- [에러 플로우 예시](#에러-플로우-예시)
- [일반적인 실수 (Common Pitfalls)](#일반적인-실수-common-pitfalls)
- [Best Practices](#best-practices)

---

## 개요

CotePT 프로젝트의 에러 처리는 **계층형 파이프라인 아키텍처**를 따릅니다. 각 계층은 명확한 책임을 가지며, 에러는 하위 레이어에서 상위 레이어로 전파되면서 점진적으로 처리됩니다.

### 핵심 원칙

1. **단일 책임 원칙**: 각 계층은 고유한 책임만 수행
2. **중복 처리 방지**: 에러는 한 번만 변환/처리되어야 함
3. **일관된 형식**: 모든 에러는 표준화된 포맷으로 전달
4. **사용자 친화적 메시지**: 백엔드에서 제공한 메시지를 최우선으로 사용

---

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Backend (NestJS)                           │
├─────────────────────────────────────────────────────────────────────┤
│  1. Exception 발생 (Business Logic)                                │
│     ↓                                                               │
│  2. HttpErrorFilter (Global Exception Filter)                      │
│     ↓                                                               │
│  3. ErrorResponse DTO 생성                                          │
│     {                                                               │
│       statusCode: 409,                                              │
│       message: "인증 요청이 너무 빈번합니다. 30분 후 다시...",      │
│       code: "RATE_LIMIT_EXCEEDED",                                  │
│       timestamp: "2025-11-28T..."                                   │
│     }                                                               │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTP Response
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Frontend - Layer 1: Axios                        │
├─────────────────────────────────────────────────────────────────────┤
│  1. Axios Interceptor (Response Error)                             │
│     ↓                                                               │
│  2. Error Handler Chain 실행                                        │
│     - handleNetworkError (네트워크 오류)                           │
│     - handleUnauthorizedError (401, 토큰 갱신)                     │
│     - handleServerError (5xx, 재시도)                              │
│     - handleForbiddenError (403, 권한)                             │
│     - handleClientError (4xx, 유효성 검사)                         │
│     ↓                                                               │
│  3. AxiosError 전파                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ AxiosError
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  Frontend - Layer 2: React Query                    │
├─────────────────────────────────────────────────────────────────────┤
│  1. useBaseMutation (Wrapper)                                       │
│     ↓                                                               │
│  2. ApiErrorHandler.process(error) 호출                             │
│     AxiosError → ProcessedError 변환                                │
│     {                                                               │
│       type: ErrorType.VALIDATION_ERROR,                             │
│       message: "인증 요청이 너무 빈번합니다. 30분 후...",           │
│       statusCode: 409,                                              │
│       originalError: AxiosError,                                    │
│       retryable: false                                              │
│     }                                                               │
│     ↓                                                               │
│  3. onError(processedError) 콜백 호출                               │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ ProcessedError
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                 Frontend - Layer 3: Feature/Hook                    │
├─────────────────────────────────────────────────────────────────────┤
│  1. Mutation onError Handler                                        │
│     onError: (error) => {                                           │
│       toast.error(error.message)  ← 이미 처리된 메시지 사용        │
│       // UI 상태 업데이트                                           │
│     }                                                               │
│     ↓                                                               │
│  2. Toast Notification 표시                                         │
│     ↓                                                               │
│  3. UI State Update (optional)                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Backend 에러 처리

### 1. Exception 발생

NestJS는 풍부한 Exception 클래스 계층을 제공합니다.

**주요 Exception 클래스**:

| Exception                    | Status | 용도                              |
| ---------------------------- | ------ | --------------------------------- |
| `BadRequestException`        | 400    | 유효성 검사 실패, 잘못된 요청     |
| `UnauthorizedException`      | 401    | 인증 실패                         |
| `ForbiddenException`         | 403    | 권한 부족                         |
| `NotFoundException`          | 404    | 리소스 없음                       |
| `ConflictException`          | 409    | 데이터 충돌, Rate Limit 초과      |
| `UnprocessableEntityException` | 422  | 처리 불가능한 엔티티              |
| `InternalServerErrorException` | 500  | 서버 내부 오류                    |

**파일**: [`apps/api/src/shared/infrastructure/common/filters/http-error.filter.ts`](../../apps/api/src/shared/infrastructure/common/filters/http-error.filter.ts)

### 2. HttpErrorFilter (Global Exception Filter)

모든 `HttpException`을 캐치하여 표준화된 응답으로 변환합니다.

```typescript
@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    const errorMessage = typeof exceptionResponse === "string"
      ? exceptionResponse
      : exceptionResponse.message

    const formattedMessage = Array.isArray(errorMessage)
      ? errorMessage.join(", ")
      : errorMessage

    response.status(status).json(ErrorResponse.create(status, formattedMessage))
  }
}
```

**책임**:
- HTTP Exception 캐치
- 메시지 추출 및 포맷팅
- ErrorResponse DTO 생성

### 3. ErrorResponse DTO

표준화된 에러 응답 형식을 정의합니다.

**파일**: [`apps/api/src/shared/infrastructure/dto/api-response.dto.ts`](../../apps/api/src/shared/infrastructure/dto/api-response.dto.ts)

```typescript
export class ErrorResponse {
  statusCode: number      // HTTP 상태 코드
  message: string         // 사용자에게 표시할 메시지
  code?: string           // 프로그래밍적 처리를 위한 에러 코드
  details?: any[]         // 추가 정보 (필드별 오류 등)
  timestamp?: string      // 발생 시각
  path?: string           // 요청 경로
  traceId?: string        // 추적 ID (디버깅용)
}
```

**예시 응답**:

```json
{
  "statusCode": 409,
  "message": "인증 요청이 너무 빈번합니다. 30분 후 다시 시도해주세요.",
  "code": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2025-11-28T02:42:19.000Z"
}
```

---

## Frontend 에러 처리 파이프라인

### Layer 1: Network/Axios Layer

#### 책임

- HTTP 통신 에러 감지
- 네트워크 레벨 에러 처리 (재시도, 토큰 갱신)
- Interceptor를 통한 전역 에러 핸들링
- **중요**: 이 레이어에서는 에러를 **처리만 하고 변환하지 않음**

#### 파일 위치

- [`apps/web/src/shared/api/core/errors/interceptors.ts`](../../apps/web/src/shared/api/core/errors/interceptors.ts)

#### Error Handler Chain

Interceptor는 에러를 순차적으로 처리하는 핸들러 체인을 실행합니다.

```typescript
export const defaultErrorHandlers: ErrorHandler[] = [
  handleNetworkError,         // 네트워크 연결 오류
  handleUnauthorizedError,    // 401: 토큰 갱신 시도
  handleServerError,          // 5xx: 재시도
  handleForbiddenError,       // 403: 권한 오류
  handleClientError,          // 4xx: 클라이언트 오류
]
```

**각 핸들러의 책임**:

1. **handleNetworkError**
   - 네트워크 연결 실패 감지
   - Toast 알림 표시
   - 에러 전파

2. **handleUnauthorizedError (401)**
   - Refresh Token으로 Access Token 갱신 시도
   - 성공 시 원래 요청 재시도
   - 실패 시 로그인 페이지 리디렉션

   ```typescript
   export const handleUnauthorizedError: ErrorHandler = async (error, originalRequest, axiosInstance) => {
     if (originalRequest._retry) {
       return null  // 이미 재시도했으면 스킵
     }

     originalRequest._retry = true

     try {
       const session = await getSession()
       const refreshResponse = await axios.post("/auth/refresh-token", {
         refreshToken: session.refreshToken
       })

       const newTokens = refreshResponse.data

       // 세션 업데이트
       await update({
         user: {
           accessToken: newTokens.accessToken,
           refreshToken: newTokens.refreshToken,
         },
       })

       // 원래 요청 재시도
       originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
       return axiosInstance(originalRequest)
     } catch (refreshError) {
       toast.error("세션이 만료되었습니다.")
       window.location.href = "/auth/signin"
       throw refreshError
     }
   }
   ```

3. **handleServerError (5xx)**
   - 재시도 가능 여부 확인
   - Exponential Backoff 재시도
   - 최대 3회 재시도 후 실패 처리

   ```typescript
   export const handleServerError: ErrorHandler = async (error, originalRequest, axiosInstance) => {
     const processedError = isErrorType(error, ErrorType.SERVER_ERROR)
     if (!processedError) return null

     const retryCount = originalRequest.__retryCount || 0

     if (ApiErrorHandler.shouldRetry(processedError, retryCount)) {
       originalRequest.__retryCount = retryCount + 1
       const delay = ApiErrorHandler.getRetryDelay(retryCount)  // 1s, 2s, 4s...

       await sleep(delay)
       return axiosInstance(originalRequest)
     }

     showErrorToast(processedError.message, originalRequest)
     throw error
   }
   ```

4. **handleClientError (4xx)**
   - 유효성 검사 오류, 409 등 클라이언트 오류
   - Toast 알림 표시
   - 에러 전파

#### Silent Mode

특정 요청에서 Toast 알림을 억제할 수 있습니다.

```typescript
const response = await apiClient.get('/user', {
  silent: true  // Interceptor에서 Toast를 표시하지 않음
})
```

---

### Layer 2: React Query Layer

#### 책임

- AxiosError → ProcessedError 변환
- 에러 타입 분류
- 백엔드 메시지 추출
- 재시도 가능 여부 판단
- **중요**: 에러 변환은 **이 레이어에서 단 한 번만** 수행

#### 파일 위치

- [`apps/web/src/shared/hooks/useBaseMutation.ts`](../../apps/web/src/shared/hooks/useBaseMutation.ts)
- [`apps/web/src/shared/api/core/errors/handlers.ts`](../../apps/web/src/shared/api/core/errors/handlers.ts)
- [`apps/web/src/shared/api/core/types.ts`](../../apps/web/src/shared/api/core/types.ts)

#### ProcessedError 타입

```typescript
export interface ProcessedError {
  type: ErrorType              // 에러 분류
  message: string              // 사용자에게 표시할 메시지
  originalError: Error         // 원본 에러 객체
  statusCode?: number          // HTTP 상태 코드
  retryable: boolean           // 재시도 가능 여부
}

export enum ErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",               // 네트워크 연결 실패
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR", // 401
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",   // 403
  VALIDATION_ERROR = "VALIDATION_ERROR",         // 400, 409, 422 등
  SERVER_ERROR = "SERVER_ERROR",                 // 5xx
  CLIENT_ERROR = "CLIENT_ERROR",                 // 기타 4xx
  UNKNOWN_ERROR = "UNKNOWN_ERROR",               // 알 수 없는 에러
}
```

#### ApiErrorHandler.process()

AxiosError를 ProcessedError로 변환하는 핵심 함수입니다.

```typescript
export class ApiErrorHandler {
  static process(error: unknown): ProcessedError {
    if (error instanceof AxiosError) {
      return this.processAxiosError(error)
    }

    // AxiosError가 아닌 경우
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message || "알 수 없는 오류가 발생했습니다.",
      originalError: error,
      retryable: false,
    }
  }

  private static processAxiosError(error: AxiosError): ProcessedError {
    const statusCode = error.response?.status

    if (!statusCode) {
      // 네트워크 오류 (응답 없음)
      return {
        type: ErrorType.NETWORK_ERROR,
        message: "네트워크 연결을 확인해주세요.",
        originalError: error,
        retryable: true,
      }
    }

    const errorType = this.getErrorTypeFromStatus(statusCode)
    const customMessage = this.extractErrorMessage(error)  // 백엔드 메시지 추출
    const defaultMessage = getApiErrorMessage(errorType).message

    return {
      type: errorType,
      message: customMessage || defaultMessage,  // 백엔드 메시지 우선
      originalError: error,
      statusCode,
      retryable: this.isRetryable(errorType),
    }
  }

  private static getErrorTypeFromStatus(statusCode: number): ErrorType {
    switch (true) {
      case statusCode === 401:
        return ErrorType.AUTHENTICATION_ERROR
      case statusCode === 403:
        return ErrorType.AUTHORIZATION_ERROR
      case statusCode === 409:
        return ErrorType.VALIDATION_ERROR  // Rate Limit 등
      case statusCode >= 400 && statusCode < 500:
        return ErrorType.VALIDATION_ERROR
      case statusCode >= 500:
        return ErrorType.SERVER_ERROR
      default:
        return ErrorType.CLIENT_ERROR
    }
  }

  private static extractErrorMessage(error: AxiosError): string | null {
    const responseData = error.response?.data as any

    // 백엔드 ErrorResponse DTO에서 메시지 추출
    if (responseData?.message) {
      return responseData.message
    }

    if (responseData?.error) {
      return responseData.error
    }

    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
      return responseData.errors[0].message || responseData.errors[0]
    }

    return null
  }
}
```

#### useBaseMutation

React Query의 `useMutation`을 래핑하여 자동으로 에러를 처리합니다.

```typescript
export function useBaseMutation<TData, TError, TVariables, TContext>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  return useMutation({
    ...options,
    onError: (error, variables, context) => {
      // ✅ 에러 변환 (AxiosError → ProcessedError)
      const processedError = ApiErrorHandler.process(error)

      // ✅ 에러 로깅
      ApiErrorHandler.logError(processedError, options.mutationKey?.[0] as string)

      // ✅ 사용자 정의 onError 콜백 호출 (ProcessedError 전달)
      options.onError?.(processedError as TError, variables, context)
    },
  })
}
```

**핵심 포인트**:
- `ApiErrorHandler.process(error)` 호출하여 **AxiosError → ProcessedError** 변환
- 변환된 `ProcessedError`를 사용자 정의 `onError` 콜백에 전달
- 상위 레이어에서는 **이미 처리된 ProcessedError**를 받음

---

### Layer 3: Feature/Hook Layer

#### 책임

- ProcessedError의 메시지를 사용자에게 표시 (Toast)
- UI 상태 업데이트
- 에러 복구 로직 (optional)
- **중요**: 이 레이어에서는 **재처리 금지** (이미 처리된 에러를 받음)

#### 파일 위치

- Feature별 커스텀 훅 (예: [`apps/web/src/features/onboarding/hooks/useBaekjoonVerification.ts`](../../apps/web/src/features/onboarding/hooks/useBaekjoonVerification.ts))

#### 올바른 사용 예시

```typescript
const { mutate: startVerification } = useStartBaekjoonVerification({
  onSuccess: ({ data: response }) => {
    setVerificationSession(response)
    toast.success("인증 코드가 발급되었습니다.")
  },
  onError: (error) => {
    // ✅ 올바름: useBaseMutation에서 이미 처리된 ProcessedError를 받음
    toast.error(error.message)

    // UI 상태 업데이트
    if (verificationSession) {
      setVerificationSession({
        ...verificationSession,
        status: VerificationStatusType.FAILED,
        errorReason: error.message,
      })
    }
  },
})
```

#### 잘못된 사용 예시

```typescript
const { mutate: startVerification } = useStartBaekjoonVerification({
  onError: (error) => {
    // ❌ 잘못됨: 이미 처리된 ProcessedError를 다시 처리
    const handledError = handleApiError(error)  // 이중 처리!
    toast.error(handledError.message)
  },
})
```

**왜 잘못되었나?**

1. `useBaseMutation`에서 이미 `ApiErrorHandler.process()`를 호출했음
2. `error`는 이미 `ProcessedError` 타입임
3. `handleApiError(error)`를 다시 호출하면:
   - `ProcessedError`는 `AxiosError`가 아니므로 `UNKNOWN_ERROR`로 분류됨
   - 백엔드에서 전달한 원본 메시지가 손실됨
   - 사용자에게 "알 수 없는 오류가 발생했습니다." 같은 일반적인 메시지만 표시됨

---

## 에러 플로우 예시

### 예시 1: Rate Limit 409 에러

**시나리오**: 사용자가 백준 인증을 30분 내에 2회 이상 시도

#### Backend

```typescript
// baekjoon-rate-limit.service.ts
async checkRateLimit(email: string): Promise<void> {
  const currentCount = await this.getCurrentCount(email)

  if (currentCount >= this.limit) {
    throw new ConflictException(
      '인증 요청이 너무 빈번합니다. 30분 후 다시 시도해주세요.'
    )
  }
}
```

**HTTP Response**:

```json
{
  "statusCode": 409,
  "message": "인증 요청이 너무 빈번합니다. 30분 후 다시 시도해주세요.",
  "timestamp": "2025-11-28T02:42:19.000Z"
}
```

#### Frontend - Layer 1 (Axios Interceptor)

```typescript
// handleClientError
export const handleClientError: ErrorHandler = async (error, originalRequest) => {
  const processedError = ApiErrorHandler.process(error)

  if (processedError.type !== ErrorType.VALIDATION_ERROR) {
    return null
  }

  // Toast 표시 (Interceptor 레벨)
  showErrorToast(processedError.message, originalRequest)

  // 에러 전파 (React Query로 전달)
  throw error
}
```

#### Frontend - Layer 2 (React Query)

```typescript
// useBaseMutation
onError: (error, variables, context) => {
  // AxiosError → ProcessedError 변환
  const processedError = ApiErrorHandler.process(error)
  // {
  //   type: ErrorType.VALIDATION_ERROR,
  //   message: "인증 요청이 너무 빈번합니다. 30분 후 다시 시도해주세요.",
  //   statusCode: 409,
  //   retryable: false
  // }

  // 사용자 정의 onError에 ProcessedError 전달
  options.onError?.(processedError, variables, context)
}
```

#### Frontend - Layer 3 (Feature Hook)

```typescript
// useBaekjoonVerification
const { mutate: startVerification } = useStartBaekjoonVerification({
  onError: (error) => {
    // ProcessedError 직접 사용
    toast.error(error.message)  // "인증 요청이 너무 빈번합니다. 30분 후 다시 시도해주세요."

    setVerificationSession({
      ...verificationSession,
      status: VerificationStatusType.FAILED,
      errorReason: error.message,
    })
  },
})
```

**최종 사용자 경험**:
- Toast 알림: "인증 요청이 너무 빈번합니다. 30분 후 다시 시도해주세요."
- 인증 상태가 FAILED로 변경
- 에러 메시지가 UI에 표시됨

---

### 예시 2: 네트워크 연결 실패

#### Frontend - Layer 1 (Axios)

```typescript
// handleNetworkError
export const handleNetworkError: ErrorHandler = async (error, originalRequest) => {
  const processedError = isErrorType(error, ErrorType.NETWORK_ERROR)
  if (!processedError) return null

  showErrorToast(processedError.message, originalRequest)  // "네트워크 연결을 확인해주세요."
  throw error
}
```

#### Frontend - Layer 2 (React Query)

```typescript
const processedError = ApiErrorHandler.process(error)
// {
//   type: ErrorType.NETWORK_ERROR,
//   message: "네트워크 연결을 확인해주세요.",
//   retryable: true
// }
```

#### Frontend - Layer 3 (Feature Hook)

```typescript
onError: (error) => {
  toast.error(error.message)  // "네트워크 연결을 확인해주세요."
}
```

---

### 예시 3: 401 Unauthorized (토큰 만료)

#### Frontend - Layer 1 (Axios Interceptor)

```typescript
// handleUnauthorizedError
export const handleUnauthorizedError: ErrorHandler = async (error, originalRequest, axiosInstance) => {
  if (originalRequest._retry) {
    return null  // 이미 재시도했으면 스킵
  }

  originalRequest._retry = true

  try {
    // Refresh Token으로 Access Token 갱신
    const session = await getSession()
    const refreshResponse = await axios.post("/auth/refresh-token", {
      refreshToken: session.refreshToken
    })

    const newTokens = refreshResponse.data

    // 세션 업데이트
    await update({
      user: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      },
    })

    // 원래 요청 재시도 (새 토큰으로)
    originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
    return axiosInstance(originalRequest)  // ✅ 성공 시 원래 응답 반환
  } catch (refreshError) {
    // Refresh Token도 만료된 경우
    toast.error("세션이 만료되었습니다.")
    window.location.href = "/auth/signin"
    throw refreshError
  }
}
```

**플로우**:
1. 원래 요청 실패 (401)
2. Refresh Token으로 Access Token 갱신
3. 성공 시: 원래 요청 재시도 → 정상 응답 반환 (에러 없음)
4. 실패 시: 로그인 페이지로 리디렉션

---

### 예시 4: 500 Internal Server Error (재시도)

#### Frontend - Layer 1 (Axios Interceptor)

```typescript
// handleServerError
export const handleServerError: ErrorHandler = async (error, originalRequest, axiosInstance) => {
  const retryCount = originalRequest.__retryCount || 0

  if (retryCount < 3) {
    originalRequest.__retryCount = retryCount + 1
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)  // 1s, 2s, 4s

    await sleep(delay)
    return axiosInstance(originalRequest)  // 재시도
  }

  // 3회 재시도 실패
  showErrorToast("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
  throw error
}
```

**플로우**:
1. 첫 번째 시도 실패 → 1초 대기 → 재시도
2. 두 번째 시도 실패 → 2초 대기 → 재시도
3. 세 번째 시도 실패 → 4초 대기 → 재시도
4. 네 번째 시도 실패 → Toast 표시 및 에러 전파

---

## 일반적인 실수 (Common Pitfalls)

### ❌ Pitfall 1: 이중 에러 처리

**문제**:

```typescript
const { mutate } = useStartBaekjoonVerification({
  onError: (error) => {
    // ❌ 잘못됨: 이미 처리된 ProcessedError를 다시 처리
    const handledError = handleApiError(error)
    toast.error(handledError.message)
  },
})
```

**증상**:
- 백엔드 메시지가 "알 수 없는 오류가 발생했습니다."로 대체됨
- 사용자에게 유용한 정보가 전달되지 않음

**해결**:

```typescript
const { mutate } = useStartBaekjoonVerification({
  onError: (error) => {
    // ✅ 올바름: 이미 처리된 메시지 직접 사용
    toast.error(error.message)
  },
})
```

**이유**:
- `useBaseMutation`에서 이미 `ApiErrorHandler.process()` 호출
- `onError`로 전달되는 `error`는 이미 `ProcessedError` 타입
- 재처리하면 `ProcessedError`가 `AxiosError`가 아니므로 UNKNOWN_ERROR로 분류됨

---

### ❌ Pitfall 2: Interceptor에서 에러 전파 누락

**문제**:

```typescript
export const handleClientError: ErrorHandler = async (error, originalRequest) => {
  const processedError = ApiErrorHandler.process(error)

  showErrorToast(processedError.message, originalRequest)

  // ❌ 잘못됨: 에러를 전파하지 않음
  return null
}
```

**증상**:
- React Query 레이어에서 에러를 받지 못함
- `onError` 콜백이 실행되지 않음
- UI 상태가 업데이트되지 않음

**해결**:

```typescript
export const handleClientError: ErrorHandler = async (error, originalRequest) => {
  const processedError = ApiErrorHandler.process(error)

  showErrorToast(processedError.message, originalRequest)

  // ✅ 올바름: 에러를 전파하여 React Query가 처리하도록 함
  throw error
}
```

---

### ❌ Pitfall 3: 타입 불일치

**문제**:

```typescript
interface MyMutationOptions {
  onError?: (error: AxiosError) => void  // ❌ 타입이 맞지 않음
}

const { mutate } = useBaseMutation<Data, AxiosError, Variables>({
  onError: (error) => {
    // error는 ProcessedError이지만 타입은 AxiosError로 선언됨
  },
})
```

**증상**:
- TypeScript 에러 또는 런타임 오류
- `error.response`에 접근 시도 시 undefined

**해결**:

```typescript
import { ProcessedError } from "@/shared/api/core/types"

interface MyMutationOptions {
  onError?: (error: ProcessedError) => void  // ✅ 올바른 타입
}

const { mutate } = useBaseMutation<Data, ProcessedError, Variables>({
  onError: (error) => {
    // error는 ProcessedError 타입
    console.log(error.type, error.message, error.statusCode)
  },
})
```

---

### ❌ Pitfall 4: Silent Mode 무시

**문제**:

```typescript
// Layer 3에서 직접 Toast 표시
const { mutate } = useMutation({
  onError: (error) => {
    toast.error(error.message)  // ❌ Interceptor와 중복 Toast
  },
})
```

**증상**:
- Toast가 중복으로 표시됨 (Interceptor + Hook)

**해결 방법 1**: Interceptor에서만 Toast 표시

```typescript
// Layer 1 (Interceptor)에서 Toast 표시
showErrorToast(processedError.message, originalRequest)

// Layer 3 (Hook)에서는 UI 상태만 업데이트
const { mutate } = useMutation({
  onError: (error) => {
    // Toast 없이 상태만 업데이트
    setErrorState(error.message)
  },
})
```

**해결 방법 2**: Silent Mode 사용

```typescript
// Interceptor에서 Toast 억제
const response = await apiClient.post('/endpoint', data, {
  silent: true  // Interceptor에서 Toast 표시 안 함
})

// Hook에서만 Toast 표시
const { mutate } = useMutation({
  onError: (error) => {
    toast.error(error.message)  // ✅ Hook에서만 표시
  },
})
```

---

## Best Practices

### 1. 계층별 책임 명확화

| Layer           | 책임                                    | 금지 사항                        |
| --------------- | --------------------------------------- | -------------------------------- |
| **Layer 1**     | 네트워크 에러 처리, 재시도, 토큰 갱신   | 에러 타입 변환 (AxiosError 유지) |
| **Layer 2**     | 에러 타입 변환 (AxiosError → ProcessedError) | 이중 변환                        |
| **Layer 3**     | Toast 표시, UI 상태 업데이트            | 재처리 (`handleApiError` 재호출) |

---

### 2. 백엔드 메시지 우선 사용

```typescript
// ✅ 올바름: 백엔드 메시지를 최우선으로 사용
private static extractErrorMessage(error: AxiosError): string | null {
  const responseData = error.response?.data as any

  // 1순위: response.data.message
  if (responseData?.message) {
    return responseData.message
  }

  // 2순위: response.data.error
  if (responseData?.error) {
    return responseData.error
  }

  // 3순위: response.data.errors 배열
  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors[0].message || responseData.errors[0]
  }

  // 4순위: 기본 메시지
  return null
}
```

---

### 3. 타입 안전성 보장

```typescript
// ✅ 올바름: ProcessedError 타입 명시
import { ProcessedError } from "@/shared/api/core/types"

const { mutate } = useBaseMutation<ResponseData, ProcessedError, Variables>({
  onError: (error) => {
    // error는 ProcessedError 타입 보장
    toast.error(error.message)
  },
})
```

---

### 4. Silent Mode 활용

특정 요청에서 Interceptor의 Toast를 억제하려면:

```typescript
// API 호출 시 silent: true 전달
const response = await apiClient.get('/user-profile', {
  silent: true  // Interceptor에서 Toast 표시 안 함
})

// Hook에서만 Toast 표시
const { mutate } = useMutation({
  mutationFn: () => apiClient.get('/user-profile', { silent: true }),
  onError: (error) => {
    toast.error(error.message)  // Hook에서만 표시
  },
})
```

---

### 5. 에러 로깅

Layer 2에서 자동으로 에러 로깅을 수행합니다.

```typescript
// useBaseMutation에서 자동 로깅
onError: (error, variables, context) => {
  const processedError = ApiErrorHandler.process(error)

  // ✅ 자동 에러 로깅
  ApiErrorHandler.logError(processedError, options.mutationKey?.[0] as string)

  options.onError?.(processedError, variables, context)
}
```

**로그 포맷**:

```
[ApiError - startBaekjoonVerification]: {
  type: "VALIDATION_ERROR",
  message: "인증 요청이 너무 빈번합니다. 30분 후 다시 시도해주세요.",
  statusCode: 409,
  stack: "..."
}
```

---

### 6. 재시도 로직

재시도 가능한 에러만 재시도합니다.

```typescript
// ✅ 올바름: 재시도 가능 여부 확인
private static isRetryable(errorType: ErrorType): boolean {
  return [ErrorType.NETWORK_ERROR, ErrorType.SERVER_ERROR].includes(errorType)
}

// ✅ Exponential Backoff 사용
static getRetryDelay(retryCount: number): number {
  return Math.min(1000 * Math.pow(2, retryCount), 10000)  // 1s, 2s, 4s, 8s, 10s (최대)
}
```

**재시도 가능**:
- `NETWORK_ERROR`: 네트워크 연결 실패
- `SERVER_ERROR`: 5xx 서버 오류

**재시도 불가**:
- `VALIDATION_ERROR`: 유효성 검사 실패, 409 등
- `AUTHENTICATION_ERROR`: 401 (토큰 갱신은 별도 처리)
- `AUTHORIZATION_ERROR`: 403
- `CLIENT_ERROR`: 기타 4xx

---

### 7. 테스트 작성

에러 처리 로직은 반드시 테스트해야 합니다.

```typescript
// Example: ApiErrorHandler 테스트
describe("ApiErrorHandler", () => {
  it("should extract backend message from 409 error", () => {
    const axiosError = {
      response: {
        status: 409,
        data: {
          message: "인증 요청이 너무 빈번합니다. 30분 후 다시 시도해주세요."
        }
      }
    } as AxiosError

    const result = ApiErrorHandler.process(axiosError)

    expect(result.type).toBe(ErrorType.VALIDATION_ERROR)
    expect(result.message).toBe("인증 요청이 너무 빈번합니다. 30분 후 다시 시도해주세요.")
    expect(result.statusCode).toBe(409)
    expect(result.retryable).toBe(false)
  })

  it("should handle network error without response", () => {
    const axiosError = {
      message: "Network Error"
    } as AxiosError

    const result = ApiErrorHandler.process(axiosError)

    expect(result.type).toBe(ErrorType.NETWORK_ERROR)
    expect(result.message).toBe("네트워크 연결을 확인해주세요.")
    expect(result.retryable).toBe(true)
  })
})
```

---

## 요약

### 에러 처리 원칙

1. **단일 변환**: 에러는 Layer 2에서 **한 번만** 변환 (AxiosError → ProcessedError)
2. **계층 책임**: 각 계층은 고유한 책임만 수행
3. **백엔드 메시지 우선**: 백엔드에서 제공한 메시지를 최우선으로 사용
4. **재처리 금지**: Layer 3에서는 이미 처리된 `ProcessedError`를 **재처리하지 않음**
5. **타입 안전성**: TypeScript로 타입 안전성 보장

### 에러 플로우 요약

```
Backend Exception
  ↓
HttpErrorFilter
  ↓
ErrorResponse DTO { statusCode, message, code }
  ↓
Axios Interceptor (Layer 1)
  - 네트워크 에러 처리
  - 401: 토큰 갱신
  - 5xx: 재시도
  - Toast 표시 (optional)
  ↓
useBaseMutation (Layer 2)
  - ApiErrorHandler.process()
  - AxiosError → ProcessedError
  - 에러 로깅
  ↓
Feature Hook (Layer 3)
  - Toast 표시 (error.message)
  - UI 상태 업데이트
  - 에러 복구 로직
```

### 체크리스트

- [ ] Layer 3에서 `handleApiError()` 재호출하지 않음
- [ ] `onError` 콜백에서 `error.message` 직접 사용
- [ ] TypeScript 타입은 `ProcessedError` 사용
- [ ] Interceptor에서 에러를 `throw error`로 전파
- [ ] Silent Mode 필요 시 `{ silent: true }` 전달
- [ ] 재시도 가능 에러만 재시도 로직 적용
- [ ] 에러 로깅 자동화 (useBaseMutation에서 처리)
- [ ] 백엔드 메시지를 최우선으로 사용

---

## 관련 문서

- [Frontend Architecture Guide](./frontend-architecture-guide.md)
- [API Project Architecture](./api-project-architecture.md)
- [ENGINEERING_GUIDE.md](../../ENGINEERING_GUIDE.md)
- [Business Rules](../business-rules.md)

---

**마지막 업데이트**: 2025-11-28
**작성자**: Claude Code
**검토자**: -
