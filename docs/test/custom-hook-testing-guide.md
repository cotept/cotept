# 커스텀 훅 테스트 가이드

**작성일**: 2025-01-18  
**기반**: project-knowledge/test-guidelines.md FIRST, Right-BICEP, CORRECT 원칙

## 목차

1. [커스텀 훅 테스트의 특수성](#커스텀-훅-테스트의-특수성)
2. [CotePT 프로젝트 테스트 환경](#cotept-프로젝트-테스트-환경)
3. [단계별 테스트 작성 가이드](#단계별-테스트-작성-가이드)
4. [의존성 모킹 전략](#의존성-모킹-전략)
5. [실제 예시: useEmailStep 테스트](#실제-예시-useemailstep-테스트)
6. [주요 테스트 패턴](#주요-테스트-패턴)
7. [테스트 시나리오 체크리스트](#테스트-시나리오-체크리스트)

## 커스텀 훅 테스트의 특수성

### 일반 함수 테스트와의 차이점

```typescript
// ❌ 일반 함수처럼 직접 호출하면 안됨
const result = useEmailStep({ onComplete: mockFn }) // Error!

// ✅ renderHook을 사용해야 함
const { result } = renderHook(() => useEmailStep({ onComplete: mockFn }))
```

### React의 규칙을 따라야 하는 이유

- **Hooks Rules**: 컴포넌트 최상위에서만 호출 가능
- **Re-render**: 상태 변경 시 리렌더링 시뮬레이션 필요  
- **Cleanup**: 언마운트 시 정리 작업 테스트
- **Context**: Provider가 필요한 경우 래퍼 제공

## CotePT 프로젝트 테스트 환경

### 필수 라이브러리

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/react-hooks": "^8.0.1", 
    "@testing-library/jest-dom": "^6.0.0",
    "vitest": "^1.0.0",
    "jsdom": "^23.0.0"
  }
}
```

### 기본 테스트 설정

```typescript
// __tests__/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// 전역 모킹
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
  Controller: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}))
```

## 단계별 테스트 작성 가이드

### 1단계: 실제 구현체 분석

**❗ 중요**: 테스트 코드 작성 전 반드시 수행

```typescript
// 1. 훅의 인터페이스 확인
interface UseEmailStepProps {
  onComplete: (data: EmailStepData) => void
}

// 2. 반환값 확인  
const result = {
  form: UseFormReturn<EmailStepData>,
  handleSubmit: SubmitHandler<EmailStepData>,
  isLoading: boolean,
  email: string,
  isEmailValid: boolean
}

// 3. 의존성 확인
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
```

### 2단계: 모킹 전략 수립

```typescript
// 의존성별 모킹 전략
const mockStrategies = {
  'react-hook-form': 'form 객체와 메서드들을 모킹',
  '@hookform/resolvers/zod': 'zodResolver 함수 모킹',  
  'API 호출': 'mutation/query 결과 모킹',
  '타이머': 'vi.useFakeTimers() 활용'
}
```

### 3단계: test-guidelines.md 원칙 적용

```typescript
describe('useEmailStep', () => {
  // FIRST 원칙
  beforeEach(() => {
    vi.clearAllMocks() // Fast, Isolated
    vi.clearAllTimers() // Repeatable
  })

  // Right-BICEP 원칙  
  describe('기본 기능 (Right)', () => {
    it('should initialize correctly', () => {
      // Given-When-Then 구조
    })
  })

  describe('경계 조건 (Boundary)', () => {
    // 빈 값, 최대/최소 길이, 특수 문자 등
  })

  describe('에러 조건 (Error)', () => {
    // API 실패, 네트워크 에러, 검증 실패 등
  })
})
```

## 의존성 모킹 전략

### React Hook Form 모킹

```typescript
const mockForm = {
  handleSubmit: vi.fn((callback) => (e) => callback(mockData)),
  setError: vi.fn(),
  watch: vi.fn().mockReturnValue('test@example.com'),
  formState: { errors: {} },
  control: {},
  register: vi.fn(),
  setValue: vi.fn(),
  getValues: vi.fn(),
}

vi.mocked(useForm).mockReturnValue(mockForm as any)
```

### TanStack Query 모킹

```typescript
const mockMutation = {
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
}

vi.mocked(useMutation).mockReturnValue(mockMutation as any)
```

### Zod 스키마 모킹

```typescript
const mockEmailStepRules = {
  safeParse: vi.fn().mockReturnValue({ success: true, data: { email: 'test@example.com' } }),
  parse: vi.fn().mockReturnValue({ email: 'test@example.com' }),
}

vi.mock('../../lib/validations/auth-rules', () => ({
  EmailStepRules: mockEmailStepRules,
}))
```

## 실제 예시: useEmailStep 테스트

### 기본 구조

```typescript
import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useForm } from 'react-hook-form'

import { useEmailStep } from '../useEmailStep'

// 모킹 설정
vi.mock('react-hook-form')
vi.mock('../../lib/validations/auth-rules')

describe('useEmailStep', () => {
  const mockOnComplete = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // 기본 모킹 설정
    vi.mocked(useForm).mockReturnValue({
      handleSubmit: vi.fn((callback) => vi.fn()),
      setError: vi.fn(),
      watch: vi.fn().mockReturnValue(''),
    } as any)
  })

  it('should initialize with correct default values', () => {
    // Given: 훅 초기화
    const { result } = renderHook(() => 
      useEmailStep({ onComplete: mockOnComplete })
    )

    // When: 초기 상태 확인
    const { form, isLoading, email, isEmailValid } = result.current

    // Then: 기대값과 일치
    expect(form).toBeDefined()
    expect(isLoading).toBe(false)
    expect(email).toBe('')
    expect(isEmailValid).toBe(false)
  })
})
```

### 비동기 동작 테스트

```typescript
it('should handle email validation with API call', async () => {
  // Given: API 성공 응답 모킹
  const mockCheckEmail = vi.fn().mockImplementation((email, options) => {
    setTimeout(() => {
      options.onSuccess({ data: { result: true, message: '사용 가능' } })
    }, 100)
  })

  // Mock 내부 함수 교체
  vi.mocked(useEmailStep).mockImplementation(() => ({
    checkEmail: mockCheckEmail,
    // ... 기타 반환값
  }))

  const { result } = renderHook(() => 
    useEmailStep({ onComplete: mockOnComplete })
  )

  // When: 이메일 제출
  act(() => {
    result.current.handleSubmit()
  })

  // Then: 비동기 완료 대기
  await waitFor(() => {
    expect(mockOnComplete).toHaveBeenCalled()
  })
})
```

### 에러 상황 테스트

```typescript
it('should handle API error gracefully', async () => {
  // Given: API 에러 모킹
  const mockCheckEmail = vi.fn().mockImplementation((email, options) => {
    setTimeout(() => {
      options.onSuccess({ data: { result: false, message: '이미 사용 중' } })
    }, 100)
  })

  // When: 에러 발생 시나리오 실행
  act(() => {
    result.current.handleSubmit()
  })

  // Then: 에러 처리 확인
  await waitFor(() => {
    expect(result.current.form.setError).toHaveBeenCalledWith(
      'email', 
      { message: '이미 사용 중' }
    )
  })
})
```

## 주요 테스트 패턴

### 패턴 1: 상태 변경 테스트

```typescript
it('should update email state on input change', () => {
  const { result } = renderHook(() => useEmailStep({ onComplete: mockOnComplete }))
  
  // 상태 변경 시뮬레이션
  act(() => {
    vi.mocked(result.current.form.watch).mockReturnValue('new@email.com')
  })
  
  // 리렌더링 후 상태 확인
  expect(result.current.email).toBe('new@email.com')
})
```

### 패턴 2: 실시간 검증 테스트

```typescript
it('should validate email format in real-time', () => {
  const { result } = renderHook(() => useEmailStep({ onComplete: mockOnComplete }))
  
  // 유효한 이메일로 변경
  act(() => {
    vi.mocked(EmailStepRules.safeParse).mockReturnValue({ 
      success: true, 
      data: { email: 'valid@email.com' } 
    })
  })
  
  expect(result.current.isEmailValid).toBe(true)
})
```

### 패턴 3: 타이머 기반 테스트 (useVerificationStep)

```typescript
describe('타이머 기능', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should countdown correctly', () => {
    const { result } = renderHook(() => 
      useVerificationStep({ email: 'test@email.com', onComplete: mockFn })
    )
    
    // 타이머 시작
    act(() => {
      result.current.sendVerificationCode()
    })
    
    // 1초 경과
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    expect(result.current.cooldownTime).toBe(59)
  })
})
```

### 패턴 4: 폼 제출 테스트

```typescript
it('should call onComplete with form data on successful submission', async () => {
  const mockFormData = { email: 'test@example.com' }
  
  vi.mocked(useForm).mockReturnValue({
    handleSubmit: vi.fn((callback) => () => callback(mockFormData)),
    // ... 기타 모킹
  } as any)

  const { result } = renderHook(() => 
    useEmailStep({ onComplete: mockOnComplete })
  )

  act(() => {
    result.current.handleSubmit()
  })

  expect(mockOnComplete).toHaveBeenCalledWith(mockFormData)
})
```

## 테스트 시나리오 체크리스트

### ✅ 기본 기능 (FIRST - Right)

- [ ] 초기화 시 올바른 기본값 설정
- [ ] 필요한 함수들이 모두 제공됨
- [ ] Props 변경 시 적절히 반응
- [ ] 언마운트 시 정리 작업 수행

### ✅ 경계 조건 (Right-BICEP - Boundary)

- [ ] 빈 값 처리 (`''`, `null`, `undefined`)
- [ ] 최소/최대 길이 처리
- [ ] 특수 문자 처리
- [ ] 형식 오류 처리

### ✅ 반대 조건 (Right-BICEP - Inverse)

- [ ] 유효 vs 무효 입력
- [ ] 성공 vs 실패 시나리오  
- [ ] 활성 vs 비활성 상태

### ✅ 교차 검증 (Right-BICEP - Cross-check)

- [ ] 클라이언트 + 서버 검증 일치
- [ ] 폼 상태 + UI 상태 일치
- [ ] 여러 조건 동시 만족

### ✅ 에러 조건 (Right-BICEP - Error)

- [ ] API 호출 실패
- [ ] 네트워크 에러
- [ ] 검증 실패
- [ ] 타임아웃
- [ ] 예상치 못한 응답

### ✅ 성능 조건 (Right-BICEP - Performance)

- [ ] 빠른 연속 입력 처리
- [ ] 메모리 누수 없음
- [ ] 불필요한 리렌더링 방지
- [ ] 타이머 정확성

### ✅ CORRECT 원칙

- [ ] **Conformance**: 규격 준수 (이메일 형식, 비밀번호 정책)
- [ ] **Ordering**: 순서 의존성 (발송→입력→검증)
- [ ] **Range**: 값의 범위 (길이, 시간 제한)
- [ ] **Reference**: 외부 의존성 (API, 타이머)
- [ ] **Existence**: 필수 값 존재 확인
- [ ] **Cardinality**: 개수 검증 (0-1-N 법칙)
- [ ] **Time**: 시간 관련 동작 (만료, 타이밍)

## 실무 팁

### 1. 실제 구현체 먼저 분석하기

```bash
# 1. 훅의 반환값 확인
grep -A 10 "return {" useEmailStep.ts

