# API 클라이언트 커스텀 템플릿 개발 로드맵

> **작성일**: 2025-01-27  
> **상태**: 계획 수립 완료, 구현 준비 단계  
> **연관 문서**: [API_CLIENT_AUTOMATION_STATUS.md](./API_CLIENT_AUTOMATION_STATUS.md)

---

## 📋 **프로젝트 개요**

OpenAPI Generator로 생성한 기본 API 클라이언트를 Web 프로젝트의 기존 아키텍처(`BaseApiService`)와 완전 통합하기 위한 커스텀 템플릿 개발 계획입니다.

### **목표**

- 생성된 타입의 안전성 + 기존 아키텍처의 일관성 확보
- 팀 컨벤션에 맞는 자동화된 API 클라이언트 생성
- 수동 타입 관리 완전 제거

---

## 🔍 **현재 상황 분석**

### **생성된 OAS 클라이언트 구조**

```
packages/api-client/src/
├── services/
│   ├── user-api.ts          # 함수형 API 호출
│   ├── auth-api.ts          # axios 기반 직접 호출
│   └── ...
├── types/
│   ├── user/                # 정확한 백엔드 타입들
│   └── ...
└── index.ts
```

**특징:**

- **함수형 접근**: `UserApi.getAllUsers()` 형태
- **axios 직접 사용**: 저수준 HTTP 호출
- **정확한 타입**: 백엔드 DTO와 100% 일치

### **Web 프로젝트 현재 구조**

```
apps/web/src/shared/api/
├── core/
│   ├── base-api-service.ts  # 클래스 기반 추상화
│   ├── types.ts             # 더미/기존 타입들
│   ├── axios.ts             # 설정된 axios 인스턴스
│   └── error-handler.ts     # 통합 에러 처리
```

**특징:**

- **클래스형 접근**: `BaseApiService` 상속
- **고수준 추상화**: `get()`, `post()`, `put()`, `delete()` 메서드
- **더미 타입**: 개발 편의를 위한 임시 타입들

### **핵심 불일치 문제**

| 구분          | 생성된 OAS 클라이언트 | Web 프로젝트 현재 구조 |
| ------------- | --------------------- | ---------------------- |
| **아키텍처**  | 함수형 API 호출       | 클래스 기반 상속 구조  |
| **타입**      | 정확한 백엔드 타입    | 더미/기존 타입들       |
| **호출 방식** | axios 직접 호출       | BaseApiService 추상화  |
| **에러 처리** | 기본 axios 에러       | 통합 에러 핸들러       |
| **컨벤션**    | OpenAPI 표준          | 팀 개발 컨벤션         |

---

## 🛠️ **3단계 로드맵**

### **1단계: 타입 통합 및 검증 (1-2주)**

#### **1.1 생성된 타입 적용**

```typescript
// 기존 (apps/web/src/shared/api/core/types.ts)
export interface User extends BaseEntity {
  email: string
  name: string
  role: "MENTEE" | "MENTOR" | "ADMIN" // 더미 타입
}

// 변경 후
import { UserResponseDto } from "@repo/api-client"
export type User = UserResponseDto // 생성된 타입 활용
```

#### **1.2 브릿지 레이어 구현**

```typescript
// 임시 연결 계층
export class UserApiService extends BaseApiService {
  constructor() {
    super("/users")
  }

  async getAllUsers(): Promise<ApiResponse<UserListResponseWrapper>> {
    return this.get("/userlist")
  }

  async getUserById(id: string): Promise<ApiResponse<UserResponseWrapper>> {
    return this.get(`/${id}`)
  }
}
```

#### **1.3 실사용 패턴 검증**

- 기존 코드에서 새로운 타입 적용해보기
- BaseApiService와의 호환성 확인
- 팀원들의 사용성 피드백 수집

---

### **2단계: 컨벤션 확립 및 커스텀 템플릿 설계 (1-2주)**

#### **2.1 최적 구조 설계**

**네이밍 컨벤션 정리:**

```typescript
// OpenAPI 기본 생성: getAllUsers (camelCase)
// 팀 컨벤션: userList 또는 getUsers
// 결정: getAllUsers 유지 (일관성 우선)
```

**에러 핸들링 통합:**

