# 🎯 Signup Step Components 페어코딩 계획

**작성일**: 2025-01-18  
**예정일**: 2025-01-19  
**예상 소요 시간**: 105분 (약 1시간 45분)

## 📋 현재 상황 분석

**✅ 이미 완성된 것들:**
- SignupContainer (상태 관리, 핸들러 완료)
- 5개 단계별 커스텀 훅들 모두 구현됨
  - `useEmailStep.ts` - 이메일 검증 및 중복 확인
  - `usePasswordStep.ts` - 비밀번호 입력, 보기/숨기기, 2줄 검증 표시
  - `useTermsStep.ts` - 전체/개별 약관 동의 토글
  - `useVerificationStep.ts` - 인증 코드 입력, 타이머, 재전송
  - `useProfileStep.ts` - 닉네임 입력 및 검증
- @repo/shared shadcn/ui 컴포넌트들 준비됨
- Zod 스키마 및 타입 정의 완료
- URL 기반 step 상수 정의됨 (`basic-types.ts`)

**🔧 구현해야 할 것들:**
- 5개 Step 컴포넌트 (EmailStep, PasswordStep, TermsStep, VerificationStep, ProfileStep)
- SignupContainer에서 실제 Step 컴포넌트들 연결

## 🚀 페어코딩 순서 (단계별 구현)

### Phase 1: EmailStep 컴포넌트 (15분)
**📂 파일**: `features/auth/components/EmailStep.tsx`

**사용자 구현 내용:**
- useEmailStep 훅 활용 (`form`, `handleSubmit`, `isLoading`, `email`, `isEmailValid`)
- shadcn/ui Form, Input, Button 사용
- 라프텔 스타일: 다크 테마, "이메일로 시작" 제목
- 하단 "이미 계정이 있으신가요?" 로그인 링크

**Claude 지원:**
- 컴포넌트 구조 가이드
- import 경로 정리 (`@repo/shared/components/*`)
- 스타일링 조언 (text-white, bg-zinc-900 계열)

**컴포넌트 구조:**
```typescript
interface EmailStepProps {
  onComplete: (data: EmailStepData) => void
}

export function EmailStep({ onComplete }: EmailStepProps) {
  const { form, handleSubmit, isLoading } = useEmailStep({ onComplete })
  // 구현 내용...
}
```

### Phase 2: PasswordStep 컴포넌트 (20분)
**📂 파일**: `features/auth/components/PasswordStep.tsx`

**사용자 구현 내용:**
- usePasswordStep 훅의 `showPassword`, `togglePasswordVisibility`, `passwordChecks` 활용
- 비밀번호 보기/숨기기 토글 아이콘 (Eye/EyeOff)
- 2줄 검증 표시 (lengthValid, compositionValid)
- 확인 비밀번호 입력 필드

**Claude 지원:**
- 아이콘 컴포넌트 추천 (lucide-react)
- 조건부 스타일링 로직 (`text-green-500` vs `text-red-500`)
- 접근성 속성 가이드 (`aria-label`, `type="password"`)

**검증 표시 구조:**
```typescript
const { passwordChecks } = usePasswordStep({ onComplete })

// 2줄 표시:
// ✅/❌ 8자 이상 32자 이하
// ✅/❌ 영문, 숫자, 특수문자 포함
```

### Phase 3: TermsStep 컴포넌트 (20분)
**📂 파일**: `features/auth/components/TermsStep.tsx`

**사용자 구현 내용:**
- useTermsStep 훅의 `allAgreed`, `toggleAllAgreements` 활용
- 전체 동의 체크박스 (상단)
- 개별 체크박스들 4개:
  - 서비스 이용약관 (필수)
  - 개인정보처리방침 (필수)
  - 만 14세 이상 확인 (필수)
  - 마케팅 수신 동의 (선택)

**Claude 지원:**
- Checkbox 컴포넌트 사용법
- 약관 텍스트 레이아웃 조언 (필수/선택 표시)
- 전체/개별 동의 UX 패턴

**약관 구조:**
```typescript
const terms = [
  { key: 'serviceTerms', label: '서비스 이용약관 동의', required: true },
  { key: 'privacyPolicy', label: '개인정보처리방침 동의', required: true },
  { key: 'ageConfirmation', label: '만 14세 이상입니다', required: true },
  { key: 'marketingConsent', label: '마케팅 수신 동의', required: false }
]
```

### Phase 4: VerificationStep 컴포넌트 (25분)
**📂 파일**: `features/auth/components/VerificationStep.tsx`

