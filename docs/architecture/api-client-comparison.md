# API Client Generator 라이브러리 비교 분석

이 문서는 현재 프로젝트에서 사용 중인 `openapi-generator`의 대체제를 검토하기 위해 작성되었습니다.
**React Query (TanStack Query v5)**, **Zod**, **TypeScript** 환경에서의 생산성과 유지보수성을 기준으로 비교합니다.

## 1. 개요 및 비교 요약

| 특징 | OpenAPI Generator (Current) | Orval | Hey API (구 openapi-ts) |
| :--- | :--- | :--- | :--- |
| **주요 컨셉** | 범용성 (다양한 언어 지원) | React Query 통합 최적화 | 모던 TS 생태계 (Zod, Query) |
| **코드 스타일** | 클래스 기반 (Java 스타일) | 함수형 & Custom Hooks | 함수형 & Tree-shakable |
| **React Query** | ❌ (수동 래핑 필요) | ✅ **자동 생성 (Hooks)** | ✅ **자동 생성 (Options/Hooks)** |
| **Zod 통합** | ❌ (지원 안함) | 🔺 (별도 라이브러리 필요) | ✅ **Native Plugin 지원** |
| **Mocking** | ❌ (지원 안함) | ✅ **MSW 핸들러 자동 생성** | 🔺 (데이터 생성만 지원) |
| **Boilerplate** | 🔴 매우 많음 | 🟡 보통 (설정 복잡) | 🟢 매우 적음 (깔끔) |

---

## 2. 상세 분석

### A. OpenAPI Generator (현재)
> **공식 문서:** [https://openapi-generator.tech](https://openapi-generator.tech)

현재 프로젝트에서 사용 중인 방식입니다. `typescript-axios` 생성기를 사용합니다.

**설정 (`openapitools.json`):**
```json
{
  "generator-name": "typescript-axios",
  "config": {
    "withSeparateModelsAndApi": true,
    "apiPackage": "api",
    "modelPackage": "types"
  }
}
```

**생성된 코드 사용 예시:**
```typescript
// 1. 설정 객체 생성
const config = new Configuration({ basePath: '...' });
// 2. Factory 또는 Class 인스턴스화
const userApi = UserApiFactory(config);

// 3. React Query에서 사용 시 (수동 래핑)
useQuery({
  queryKey: ['users'],
  queryFn: () => userApi.getUsers().then(res => res.data)
});
```

**단점:**
- DTO가 Class로 생성될 때가 있어 불필요하게 무거움.
- React Query와 연결하기 위해 모든 API마다 wrapper 함수를 작성해야 함.
- `organize-types.js` 같은 후처리 스크립트 의존도가 높음.

---

### B. Orval
> **공식 문서:** [https://orval.dev](https://orval.dev)

React Query를 사용한다면 가장 강력한 기능을 제공하는 도구입니다.

**설정 (`orval.config.ts`):**
```typescript
import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: './openapi-spec.yaml',
    output: {
      mode: 'tags-split',
      target: './src/gen/api.ts',
      schemas: './src/gen/model',
      client: 'react-query', // 핵심: Hook 자동 생성
      mock: true, // MSW 핸들러 생성
      override: {
        mutator: {
          path: './src/axios-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
```

**생성된 코드 사용 예시:**
```typescript
import { useGetUsers } from '@repo/api-client';

// React Component 내부
const { data, isLoading } = useGetUsers({ 
  page: 1 
}, {
  query: { enabled: true } // React Query 옵션 바로 주입 가능
});
```

**장점:**
- **생산성:** `useQuery`를 감싼 커스텀 훅(`useGetUsers`)을 바로 만들어줌.
- **MSW:** 테스트용 Mock Server Worker 핸들러를 완벽하게 생성해줌.

**단점:**
- Zod 스키마 생성을 위해서는 `orval-zod` 같은 커스텀 설정을 추가해야 해서 복잡함.
- React Query v5의 `suspense`나 `prefetch`를 쓰려면 설정 튜닝이 필요함.

---

### C. Hey API (구 openapi-ts)
> **공식 문서:** [https://heyapi.vercel.app](https://heyapi.vercel.app)

최근 가장 빠르게 성장하는 라이브러리입니다. 코드가 매우 간결하고 Zod와의 궁합이 완벽합니다.

**설정 (`openapi-ts.config.ts`):**
```typescript
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'openapi-spec.yaml',
  output: 'src/hey-api',
  plugins: [
    '@hey-api/schemas', // Zod 스키마 생성
    {
      name: '@hey-api/sdk',
      transformer: true, // Date 객체 자동 변환 등
    },
    {
      name: '@tanstack/react-query', // Query Options 생성
    },
    {
      name: '@hey-api/typescript',
      enums: 'javascript',
    }
  ],
  client: '@hey-api/client-axios', // 또는 fetch
});
```

**생성된 코드 사용 예시 (React Query v5 Style):**
```typescript
import { useQuery } from '@tanstack/react-query';
import { getUsersOptions, zUserSchema } from '@repo/api-client';

// 1. Zod 스키마를 Form Validation에 바로 사용
const form = useForm({ 
  resolver: zodResolver(zUserSchema) 
});

// 2. Query Options 사용 (v5 권장 방식)
const { data } = useQuery({
  ...getUsersOptions({ query: { page: 1 } })
});
```

**장점:**
- **Zod 통합:** API 스펙기반으로 Form Validation 스키마까지 한 번에 해결.
- **Query Options:** `useQuery`, `useSuspenseQuery`, `prefetchQuery` 등 어떤 상황에서도 유연하게 쓸 수 있는 Options 객체를 제공.
- **가벼움:** Tree-shaking이 잘 되며 생성된 코드가 사람이 짠 것처럼 읽기 쉬움.

---

## 3. 결론 및 추천

현재 프로젝트(`apps/web`)의 기술 스택을 고려할 때 추천 순위는 다음과 같습니다.

### 🥇 1순위: Hey API
- **이유:** `react-hook-form` + `zod`를 사용 중이므로, API 응답 타입뿐만 아니라 **검증 로직(Schema)까지 자동화**할 수 있다는 점이 압도적입니다. 또한 React Query v5의 모던한 패턴(`queryOptions`)을 가장 잘 지원합니다.

### 🥈 2순위: Orval
- **이유:** "Hook 하나만 import 하면 끝"이라는 단순함이 필요하다면 최적입니다. 특히 **테스트 코드(MSW)** 작성이 잦다면 Orval의 Mocking 기능이 큰 도움이 됩니다.

### 🥉 3순위: OpenAPI Generator (Current)
- **이유:** 현재 구조는 보일러플레이트가 너무 많고, React Query와의 통합을 위해 수동 작업이 계속 발생합니다. 점진적으로 교체하는 것을 권장합니다.

## 4. 마이그레이션 전략 (Side-by-Side)

한 번에 교체하는 것은 위험하므로 **"공존 전략"**을 추천합니다.

1. `packages/api-client`에 새 라이브러리(Hey API 추천)를 설치합니다.
2. `src/hey-api` (또는 `src/orval`) 폴더에 새 코드를 생성합니다.
3. 기존 `src/api` 코드는 유지합니다.
4. 신규 기능 개발 시에만 새 클라이언트를 import 하여 사용합니다.
5. 점진적으로 기존 코드를 리팩토링합니다.