```typescript
export class BaseApiService {
  protected async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      return await apiClient.get(this.buildUrl(endpoint))
    } catch (error) {
      throw this.handleError(error) // 기존 에러 핸들러 활용
    }
  }
}
```

#### **2.2 Mustache 템플릿 분석**

**현재 템플릿 구조:**

```
packages/api-client/mustaches/
├── api.mustache           # 메인 API 클래스 템플릿
├── model.mustache         # 타입 정의 템플릿
├── baseApi.mustache       # 기본 API 클래스
└── ...
```

**커스터마이징 포인트:**

1. **api.mustache**: 함수형 → 클래스형 변경
2. **baseApi.mustache**: BaseApiService 상속 구조
3. **model.mustache**: import/export 구조 최적화

---

### **3단계: 커스텀 템플릿 구현 및 자동화 (2-3주)**

#### **3.1 커스텀 템플릿 개발**

**API 서비스 템플릿 (api.mustache)**

```mustache
{{>licenseInfo}}
import { BaseApiService } from '@/shared/api/core/base-api-service'
import { ApiResponse, GetRequest, PostRequest, PutRequest, DeleteRequest } from '@/shared/api/core/types'
{{#imports}}
import { {{classname}} } from '../types'
{{/imports}}

/**
 * {{description}}
 * {{#version}}OpenAPI spec version: {{version}}{{/version}}
 */
export class {{classname}}Service extends BaseApiService {
  constructor() {
    super('{{basePath}}')
  }

{{#operations}}
{{#operation}}
  /**
   * {{summary}}
   * {{notes}}
   {{#allParams}}
   * @param {{paramName}} {{description}}
   {{/allParams}}
   */
  async {{operationId}}({{#allParams}}{{paramName}}{{#hasOptional}}?{{/hasOptional}}: {{dataType}}{{#hasMore}}, {{/hasMore}}{{/allParams}}): Promise<ApiResponse<{{returnType}}>> {
    {{#hasParams}}
    const request: {{#isGetMethod}}GetRequest{{/isGetMethod}}{{#isPostMethod}}PostRequest<{{bodyParam.dataType}}>{{/isPostMethod}}{{#isPutMethod}}PutRequest<{{bodyParam.dataType}}>{{/isPutMethod}}{{#isDeleteMethod}}DeleteRequest{{/isDeleteMethod}} = {
      {{#hasPathParams}}params: { {{#pathParams}}{{paramName}}{{#hasMore}}, {{/hasMore}}{{/pathParams}} },{{/hasPathParams}}
      {{#hasQueryParams}}query: { {{#queryParams}}{{paramName}}{{#hasMore}}, {{/hasMore}}{{/queryParams}} },{{/hasQueryParams}}
      {{#hasBodyParam}}body: {{bodyParam.paramName}}{{/hasBodyParam}}
    }
    {{/hasParams}}

    return this.{{httpMethod.toLowerCase()}}('{{path}}'{{#hasParams}}, request{{/hasParams}})
  }

{{/operation}}
{{/operations}}
}
```

**타입 조직화 템플릿 (modelIndex.mustache)**

```mustache
{{>licenseInfo}}
// {{package}} 도메인 타입들
{{#models}}
{{#model}}
export * from './{{filename}}'
{{/model}}
{{/models}}

// 편의를 위한 re-export
{{#models}}
{{#model}}
export type { {{classname}} } from './{{filename}}'
{{/model}}
{{/models}}
```

#### **3.2 Config 및 빌드 시스템 통합**

**config.json 업데이트:**

```json
{
  "npmName": "@repo/api-client",
  "templateDir": "./custom-templates",
  "apiPackage": "services",
  "modelPackage": "types",
  "withSeparateModelsAndApi": true,
  "useSingleRequestParameter": true,
  "classname": "{{classname}}Service",
  "supportsES6": true
}
```

**package.json 스크립트 확장:**

```json
{
  "scripts": {
    "generate": "npm run clean && npm run generate:client && npm run organize && npm run integrate",
    "integrate": "node scripts/integrate-with-web.js"
  }
}
```

#### **3.3 CI/CD 파이프라인 구축**

**GitHub Actions 워크플로우:**

