# CotePT Zod Validation Rules 패턴

CotePT 프로젝트에서 사용하는 Zod 기반 유효성 검증 규칙 패턴 가이드입니다.

## 📁 폴더 구조

```
apps/web/src/
├── shared/
│   └── lib/
│       └── validations/
│           ├── README.md              # 이 문서
│           ├── common-rules.ts        # 프로젝트 전체 공통 규칙
│           └── field-rules.ts         # 재사용 가능한 필드별 규칙
├── features/
│   ├── auth/
│   │   ├── lib/
│   │   │   └── validations/
│   │   │       └── auth-rules.ts      # 인증 도메인 전용 규칙
│   │   └── types/
│   │       └── auth.types.ts          # 인증 관련 타입 정의
│   ├── user/
│   │   └── lib/
│   │       └── validations/
│   │           └── user-rules.ts      # 사용자 도메인 전용 규칙
│   └── mentoring/
│       └── lib/
│           └── validations/
│               └── mentoring-rules.ts # 멘토링 도메인 전용 규칙
```

## 🎯 명명 규칙

### 1. **파일명**: `{domain}-rules.ts`

- ✅ `auth-rules.ts`
- ✅ `user-rules.ts`
- ✅ `mentoring-rules.ts`
- ❌ `auth-schema.ts` (스키마 용어 지양)
- ❌ `authValidation.ts` (카멜케이스 지양)

### 2. **변수명**: `{Entity}Rules`

- ✅ `LoginRules`
- ✅ `SignupRules`
- ✅ `UserProfileRules`
- ❌ `LoginSchema`
- ❌ `loginValidator`

### 3. **타입명**: `{Entity}Data`

- ✅ `LoginData`
- ✅ `SignupData`
- ✅ `UserProfileData`

## 🚀 사용법 예시

### 1. 기본 사용 패턴

```typescript
// features/auth/lib/validations/auth-rules.ts
import { z } from "zod"
import { FieldRules } from "@/shared/lib/validations/field-rules"

export const LoginRules = z.object({
  email: FieldRules.email(),
  password: FieldRules.password(),
})

export const SignupRules = LoginRules.extend({
  nickname: FieldRules.nickname(),
  confirmPassword: z.string({
    required_error: "비밀번호 확인을 입력해주세요",
  }),
  agreements: z.object({
    terms: z.boolean().refine((val) => val === true, "이용약관에 동의해야 합니다"),
    privacy: z.boolean().refine((val) => val === true, "개인정보처리방침에 동의해야 합니다"),
    marketing: z.boolean().optional().default(false),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
})

// 타입 추출
export type LoginData = z.infer<typeof LoginRules>
export type SignupData = z.infer<typeof SignupRules>
```

### 2. React Hook Form과 함께 사용

```typescript
// features/auth/hooks/useSignup.ts
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { SignupRules, type SignupData } from "../lib/validations/auth-rules"

export function useSignup() {
  const form = useForm<SignupData>({
    resolver: zodResolver(SignupRules),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      nickname: "",
      agreements: {
        terms: false,
        privacy: false,
        marketing: false,
      },
    },
  })

  const handleSubmit = form.handleSubmit((data: SignupData) => {
    // Zod 검증을 통과한 타입 안전한 데이터
    console.log("유효한 데이터:", data)
  })

  return { form, handleSubmit }
}
```

### 3. API 요청 데이터 검증

```typescript
// features/auth/api/mutations.ts
import { SignupRules, type SignupData } from "../lib/validations/auth-rules"

export async function signupUser(data: unknown) {
  // 런타임 검증 + 타입 추론
  const validatedData = SignupRules.parse(data)

  // API 호출
  return apiClient.post("/auth/signup", validatedData)
}
```

## 🛠️ 새로운 규칙 추가하기

### 1. 공통 필드 규칙 추가

새로운 공통 필드 타입이 필요한 경우:

```typescript
// shared/lib/validations/field-rules.ts
export const FieldRules = {
  // 기존 규칙들...

  // 새로운 필드 규칙 추가
  companyName: () =>
    z
      .string({
        required_error: "회사명을 입력해주세요",
        invalid_type_error: "회사명은 문자열이어야 합니다",
      })
      .min(2, "회사명은 2자 이상이어야 합니다")
      .max(50, "회사명은 50자 이하여야 합니다")
      .trim(),
} as const
```

