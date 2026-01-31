# CotePT Frontend — Sitemap & Routing Guide

> **Last Updated**: 2026-01-28
> **Branch**: fix/silent-refresh
> **Source of Truth**: `apps/web/src/proxy/config/routes.ts`

---

## 1. Route Classification

모든 라우트는 `routes.ts`에서 중앙 관리됩니다.

| 분류 | 경로 | 비로그인 접근 | 로그인 접근 |
|------|------|:---:|:---:|
| **Public** | `/` | ✅ | ✅ |
| **Public** | `/landing` | ✅ | ✅ |
| **Public** | `/main` | ✅ | ✅ |
| **Public** | `/auth/signin` | ✅ | → `/main` |
| **Public** | `/auth/signup` | ✅ | → `/main` |
| **Public** | `/auth/error` | ✅ | ✅ |
| **Public** | `/api/auth` | ✅ | ✅ |
| **Protected** | `/onboarding` | → `/auth/signin` | ✅ (Guard 적용) |
| **Protected** | `/mentoring` | → `/auth/signin` | ✅ (Guard 적용) |
| **Protected** | `/my` | → `/auth/signin` | ✅ (Guard 적용) |

---

## 2. Link Graph (전체 네비게이션 흐름)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        비로그인 상태                                  │
│                                                                     │
│  / (Landing)                                                        │
│  ├── [로그인]     → /auth/signin                                    │
│  ├── [회원가입]   → /auth/signup                                    │
│  └── [둘러보기]   → /main                                           │
│                                                                     │
│  /main                                                              │
│  ├── [로그인]     → /auth/signin                                    │
│  └── [회원가입]   → /auth/signup                                    │
│                                                                     │
│  /auth/signin                                                       │
│  ├── [로그인 성공] → session.update(ONBOARDING_UPDATE) → /main      │
│  └── [회원가입]   → /auth/signup                                    │
│                                                                     │
│  /auth/signup                                                       │
│  └── [단계별 진행] → ?step=terms-agreement                          │
│       → ?step=enter-email                                           │
│       → ?step=verify-email                                          │
│       → ?step=set-userid                                            │
│       → ?step=set-password                                          │
│       → ?step=signup-complete → /onboarding                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  로그인 + 온보딩 미완료 상태                            │
│                                                                     │
│  /main, /landing, /                                                 │
│  └── 자유 접근 가능 (둘러보기) ✅                                     │
│                                                                     │
│  /mentoring, /my  (Protected 경로)                                  │
│  └── OnboardingGuard → /onboarding (납치)                           │
│                                                                     │
│  /onboarding                                                        │
│  └── [단계별 진행] → ?step=profile-setup                            │
│       → ?step=baekjoon-verify                                       │
│       ├── [백준 건너뛰기] → ?step=complete                          │
│       └── [백준 인증 완료]                                           │
│            ├── [멘토 제안 수락] → ?step=mentor-setup                 │
│            │    └── → ?step=complete                                 │
│            └── [멘토 제안 거부] → ?step=complete                     │
│                                                                     │
│  /onboarding?step=complete                                          │
│  └── [시작하기] → session.update(ONBOARDING_UPDATE)                 │
│       ├── 멘토 선택 시 → /mentoring                                  │
│       └── 멘티 선택 시 → /main                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  로그인 + 온보딩 완료 상태                              │
│                                                                     │
│  모든 Public & Protected 경로 자유 접근                                │
│                                                                     │
│  /onboarding (접근 시도)                                            │
│  └── OnboardingGuard → /main (강제 리다이렉트)                       │
│                                                                     │
│  GlobalHeader (공통)                                                 │
│  ├── [로고]       → /                                               │
│  └── UserMenu                                                       │
│       ├── [대시보드]  → /dashboard  (미구현)                         │
│       ├── [마이페이지] → /mypage    (미구현)                         │
│       └── [로그아웃]  → signOut → /main                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Proxy (Middleware) 실행 순서

`apps/web/src/proxy.ts`에서 우선순위 순으로 처리됩니다.

