# Figma Make → CotePT 컨벤션 변환 워크플로우

## 🎯 개요

**Figma Make**는 LLM 기반으로 Figma 디자인이나 이미지에서 shadcn + React TypeScript 코드를 자동 생성하는 도구입니다. 생성된 코드를 CotePT 프로젝트의 **FSD 아키텍처**와 **헥사고날 아키텍처** 컨벤션에 맞게 변환하는 체계적인 워크플로우를 정의합니다.

---

## 📋 변환 전 체크리스트

### 1. Figma Make 코드 분석
- [ ] **컴포넌트 구조** 파악 (단일 컴포넌트 vs 복합 컴포넌트)
- [ ] **상태 관리** 확인 (useState 사용 현황)
- [ ] **외부 의존성** 점검 (lucide-react, shadcn 컴포넌트)
- [ ] **이벤트 핸들러** 식별 (비즈니스 로직 포함 여부)
- [ ] **재사용성** 평가 (2회 이상 사용 가능성)

### 2. CotePT 컨벤션 매핑
- [ ] **FSD 레이어** 결정 (shared/ui, features, containers, app)
- [ ] **비즈니스 로직** 분리 필요성 확인
- [ ] **API 연동** 여부 판단
- [ ] **에러 핸들링** 요구사항 확인

---

## 🔄 단계별 변환 워크플로우

### Step 1: 코드 분석 및 분류

#### 1.1 컴포넌트 복잡도 분석
```typescript
// 📊 복잡도 평가 기준
simple:     단일 UI 컴포넌트 + 로컬 상태만
moderate:   여러 UI 조합 + 폼 처리 + 유효성 검증
complex:    API 호출 + 글로벌 상태 + 비즈니스 로직
```

#### 1.2 FSD 레이어 매핑
```typescript
// 🏗️ 레이어 결정 트리
if (재사용성 >= 2회 && 비즈니스로직 == 없음) {
  → shared/ui/
} else if (도메인_특화 && 비즈니스로직 == 있음) {
  → features/[domain]/
} else if (페이지_전용 && UI_조합) {
  → containers/[domain]/
} else {
  → app/[route]/
}
```

### Step 2: 프로젝트 구조 적용

#### 2.1 파일 구조 변환
```bash
# ❌ Figma Make 단일 파일
App.tsx

# ✅ CotePT FSD 구조 
shared/ui/button/Button.tsx           # 재사용 UI
shared/ui/input/Input.tsx             # 재사용 UI  
features/auth/hooks/useSignup.ts      # 비즈니스 로직
features/auth/types/auth.types.ts     # 타입 정의
containers/auth/SignupContainer.tsx   # UI 조합
app/auth/signup/page.tsx              # 라우트
```

#### 2.2 Import 경로 수정
```typescript
// ❌ Figma Make 방식
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

// ✅ CotePT 방식
import { Button } from "@repo/shared/components/button"
import { Input } from "@/shared/ui/input"
import { useSignup } from "@/features/auth/hooks"
```

### Step 3: 유효성 검사 및 비즈니스 로직 분리

#### 3.1 Zod 스키마 정의
```typescript
// ❌ Figma Make - 유효성 검사 없음
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // 직접 전송, 검증 없음
  console.log('회원가입:', { email, password });
};

// ✅ CotePT - Zod 스키마 기반 검증
// features/auth/schemas/auth.schema.ts
import { z } from "zod"

export const SignupFormSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string()
    .min(8, "비밀번호는 8자 이상이어야 합니다")
    .max(32, "비밀번호는 32자 이하여야 합니다")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/, 
           "영문, 숫자, 특수문자를 모두 포함해야 합니다"),
  confirmPassword: z.string(),
  agreements: z.object({
    terms: z.boolean().refine(val => val === true, "이용약관에 동의해야 합니다"),
    privacy: z.boolean().refine(val => val === true, "개인정보처리방침에 동의해야 합니다"),
    marketing: z.boolean().optional()
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"]
})

export type SignupFormData = z.infer<typeof SignupFormSchema>
```