**사용자 구현 내용:**
- useVerificationStep 훅의 타이머, 재전송 로직 활용
- 6자리 인증 코드 입력 (maxLength={6})
- 카운트다운 타이머 표시 (MM:SS 형식)
- 재전송 버튼 (쿨다운 적용)
- 이메일 주소 표시

**Claude 지원:**
- 입력 필드 포맷팅 (text-center, tracking-wider)
- 타이머 UI 구현 (`formatTime` 함수 활용)
- 상태별 버튼 스타일링 (disabled, loading)

**타이머 표시 구조:**
```typescript
const { cooldownTime, sendVerificationCode } = useVerificationStep({...})

// 표시: "남은 시간: 02:45" 또는 "재전송 (30초 후)"
```

### Phase 5: ProfileStep 컴포넌트 (15분)
**📂 파일**: `features/auth/components/ProfileStep.tsx`

**사용자 구현 내용:**
- useProfileStep 훅 활용
- 닉네임 입력 필드 (2-20자)
- "내 프로필" 제목 스타일
- 최종 "회원가입 완료" 버튼

**Claude 지원:**
- 입력 검증 피드백 UI
- 완료 버튼 스타일링 (primary, large)
- 최종 단계 UX 조언

**완료 단계 구조:**
```typescript
// 닉네임 입력 + 완료 버튼
// "거의 다 완료되었습니다!" 안내 메시지
```

### Phase 6: SignupContainer 연결 (10분)
**📂 파일**: `containers/auth/pages/SignupContainer.tsx`

**사용자 구현 내용:**
- 실제 Step 컴포넌트들 import
- 임시 텍스트를 실제 컴포넌트로 교체
- props 연결 확인 (`onComplete` 핸들러)

**Claude 지원:**
- import 경로 정리
- props 타입 체크
- 전체 플로우 테스트 가이드

**연결 구조:**
```typescript
import { EmailStep } from '@/features/auth/components/EmailStep'
// ... 기타 imports

{currentStep === 'email' && (
  <EmailStep onComplete={handleEmailComplete} />
)}
// ... 기타 단계들
```

## 🎨 공통 디자인 가이드라인

**라프텔 스타일 적용:**
- 다크 테마 (bg-zinc-900, text-white)
- 중앙 카드 레이아웃 (rounded-xl, p-8)
- 그라데이션 로고 (purple-400 to pink-400)
- 깔끔한 타이포그래피 (text-xl font-semibold)

**shadcn/ui 컴포넌트 활용:**
- Form, FormField, FormItem, FormLabel, FormControl, FormMessage
- Input, Button, Checkbox
- 일관된 스타일링과 접근성 자동 적용

**공통 import 패턴:**
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage 
} from '@repo/shared/components/form'
import { Input } from '@repo/shared/components/input'
import { Button } from '@repo/shared/components/button'
```

## 🔧 기술적 고려사항

**Hook 활용:**
- 각 Step 컴포넌트는 해당하는 useXXXStep 훅만 사용
- onComplete prop으로 부모 컨테이너와 연결
- form 객체를 통한 상태 관리

**타입 안전성:**
- 모든 Step 컴포넌트에서 해당 StepData 타입 사용
- Props 인터페이스 명시적 정의

**재사용성:**
- 각 Step은 독립적인 컴포넌트로 설계
- 다른 컨텍스트에서도 사용 가능하도록 구성

## 📝 성공 기준

1. ✅ 5개 모든 Step 컴포넌트 완성
2. ✅ 각 단계별 실제 폼 기능 동작
3. ✅ 라프텔 스타일 일관성 유지
4. ✅ 기존 커스텀 훅들 완전 활용
5. ✅ SignupContainer에서 전체 플로우 연결

## 🧪 테스트 방법

**개발 서버 실행:**
```bash
pnpm dev
```

**테스트 URL:**
```
http://localhost:3000/auth/signup
```

**테스트 시나리오:**
1. 각 단계별 폼 입력 및 검증 확인
2. 단계 간 데이터 전달 확인
3. 최종 회원가입 API 호출 확인
4. 에러 처리 및 로딩 상태 확인

## 📚 참고 문서

- [signup.md](./signup.md) - 전체 설계 문서
- [기존 커스텀 훅들](/apps/web/src/features/auth/hooks/signup/)
- [shadcn/ui 컴포넌트](/packages/shared/src/components/)
- [라프텔 스크린샷](/screenshots/laftel/)

---

**Note**: 이 계획은 기존 완성된 커스텀 훅들과 shadcn/ui 컴포넌트를 최대한 활용하여 효율적인 페어코딩을 목표로 합니다.