```yaml
name: API Client Auto Update

on:
  push:
    paths:
      - "apps/api/src/**/*.ts"
      - "packages/api-client/openapi-spec.yaml"

jobs:
  update-client:
    runs-on: ubuntu-latest
    steps:
      - name: Generate New Client
        run: pnpm gen:api

      - name: Check Breaking Changes
        run: npx oasdiff changelog old-spec.yaml new-spec.yaml --format markdown

      - name: Create PR
        if: changes detected
        uses: peter-evans/create-pull-request@v5
        with:
          title: "🤖 API Client Auto Update"
          body: "API 스펙 변경에 따른 자동 클라이언트 업데이트"
```

---

## 🎯 **예상 최종 결과**

### **생성될 구조**

```
packages/api-client/src/
├── services/
│   ├── user-api.service.ts    # BaseApiService 상속
│   ├── auth-api.service.ts    # BaseApiService 상속
│   ├── mail-api.service.ts    # BaseApiService 상속
│   └── index.ts               # 모든 서비스 export
├── types/
│   ├── user/
│   │   ├── user-response-dto.ts
│   │   ├── create-user-request-dto.ts
│   │   └── index.ts           # 도메인별 타입 export
│   ├── auth/
│   ├── mail/
│   └── index.ts               # 모든 타입 re-export
└── index.ts                   # 패키지 진입점
```

### **Web 프로젝트에서 사용**

```typescript
// 1. 타입 안전한 API 호출
import { UserApiService, UserResponseDto } from '@repo/api-client'

const userApi = new UserApiService()
const users = await userApi.getAllUsers() // 완전한 타입 추론

// 2. 기존 패턴 유지
class CustomUserService extends UserApiService {
  async getActiveUsers() {
    return this.getAllUsers().then(response =>
      response.data.filter(user => user.status === 'ACTIVE')
    )
  }
}

// 3. React 컴포넌트에서
const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDto[]>([])

  useEffect(() => {
    userApi.getAllUsers().then(response => {
      setUsers(response.data)  // 타입 안전성 보장
    })
  }, [])

  return <div>{/* 렌더링 */}</div>
}
```

---

## 📈 **기대 효과**

### **1. 개발 효율성**

- **수동 타입 관리 제거**: 백엔드 변경시 자동 타입 업데이트
- **타입 안전성**: 컴파일 타임에 API 변경점 감지
- **일관된 API 호출**: BaseApiService 패턴 유지

### **2. 코드 품질**

- **중복 제거**: 수작업으로 만든 타입/API 호출 코드 제거
- **문서화**: 자동 생성된 JSDoc 주석
- **테스트 용이성**: 일관된 구조로 테스트 작성 간소화

### **3. 협업 효율성**

- **API 변경점 추적**: oasdiff를 통한 Breaking Change 알림
- **자동 PR 생성**: 변경사항 자동 반영 및 리뷰 프로세스
- **팀 컨벤션 자동 적용**: 개발자가 신경쓸 필요 없는 자동화

---

## 🚀 **다음 액션 아이템**

### **즉시 시작 가능한 작업**

1. **1단계 시작**: Web 프로젝트에 `@repo/api-client` 타입 적용
2. **브릿지 레이어 구현**: 기존 코드 점진적 마이그레이션
3. **사용 패턴 문서화**: 실제 사용해보며 최적 패턴 발견

### **준비 작업**

1. **Mustache 문법 학습**: 템플릿 커스터마이징을 위한 기술 습득
2. **BaseApiService 개선**: 생성될 구조와의 호환성 확보
3. **팀 컨벤션 정리**: 네이밍, 구조, 에러 처리 등 표준화

### **장기 계획**

1. **CI/CD 파이프라인 구축**: 완전 자동화 시스템
2. **모니터링 시스템**: API 변경점 추적 및 알림
3. **문서 자동화**: Swagger UI와 연동된 API 문서

---

## 💭 **참고사항**

이 로드맵은 [API_CLIENT_AUTOMATION_STATUS.md](./API_CLIENT_AUTOMATION_STATUS.md)에서 언급한 **"1단계: Web 프로젝트 타입 적용"**의 구체적 실행 계획입니다.

기존 문서에서 확립된 탄탄한 기반(정확한 OpenAPI 스펙, Repository 아키텍처 통일) 위에 실용적인 자동화를 구축하는 것이 핵심입니다.