#### 3.2 커스텀 훅 추출
```typescript
// ❌ Figma Make - 컴포넌트 내부 로직
export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('회원가입 시도:', { email, password });
  };
  
  return (
    // UI JSX...
  );
}

// ✅ CotePT - Zod + React Hook Form 통합
// features/auth/hooks/useSignup.ts
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SignupFormSchema, type SignupFormData } from "../schemas/auth.schema"
import { useSignupMutation } from "../apis/mutations"

export function useSignup() {
  const form = useForm<SignupFormData>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      agreements: {
        terms: false,
        privacy: false,
        marketing: false
      }
    }
  });
  
  const { mutate: signup, isPending } = useSignupMutation();
  
  const handleSubmit = form.handleSubmit((data) => {
    // Zod 검증을 통과한 데이터만 전달됨
    signup(data);
  });
  
  return {
    form,
    handleSubmit,
    isLoading: isPending,
    errors: form.formState.errors
  };
}

// containers/auth/SignupContainer.tsx  
export function SignupContainer() {
  const { form, handleSubmit, isLoading, errors } = useSignup();
  
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input placeholder="example@cotept.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* 다른 필드들... */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <InlineLoading /> : "가입하기"}
        </Button>
      </form>
    </Form>
  );
}
```

#### 3.2 타입 정의 분리
```typescript
// ❌ Figma Make - 인라인 타입
const [agreements, setAgreements] = useState({
  terms: false,
  privacy: false,
  marketing: false
});

// ✅ CotePT - 타입 파일 분리
// features/auth/types/auth.types.ts
export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  agreements: AgreementSettings;
}

export interface AgreementSettings {
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
}

// shared/types/auth.d.ts (글로벌 타입)
declare namespace Auth {
  interface User {
    id: string;
    email: string;
    role: UserRole;
  }
}
```

### Step 4: API 연동 구현

#### 4.1 API 클라이언트 활용
```typescript
// ❌ Figma Make - 직접 fetch
const handleSubmit = async (data) => {
  const response = await fetch('/api/signup', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// ✅ CotePT - API 클라이언트 활용
// features/auth/apis/mutations.ts
import { authApi } from "@/shared/api/services/auth-api-service"
import { useMutation } from "@tanstack/react-query"

export function useSignupMutation() {
  return useMutation({
    mutationFn: authApi.signup,
    onSuccess: () => {
      // 성공 처리
    },
    onError: (error) => {
      // 에러 처리
    }
  });
}
```

#### 4.2 에러 핸들링 적용
```typescript
// ✅ CotePT - 표준화된 에러 핸들링
import { AuthErrorHandler } from "@/shared/auth/errors/handler"

export function useSignup() {
  const { mutate, isPending, error } = useSignupMutation();
  
  const handleSubmit = useCallback((data: SignupFormData) => {
    try {
      mutate(data);
    } catch (error) {
      const handledError = AuthErrorHandler.handle(error);
      AuthErrorHandler.logError(handledError, "Signup Hook");
    }
  }, [mutate]);
  
  return {
    handleSubmit,
    isLoading: isPending,
    error: error ? AuthErrorHandler.getErrorMessage(error.code) : null
  };
}
```

### Step 5: UI 컴포넌트 최적화

#### 5.1 Shared UI 컴포넌트 활용
```typescript
// ❌ Figma Make - 인라인 스타일
<button className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium">
  가입하기
</button>

// ✅ CotePT - 표준 컴포넌트 활용
import { Button } from "@repo/shared/components/button"

<Button 
  variant="default" 
  size="lg" 
  className="w-full"
  disabled={isLoading}
>
  {isLoading ? <InlineLoading /> : "가입하기"}
</Button>
```

#### 5.2 반응형 디자인 적용
```typescript
// ✅ CotePT - 반응형 레이아웃
<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div className="w-full max-w-md md:max-w-lg bg-white rounded-lg shadow-sm p-6 md:p-8">
    {/* 모바일: p-6, 데스크톱: p-8 */}
  </div>
</div>
```

### Step 6: 테스트 코드 작성

#### 6.1 컴포넌트 테스트
```typescript
// containers/auth/__tests__/SignupContainer.test.tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { SignupContainer } from "../SignupContainer"

describe("SignupContainer", () => {
  it("이메일 입력 시 상태가 업데이트된다", () => {
    render(<SignupContainer />);
    
    const emailInput = screen.getByLabelText("이메일");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    
    expect(emailInput).toHaveValue("test@example.com");
  });
});
```