### 2. 도메인별 규칙 추가

새로운 기능의 폼 검증이 필요한 경우:

```typescript
// features/mentoring/lib/validations/mentoring-rules.ts
import { z } from "zod"
import { FieldRules } from "@/shared/lib/validations/field-rules"

export const SessionCreateRules = z.object({
  title: FieldRules.title(),
  description: FieldRules.content(),
  scheduledAt: z
    .date({
      required_error: "세션 시간을 선택해주세요",
    })
    .refine((date) => date > new Date(), {
      message: "미래 시간을 선택해주세요",
    }),
  tags: z.array(FieldRules.tag()).max(5, "태그는 최대 5개까지 선택할 수 있습니다"),
})

export type SessionCreateData = z.infer<typeof SessionCreateRules>
```

### 3. 복합 규칙 추가

여러 필드가 연관된 복잡한 검증이 필요한 경우:

```typescript
// features/user/lib/validations/user-rules.ts
export const UserProfileRules = z
  .object({
    nickname: FieldRules.nickname(),
    bio: FieldRules.content().optional(),
    website: FieldRules.url().optional(),
    birthDate: FieldRules.birthDate().optional(),
  })
  .refine(
    (data) => {
      // 복합 검증: 웹사이트가 있으면 bio도 있어야 함
      if (data.website && !data.bio) {
        return false
      }
      return true
    },
    {
      message: "웹사이트를 입력한 경우 자기소개도 작성해주세요",
      path: ["bio"],
    },
  )
```

## 📋 체크리스트

새로운 검증 규칙을 추가할 때 확인할 사항들:

### ✅ 코드 품질

- [ ] TypeScript strict 모드 통과
- [ ] 명명 규칙 준수 (`{Entity}Rules`, `{Entity}Data`)
- [ ] 적절한 폴더 위치 (shared vs features)
- [ ] 에러 메시지 한국어 작성

### ✅ 검증 로직

- [ ] 필수/선택 필드 구분 명확
- [ ] 적절한 최소/최대 길이 설정
- [ ] 정규식 패턴 검증 (필요한 경우)
- [ ] 커스텀 검증 로직 (refine 사용)

### ✅ 사용성

- [ ] React Hook Form과 호환성 확인
- [ ] API 요청 데이터 검증 적용
- [ ] 타입 추론 정상 동작 확인
- [ ] 에러 메시지 사용자 친화적

## 🔧 고급 패턴

### 1. 조건부 검증

```typescript
const ConditionalRules = z
  .object({
    accountType: z.enum(["personal", "business"]),
    companyName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.accountType === "business" && !data.companyName) {
        return false
      }
      return true
    },
    {
      message: "사업자 계정은 회사명이 필요합니다",
      path: ["companyName"],
    },
  )
```

### 2. 동적 검증 규칙

```typescript
const createPasswordRules = (isAdmin: boolean) => {
  const baseRules = FieldRules.password()

  if (isAdmin) {
    return baseRules.min(12, "관리자 비밀번호는 12자 이상이어야 합니다")
  }

  return baseRules
}
```

### 3. 에러 메시지 커스터마이징

```typescript
const CustomErrorRules = z
  .object({
    email: FieldRules.email(),
  })
  .superRefine((data, ctx) => {
    if (data.email.includes("temp")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "임시 이메일은 사용할 수 없습니다",
        path: ["email"],
      })
    }
  })
```

## 🎯 베스트 프랙티스

1. **재사용성 우선**: 2회 이상 사용되는 검증 로직은 공통 규칙으로 분리
2. **도메인 분리**: 도메인별로 파일을 나누어 관심사 분리
3. **타입 안전성**: 항상 `z.infer`로 타입 추출하여 사용
4. **에러 메시지**: 사용자가 이해하기 쉬운 한국어 메시지 작성
5. **성능 고려**: 복잡한 검증은 `superRefine`보다 `refine` 우선 사용

## 🚫 안티 패턴

1. **❌ 인라인 검증**: 컴포넌트 내부에서 직접 z.object 정의
2. **❌ 중복 규칙**: 같은 검증 로직을 여러 곳에서 반복 정의
3. **❌ 영어 에러**: 사용자에게 보여지는 에러 메시지를 영어로 작성
4. **❌ 타입 단언**: `as` 키워드로 타입 강제 변환
5. **❌ 스키마 용어**: "Schema", "Validator" 등의 용어 사용

---