# 2. 의존성 확인  
grep "import.*from" useEmailStep.ts

# 3. 내부 로직 이해
grep -A 5 -B 5 "handleSubmit\|useForm\|mutation" useEmailStep.ts
```

### 2. 점진적 테스트 작성

```typescript
// 1단계: 기본 초기화 테스트
it('should initialize', () => { /* 가장 단순한 테스트 */ })

// 2단계: 단순 상태 변경 테스트  
it('should update state', () => { /* 상태 변경 테스트 */ })

// 3단계: 비즈니스 로직 테스트
it('should validate email', () => { /* 복잡한 로직 테스트 */ })

// 4단계: 에러 시나리오 테스트
it('should handle errors', () => { /* 에러 케이스 테스트 */ })
```

### 3. 모킹은 최소한으로

```typescript
// ❌ 과도한 모킹
vi.mock('every-single-import')

// ✅ 필요한 부분만 모킹
vi.mock('external-api-calls')
vi.mock('complex-dependencies')

// 실제 라이브러리 동작은 유지
// (예: lodash, date-fns 등의 유틸 함수들)
```

### 4. 테스트 실패 시 디버깅

```typescript
it('should debug failing test', () => {
  const { result } = renderHook(() => useEmailStep({ onComplete: mockFn }))
  
  // 실제 반환값 확인
  console.log('Actual result:', result.current)
  
  // 모킹 호출 여부 확인
  console.log('Mock calls:', vi.mocked(useForm).mock.calls)
  
  // 예상 vs 실제 비교
  expect(result.current).toMatchObject({
    // 실제 구현에서 반환하는 정확한 구조
  })
})
```

## 커스텀 훅별 특화 가이드

### useEmailStep

- **핵심**: 이메일 검증 + 중복 확인
- **주요 테스트**: 형식 검증, API 호출, 에러 처리
- **모킹 대상**: useForm, API mutation

### usePasswordStep  

- **핵심**: 실시간 검증 + 보기/숨기기
- **주요 테스트**: 조건별 검증, 상태 토글
- **모킹 대상**: useForm, useMemo 최적화

### useTermsStep

- **핵심**: 전체/개별 약관 토글
- **주요 테스트**: 전체 동의 로직, 부분 동의 상태
- **모킹 대상**: useForm, Object.keys 순회

### useVerificationStep

- **핵심**: 타이머 + 비동기 API
- **주요 테스트**: 카운트다운, 자동 제출, API 호출
- **모킹 대상**: 타이머, API mutations, useCallback

### useProfileStep

- **핵심**: 닉네임 검증 + 최종 단계
- **주요 테스트**: 형식 검증, 중복 확인, 완료 처리
- **모킹 대상**: useForm, 최종 완료 콜백

---

**참고 문서**: 
- [project-knowledge/test-guidelines.md](../project-knowledge/test-guidelines.md)
- [React Testing Library 문서](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest 문서](https://vitest.dev/)