#### 6.2 커스텀 훅 테스트
```typescript
// features/auth/hooks/__tests__/useSignup.test.ts
import { renderHook, act } from "@testing-library/react"
import { useSignup } from "../useSignup"

describe("useSignup", () => {
  it("폼 데이터가 올바르게 업데이트된다", () => {
    const { result } = renderHook(() => useSignup());
    
    act(() => {
      result.current.setFormData({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123"
      });
    });
    
    expect(result.current.formData.email).toBe("test@example.com");
  });
});
```

---

## 📝 변환 체크리스트

### 코드 품질 검증
- [ ] **TypeScript Strict 모드** 통과
- [ ] **ESLint 규칙** 준수
- [ ] **Prettier 포맷팅** 적용
- [ ] **Import 경로** 정리 (절대 경로 사용)

### FSD 아키텍처 준수
- [ ] **레이어 의존성 방향** 확인 (상위 → 하위만)
- [ ] **비즈니스 로직 분리** (hooks, services)
- [ ] **타입 정의 분리** (types 폴더)
- [ ] **재사용성 고려** (2회 이상 사용 시 shared/ui)

### CotePT 특화 적용
- [ ] **Zod 스키마** 유효성 검사 적용
- [ ] **React Hook Form** 통합 (zodResolver 사용)
- [ ] **API 클라이언트** 사용 (auto-generated)
- [ ] **에러 핸들링** 표준화
- [ ] **로딩 상태** 처리
- [ ] **테스트 코드** 작성

---

## 🚀 실제 변환 예시

### Before: Figma Make 코드
```typescript
// ❌ 단일 파일에 모든 로직
import { useState } from 'react';
import { Button } from './components/ui/button';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('회원가입:', { email, password });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">가입하기</Button>
      </form>
    </div>
  );
}
```

### After: CotePT 컨벤션 적용
```typescript
// ✅ features/auth/schemas/auth.schema.ts
import { z } from "zod"

export const SignupFormSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다")
})

export type SignupFormData = z.infer<typeof SignupFormSchema>

// ✅ features/auth/hooks/useSignup.ts
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useSignupMutation } from "@/features/auth/apis/mutations"
import { AuthErrorHandler } from "@/shared/auth/errors/handler"
import { SignupFormSchema, type SignupFormData } from "../schemas/auth.schema"

export function useSignup() {
  const router = useRouter()
  const form = useForm<SignupFormData>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })
  
  const { mutate: signup, isPending } = useSignupMutation()
  
  const handleSubmit = form.handleSubmit((data) => {
    try {
      signup(data, {
        onSuccess: () => {
          router.push("/dashboard")
        }
      })
    } catch (error) {
      const handledError = AuthErrorHandler.handle(error)
      AuthErrorHandler.logError(handledError, "Signup Hook")
    }
  }, [signup, router])
  
  return {
    form,
    handleSubmit,
    isLoading: isPending
  }
}

// ✅ containers/auth/SignupContainer.tsx
import { Button } from "@repo/shared/components/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { InlineLoading } from "@/shared/ui/loading"
import { useSignup } from "@/features/auth/hooks/useSignup"

export function SignupContainer() {
  const { form, handleSubmit, isLoading } = useSignup()
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input placeholder="example@cotept.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              variant="default" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? <InlineLoading /> : "가입하기"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

// ✅ app/auth/signup/page.tsx
import { SignupContainer } from "@/containers/auth/SignupContainer"

export default function SignupPage() {
  return <SignupContainer />
}
```

---

## 🛠️ 자동화 도구 제안

### VS Code Extension 개발
```json
{
  "name": "figma-make-to-cotept",
  "commands": [
    {
      "command": "cotept.convertFigmaMake",
      "title": "Convert Figma Make Code to CotePT"
    }
  ]
}
```

### CLI 도구 개발  
```bash
# 사용법
npx cotept-converter input.tsx --output ./src/features/auth/

# 기능
- 자동 파일 분할
- Import 경로 변환
- 타입 추출
- 훅 생성
```

---

이 워크플로우를 따라 Figma Make 코드를 체계적으로 변환하면 CotePT 프로젝트의 아키텍처와 컨벤션을 유지하면서도 빠른 UI 개발이 가능합니다.