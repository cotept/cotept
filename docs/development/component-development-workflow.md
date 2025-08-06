# 컴포넌트 개발 워크플로우 가이드

> CotePT 프로젝트의 FSD 아키텍처 기반 컴포넌트 개발 가이드

## 📋 목차

1. [아키텍처 원칙](#아키텍처-원칙)
2. [컴포넌트 생성 판단 기준](#컴포넌트-생성-판단-기준)
3. [레이어별 역할과 제약사항](#레이어별-역할과-제약사항)
4. [작업 프로세스](#작업-프로세스)
5. [안티패턴과 주의사항](#안티패턴과-주의사항)
6. [템플릿과 예시](#템플릿과-예시)

---

## 🏗️ 아키텍처 원칙

### FSD (Feature-Sliced Design) + Next.js App Router

```
apps/web/src/
├── shared/                    # 전역 공통 요소
│   ├── ui/                   # 범용 UI 컴포넌트
│   ├── api/                  # API 클라이언트
│   ├── utils/                # 유틸리티
│   └── types/                # 전역 타입
├── features/                  # 비즈니스 도메인
│   └── [domain]/
│       ├── hooks/            # 비즈니스 로직 (주요)
│       ├── components/       # 도메인 전용 UI (최소화)
│       └── api/              # 도메인 API
├── containers/               # 페이지별 + Layout 전용 컴포넌트
│   └── [domain]/             # 특정 페이지/레이아웃에서만 사용
└── app/                      # Next.js 라우팅
    ├── layout.tsx            # 레이아웃
    ├── page.tsx              # 페이지
    ├── loading.tsx           # 라우트 레벨 로딩
    └── error.tsx             # 라우트 레벨 에러
```

### 핵심 원칙

1. **재사용성 기준**: 2회 이상 사용되지 않으면 컴포넌트로 만들지 않음
2. **단일 책임**: 각 레이어는 명확한 단일 책임을 가짐
3. **의존성 방향**: 상위 레이어가 하위 레이어를 import (역방향 금지)
4. **Next.js 표준 활용**: layout.tsx, error.tsx, loading.tsx 적극 활용
5. **필요한 컴포넌트는 shadcn ui를 사용**: packages/shared/ 에 다운받아 사용한다.

---

## 🤔 컴포넌트 생성 판단 기준

### 판단 플로우차트

```mermaid
flowchart TD
    A[컴포넌트 생성 필요?] --> B{2회 이상 사용?}
    B -->|No| C[인라인으로 구현]
    B -->|Yes| D{어느 레이어?}

    D --> E{전역에서 사용?}
    E -->|Yes| F[shared/ui]
    E -->|No| G{도메인 전체에서 사용?}

    G -->|Yes| H[features/[domain]/components]
    G -->|No| I{특정 페이지/레이아웃만?}

    I -->|Yes| J[containers/[domain]]
    I -->|No| K[인라인으로 구현]
```

### 구체적 기준

| 사용 범위                     | 위치                           | 예시                                  |
| ----------------------------- | ------------------------------ | ------------------------------------- |
| **전역 (3개+ 도메인)**        | `shared/ui`                    | Button, LoadingSpinner, ErrorBoundary |
| **도메인 전체 (2개+ 페이지)** | `features/[domain]/components` | AuthErrorFallback, AuthLoading        |
| **특정 페이지/레이아웃만**    | `containers/[domain]`          | HeaderContainer, AuthLayoutComponents |
| **1회만 사용**                | **인라인 구현**                | 페이지별 고유 UI 로직                 |

---

## 📂 레이어별 역할과 제약사항

### 1. `shared/ui/` - 전역 범용 UI

**역할**: 프로젝트 전체에서 사용하는 범용 UI 컴포넌트

**허용**:

- ✅ Button, Input, Modal 등 기본 UI 컴포넌트
- ✅ packages/shared 기반의 컴포지션
- ✅ LoadingSpinner, ErrorBoundary 등 공통 유틸리티

**금지**:

- ❌ 도메인 특화 로직
- ❌ 비즈니스 룰 포함
- ❌ 특정 API 호출

### 2. `features/[domain]/` - 비즈니스 도메인

**주요 초점**: `hooks/` (비즈니스 로직)

**허용**:

- ✅ **hooks/**: 커스텀 훅, 비즈니스 로직 (주요 역할)
- ✅ **api/**: 도메인별 API 클라이언트
- ✅ **components/**: 도메인 전체에서 사용하는 UI (최소화)

**금지**:

- ❌ 페이지별 특화 컴포넌트
- ❌ 레이아웃 전용 컴포넌트
- ❌ 단일 페이지에서만 사용하는 UI

### 3. `containers/[domain]/` - 페이지별 + Layout 전용

**역할**: 특정 페이지나 레이아웃에서만 사용하는 컴포넌트

**허용**:

- ✅ 페이지별 컨테이너 컴포넌트
- ✅ Layout 전용 컴포넌트 (AuthErrorFallback, AuthLoading)
- ✅ shared/ui, features 조합

**금지**:

- ❌ 비즈니스 로직 (features/hooks 사용)
- ❌ 직접적인 API 호출
- ❌ 다른 도메인의 containers import

### 4. `app/` - Next.js 라우팅

**역할**: Next.js App Router 표준 파일들

**허용**:

- ✅ **layout.tsx**: ErrorBoundary + Suspense 조합
- ✅ **page.tsx**: containers import 후 단순 렌더링
- ✅ **loading.tsx**: 라우트 레벨 로딩 (페이지 전환)
- ✅ **error.tsx**: 라우트 레벨 에러 (서버/라우팅 에러)

**금지**:

- ❌ 컴포넌트 내부에서 다른 컴포넌트 정의
- ❌ 복잡한 비즈니스 로직
- ❌ 직접적인 상태 관리

---

## 🔄 작업 프로세스

### Phase 1: 계획 및 분석 📋

1. **요구사항 분석**

   ```
   - 어떤 기능을 구현해야 하는가?
   - 재사용될 가능성은?
   - 기존 컴포넌트 활용 가능성은?
   ```

2. **아키텍처 설계**

   ```
   - 어느 레이어에 배치할 것인가?
   - 의존성 방향이 올바른가?
   - 기존 패턴과 일치하는가?
   ```

3. **구조 계획 문서화**

   ```markdown
   ## 구현 계획

   ### 파일 구조

   - `features/auth/hooks/useNewFeature.ts`
   - `containers/auth/NewContainer.tsx`
   - `app/auth/new-page/page.tsx`

   ### 컴포넌트 판단

   - NewContainer: containers (특정 페이지만 사용)
   - ErrorUI: 인라인 (1회만 사용)
   ```

### Phase 2: 승인 및 검토 ✅

**체크리스트**:

- [ ] FSD 레이어 구분이 올바른가?
- [ ] 컴포넌트 생성 기준에 맞는가?
- [ ] 기존 패턴과 일관성이 있는가?
- [ ] 의존성 방향이 올바른가?
- [ ] Next.js 표준을 활용하고 있는가?

### Phase 3: 구현 🔨

1. **순서**: 하위 레이어부터 (shared → features → containers → app)
2. **단계별 검증**: 각 레이어 완성 시마다 확인
3. **타입 안전성**: TypeScript 에러 없이 구현

### Phase 4: 검토 및 정리 🧹

**최종 체크리스트**:

- [ ] 사용하지 않는 컴포넌트 제거
- [ ] import 경로 정리
- [ ] 타입 정의 완료
- [ ] 문서 업데이트 (필요시)

---

## ⚠️ 안티패턴과 주의사항

### 🚫 절대 금지사항

1. **컴포넌트 내부 컴포넌트 정의**

   ```tsx
   // ❌ 잘못된 예시
   function ParentComponent() {
     function ChildComponent() {
       // 절대 금지!
       return <div>Child</div>
     }
     return <ChildComponent />
   }

   // ✅ 올바른 예시
   function ChildComponent() {
     return <div>Child</div>
   }
   function ParentComponent() {
     return <ChildComponent />
   }
   ```

2. **불필요한 추상화**

   ```tsx
   // ❌ 한 번만 사용하는데 컴포넌트화
   function OneTimeButton() {
     return <button onClick={specificHandler}>특정 동작</button>
   }

   // ✅ 인라인으로 처리
   function Page() {
     return (
       <div>
         <button onClick={specificHandler}>특정 동작</button>
       </div>
     )
   }
   ```

3. **역방향 의존성**

   ```tsx
   // ❌ shared가 features를 import
   import { useAuth } from "@/features/auth/hooks"

   // ✅ features가 shared를 import
   import { Button } from "@/shared/ui"
   ```

### 🤔 자주 헷갈리는 상황들

1. **ErrorBoundary vs error.tsx**

   - `ErrorBoundary`: JavaScript 런타임 에러 (컴포넌트 에러)
   - `error.tsx`: 서버 에러, 라우팅 에러 (Next.js 레벨)

2. **Suspense vs loading.tsx**

   - `Suspense`: 비동기 작업 로딩 (API 호출 등)
   - `loading.tsx`: 페이지 전환 로딩 (라우트 레벨)

3. **features/components vs containers**
   - `features/components`: 도메인 전체에서 사용
   - `containers`: 특정 페이지/레이아웃에서만 사용

---

## 📝 템플릿과 예시

### 1. 새 도메인 추가 시 구조

```
features/new-domain/
├── hooks/
│   ├── useNewDomainData.ts
│   └── index.ts
├── components/
│   ├── NewDomainError.tsx      # 도메인 전체에서 사용
│   └── index.ts
└── api/
    ├── queries.ts
    └── mutations.ts

containers/new-domain/
├── NewDomainContainer.tsx      # 특정 페이지 전용
└── index.ts

app/new-domain/
├── layout.tsx                  # ErrorBoundary + Suspense
├── page.tsx                    # Container 호출만
├── loading.tsx                 # 라우트 레벨 로딩
└── error.tsx                   # 라우트 레벨 에러
```

### 2. 커스텀 훅 템플릿

```tsx
// features/[domain]/hooks/useNewFeature.ts
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface UseNewFeatureResult {
  data: any
  isLoading: boolean
  error: string | null
  retry: () => void
}

export function useNewFeature(): UseNewFeatureResult {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async () => {
    // 비즈니스 로직
  }

  const retry = () => {
    // 재시도 로직
  }

  return {
    data,
    isLoading,
    error,
    retry,
  }
}
```

### 3. 컨테이너 컴포넌트 템플릿

```tsx
// containers/[domain]/NewContainer.tsx
"use client"

import { Button } from "@repo/shared/components/button"
import { useNewFeature } from "@/features/new-domain/hooks"

export function NewContainer() {
  const { data, isLoading, error, retry } = useNewFeature()

  if (isLoading) {
    return null // Suspense가 처리
  }

  return <div className="container">{/* UI 렌더링 */}</div>
}
```

### 4. 페이지 템플릿

```tsx
// app/new-domain/page.tsx
import { NewContainer } from "@/containers/new-domain"

export default function NewDomainPage() {
  return <NewContainer />
}
```

### 5. 레이아웃 템플릿

```tsx
// app/new-domain/layout.tsx
"use client"

import { ReactNode, Suspense } from "react"
import { ErrorBoundary } from "@/shared/ui"
import { DomainErrorFallback, DomainLoading } from "@/containers/new-domain"

interface DomainLayoutProps {
  children: ReactNode
}

export default function DomainLayout({ children }: DomainLayoutProps) {
  return (
    <ErrorBoundary fallback={(error, errorInfo, resetError) => DomainErrorFallback(error, errorInfo, resetError)}>
      <Suspense fallback={<DomainLoading />}>{children}</Suspense>
    </ErrorBoundary>
  )
}
```

---

## 🎯 마무리

이 가이드를 통해:

1. **일관된 아키텍처** 유지
2. **불필요한 추상화** 방지
3. **효율적인 개발** 프로세스
4. **유지보수성** 향상

을 달성할 수 있습니다.

**핵심 원칙**: "정말 재사용되는가? 올바른 레이어에 있는가? Next.js 표준을 활용하고 있는가?"

---

_마지막 업데이트: 2025-01-XX_
_작성자: CotePT 개발팀_
