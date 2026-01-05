# Frontend Architecture Evolution Strategy

> 프로젝트 규모에 따른 프론트엔드 아키텍처 진화 전략 및 테스트 가이드

**작성일**: 2025-01-10
**버전**: 1.0.0
**대상**: CotePT 개발팀 및 프론트엔드 개발자
**관련 문서**: [frontend-architecture-guide.md](./frontend-architecture-guide.md), [CLAUDE.md](../../CLAUDE.md)

---

## 📋 목차

1. [개요](#개요)
2. [아키텍처 진화 로드맵](#아키텍처-진화-로드맵)
3. [Phase 1: MVP / 초기 스타트업](#phase-1-mvp--초기-스타트업)
4. [Phase 2: 성장기 스타트업](#phase-2-성장기-스타트업)
5. [Phase 3: 스케일업 / 중견 기업](#phase-3-스케일업--중견-기업)
6. [테스트 전략](#테스트-전략)
7. [의사결정 프레임워크](#의사결정-프레임워크)
8. [CotePT 프로젝트 적용 계획](#cotept-프로젝트-적용-계획)
9. [현업 사례 연구](#현업-사례-연구)
10. [FAQ](#faq)

---

## 개요

### 문서의 목적

이 문서는 **프로젝트 규모와 팀 성숙도에 따라 프론트엔드 아키텍처를 어떻게 진화시켜야 하는지**에 대한 실전 가이드입니다.

**핵심 철학**:
- **점진적 진화**: 처음부터 완벽한 아키텍처는 없다. 필요에 따라 진화한다.
- **비즈니스 가치 우선**: 기술 부채보다 제품 출시가 우선일 수 있다.
- **현실적인 테스트**: 각 단계에 맞는 실용적인 테스트 전략을 제시한다.
- **명확한 전환 시점**: 언제 다음 단계로 넘어가야 하는지 구체적 지표를 제공한다.

### 대상 독자

- **스타트업 개발자**: 빠른 프로토타이핑과 유지보수 사이의 균형을 찾는 개발자
- **기술 리더**: 팀 확장 시 아키텍처 전환을 고민하는 CTO, Tech Lead
- **프론트엔드 팀**: 레거시 코드 리팩토링 전략을 수립하는 팀

---

## 아키텍처 진화 로드맵

### 전체 진화 경로

```
Phase 1: Fat Hooks           Phase 2: Service Functions    Phase 3: Clean Architecture
(MVP, 1-3명, ~6개월)         (성장기, 4-10명, 6개월-2년)    (스케일업, 10+명, 2년+)
        │                           │                           │
        │                           │                           │
    빠른 개발                   균형잡힌 구조               엔터프라이즈급
    낮은 진입장벽                테스트 가능                 높은 유지보수성
        │                           │                           │
        └─────────▶─────────────────┴─────────────▶─────────────┘
           팀 확장 / 복잡도 증가        대규모 시스템 / 장기 운영
```

### 각 Phase 비교표

| 항목 | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| **팀 크기** | 1-3명 | 4-10명 | 10+명 |
| **프로젝트 기간** | ~6개월 | 6개월-2년 | 2년+ |
| **파일 수** | <50개 | 50-200개 | 200+개 |
| **개발 속도** | ⚡⚡⚡ 매우 빠름 | ⚡⚡ 빠름 | ⚡ 보통 |
| **테스트 커버리지** | 40-60% | 70-85% | 85-95% |
| **학습 곡선** | 낮음 | 중간 | 높음 |
| **리팩토링 난이도** | 낮음 | 중간 | 높음 |
| **장기 유지보수** | 어려움 | 보통 | 쉬움 |

---

## Phase 1: MVP / 초기 스타트업

### 프로젝트 특성

- **목표**: 빠른 프로토타이핑, 제품-시장 적합성(PMF) 검증
- **팀**: 1-3명의 풀스택 또는 프론트엔드 개발자
- **기간**: 출시까지 ~6개월
- **우선순위**: 속도 > 구조 > 테스트

### 아키텍처 패턴: Fat Hooks with Reducer

**선택 이유**:
- ✅ 가장 빠른 개발 속도
- ✅ 별도 레이어 없이 바로 구현 가능
- ✅ 낮은 학습 곡선 (React Hooks 기본 지식만 필요)
- ✅ 작은 기능에는 오히려 효율적
- ⚠️ 비즈니스 로직 증가 시 테스트 어려움
- ⚠️ 재사용성 낮음

### 디렉토리 구조

```
apps/web/src/
├── features/
│   └── payment/
│       ├── api/
│       │   ├── queries.ts          # React Query queries
│       │   └── mutations.ts         # React Query mutations
│       ├── hooks/                   # Fat Hooks (100-300줄)
│       │   └── usePayment.ts        # Reducer + 비즈니스 로직 + UI 로직
│       ├── schemas/
│       │   └── payment.schema.ts    # Zod validation
│       └── components/
│           └── PaymentForm.tsx
└── shared/
    └── ui/                          # 공통 컴포넌트
```

### 코드 예시

#### 전형적인 Fat Hook 패턴

```typescript
// features/payment/hooks/usePayment.ts
import { useCallback, useReducer } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useProcessPayment } from '../api/mutations'

// ============================================
// 상태 타입 정의
// ============================================
type PaymentState = {
  stage: 'idle' | 'processing' | 'succeeded' | 'failed'
  amount: number
  error: string | null
  isLoading: boolean
}

type PaymentAction =
  | { type: 'SET_AMOUNT'; payload: number }
  | { type: 'PROCESS_REQUEST' }
  | { type: 'PROCESS_SUCCESS' }
  | { type: 'PROCESS_FAILURE'; payload: string }
  | { type: 'RESET' }

const initialState: PaymentState = {
  stage: 'idle',
  amount: 0,
  error: null,
  isLoading: false,
}

// ============================================
// Reducer (이 부분은 분리되어 있어 테스트 가능!)
// ============================================
function paymentReducer(state: PaymentState, action: PaymentAction): PaymentState {
  switch (action.type) {
    case 'SET_AMOUNT':
      return { ...state, amount: action.payload, error: null }

    case 'PROCESS_REQUEST':
      return { ...state, isLoading: true, stage: 'processing', error: null }

    case 'PROCESS_SUCCESS':
      return { ...state, isLoading: false, stage: 'succeeded', error: null }

    case 'PROCESS_FAILURE':
      return { ...state, isLoading: false, stage: 'failed', error: action.payload }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

// ============================================
// Fat Hook (비즈니스 로직 + UI 로직 혼재)
// ============================================
export interface UsePaymentProps {
  onComplete?: (data: { amount: number }) => void
}

export function usePayment({ onComplete }: UsePaymentProps = {}) {
  const { data: session } = useSession()
  const [state, dispatch] = useReducer(paymentReducer, initialState)
  const processMutation = useProcessPayment()

  // 금액 설정
  const setAmount = useCallback((amount: number) => {
    dispatch({ type: 'SET_AMOUNT', payload: amount })
  }, [])

  // 결제 처리 (비즈니스 로직 + API + UI 로직)
  const processPayment = useCallback(async () => {
    // Validation (비즈니스 로직)
    if (!session?.user?.id) {
      toast.error('로그인이 필요합니다.')
      return
    }

    if (state.amount <= 0) {
      toast.error('결제 금액을 입력해주세요.')
      return
    }

    if (state.amount > 1000000) {
      toast.error('결제 금액은 100만원을 초과할 수 없습니다.')
      return
    }

    dispatch({ type: 'PROCESS_REQUEST' })

    try {
      // API 호출
      const response = await processMutation.mutateAsync({
        processPaymentDto: {
          userId: session.user.id,
          amount: state.amount,
        },
      })

      if (!response.data) {
        const errorMsg = '결제 처리 중 오류가 발생했습니다.'
        dispatch({ type: 'PROCESS_FAILURE', payload: errorMsg })
        toast.error(errorMsg)
        return
      }

      dispatch({ type: 'PROCESS_SUCCESS' })
      toast.success('결제가 완료되었습니다.')
      onComplete?.({ amount: state.amount })
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || '결제에 실패했습니다.'
      dispatch({ type: 'PROCESS_FAILURE', payload: errorMessage })
      toast.error(errorMessage)
    }
  }, [state.amount, session, processMutation, onComplete])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return {
    // 상태
    amount: state.amount,
    stage: state.stage,
    isLoading: state.isLoading,
    error: state.error,

    // 메서드
    setAmount,
    processPayment,
    reset,
  }
}
```

#### 사용 예시

```typescript
// containers/payment/PaymentContainer.tsx
export function PaymentContainer() {
  const payment = usePayment({
    onComplete: (data) => {
      console.log('Payment completed:', data)
      router.push('/payment/success')
    },
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      payment.processPayment()
    }}>
      <Input
        type="number"
        value={payment.amount}
        onChange={(e) => payment.setAmount(Number(e.target.value))}
        placeholder="결제 금액"
      />

      <Button
        type="submit"
        disabled={payment.isLoading}
      >
        {payment.isLoading ? '처리 중...' : '결제하기'}
      </Button>

      {payment.error && <ErrorMessage>{payment.error}</ErrorMessage>}
    </form>
  )
}
```

### Phase 1 테스트 전략

#### 목표 커버리지: 40-60%

**우선순위**:
1. **Reducer 테스트** (90%+) - 순수 함수로 분리되어 있어 쉬움
2. **Critical Path E2E** (핵심 사용자 플로우만)
3. **Hook 통합 테스트** (선택적)

#### 예산 배분
- 개발 시간의 **10-15%**를 테스트에 투자
- Reducer 테스트 작성: 2-3시간
- E2E 테스트: 주요 플로우만 1-2개

#### 테스트 코드 예시

```typescript
// features/payment/hooks/__tests__/usePayment.reducer.test.ts
import { describe, it, expect } from 'vitest'

describe('paymentReducer', () => {
  const initialState: PaymentState = {
    stage: 'idle',
    amount: 0,
    error: null,
    isLoading: false,
  }

  describe('SET_AMOUNT', () => {
    it('should set amount and clear error', () => {
      const state = paymentReducer(initialState, {
        type: 'SET_AMOUNT',
        payload: 50000,
      })

      expect(state.amount).toBe(50000)
      expect(state.error).toBeNull()
    })
  })

  describe('PROCESS_REQUEST', () => {
    it('should set loading and processing stage', () => {
      const state = paymentReducer(initialState, {
        type: 'PROCESS_REQUEST',
      })

      expect(state.isLoading).toBe(true)
      expect(state.stage).toBe('processing')
      expect(state.error).toBeNull()
    })
  })

  describe('PROCESS_SUCCESS', () => {
    it('should set succeeded stage and stop loading', () => {
      const processingState = {
        ...initialState,
        isLoading: true,
        stage: 'processing' as const,
      }

      const state = paymentReducer(processingState, {
        type: 'PROCESS_SUCCESS',
      })

      expect(state.isLoading).toBe(false)
      expect(state.stage).toBe('succeeded')
      expect(state.error).toBeNull()
    })
  })

  describe('PROCESS_FAILURE', () => {
    it('should set failed stage with error message', () => {
      const processingState = {
        ...initialState,
        isLoading: true,
        stage: 'processing' as const,
      }

      const errorMessage = '결제에 실패했습니다.'
      const state = paymentReducer(processingState, {
        type: 'PROCESS_FAILURE',
        payload: errorMessage,
      })

      expect(state.isLoading).toBe(false)
      expect(state.stage).toBe('failed')
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('RESET', () => {
    it('should reset to initial state', () => {
      const modifiedState = {
        stage: 'succeeded' as const,
        amount: 50000,
        error: 'some error',
        isLoading: true,
      }

      const state = paymentReducer(modifiedState, { type: 'RESET' })

      expect(state).toEqual(initialState)
    })
  })
})
```

#### E2E 테스트 (Playwright)

```typescript
// e2e/payment.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Payment Flow', () => {
  test('사용자가 결제를 완료할 수 있다', async ({ page }) => {
    // Given: 로그인된 사용자
    await page.goto('/auth/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // When: 결제 페이지로 이동하여 금액 입력
    await page.goto('/payment')
    await page.fill('[name="amount"]', '50000')
    await page.click('button[type="submit"]')

    // Then: 성공 메시지 확인
    await expect(page.locator('text=결제가 완료되었습니다')).toBeVisible()
    await expect(page).toHaveURL('/payment/success')
  })

  test('결제 금액이 0원 이하일 때 에러 메시지를 표시한다', async ({ page }) => {
    await page.goto('/payment')
    await page.fill('[name="amount"]', '0')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=결제 금액을 입력해주세요')).toBeVisible()
  })
})
```

### Phase 1 주의사항

#### 🚨 규모 확장 시 문제점

**1. 테스트 작성 어려움**
- Hook은 React 의존성이 강해 Integration Test만 가능
- Mock 설정이 복잡하고 시간 소요 (useSession, React Query 등)

**2. 비즈니스 로직 재사용 불가**
- Hook에 묶인 로직은 다른 컴포넌트나 Server Component에서 사용 불가
- 동일한 로직을 여러 Hook에서 중복 구현

**3. 복잡도 증가 시 유지보수 어려움**
- 100줄 넘는 Hook은 읽기 어려움
- 비즈니스 로직, API 호출, UI 로직이 혼재

#### 📊 전환 시점 지표

다음 중 **2개 이상** 해당하면 Phase 2로 전환 고려:

- [ ] 팀 크기가 4명 이상으로 증가
- [ ] Feature별 Hook이 150줄 이상
- [ ] 동일한 비즈니스 로직을 3개 이상의 Hook에서 중복 구현
- [ ] 신규 개발자 온보딩 시 Hook 이해에 1주 이상 소요
- [ ] 버그 수정 시 사이드 이펙트로 다른 기능이 깨지는 경우 빈번
- [ ] 테스트 커버리지가 40% 미만
- [ ] PMF를 찾아 제품이 안정화 단계 진입

---

## Phase 2: 성장기 스타트업

### 프로젝트 특성

- **목표**: 비즈니스 모델 확립, 사용자 증가, 기능 확장
- **팀**: 4-10명의 프론트엔드/백엔드 개발자
- **기간**: 6개월-2년
- **우선순위**: 구조 = 속도 > 테스트

### 아키텍처 패턴: Feature-Sliced Design + Service Functions

**선택 이유**:
- ✅ 균형잡힌 복잡도 (Clean Architecture보다 간단, Fat Hook보다 구조적)
- ✅ 빠른 개발 속도 유지 (Boilerplate 최소화)
- ✅ 테스트 가능 (순수 함수 Service Layer)
- ✅ 팀 온보딩 쉬움 (직관적인 구조)
- ✅ 재사용성 높음 (Service는 Hook 외부에서도 사용 가능)
- ⚠️ 대규모 확장 시 한계 (매우 복잡한 비즈니스 로직에는 부족)

### 디렉토리 구조

```
apps/web/src/
├── features/
│   └── payment/
│       ├── api/
│       │   ├── queries.ts           # React Query queries
│       │   └── mutations.ts          # React Query mutations
│       ├── services/                 # ✨ NEW: 비즈니스 로직 (순수 함수)
│       │   └── payment-service.ts
│       ├── lib/                      # ✨ NEW: Utilities
│       │   ├── validations.ts
│       │   └── transformers.ts
│       ├── hooks/                    # ✨ Thin Hooks (30-50줄)
│       │   └── usePayment.ts
│       ├── schemas/
│       │   └── payment.schema.ts
│       └── components/
│           └── PaymentForm.tsx
└── shared/
    └── ui/
```

### 마이그레이션 전략: Fat Hook → Service Layer

#### Step 1: 비즈니스 로직 추출 (Validation)

**Before (Fat Hook)**:
```typescript
// hooks/usePayment.ts (Fat Hook)
const processPayment = useCallback(async () => {
  // ❌ 비즈니스 로직이 Hook 안에 있음
  if (!session?.user?.id) {
    toast.error('로그인이 필요합니다.')
    return
  }

  if (state.amount <= 0) {
    toast.error('결제 금액을 입력해주세요.')
    return
  }

  if (state.amount > 1000000) {
    toast.error('결제 금액은 100만원을 초과할 수 없습니다.')
    return
  }

  // ... API 호출
}, [session, state.amount])
```

**After (Service Layer)**:
```typescript
// services/payment-service.ts (순수 함수)
export const PaymentService = {
  /**
   * 결제 요청 검증
   */
  validatePaymentRequest(userId: string | undefined, amount: number) {
    if (!userId) {
      return {
        isValid: false,
        errorMessage: '로그인이 필요합니다.',
      }
    }

    if (amount <= 0) {
      return {
        isValid: false,
        errorMessage: '결제 금액을 입력해주세요.',
      }
    }

    if (amount > 1000000) {
      return {
        isValid: false,
        errorMessage: '결제 금액은 100만원을 초과할 수 없습니다.',
      }
    }

    return { isValid: true }
  },
}

// hooks/usePayment.ts (Thin Hook)
const processPayment = useCallback(async () => {
  // ✅ 순수 함수 사용
  const validation = PaymentService.validatePaymentRequest(
    session?.user?.id,
    state.amount
  )

  if (!validation.isValid) {
    toast.error(validation.errorMessage)
    return
  }

  // ... API 호출
}, [session, state.amount])
```

#### Step 2: API 호출 로직 추출

**Before (Fat Hook)**:
```typescript
const processPayment = useCallback(async () => {
  // ... validation

  try {
    // ❌ API 호출 로직이 Hook 안에 있음
    const response = await processMutation.mutateAsync({
      processPaymentDto: {
        userId: session.user.id,
        amount: state.amount,
      },
    })

    if (!response.data) {
      throw new Error('결제 처리 중 오류가 발생했습니다.')
    }

    return response.data
  } catch (error) {
    const errorMessage = extractErrorMessage(error)
    throw new Error(errorMessage)
  }
}, [session, state.amount, processMutation])
```

**After (Service Layer)**:
```typescript
// services/payment-service.ts
export const PaymentService = {
  // ... validatePaymentRequest

  /**
   * 결제 처리
   *
   * @param apiClient - 의존성 주입을 통해 React Query mutation 전달
   */
  async processPayment(
    userId: string,
    amount: number,
    apiClient: { processPayment: (dto: any) => Promise<any> }
  ) {
    const response = await apiClient.processPayment({
      processPaymentDto: { userId, amount },
    })

    if (!response.data) {
      throw new Error('결제 처리 중 오류가 발생했습니다.')
    }

    return response.data
  },
}

// hooks/usePayment.ts (Thin Hook)
const processPayment = useCallback(async () => {
  const validation = PaymentService.validatePaymentRequest(
    session?.user?.id,
    state.amount
  )

  if (!validation.isValid) {
    toast.error(validation.errorMessage)
    return
  }

  try {
    // ✅ Service 함수 사용 (의존성 주입)
    const result = await PaymentService.processPayment(
      session!.user!.id,
      state.amount,
      { processPayment: processMutation.mutateAsync }
    )

    toast.success('결제가 완료되었습니다.')
    onComplete?.({ amount: state.amount })
  } catch (error) {
    const errorMessage = extractErrorMessage(error)
    toast.error(errorMessage)
  }
}, [session, state.amount, processMutation, onComplete])
```

### 최종 코드: Service Function Pattern

```typescript
// ============================================
// services/payment-service.ts (순수 함수)
// ============================================
export const PaymentService = {
  /**
   * 결제 요청 검증
   */
  validatePaymentRequest(userId: string | undefined, amount: number) {
    if (!userId) {
      return {
        isValid: false,
        errorMessage: '로그인이 필요합니다.',
      }
    }

    if (amount <= 0) {
      return {
        isValid: false,
        errorMessage: '결제 금액을 입력해주세요.',
      }
    }

    if (amount > 1000000) {
      return {
        isValid: false,
        errorMessage: '결제 금액은 100만원을 초과할 수 없습니다.',
      }
    }

    return { isValid: true }
  },

  /**
   * 결제 처리
   */
  async processPayment(
    userId: string,
    amount: number,
    apiClient: { processPayment: (dto: any) => Promise<any> }
  ) {
    const response = await apiClient.processPayment({
      processPaymentDto: { userId, amount },
    })

    if (!response.data) {
      throw new Error('결제 처리 중 오류가 발생했습니다.')
    }

    return response.data
  },

  /**
   * 결제 가능 여부 확인
   */
  canProcessPayment(amount: number, userBalance: number): boolean {
    return amount > 0 && amount <= userBalance
  },
}

// ============================================
// hooks/usePayment.ts (Thin Hook - 50줄)
// ============================================
import { useCallback, useReducer } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { PaymentService } from '../services/payment-service'
import { useProcessPayment } from '../api/mutations'

export interface UsePaymentProps {
  onComplete?: (data: { amount: number }) => void
}

export function usePayment({ onComplete }: UsePaymentProps = {}) {
  const { data: session } = useSession()
  const [state, dispatch] = useReducer(paymentReducer, initialState)
  const processMutation = useProcessPayment()

  const setAmount = useCallback((amount: number) => {
    dispatch({ type: 'SET_AMOUNT', payload: amount })
  }, [])

  const processPayment = useCallback(async () => {
    // ✅ Service 함수로 validation
    const validation = PaymentService.validatePaymentRequest(
      session?.user?.id,
      state.amount
    )

    if (!validation.isValid) {
      toast.error(validation.errorMessage)
      return
    }

    dispatch({ type: 'PROCESS_REQUEST' })

    try {
      // ✅ Service 함수로 API 호출
      const result = await PaymentService.processPayment(
        session!.user!.id,
        state.amount,
        { processPayment: processMutation.mutateAsync }
      )

      dispatch({ type: 'PROCESS_SUCCESS' })
      toast.success('결제가 완료되었습니다.')
      onComplete?.({ amount: state.amount })
    } catch (error: any) {
      const errorMessage = error.message || '결제에 실패했습니다.'
      dispatch({ type: 'PROCESS_FAILURE', payload: errorMessage })
      toast.error(errorMessage)
    }
  }, [state.amount, session, processMutation, onComplete])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return {
    amount: state.amount,
    stage: state.stage,
    isLoading: state.isLoading,
    error: state.error,
    setAmount,
    processPayment,
    reset,
  }
}
```

### Phase 2 테스트 전략

#### 목표 커버리지: 70-85%

**우선순위**:
1. **Service Function 단위 테스트** (90%+) - 순수 함수로 쉬움
2. **Lib/Utils 테스트** (95%+) - 순수 함수
3. **Integration Test** (주요 플로우)
4. **E2E Test** (Critical Path)

#### 예산 배분
- 개발 시간의 **20-30%**를 테스트에 투자
- Service Function 테스트: 4-6시간
- Integration Test: 2-3시간

#### 테스트 코드 예시

```typescript
// services/__tests__/payment-service.test.ts
import { describe, it, expect, vi } from 'vitest'
import { PaymentService } from '../payment-service'

describe('PaymentService', () => {
  describe('validatePaymentRequest', () => {
    it('should return error when userId is undefined', () => {
      const result = PaymentService.validatePaymentRequest(undefined, 50000)

      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe('로그인이 필요합니다.')
    })

    it('should return error when amount is 0', () => {
      const result = PaymentService.validatePaymentRequest('user123', 0)

      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe('결제 금액을 입력해주세요.')
    })

    it('should return error when amount exceeds limit', () => {
      const result = PaymentService.validatePaymentRequest('user123', 1500000)

      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe('결제 금액은 100만원을 초과할 수 없습니다.')
    })

    it('should return valid when userId and amount are correct', () => {
      const result = PaymentService.validatePaymentRequest('user123', 50000)

      expect(result.isValid).toBe(true)
    })
  })

  describe('processPayment', () => {
    it('should call API client with correct parameters', async () => {
      const mockApiClient = {
        processPayment: vi.fn(async () => ({
          data: { paymentId: 'payment123', status: 'succeeded' },
        })),
      }

      const result = await PaymentService.processPayment(
        'user123',
        50000,
        mockApiClient
      )

      expect(mockApiClient.processPayment).toHaveBeenCalledWith({
        processPaymentDto: {
          userId: 'user123',
          amount: 50000,
        },
      })
      expect(result.paymentId).toBe('payment123')
      expect(result.status).toBe('succeeded')
    })

    it('should throw error when response has no data', async () => {
      const mockApiClient = {
        processPayment: vi.fn(async () => ({ data: null })),
      }

      await expect(
        PaymentService.processPayment('user123', 50000, mockApiClient)
      ).rejects.toThrow('결제 처리 중 오류가 발생했습니다.')
    })
  })

  describe('canProcessPayment', () => {
    it('should return true when amount is valid and within balance', () => {
      const result = PaymentService.canProcessPayment(50000, 100000)

      expect(result).toBe(true)
    })

    it('should return false when amount exceeds balance', () => {
      const result = PaymentService.canProcessPayment(150000, 100000)

      expect(result).toBe(false)
    })

    it('should return false when amount is 0', () => {
      const result = PaymentService.canProcessPayment(0, 100000)

      expect(result).toBe(false)
    })
  })
})
```

### Phase 2 주의사항

#### 🚨 규모 확장 시 문제점

**1. 복잡한 도메인 로직 표현 한계**
- Service Function은 상태를 가질 수 없음 (순수 함수)
- 복잡한 비즈니스 규칙은 Class 기반 Domain Model이 더 적합

**2. 의존성 주입이 번거로움**
- 함수 파라미터로 의존성 전달 → 파라미터 개수 증가
- DI Container 없이는 테스트 시 Mock 설정 반복

**3. Service 간 의존성 관리 어려움**
- PaymentService가 OrderService를 사용해야 하는 경우
- 순환 참조 위험

#### 📊 전환 시점 지표

다음 중 **3개 이상** 해당하면 Phase 3로 전환 고려:

- [ ] 팀 크기가 10명 이상으로 증가
- [ ] 도메인 로직이 복잡해져 Service Function으로 표현 어려움
- [ ] Service 간 의존성이 3단계 이상 깊어짐
- [ ] 동일한 도메인 로직을 여러 곳에서 중복 구현
- [ ] 멀티 플랫폼 지원 (Web, Mobile, Desktop) 필요
- [ ] 5년 이상 장기 운영 예상
- [ ] 엔터프라이즈 고객 대상 제품

---

## Phase 3: 스케일업 / 중견 기업

### 프로젝트 특성

- **목표**: 엔터프라이즈급 복잡도, 장기 유지보수
- **팀**: 10+명 (여러 스쿼드)
- **기간**: 2년+ (장기 운영)
- **우선순위**: 유지보수 > 구조 > 속도

### 아키텍처 패턴: Clean Architecture + DI Container

**선택 이유**:
- ✅ 최고 수준의 유지보수성
- ✅ 명확한 레이어 분리 (Domain → Application → Infrastructure)
- ✅ 의존성 역전 (Ports & Adapters)
- ✅ 100% 테스트 커버리지 가능
- ✅ 멀티 플랫폼 지원 용이
- ⚠️ 높은 학습 곡선
- ⚠️ 많은 Boilerplate
- ⚠️ 개발 속도 느림

### 디렉토리 구조

```
apps/web/src/
├── features/
│   └── payment/
│       ├── domain/                   # ✨ Domain Layer (비즈니스 규칙)
│       │   ├── models/
│       │   │   └── Payment.ts        # Domain Entity (비즈니스 로직)
│       │   └── rules/
│       │       └── payment-validation.ts
│       ├── application/              # ✨ Application Layer (Use Cases)
│       │   ├── services/
│       │   │   └── PaymentService.ts # Use Case 구현
│       │   └── ports/                # 인터페이스 정의
│       │       ├── PaymentRepository.ts
│       │       └── NotificationService.ts
│       ├── infrastructure/           # ✨ Infrastructure Layer
│       │   ├── api/
│       │   │   └── payment-api-client.ts
│       │   └── repositories/
│       │       └── PaymentRepositoryImpl.ts
│       └── presentation/             # Presentation Layer (UI)
│           ├── hooks/
│           │   └── usePayment.ts     # Thin Hook (10-20줄)
│           └── components/
│               └── PaymentForm.tsx
└── shared/
    └── di/                           # ✨ DI Container
        └── container.ts
```

### 코드 예시

#### Domain Layer (비즈니스 규칙)

```typescript
// domain/models/Payment.ts
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export class Payment {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly status: PaymentStatus,
    public readonly createdAt: Date
  ) {
    this.validate()
  }

  /**
   * 비즈니스 규칙 검증
   */
  private validate() {
    if (this.amount <= 0) {
      throw new InvalidPaymentError('Amount must be positive')
    }

    if (this.amount > 1000000) {
      throw new InvalidPaymentError('Amount exceeds maximum limit')
    }
  }

  /**
   * 도메인 로직: 결제 취소 가능 여부
   */
  canCancel(): boolean {
    return this.status === PaymentStatus.PENDING ||
           this.status === PaymentStatus.PROCESSING
  }

  /**
   * 도메인 로직: 결제 상태 변경
   */
  markAsSucceeded(): Payment {
    if (this.status !== PaymentStatus.PROCESSING) {
      throw new InvalidPaymentStateError('Cannot mark as succeeded')
    }

    return new Payment(
      this.id,
      this.userId,
      this.amount,
      PaymentStatus.SUCCEEDED,
      this.createdAt
    )
  }

  markAsFailed(): Payment {
    if (this.status !== PaymentStatus.PROCESSING) {
      throw new InvalidPaymentStateError('Cannot mark as failed')
    }

    return new Payment(
      this.id,
      this.userId,
      this.amount,
      PaymentStatus.FAILED,
      this.createdAt
    )
  }
}

// domain/rules/payment-validation.ts
export const PaymentValidationRules = {
  validateAmount(amount: number): ValidationResult {
    if (amount <= 0) {
      return {
        isValid: false,
        errors: ['결제 금액은 0보다 커야 합니다.'],
      }
    }

    if (amount > 1000000) {
      return {
        isValid: false,
        errors: ['결제 금액은 100만원을 초과할 수 없습니다.'],
      }
    }

    return { isValid: true }
  },
}
```

#### Application Layer (Use Cases)

```typescript
// application/ports/PaymentRepository.ts (Interface)
export interface PaymentRepository {
  create(payment: Payment): Promise<Payment>
  findById(id: string): Promise<Payment | null>
  update(payment: Payment): Promise<Payment>
}

// application/ports/NotificationService.ts (Interface)
export interface NotificationService {
  sendPaymentConfirmation(payment: Payment): Promise<void>
}

// application/services/PaymentService.ts (Use Case)
import { injectable, inject } from 'tsyringe'

@injectable()
export class PaymentService {
  constructor(
    @inject('PaymentRepository')
    private repository: PaymentRepository,

    @inject('NotificationService')
    private notificationService: NotificationService,

    @inject('Logger')
    private logger: Logger
  ) {}

  /**
   * Use Case: 결제 처리
   */
  async processPayment(request: ProcessPaymentRequest): Promise<Payment> {
    this.logger.info('Processing payment', { request })

    // 1. 비즈니스 규칙 검증
    const validation = PaymentValidationRules.validateAmount(request.amount)
    if (!validation.isValid) {
      throw new ValidationError(validation.errors)
    }

    // 2. Domain Entity 생성
    const payment = new Payment(
      uuidv4(),
      request.userId,
      request.amount,
      PaymentStatus.PROCESSING,
      new Date()
    )

    // 3. 저장
    const savedPayment = await this.repository.create(payment)

    // 4. 후속 작업 (이벤트 발행)
    try {
      await this.notificationService.sendPaymentConfirmation(savedPayment)
    } catch (error) {
      this.logger.error('Failed to send notification', { error })
      // 알림 실패는 결제 실패로 이어지지 않음
    }

    return savedPayment.markAsSucceeded()
  }

  /**
   * Use Case: 결제 취소
   */
  async cancelPayment(paymentId: string): Promise<Payment> {
    const payment = await this.repository.findById(paymentId)

    if (!payment) {
      throw new PaymentNotFoundError(paymentId)
    }

    if (!payment.canCancel()) {
      throw new InvalidPaymentStateError('Cannot cancel this payment')
    }

    const cancelledPayment = new Payment(
      payment.id,
      payment.userId,
      payment.amount,
      PaymentStatus.CANCELLED,
      payment.createdAt
    )

    return this.repository.update(cancelledPayment)
  }
}
```

#### Infrastructure Layer (구현)

```typescript
// infrastructure/repositories/PaymentRepositoryImpl.ts
import { injectable } from 'tsyringe'
import type { PaymentRepository } from '../../application/ports/PaymentRepository'
import type { Payment } from '../../domain/models/Payment'

@injectable()
export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(
    private apiClient: ApiClient
  ) {}

  async create(payment: Payment): Promise<Payment> {
    const response = await this.apiClient.payments.create({
      userId: payment.userId,
      amount: payment.amount,
      status: payment.status,
    })

    return new Payment(
      response.id,
      response.userId,
      response.amount,
      response.status,
      new Date(response.createdAt)
    )
  }

  async findById(id: string): Promise<Payment | null> {
    try {
      const response = await this.apiClient.payments.getById(id)

      return new Payment(
        response.id,
        response.userId,
        response.amount,
        response.status,
        new Date(response.createdAt)
      )
    } catch (error) {
      if (error.status === 404) {
        return null
      }
      throw error
    }
  }

  async update(payment: Payment): Promise<Payment> {
    const response = await this.apiClient.payments.update(payment.id, {
      status: payment.status,
    })

    return new Payment(
      response.id,
      response.userId,
      response.amount,
      response.status,
      new Date(response.createdAt)
    )
  }
}
```

#### Presentation Layer (UI)

```typescript
// presentation/hooks/usePayment.ts (Thin Hook - 15줄)
import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Container } from '@/shared/di/container'
import { PaymentService } from '../../application/services/PaymentService'

export function usePayment() {
  const queryClient = useQueryClient()

  // DI Container에서 Service 해결
  const paymentService = useMemo(
    () => Container.resolve(PaymentService),
    []
  )

  const processMutation = useMutation({
    mutationFn: async (request: ProcessPaymentRequest) => {
      return paymentService.processPayment(request)
    },
    onSuccess: (payment) => {
      toast.success('결제가 완료되었습니다.')
      queryClient.invalidateQueries(['payments'])
    },
    onError: (error) => {
      const message = ErrorHandler.getErrorMessage(error)
      toast.error(message)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      return paymentService.cancelPayment(paymentId)
    },
    onSuccess: () => {
      toast.success('결제가 취소되었습니다.')
      queryClient.invalidateQueries(['payments'])
    },
  })

  return {
    processPayment: processMutation.mutate,
    cancelPayment: cancelMutation.mutate,
    isProcessing: processMutation.isPending,
    isCancelling: cancelMutation.isPending,
  }
}
```

#### DI Container 설정

```typescript
// shared/di/container.ts
import { container } from 'tsyringe'
import { PaymentService } from '@/features/payment/application/services/PaymentService'
import { PaymentRepositoryImpl } from '@/features/payment/infrastructure/repositories/PaymentRepositoryImpl'
import type { PaymentRepository } from '@/features/payment/application/ports/PaymentRepository'

// Repository 등록
container.register<PaymentRepository>('PaymentRepository', {
  useClass: PaymentRepositoryImpl,
})

// Service 등록 (자동 주입)
container.register(PaymentService, { useClass: PaymentService })

export const Container = container
```

### Phase 3 테스트 전략

#### 목표 커버리지: 85-95%

**우선순위**:
1. **Domain Layer** (100%) - 비즈니스 규칙은 완벽히 테스트
2. **Application Layer** (95%+) - Use Case 테스트
3. **Infrastructure Layer** (70%+) - Integration Test
4. **Presentation Layer** (30%+) - Integration Test만

#### 예산 배분
- 개발 시간의 **30-40%**를 테스트에 투자
- Domain Model 테스트: 6-8시간
- Application Service 테스트: 8-10시간
- Integration Test: 4-6시간

#### 테스트 코드 예시

```typescript
// domain/models/__tests__/Payment.test.ts
describe('Payment Domain Model', () => {
  describe('constructor validation', () => {
    it('should throw error when amount is 0', () => {
      expect(() => {
        new Payment('id', 'user123', 0, PaymentStatus.PENDING, new Date())
      }).toThrow(InvalidPaymentError)
    })

    it('should throw error when amount exceeds limit', () => {
      expect(() => {
        new Payment('id', 'user123', 1500000, PaymentStatus.PENDING, new Date())
      }).toThrow(InvalidPaymentError)
    })

    it('should create payment with valid amount', () => {
      const payment = new Payment(
        'id',
        'user123',
        50000,
        PaymentStatus.PENDING,
        new Date()
      )

      expect(payment.amount).toBe(50000)
    })
  })

  describe('canCancel', () => {
    it('should return true when status is PENDING', () => {
      const payment = new Payment(
        'id',
        'user123',
        50000,
        PaymentStatus.PENDING,
        new Date()
      )

      expect(payment.canCancel()).toBe(true)
    })

    it('should return false when status is SUCCEEDED', () => {
      const payment = new Payment(
        'id',
        'user123',
        50000,
        PaymentStatus.SUCCEEDED,
        new Date()
      )

      expect(payment.canCancel()).toBe(false)
    })
  })

  describe('markAsSucceeded', () => {
    it('should change status to SUCCEEDED', () => {
      const payment = new Payment(
        'id',
        'user123',
        50000,
        PaymentStatus.PROCESSING,
        new Date()
      )

      const succeededPayment = payment.markAsSucceeded()

      expect(succeededPayment.status).toBe(PaymentStatus.SUCCEEDED)
      expect(succeededPayment.id).toBe(payment.id)
    })

    it('should throw error when status is not PROCESSING', () => {
      const payment = new Payment(
        'id',
        'user123',
        50000,
        PaymentStatus.PENDING,
        new Date()
      )

      expect(() => payment.markAsSucceeded()).toThrow(InvalidPaymentStateError)
    })
  })
})

// application/services/__tests__/PaymentService.test.ts
describe('PaymentService', () => {
  let service: PaymentService
  let mockRepository: jest.Mocked<PaymentRepository>
  let mockNotificationService: jest.Mocked<NotificationService>
  let mockLogger: jest.Mocked<Logger>

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    }

    mockNotificationService = {
      sendPaymentConfirmation: jest.fn(),
    }

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    }

    service = new PaymentService(
      mockRepository,
      mockNotificationService,
      mockLogger
    )
  })

  describe('processPayment', () => {
    it('should create payment and send notification', async () => {
      const request: ProcessPaymentRequest = {
        userId: 'user123',
        amount: 50000,
      }

      mockRepository.create.mockResolvedValue(
        new Payment(
          'payment123',
          'user123',
          50000,
          PaymentStatus.PROCESSING,
          new Date()
        )
      )

      const result = await service.processPayment(request)

      expect(mockRepository.create).toHaveBeenCalled()
      expect(mockNotificationService.sendPaymentConfirmation).toHaveBeenCalled()
      expect(result.status).toBe(PaymentStatus.SUCCEEDED)
    })

    it('should throw validation error when amount is invalid', async () => {
      const request: ProcessPaymentRequest = {
        userId: 'user123',
        amount: 0,
      }

      await expect(service.processPayment(request)).rejects.toThrow(ValidationError)
    })

    it('should not fail when notification fails', async () => {
      const request: ProcessPaymentRequest = {
        userId: 'user123',
        amount: 50000,
      }

      mockRepository.create.mockResolvedValue(
        new Payment(
          'payment123',
          'user123',
          50000,
          PaymentStatus.PROCESSING,
          new Date()
        )
      )

      mockNotificationService.sendPaymentConfirmation.mockRejectedValue(
        new Error('Notification failed')
      )

      const result = await service.processPayment(request)

      expect(result.status).toBe(PaymentStatus.SUCCEEDED)
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('cancelPayment', () => {
    it('should cancel payment when status allows', async () => {
      const payment = new Payment(
        'payment123',
        'user123',
        50000,
        PaymentStatus.PENDING,
        new Date()
      )

      mockRepository.findById.mockResolvedValue(payment)
      mockRepository.update.mockResolvedValue(payment)

      const result = await service.cancelPayment('payment123')

      expect(result.status).toBe(PaymentStatus.CANCELLED)
      expect(mockRepository.update).toHaveBeenCalled()
    })

    it('should throw error when payment not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(service.cancelPayment('payment123')).rejects.toThrow(
        PaymentNotFoundError
      )
    })

    it('should throw error when payment cannot be cancelled', async () => {
      const payment = new Payment(
        'payment123',
        'user123',
        50000,
        PaymentStatus.SUCCEEDED,
        new Date()
      )

      mockRepository.findById.mockResolvedValue(payment)

      await expect(service.cancelPayment('payment123')).rejects.toThrow(
        InvalidPaymentStateError
      )
    })
  })
})
```

### Phase 3 주의사항

#### 🚨 과도한 엔지니어링 위험

**1. 불필요한 추상화**
- 간단한 CRUD에 Clean Architecture 적용은 과함
- 비즈니스 로직이 없는 경우 Service Function이 더 적합

**2. 팀 온보딩 시간 증가**
- 신규 개발자가 코드 이해에 2-3주 소요
- Domain-Driven Design 개념 학습 필요

**3. 개발 속도 저하**
- 새로운 기능 개발에 Phase 2 대비 1.5-2배 시간 소요
- Boilerplate 코드 작성 필요

#### 💡 유지 조건

Clean Architecture는 다음 조건에서만 정당화됨:

- ✅ 복잡한 비즈니스 규칙 (금융, 의료, 물류 등)
- ✅ 장기 운영 (5년+ 예상)
- ✅ 멀티 플랫폼 지원
- ✅ 대규모 팀 (10+명)
- ✅ 엔터프라이즈 고객 대상

위 조건이 **3개 미만**이면 Phase 2 유지 권장.

---

## 테스트 전략

### 테스트 피라미드

```
         /\
        /  \  E2E Tests (5%)
       /────\
      /      \  Integration Tests (15%)
     /────────\
    /          \  Unit Tests (80%)
   /────────────\
```

### Phase별 테스트 전략 비교

| 항목 | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| **단위 테스트** | Reducer (90%) | Service (90%), Lib (95%) | Domain (100%), Application (95%) |
| **통합 테스트** | 선택적 | 주요 플로우 | 모든 Use Case |
| **E2E 테스트** | Critical Path만 | Critical Path | Critical Path + 주요 시나리오 |
| **목표 커버리지** | 40-60% | 70-85% | 85-95% |
| **예산 (개발 시간)** | 10-15% | 20-30% | 30-40% |

### 테스트 도구

**모든 Phase 공통**:
- **Vitest**: 단위 테스트 (빠른 실행 속도)
- **Playwright**: E2E 테스트 (크로스 브라우저)
- **MSW (Mock Service Worker)**: API mocking
- **Storybook**: 컴포넌트 문서화

**Phase 2-3 추가**:
- **Testing Library**: React 컴포넌트 Integration Test
- **Contract Testing** (Phase 3): Pact.io

### 테스트 우선순위

#### High Priority (반드시 테스트)
- 비즈니스 로직 (Reducer, Service, Domain)
- Critical Path (로그인, 결제, 핵심 기능)
- 보안 관련 코드 (인증, 권한)

#### Medium Priority (선택적 테스트)
- Utility 함수
- Transformer 함수
- Integration Test

#### Low Priority (E2E로 대체 가능)
- UI 컴포넌트 단위 테스트
- Hook Integration Test

---

## 의사결정 프레임워크

### Phase 전환 결정 체크리스트

#### Phase 1 → Phase 2 전환

다음 중 **2개 이상** 해당 시 전환:

- [ ] **팀 확장**: 4명 이상으로 증가
- [ ] **코드 복잡도**: Feature별 Hook이 150줄 초과
- [ ] **중복 로직**: 동일한 비즈니스 로직이 3개 이상 Hook에서 중복
- [ ] **온보딩 시간**: 신규 개발자가 Hook 이해에 1주 이상 소요
- [ ] **버그 빈도**: 사이드 이펙트로 다른 기능이 깨지는 경우 주 1회 이상
- [ ] **테스트 어려움**: 테스트 커버리지 40% 미만
- [ ] **제품 안정화**: PMF 찾아 안정화 단계 진입

**예상 마이그레이션 기간**: 2-3개월 (점진적)

#### Phase 2 → Phase 3 전환

다음 중 **3개 이상** 해당 시 전환:

- [ ] **대규모 팀**: 10명 이상으로 증가
- [ ] **복잡한 도메인**: Service Function으로 표현 어려운 비즈니스 규칙
- [ ] **깊은 의존성**: Service 간 의존성이 3단계 이상
- [ ] **중복 로직**: 동일한 도메인 로직이 여러 곳에서 중복
- [ ] **멀티 플랫폼**: Web, Mobile, Desktop 지원 필요
- [ ] **장기 운영**: 5년 이상 장기 운영 예상
- [ ] **엔터프라이즈**: B2B 엔터프라이즈 고객 대상

**예상 마이그레이션 기간**: 6-12개월 (전면 리팩토링)

### 현재 단계 유지 판단

#### Phase 1 유지

다음 조건에서 Phase 1 유지 권장:

- ✅ MVP 단계, 빠른 실험 필요
- ✅ 팀 크기 1-3명
- ✅ 6개월 이내 피봇 가능성
- ✅ 비즈니스 로직 단순

#### Phase 2 유지

다음 조건에서 Phase 2 유지 권장:

- ✅ 비즈니스 모델 확립
- ✅ 팀 크기 4-10명
- ✅ 중간 복잡도 비즈니스 로직
- ✅ 단일 플랫폼 (Web only)

#### Phase 3 전환 보류

다음 경우 Phase 3 전환 보류:

- ⚠️ 팀이 10명 미만
- ⚠️ 비즈니스 로직이 단순
- ⚠️ 단기 프로젝트 (2년 미만)
- ⚠️ 빠른 개발 속도가 중요

---

## CotePT 프로젝트 적용 계획

### 현재 상태 진단

**Phase**: 1 (Fat Hooks with Reducer)

**강점**:
- ✅ Reducer 잘 분리되어 있음 (테스트 가능)
- ✅ Feature-Sliced Design 구조
- ✅ TypeScript strict 모드

**개선 필요**:
- ⚠️ 비즈니스 로직이 Hook에 혼재
- ⚠️ 테스트 커버리지 낮음 (예상 20-30%)
- ⚠️ 재사용성 낮음

### 목표 상태

**Phase**: 2 (Service Functions)

**이유**:
- 팀 크기: 현재 1-2명, 6개월 내 4-5명 예상
- 프로젝트 복잡도: 중간 (실시간 멘토링, WebRTC)
- 장기 운영: 2-3년 예상
- 테스트 필요성: 높음 (결제, 멘토링 세션)

### 마이그레이션 로드맵

#### Week 1-2: 기반 작업
1. **Reducer 테스트 작성** (모든 기존 Hook)
   - `useBaekjoonVerify` Reducer 테스트
   - `useProfileSetup` Reducer 테스트
   - `useMentorOnboarding` Reducer 테스트
   - 예상 시간: 6-8시간

2. **팀 컨벤션 문서화**
   - Service Function 패턴 가이드 작성
   - 코드 리뷰 체크리스트 작성
   - 예상 시간: 4시간

#### Week 3-4: 신규 Feature 적용
3. **신규 Feature는 Service Pattern 적용**
   - 멘토링 세션 관리 (`features/session`)
   - 실시간 코드 에디터 (`features/editor`)
   - 예상 시간: 신규 개발 시간과 동일 (오버헤드 없음)

#### Month 2: 기존 Feature 리팩토링 (우선순위 높은 것부터)
4. **Phase 1: `useBaekjoonVerify` 리팩토링**
   - `services/baekjoon-verification-service.ts` 생성
   - Validation 로직 추출
   - API 호출 로직 추출
   - 테스트 작성 (Service Function)
   - 예상 시간: 4-6시간

5. **Phase 2: `useProfileSetup` 리팩토링**
   - `services/profile-setup-service.ts` 생성
   - 이미지 업로드 로직 추출
   - 테스트 작성
   - 예상 시간: 4-6시간

#### Month 3-6: 점진적 리팩토링
6. **나머지 Feature 리팩토링**
   - 주 1-2개 Feature씩 점진적 리팩토링
   - 우선순위: 버그가 많은 Feature > 복잡한 Feature > 단순한 Feature

### 예상 효과

#### 개발 속도
- **단기 (1-2개월)**: 20% 느려짐 (학습 비용)
- **중기 (3-6개월)**: 동일
- **장기 (6개월+)**: 30% 빨라짐 (재사용성, 버그 감소)

#### 테스트 커버리지
- **현재**: 20-30%
- **목표 (6개월)**: 70-80%

#### 버그 발생률
- **현재**: 주 2-3건
- **목표 (6개월)**: 주 0-1건

### 리스크 & 대응

| 리스크 | 확률 | 영향 | 대응 방안 |
|--------|------|------|----------|
| 팀원 반발 | 중 | 중 | 페어 프로그래밍, 교육 세션 |
| 개발 속도 저하 | 높음 | 중 | 점진적 적용, 신규 Feature만 |
| 테스트 작성 시간 부족 | 중 | 높음 | Critical Path만 테스트 |
| 레거시 코드 방치 | 중 | 낮음 | 버그 발생 시 리팩토링 |

---

## 현업 사례 연구

### Cal.com (Scheduling Platform)

**규모**: Series A, 10-20명
**패턴**: FSD + Service Functions
**이유**: 빠른 개발 속도 + 테스트 가능성

**코드 스타일**:
```typescript
// apps/web/features/bookings/services/booking-service.ts
export const BookingService = {
  async createBooking(data: CreateBookingInput) {
    const validation = BookingValidationRules.validate(data)
    if (!validation.isValid) {
      throw new ValidationError(validation.errors)
    }

    const booking = await prisma.booking.create({ data })
    await sendBookingConfirmation(booking)

    return booking
  }
}
```

**교훈**:
- ✅ Service Function으로도 충분히 복잡한 로직 처리 가능
- ✅ 빠른 개발 속도 유지하면서 테스트 커버리지 80%+ 달성

### Plane.so (Jira Alternative)

**규모**: Series B, 20-30명
**패턴**: Clean Architecture (Partial)
**이유**: 복잡한 프로젝트 관리 도메인, 장기 운영

**코드 스타일**:
```typescript
// features/issues/domain/Issue.ts
export class Issue {
  constructor(public readonly id: string, public title: string) {}

  validate() {
    if (this.title.length < 3) {
      throw new InvalidIssueTitleError()
    }
  }
}

// features/issues/application/IssueService.ts
export class IssueService {
  constructor(private repository: IssueRepository) {}

  async createIssue(data: CreateIssueDTO): Promise<Issue> {
    const issue = new Issue(uuid(), data.title)
    issue.validate()
    return this.repository.save(issue)
  }
}
```

**교훈**:
- ✅ Clean Architecture는 복잡한 도메인에 효과적
- ⚠️ 학습 곡선이 가파름 (신규 개발자 온보딩 2-3주)

### Linear (Project Management)

**규모**: Series B, 30-50명
**패턴**: Hybrid (Service + Domain Model)
**이유**: 복잡도에 따라 유연하게 적용

**교훈**:
- ✅ 모든 Feature에 동일한 패턴을 강제할 필요 없음
- ✅ 간단한 CRUD는 Service Function, 복잡한 로직은 Domain Model

---

## FAQ

### Q1: 언제 리팩토링을 시작해야 하나요?

**A**: 다음 신호가 보이면 시작하세요.

- **개발 속도 저하**: 새로운 기능 추가에 예상보다 2배 이상 시간 소요
- **버그 빈도 증가**: 주 2-3건 이상 버그 발생
- **온보딩 어려움**: 신규 개발자가 코드 이해에 1주 이상 소요
- **테스트 불가능**: 테스트 작성이 너무 어려워 커버리지 40% 미만

**전략**: 전면 리팩토링보다 **점진적 리팩토링** 권장. 신규 Feature부터 새 패턴 적용하고, 기존 코드는 버그 발생 시 리팩토링.

### Q2: 테스트 커버리지 목표가 현실적인가요?

**A**: 단계별로 다릅니다.

| Phase | 목표 | 현실성 |
|-------|------|--------|
| Phase 1 | 40-60% | ✅ 현실적 (Reducer + E2E만) |
| Phase 2 | 70-85% | ✅ 현실적 (Service Function 덕분) |
| Phase 3 | 85-95% | ✅ 현실적 (Domain/Application Layer) |

**중요**: 100% 커버리지는 불필요. **Critical Path**와 **비즈니스 로직**만 집중 테스트.

### Q3: 팀원들이 새로운 패턴을 거부하면?

**A**: 다음 전략을 사용하세요.

1. **점진적 도입**: 신규 Feature만 새 패턴 적용
2. **페어 프로그래밍**: 함께 코드 작성하며 학습
3. **교육 세션**: 주 1회 1시간 세션 (총 4주)
4. **성공 사례 공유**: 리팩토링 후 버그 감소, 개발 속도 향상 데이터 공유
5. **코드 리뷰**: Pull Request에서 패턴 피드백

**실패 시**: 무리하게 강제하지 말고, 팀의 현재 수준에 맞는 패턴 선택.

### Q4: 레거시 코드는 어떻게 처리하나요?

**A**: **점진적 마이그레이션** 전략.

```
┌─────────────────────────────────────────────┐
│ 신규 Feature                                │
│ ✅ 새로운 패턴 (Service Functions)         │
├─────────────────────────────────────────────┤
│ 기존 Feature (버그 있음)                   │
│ 🔄 버그 발생 시 리팩토링                   │
├─────────────────────────────────────────────┤
│ 기존 Feature (안정적)                      │
│ ⏸️  유지 (굳이 리팩토링 불필요)            │
└─────────────────────────────────────────────┘
```

**원칙**: "동작하는 코드는 건드리지 않는다" (Chesterton's Fence)

### Q5: Clean Architecture가 항상 좋은 건 아닌가요?

**A**: 아닙니다. **과도한 엔지니어링** 위험이 있습니다.

**Clean Architecture가 과한 경우**:
- ❌ 간단한 CRUD 애플리케이션
- ❌ MVP 단계 (빠른 실험 필요)
- ❌ 팀 크기 10명 미만
- ❌ 단기 프로젝트 (2년 미만)

**Clean Architecture가 필요한 경우**:
- ✅ 복잡한 비즈니스 규칙 (금융, 의료, 물류)
- ✅ 장기 운영 (5년+)
- ✅ 멀티 플랫폼 (Web, Mobile, Desktop)
- ✅ 대규모 팀 (10+명)

**핵심**: 프로젝트 특성에 맞는 패턴 선택이 중요. 모든 프로젝트에 Clean Architecture를 적용할 필요는 없음.

---

## 참고 자료

### 외부 문서
- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Testing Library 공식 문서](https://testing-library.com/)
- [Vitest 공식 문서](https://vitest.dev/)

### 관련 프로젝트 문서
- [frontend-architecture-guide.md](./frontend-architecture-guide.md) - CotePT 프론트엔드 아키텍처 가이드
- [test-guidelines.md](../test/test-guidelines.md) - 테스트 원칙 가이드
- [CLAUDE.md](../../CLAUDE.md) - 프로젝트 전체 가이드

### 추천 학습 자료
- [Kent C. Dodds - Testing React Hooks](https://kentcdodds.com/blog/how-to-test-custom-react-hooks)
- [Cal.com GitHub Repository](https://github.com/calcom/cal.com)
- [Plane.so GitHub Repository](https://github.com/makeplane/plane)

---

**마지막 업데이트**: 2025-01-10
**작성자**: CotePT Development Team
**버전**: 1.0.0
**다음 리뷰**: 2025-04-10 (3개월 후)