```
Request 진입
    │
    ▼
┌─────────────────────────────────┐
│ Priority 1: Guard 체크           │  ← 로그인 상태일 때만 실행
│ (OnboardingGuard)                │
│                                  │
│ • 온보딩 완료 + /onboarding     │→ /main
│ • 온보딩 미완료 + Protected 경로 │→ /onboarding
│ • 그 외                         │→ 통과 (null 반환)
└──────────────┬──────────────────┘
               │ 통과
               ▼
┌─────────────────────────────────┐
│ Priority 2: Public Route 체크    │
│                                  │
│ /main, /, /landing, /auth/* 등  │→ NextResponse.next()
└──────────────┬──────────────────┘
               │ 비 Public
               ▼
┌─────────────────────────────────┐
│ Priority 3: Auth Route 체크      │
│                                  │
│ /auth/signin, /auth/signup       │
│ • 로그인 상태                   │→ /main
│ • 비로그인 상태                 │→ NextResponse.next()
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ Priority 4: Protected Route 체크 │
│                                  │
│ /onboarding, /mentoring, /my    │
│ • 비로그인 상태                 │→ /auth/signin?callbackUrl=...
│ • 로그인 상태                   │→ NextResponse.next()
└─────────────────────────────────┘
```

> **핵심 설계 원칙**: Guard는 **Protected 경로에만** 납치를 적용합니다.
> Public 경로(`/main`)는 온보딩 미완료 유저도 자유롭게 접근할 수 있습니다 (둘러보기).

---

## 4. OnboardingGuard 설계 원칙

`apps/web/src/proxy/guards/onboarding.guard.ts`

| 조건 | 행동 | 근거 |
|------|------|------|
| 온보딩 완료 + `/onboarding` 접근 | → `/main` | 완료된 유저는 온보딩 재진입 불가 |
| 온보딩 미완료 + Protected 경로 접근 | → `/onboarding` | 핵심 기능 사용 전 최소 온보딩 필수 |
| 온보딩 미완료 + Public 경로 접근 | 통과 | 둘러보기 경험 보장 |

Guard가 **route classification의 책임을 가지지 않고** `isProtectedRoute()`를 위임하여, 라우트 정의는 `routes.ts` (Source of Truth)에 집중됩니다.

---

## 5. Session Update & 온보딩 상태 동기화

온보딩 완료 후 Proxy Guard가 올바르게 동작하려면 **세션에 `onboardingCompleted` 플래그**가 반영되어야 합니다.

```
OnboardingCompleteStep 완료 클릭
    │
    ▼
session.update({ trigger: "ONBOARDING_UPDATE" })
    │
    ▼
jwt callback → OnboardingUpdateStrategy.syncOnboardingState()
    │                   │
    │                   ▼
    │           API: GET /onboarding/state
    │                   │
    │                   ▼
    │           token.member.onboardingCompleted = true
    ▼
router.push("/mentoring" | "/main")
    │
    ▼
Proxy Guard: onboardingCompleted === true → 통과 ✅
```

---

## 6. 미구현 경로 (Backlog)

| 경로 | 현재 상태 | 참조 |
|------|-----------|------|
| `/dashboard` | UserMenu에서 링크 존재, 페이지 미구현 | - |
| `/mypage` | UserMenu에서 링크 존재, 페이지 미구현 | - |
| `/auth/find-password` | SignInForm에서 링크 존재, 페이지 미구현 | - |
| `/auth/error` | 라우트 정의 존재, 구현 여부 확인 필요 | - |

---

## 7. 관련 파일 지도

| 역할 | 파일 |
|------|------|
| 라우트 분류 (Source of Truth) | `apps/web/src/proxy/config/routes.ts` |
| 미들웨어 실행 | `apps/web/src/proxy.ts` |
| 온보딩 가드 | `apps/web/src/proxy/guards/onboarding.guard.ts` |
| Guard 인터페이스 | `apps/web/src/proxy/guards/guard.interface.ts` |
| 경로 매칭 헬퍼 | `apps/web/src/proxy/lib/helpers.ts` |
| NextAuth 설정 | `apps/web/src/auth.ts` |
| JWT/세션 콜백 | `apps/web/src/shared/auth/callbacks/callbacks.ts` |
| 온보딩 동기화 전략 | `apps/web/src/shared/auth/strategies/onboarding-update.strategy.ts` |
| 온보딩 완료 컴포넌트 | `apps/web/src/features/onboarding/components/OnboardingCompleteStep.tsx` |
| 온보딩 라우터 훅 | `apps/web/src/features/onboarding/hooks/useOnboardingRouter.ts` |
| 글로벌 헤더 | `apps/web/src/shared/ui/layout/GlobalHeader.tsx` |
| 사용자 메뉴 | `apps/web/src/shared/ui/layout/UserMenu.tsx` |
