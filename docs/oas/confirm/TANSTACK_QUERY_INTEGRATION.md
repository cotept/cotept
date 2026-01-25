# TanStack Query + OAS 클라이언트 통합 전략

> **상태**: 제안 완료. 기존 아키텍처를 활용하는 `shared/api` 래핑 방식 채택

---

## 1. 문제 정의: 어떤 통합 방식이 최선인가?

OAS로 생성된 API 클라이언트를 TanStack Query와 통합하는 데에는 두 가지 주요 접근 방식이 있습니다. 각각의 장단점을 명확히 이해하고 우리 프로젝트의 장기적인 유지보수성과 확장성에 가장 유리한 방식을 선택해야 합니다.

- **방식 1: 직접 사용 (KISS/YAGNI 원칙)**

  - **내용**: TanStack Query의 `queryFn`에서 생성된 API 함수(`UserApi.getAllUsers`)를 직접 호출합니다.
  - **장점**: 구조가 단순하고, 추가적인 래핑 레이어가 없어 초기 구현이 빠릅니다.
  - **단점**: 기존 `BaseApiService`에 구현된 **인증, 에러 처리, 로깅 등 핵심 공통 로직을 재사용할 수 없습니다.** 모든 `queryFn`에서 이 로직을 중복으로 처리해야 하므로 프로젝트가 커질수록 기술 부채가 쌓입니다.

- **방식 2: `shared/api` 래핑 (SOLID/DRY 원칙)**
  - **내용**: 기존 `BaseApiService`를 상속받는 새로운 서비스(`UserApiService`)를 `shared/api`에 만들고, 그 내부에서 생성된 API 함수를 호출합니다.
  - **장점**: **아키텍처의 일관성**을 유지하고, `BaseApiService`의 **모든 공통 로직을 완벽하게 재사용**합니다. 유지보수성과 확장성이 극대화됩니다.
  - **단점**: 생성된 함수를 한 번 더 감싸는 래핑 레이어가 추가됩니다.

## 2. 최종 결정: `shared/api` 래핑 방식 채택

**CotePT 프로젝트는 이미 `shared/api`를 중심으로 잘 설계된 API 인프라를 갖추고 있습니다.** 이 자산을 버리고 직접 사용 방식으로 회귀하는 것은 장기적으로 손실이 더 큽니다.

따라서 **기존 아키텍처의 강점을 계승하고 발전시키는 `shared/api` 래핑 방식을 채택**합니다.

## 3. 구현 전략

### 1단계: 순수 FP 기반 OAS 클라이언트 유지

`packages/api-client`는 어떠한 인증/공통 로직도 포함하지 않는 순수한 DTO와 함수형(FP) HTTP 함수들의 집합으로 유지합니다.

```typescript
// packages/api-client/src/services/user-api.ts (순수 생성 코드)
export const UserApiFp = {
  getAllUsers(params?: GetUsersParams) {
    return (axios: AxiosInstance): Promise<UserListResponseDto> => {
      // ... 순수한 fetch/axios 호출 로직
    }
  },
}
```

### 2단계: `shared/api`에 래핑 서비스 구현

`apps/web/src/shared/api/services/` 디렉토리에 OAS 클라이언트를 래핑하는 새로운 서비스 클래스를 만듭니다.

```typescript
// apps/web/src/shared/api/services/user-api.service.ts
import { UserApiFp } from "@repo/api-client"
import type { UserListResponseDto, GetUsersParams } from "@repo/api-client/types"
import { BaseApiService } from "../core/base-api-service"
import { customAxios } from "../core/axios" // 👈 **인증 인터셉터가 적용된 axios 인스턴스**
import type { PaginatedResponse } from "../core/types"

export class UserApiService extends BaseApiService {
  constructor() {
    super("/users") // 부모 클래스의 basePath 설정
  }

  /**
   * 사용자 목록 조회
   * - OAS 함수를 호출하고, BaseApiService의 공통 로직을 적용합니다.
   */
  async getAllUsers(params?: GetUsersParams): Promise<PaginatedResponse<UserListResponseDto>> {
    try {
      // 1. FP 스타일 함수에 파라미터 전달
      const getAllUsersFn = UserApiFp.getAllUsers(params)

      // 2. 인증 로직이 담긴 customAxios를 주입하여 함수 실행
      const response = await getAllUsersFn(customAxios)

      // 3. 기존 아키텍처의 응답 형식으로 변환 (필요시)
      return this.handlePaginatedResponse(response.users) // 예시 변환 로직
    } catch (error) {
      // 4. 중앙화된 에러 핸들러에 위임
      throw this.handleError(error)
    }
  }
}

export const userApiService = new UserApiService()
```

### 3단계: TanStack Query에서 래핑 서비스 사용

`features` 레벨에서는 기존과 동일한 패턴으로 래핑된 서비스를 사용합니다. **개발자 경험의 변화가 거의 없습니다.**

```typescript
// apps/web/src/features/mentoring/apis/queries.ts
import { userApiService } from "@/shared/api/services/user-api.service" // 새로 만든 래핑 서비스 import
import { userKeys } from "./queryKeyFactory"

export const userQueries = {
  list: (params: GetUsersParams) => ({
    queryKey: userKeys.list(params).queryKey,
    // queryFn에서 래핑된 서비스의 메서드를 호출
    queryFn: () => userApiService.getAllUsers(params),
  }),
  // ... 다른 쿼리들
}

// useQuery 훅은 기존과 완전히 동일
export function useUsers(params?: GetUsersParams) {
  const query = userQueries.list(params)
  return useQuery({ ...query })
}
```

## 4. 기대 효과

