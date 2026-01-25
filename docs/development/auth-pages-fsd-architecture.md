# CotePT Auth 페이지 FSD 아키텍처 설계

CotePT 프로젝트의 간결화된 Feature-Sliced Design 아키텍처를 기반으로 한 인증(Auth) 페이지 설계 문서입니다.

## 📋 목차

1. [FSD 아키텍처 개요](#fsd-아키텍처-개요)
2. [레이어별 구조 및 역할](#레이어별-구조-및-역할)
3. [의존성 방향 및 Import 규칙](#의존성-방향-및-import-규칙)
4. [Auth 페이지 구체적 설계](#auth-페이지-구체적-설계)
5. [하이브리드 RSC + RCC 패턴](#하이브리드-rsc--rcc-패턴)
6. [구현 가이드라인](#구현-가이드라인)
7. [파일 구조 예시](#파일-구조-예시)
8. [Import 순서 예시](#import-순서-예시)

---

## FSD 아키텍처 개요

CotePT 프로젝트는 **간결화된 Feature-Sliced Design** 아키텍처를 채택하여 코드의 구조화와 유지보수성을 확보합니다.

### 🏗️ 레이어 구조 (피라미드)

```
    ┌─────────┐
    │   app   │ ← Next.js 라우터 + RSC 페이지
    └─────────┘
        ↑
    ┌─────────┐  
    │containers│ ← UI 조합 + 비즈니스 로직 연결
    └─────────┘
        ↑
    ┌─────────┐
    │features │ ← 도메인별 비즈니스 로직
    └─────────┘  
        ↑
    ┌─────────┐
    │ shared  │ ← 공통 컴포넌트, 유틸리티
    └─────────┘
```

### 🎯 핵심 원칙

- **단방향 의존성**: 상위 레이어만 하위 레이어를 참조
- **도메인 중심 구조**: features 레이어에서 비즈니스 도메인 분리
- **재사용성 최우선**: shared 레이어에서 공통 요소 관리
- **ESLint 강제**: boundaries 플러그인으로 아키텍처 규칙 강제

---

## 레이어별 구조 및 역할

### 📦 **app/** - 라우팅 및 페이지 레이어

**역할**: Next.js App Router 기반의 라우팅과 RSC 페이지 정의

**특징**:
- Server Components 우선 사용
- 메타데이터, SEO 최적화
- 레이아웃 및 로딩 상태 관리
- API 라우트 정의

**예시**:
```typescript
// app/auth/signin/page.tsx
import { Metadata } from 'next'
import { SigninContainer } from '@containers/auth/forms/SigninForm'

export const metadata: Metadata = {
  title: 'CotePT - 로그인',
  description: '개발자를 위한 1:1 멘토링 서비스 CotePT에 로그인하세요'
}

export default function SigninPage() {
  return (
    <div className="container mx-auto max-w-md py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">CotePT 로그인</h1>
        <p className="text-muted-foreground">계정에 로그인하세요</p>
      </div>
      <SigninContainer />
    </div>
  )
}
```

### 📦 **containers/** - UI 조합 레이어

**역할**: 비즈니스 로직과 UI 컴포넌트를 연결하는 조합 레이어

**특징**:
- Client Components 위주 사용
- 상태 관리와 이벤트 처리
- features와 shared의 연결점
- 페이지별/도메인별 UI 조합

**예시**:
```typescript
// containers/auth/forms/SigninForm.tsx
'use client'

import { useSignin } from '@features/auth/hooks/useSignin'
import { AuthFormLayout } from '@containers/auth/components/AuthFormLayout'
import { Button } from '@repo/shared/components/button'

export function SigninForm() {
  const { form, handleSubmit, isLoading } = useSignin()
  
  return (
    <AuthFormLayout>
      <form onSubmit={handleSubmit}>
        {/* 폼 필드들 */}
        <Button type="submit" disabled={isLoading}>
          로그인
        </Button>
      </form>
    </AuthFormLayout>
  )
}
```

### 📦 **features/** - 비즈니스 로직 레이어

**역할**: 도메인별 비즈니스 로직과 상태 관리

**특징**:
- 도메인별 폴더 구조 (`auth/`, `user/`, `mentoring/`)
- API 호출 및 데이터 관리
- 비즈니스 규칙과 검증 로직
- 타입 정의 및 스키마

**예시**:
```typescript
// features/auth/hooks/useSignin.ts
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SigninSchema } from '@features/auth/schemas/signin.schema'
import { authApiService } from '@shared/api/services/auth-api-service'

export function useSignin() {
  const form = useForm({
    resolver: zodResolver(SigninSchema)
  })
  
  const handleSubmit = form.handleSubmit(async (data) => {
    await authApiService.signin(data)
  })
  
  return { form, handleSubmit }
}
```

### 📦 **shared/** - 공통 요소 레이어

**역할**: 프로젝트 전반에서 재사용되는 공통 요소들

**특징**:
- UI 컴포넌트 라이브러리
- API 서비스 및 유틸리티
- 공통 타입 정의
- 에러 처리 및 상수

**예시**:
```typescript
// shared/auth/services/auth-api-service.ts
export class AuthApiService extends BaseApiService {
  async signin(credentials: SigninRequest): Promise<SigninResponse> {
    return this.post('/auth/signin', credentials)
  }
}
```

---

## 의존성 방향 및 Import 규칙

### 🔄 의존성 방향 (ESLint Boundaries)

```yaml
app:
  allow: ["shared", "features", "containers", "app"]
  
containers:
  allow: ["shared", "features", "containers"]
  
features:
  allow: ["shared", "features"]
  
shared:
  allow: ["shared"]
```

### 📥 Import 순서 (ESLint 규칙 준수)

```typescript
// 1. React 및 React 관련 패키지
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

// 2. Next.js 관련 패키지
import { useRouter } from 'next/navigation'
import { Metadata } from 'next'

// 3. 모노레포 공유 패키지
import { Button } from '@repo/shared/components/button'
import { Input } from '@repo/shared/components/input'

// 4. 외부 패키지 (node_modules)
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

// 5. 내부 alias imports (상위 → 하위)
import { useSignin } from '@features/auth/hooks/useSignin'
import { SigninSchema } from '@features/auth/schemas/signin.schema'
import { AuthFormLayout } from '@containers/auth/components/AuthFormLayout'
import { LoadingSpinner } from '@shared/ui/loading'

// 6. 상대경로 imports
import './styles.css'

// 7. 타입 전용 imports
import type { SigninFormProps } from './types'
```

---

## Auth 페이지 구체적 설계

### 📱 페이지 구조

#### **app/auth/** - RSC 페이지들
```
app/auth/
├── signin/
│   └── page.tsx              # 로그인 페이지 (RSC)
├── signup/
│   └── page.tsx              # 회원가입 페이지 (RSC)
├── forgot-password/
│   └── page.tsx              # 비밀번호 찾기 (RSC)
├── reset-password/
│   └── page.tsx              # 비밀번호 재설정 (RSC)
└── layout.tsx                # Auth 공통 레이아웃
```

#### **containers/auth/** - UI 조합 컴포넌트들
```
containers/auth/
├── forms/
│   ├── SigninForm.tsx        # 로그인 폼 (RCC)
│   ├── SignupForm.tsx        # 회원가입 폼 (RCC)
│   ├── ForgotPasswordForm.tsx # 비밀번호 찾기 폼 (RCC)
│   └── ResetPasswordForm.tsx # 비밀번호 재설정 폼 (RCC)
├── components/
│   ├── AuthFormLayout.tsx    # 공통 폼 레이아웃
│   ├── SocialLoginButtons.tsx # 소셜 로그인 버튼들
│   ├── FormSkeleton.tsx      # 로딩 스켈레톤
│   └── AuthErrorFallback.tsx # 에러 폴백 (기존)
└── layouts/
    └── AuthLoading.tsx       # 로딩 컴포넌트 (기존)
```

#### **features/auth/** - 비즈니스 로직
```
features/auth/
├── schemas/
│   ├── signin.schema.ts      # 로그인 Zod 스키마
│   ├── signup.schema.ts      # 회원가입 Zod 스키마
│   ├── password.schema.ts    # 비밀번호 관련 스키마
│   └── index.ts              # 통합 export
├── hooks/
│   ├── useSignin.ts          # 로그인 로직
│   ├── useSignup.ts          # 회원가입 로직
│   ├── usePasswordReset.ts   # 비밀번호 재설정
│   ├── useSocialCallback.ts  # 소셜 콜백 (기존)
│   ├── useSocialLinkCallback.ts # 소셜 연결 (기존)
│   └── index.ts              # 통합 export
├── types/
│   ├── auth-forms.types.ts   # 폼 관련 타입
│   └── index.ts              # 통합 export
└── apis/                     # 기존 API 관련 (유지)
    ├── mutations.ts
    ├── queries.ts
    └── queryKey.ts
```

#### **shared/auth/** - 공통 서비스 (기존 유지)
```
shared/auth/
├── services/
│   ├── auth-api-service.ts   # API 서비스 (기존)
│   └── social-login.ts       # 소셜 로그인 서비스 (기존)
├── errors/
│   ├── handler.ts            # 에러 처리 (기존)
│   ├── messages.ts           # 에러 메시지 (기존)
│   └── types.ts              # 에러 타입 (기존)
├── callbacks/
│   └── callbacks.ts          # NextAuth 콜백 (기존)
├── providers/
│   └── credentials.ts        # NextAuth Provider (기존)
└── types/
    └── auth.types.ts         # 공통 Auth 타입 (기존)
```

---

## 하이브리드 RSC + RCC 패턴

### 🎯 설계 원칙

**Page Level (RSC)**:
- 메타데이터 최적화 (SEO, 소셜 공유)
- 초기 HTML 렌더링으로 빠른 FCP
- 정적 콘텐츠 서버 렌더링
- 번들 크기 최적화

**Form Level (RCC)**:
- 실시간 상호작용 (폼 검증, 상태 관리)
- NextAuth 소셜 로그인 통합
- Toast 알림, 에러 상태 표시
- 로딩 상태 및 UX 향상

### 🚀 성능 최적화 전략

#### **Suspense + Streaming**
```typescript
// app/auth/signin/page.tsx
import { Suspense } from 'react'
import { FormSkeleton } from '@containers/auth/components/FormSkeleton'
import { SigninForm } from '@containers/auth/forms/SigninForm'

export default function SigninPage() {
  return (
    <div className="auth-page-layout">
      <Suspense fallback={<FormSkeleton />}>
        <SigninForm />
      </Suspense>
    </div>
  )
}
```

#### **점진적 향상**
```typescript
// containers/auth/forms/SigninForm.tsx
'use client'

export function SigninForm() {
  const [isEnhanced, setIsEnhanced] = useState(false)
  
  useEffect(() => {
    // 클라이언트에서만 향상된 기능 활성화
    setIsEnhanced(true)
  }, [])
  
  return (
    <form>
      {/* 기본 폼 요소들 */}
      {isEnhanced && (
        <>
          {/* 클라이언트 전용 향상 기능들 */}
          <RealTimeValidation />
          <PasswordStrengthMeter />
        </>
      )}
    </form>
  )
}
```

#### **메타데이터 최적화**
```typescript
// app/auth/signin/page.tsx
export const metadata: Metadata = {
  title: 'CotePT - 로그인',
  description: '개발자를 위한 1:1 멘토링 서비스 CotePT에 로그인하세요',
  openGraph: {
    title: 'CotePT 로그인',
    description: '개발자 멘토링의 새로운 경험을 시작하세요',
    type: 'website',
  },
  robots: {
    index: false, // 인증 페이지는 검색 노출 방지
    follow: true,
  }
}
```

---

## 구현 가이드라인

### 📝 개발 원칙

1. **FSD 레이어 준수**: 의존성 방향을 철저히 지키며 개발
2. **타입 안전성**: TypeScript strict 모드 준수
3. **재사용성**: 2회 이상 사용되는 로직은 공통화
4. **테스트 커버리지**: 비즈니스 로직에 대한 단위 테스트 필수
5. **접근성**: WCAG 2.1 AA 수준 준수
6. **성능**: Core Web Vitals 기준 준수

### 🛡️ 보안 가이드라인

1. **입력 검증**: 모든 사용자 입력에 대한 Zod 스키마 검증
2. **민감 정보 보호**: 토큰, 비밀번호 등 클라이언트 노출 방지
3. **CSRF 보호**: NextAuth 기본 보안 기능 활용
4. **XSS 방지**: 사용자 입력 데이터 적절한 이스케이핑
5. **에러 정보 노출 방지**: 상세 에러 정보 클라이언트 노출 금지

### 🎨 UI/UX 가이드라인

1. **일관된 디자인**: shadcn/ui 컴포넌트 우선 사용
2. **반응형 디자인**: 모바일 퍼스트 접근법
3. **로딩 상태**: 모든 비동기 작업에 로딩 표시
4. **에러 처리**: 사용자 친화적 에러 메시지 제공
5. **키보드 네비게이션**: Tab 키 순서 및 접근성 보장

---

## 파일 구조 예시

### 📂 완성된 Auth 도메인 구조

```
src/
├── app/
│   └── auth/
│       ├── layout.tsx
│       ├── signin/
│       │   └── page.tsx
│       ├── signup/
│       │   └── page.tsx
│       ├── forgot-password/
│       │   └── page.tsx
│       └── reset-password/
│           └── page.tsx
│
├── containers/
│   └── auth/
│       ├── forms/
│       │   ├── SigninForm.tsx
│       │   ├── SignupForm.tsx
│       │   ├── ForgotPasswordForm.tsx
│       │   └── ResetPasswordForm.tsx
│       ├── components/
│       │   ├── AuthFormLayout.tsx
│       │   ├── SocialLoginButtons.tsx
│       │   └── FormSkeleton.tsx
│       └── layouts/ (기존)
│           ├── AuthErrorFallback.tsx
│           └── AuthLoading.tsx
│
├── features/
│   └── auth/
│       ├── schemas/
│       │   ├── signin.schema.ts
│       │   ├── signup.schema.ts
│       │   ├── password.schema.ts
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useSignin.ts
│       │   ├── useSignup.ts
│       │   ├── usePasswordReset.ts
│       │   ├── useSocialCallback.ts (기존)
│       │   ├── useSocialLinkCallback.ts (기존)
│       │   └── index.ts
│       ├── types/
│       │   ├── auth-forms.types.ts
│       │   └── index.ts
│       └── apis/ (기존)
│           ├── mutations.ts
│           ├── queries.ts
│           └── queryKey.ts
│
└── shared/
    └── auth/ (기존 구조 유지)
        ├── services/
        ├── errors/
        ├── callbacks/
        ├── providers/
        └── types/
```

### 📄 파일명 컨벤션

- **페이지**: `page.tsx` (Next.js 규칙)
- **컴포넌트**: `PascalCase.tsx` (예: `SigninForm.tsx`)
- **훅**: `use + PascalCase.ts` (예: `useSignin.ts`)
- **스키마**: `kebab-case.schema.ts` (예: `signin.schema.ts`)
- **타입**: `kebab-case.types.ts` (예: `auth-forms.types.ts`)
- **API**: `kebab-case.ts` (예: `auth-api-service.ts`)

---

## Import 순서 예시

### 📥 올바른 Import 순서

```typescript
// containers/auth/forms/SigninForm.tsx
'use client'

// 1. React 및 React 관련 패키지
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

// 2. Next.js 관련 패키지
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 3. 모노레포 공유 패키지
import { Button } from '@repo/shared/components/button'
import { Input } from '@repo/shared/components/input'
import { Label } from '@repo/shared/components/label'

// 4. 외부 패키지 (node_modules)
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

// 5. 내부 alias imports (상위 → 하위)
import { useSignin } from '@features/auth/hooks/useSignin'
import { SigninSchema } from '@features/auth/schemas/signin.schema'
import { AuthFormLayout } from '@containers/auth/components/AuthFormLayout'
import { SocialLoginButtons } from '@containers/auth/components/SocialLoginButtons'
import { LoadingSpinner } from '@shared/ui/loading'

// 6. 상대경로 imports (필요시)
import './signin-form.css'

// 7. 타입 전용 imports
import type { SigninFormProps } from '../types'
import type { SigninRequest } from '@features/auth/types'
```

### ❌ 잘못된 Import 순서

```typescript
// ❌ 잘못된 예시 - 순서가 뒤섞임
import { toast } from 'sonner'                    // 외부 패키지가 위에
import React from 'react'                        // React가 아래에
import { useSignin } from '@features/auth/hooks' // features가 shared보다 위에
import { Button } from '@repo/shared/components/button'
import { useRouter } from 'next/navigation'      // Next.js가 React 아래에
```

---

## 마무리

이 문서는 CotePT 프로젝트의 Auth 페이지 개발을 위한 **FSD 아키텍처 가이드**입니다. 

### 🎯 핵심 기억사항

1. **의존성 방향 준수**: 상위 레이어만 하위 레이어 참조
2. **하이브리드 패턴**: RSC(페이지) + RCC(폼) 조합
3. **ESLint 규칙**: boundaries와 import 순서 엄격 준수
4. **재사용성**: 공통 요소는 반드시 shared 레이어에
5. **타입 안전성**: TypeScript strict 모드 필수

이 가이드를 따라 개발하면 **확장 가능하고 유지보수가 용이한** 인증 시스템을 구축할 수 있습니다.

---

*문서 작성일: 2025년 1월*
*버전: 1.0*
*작성자: CotePT Development Team*