- **아키텍처 일관성**: 프로젝트 전체가 `BaseApiService` 기반의 일관된 API 호출 패턴을 유지합니다.
- **공통 로직 재사용**: 인증, 에러 처리, 로깅 등 모든 공통 기능을 자동으로 상속받습니다.
- **유지보수 용이성**: 공통 로직 변경 시 `BaseApiService` 또는 `axios.ts` 한 곳만 수정하면 됩니다.
- **점진적 전환**: 기존의 수동 서비스와 새로운 래핑 서비스를 함께 사용하며 점진적으로 전환할 수 있어 안정적입니다.
- **개발자 경험**: `features` 레벨 개발자는 내부 구현을 신경 쓸 필요 없이 기존과 동일한 방식으로 API를 호출하고 TanStack Query를 사용합니다.

## 5. 분석

1. 코드 격리 수준 분석

✅ 현재 구조의 장점

- 물리적 격리: packages/api-client vs apps/web/src/shared/api 완전 분리
- 의존성 방향: 생성 코드 → 비즈니스 코드 단방향 의존성 (역방향 오염 없음)
- 버전 관리: 생성 코드 전체를 .gitignore로 제외 가능
- 빌드 프로세스: 생성 → 래핑 → 사용의 명확한 단계

🔄 FP 패턴의 격리 효과

// 생성된 FP 함수는 순수하고 상태가 없음
const getAllUsersFn = UserApiFp.getAllUsers(params); // 순수 함수 반환
const result = await getAllUsersFn(customAxios); // 런타임에 의존성 주입

2. 관리 편의성 분석

✅ 커스텀 템플릿 없는 장점

- 표준 준수: OpenAPI Generator 표준 출력 사용
- 업그레이드 용이: 생성기 버전업 시 문제 없음
- 디버깅: 표준 패턴이라 문서/커뮤니티 지원 풍부
- 유지보수: 템플릿 커스터마이징 기술부채 없음

✅ Monorepo 구조 활용

- 타입 공유: @repo/api-client 패키지로 타입 안전성
- 의존성 관리: workspace 레벨에서 일괄 관리
- 빌드 파이프라인: Turborepo로 캐싱 및 병렬 처리

3. 예상 문제점 분석

⚠️ 잠재적 문제들

3.1 응답 데이터 형식 불일치

// OAS 생성: Wrapper 패턴
UserListResponseWrapper { data: UserListResponseDto }

// 기존 코드: 직접 배열
PaginatedResponse<User[]>
해결책: 매퍼에서 변환 로직 처리

3.2 에러 처리 일관성

// OAS 생성: AxiosError + 백엔드 에러 구조
// 기존 코드: 정규화된 ApiError

// 래핑 서비스에서 변환 필요
catch (error) {
throw this.handleError(error); // BaseApiService의 에러 정규화
}

3.3 FP 함수의 타입 복잡성

// 생성된 타입이 복잡할 수 있음
Promise<(axios?: AxiosInstance, basePath?: string) =>
AxiosPromise<UserListResponseWrapper>>

3.4 개발자 학습 곡선

- FP 스타일 + Axios 주입 패턴 이해 필요
- 두 레이어(생성 코드 + 래핑 서비스) 디버깅

4. Adapter 레이어 필요성 검토

🤔 Adapter 패턴을 고려해야 하는 이유

4.1 인터페이스 불일치 해결

// Adapter 레이어가 있다면
interface UserApiAdapter {
getAllUsers(params: GetUsersParams): Promise<PaginatedResponse<User>>;
}

class OasUserApiAdapter implements UserApiAdapter {
async getAllUsers(params: GetUsersParams): Promise<PaginatedResponse<User>> {
const fn = UserApiFp.getAllUsers(this.transformParams(params));
const response = await fn(this.axiosInstance);
return this.transformResponse(response.data);
}
}

4.2 변경 격리

- OAS 스키마 변경: Adapter에서 호환성 유지
- 백엔드 API 변경: 인터페이스는 유지하고 구현만 변경
- 여러 버전 API 지원: 같은 인터페이스로 다른 버전 처리

  4.3 테스트 용이성

// Mock 구현 쉬움
class MockUserApiAdapter implements UserApiAdapter {
async getAllUsers() { return mockData; }
}

💡 Adapter vs 직접 래핑 비교

| 관점        | Adapter 패턴             | 직접 래핑 |
| ----------- | ------------------------ | --------- |
| 복잡성      | 높음 (인터페이스 + 구현) | 낮음      |
| 유연성      | 높음 (교체 가능)         | 보통      |
| 타입 안전성 | 높음 (명시적 인터페이스) | 보통      |
| 개발 속도   | 느림                     | 빠름      |
| 유지보수    | 좋음 (변경 격리)         | 보통      |

5. 권장사항

🎯 단계적 접근

Phase 1: 직접 래핑으로 시작

export class UserApiService extends BaseApiService {
async getAllUsers(params?: GetUsersParams) {
const fn = UserApiFp.getAllUsers(params);
const response = await fn(customAxios);
return this.transformToAppFormat(response.data);
}
}

Phase 2: 복잡성 증가 시 Adapter 도입

- API 버전 관리 필요할 때
- 여러 데이터 소스 통합할 때
- 테스트 격리가 중요할 때

🔍 현재 시점 결론

Adapter 레이어는 현재로서는 과도한 설계라고 판단됩니다:

1. YAGNI 원칙: 당장 필요하지 않은 복잡성
2. 팀 생산성: 학습 곡선과 개발 속도 저하
3. 프로젝트 단계: MVP/초기 단계에서는 단순함이 우선

직접 래핑 방식으로 시작하되, 다음 신호들이 나타나면 Adapter 패턴 고려:

- API 버전 관리 필요성
- 복잡한 데이터 변환 로직 증가
- 테스트 복잡성 증가
- 다중 데이터 소스 통합 요구
