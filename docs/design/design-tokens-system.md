# 🎨 CotePT 디자인 토큰 시스템

CotePT 프로젝트의 Tailwind CSS v4 기반 디자인 토큰 시스템 문서입니다.

## 📋 시스템 개요

### 구현 파일
- `packages/shared/src/styles/globals.css`
- 기존 shadcn/ui 스타일과 통합

### 핵심 철학
- **일관성**: 모든 인증 페이지에서 동일한 브랜드 경험
- **확장성**: 새로운 컴포넌트 추가 시 기존 토큰 재사용
- **유지보수성**: 토큰 수정만으로 전체 디자인 업데이트

## 🎯 디자인 토큰 구조

### 1. Brand Colors (브랜드 색상)

```css
@theme {
  /* CotePT 브랜드 컬러 (기존 OKLCH 유지) */
  --color-brand-purple: oklch(0.646 0.222 41.116);  /* 메인 보라색 */
  --color-brand-pink: oklch(0.769 0.188 70.08);     /* 보조 분홍색 */
  --color-brand-blue: oklch(0.398 0.07 227.392);    /* 액센트 파랑색 */
}
```

**사용 방법:**
```tsx
// 자동 생성된 유틸리티 클래스 사용
<div className="bg-brand-purple text-white">
<div className="border-brand-pink">
<div className="text-brand-blue">
```

### 2. Auth Palette (인증 전용 색상)

```css
@theme {
  /* Auth 페이지 전용 색상 팔레트 */
  --color-auth-surface: rgb(39 39 42 / 0.5);    /* bg-zinc-800/50 */
  --color-auth-border: rgb(63 63 70 / 0.5);     /* border-zinc-700/50 */
  --color-auth-input: rgb(55 65 81 / 0.5);      /* bg-zinc-700/50 */
}
```

**사용 예시:**
```tsx
// 인증 카드 배경
<div className="bg-auth-surface border border-auth-border">

// 인증 입력 필드
<input className="bg-auth-input border-auth-border" />
```

### 3. Component Sizing (컴포넌트 크기)

```css
@theme {
  /* Auth 컴포넌트 표준 크기 */
  --size-auth-input: 2.75rem;     /* h-11, 44px */
  --size-auth-button: 3rem;       /* h-12, 48px */
  --size-auth-card: 28rem;        /* max-w-md, 448px */
}
```

**사용 방법:**
```tsx
// 표준 버튼 높이
<button className="h-auth-button">

// 표준 입력 필드 높이
<input className="h-auth-input">

// 표준 카드 최대 너비
<div className="max-w-auth-card">
```

### 4. Spacing Scale (여백 체계)

```css
@theme {
  /* Auth 레이아웃 표준 여백 */
  --spacing-auth-gap: 1rem;         /* space-y-4, 16px */
  --spacing-auth-container: 1.5rem; /* space-y-6, 24px */
  --spacing-auth-padding: 1.75rem;  /* p-7, 28px */
}
```

**사용 예시:**
```tsx
// 폼 요소 간격
<form className="space-y-auth-gap">

// 컨테이너 요소 간격
<div className="space-y-auth-container">

// 카드 내부 여백
<div className="p-auth-padding">
```

### 5. Typography (타이포그래피)

```css
@theme {
  /* CotePT 전용 폰트 스택 */
  --font-display: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

**사용 방법:**
```tsx
// 브랜드 폰트 적용
<h1 className="font-display">COTEPT</h1>
```

## 📱 컴포넌트 패턴

### Auth 컨테이너 레이아웃

```tsx
export function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-auth-card">
        {/* 로고 */}
        <h1 className="mb-6 bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-3xl font-bold text-transparent text-center">
          COTEPT
        </h1>

        {/* 메인 카드 */}
        <div className="space-y-auth-container rounded-xl border border-auth-border bg-auth-surface p-auth-padding">
          {children}
        </div>
      </div>
    </div>
  )
}
```

### Auth 입력 필드 스타일

```tsx
export function AuthInput(props) {
  return (
    <input
      {...props}
      className={cn(
        "h-auth-input w-full rounded-lg",
        "bg-auth-input border-zinc-600 text-white",
        "placeholder:text-base placeholder:text-zinc-400",
        "focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/20",
        "transition-colors duration-200",
        props.className
      )}
    />
  )
}
```

### Auth 버튼 Variants

```tsx
// Primary 버튼 (메인 액션)
<button className="h-auth-button w-full rounded-lg bg-brand-purple text-white font-medium hover:bg-brand-purple/90 transition-colors">
  로그인
</button>

// Secondary 버튼 (보조 액션)
<button className="h-auth-button w-full rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition-colors">
  중복 확인
</button>

// Gradient 버튼 (특별 액션)
<button className="h-auth-button w-full rounded-lg bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold hover:from-brand-purple/90 hover:to-brand-pink/90 transition-all">
  가입 완료
</button>
```

## 🎨 브랜드 아이덴티티 요소

### 로고 스타일

```css
/* COTEPT 로고 표준 스타일 */
.cotept-logo {
  background: linear-gradient(135deg, var(--color-brand-purple), var(--color-brand-pink));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.875rem;  /* text-3xl */
  font-weight: 700;     /* font-bold */
  text-align: center;
}
```

### 그라데이션 패턴

```css
/* 브랜드 그라데이션 정의 */
.gradient-brand-primary {
  background: linear-gradient(135deg, var(--color-brand-purple), var(--color-brand-pink));
}

.gradient-brand-text {
  background: linear-gradient(135deg, var(--color-brand-purple), var(--color-brand-pink));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 🔧 사용 가이드

### 새로운 Auth 페이지 생성 시

```tsx
// 1. AuthLayout으로 감싸기
function NewAuthPage() {
  return (
    <AuthLayout>
      {/* 2. 표준 spacing 적용 */}
      <form className="space-y-auth-gap">

        {/* 3. 표준 컴포넌트 사용 */}
        <div className="space-y-2">
          <label className="text-zinc-300">라벨</label>
          <AuthInput placeholder="입력하세요" />
        </div>

        {/* 4. 표준 버튼 사용 */}
        <button className="auth-button-primary">
          확인
        </button>
      </form>
    </AuthLayout>
  )
}
```

### 기존 컴포넌트 마이그레이션

```tsx
// Before (하드코딩된 스타일)
<div className="bg-zinc-800/50 border-zinc-700/50 p-7 rounded-xl">

// After (토큰 기반)
<div className="bg-auth-surface border-auth-border p-auth-padding rounded-xl">
```

## 📊 토큰 활용 통계

| 카테고리 | 토큰 수 | 자동 생성 클래스 |
|---------|---------|-----------------|
| Colors | 6개 | 36개 (bg-, text-, border- 등) |
| Sizes | 3개 | 12개 (w-, h-, max-w- 등) |
| Spacing | 3개 | 18개 (p-, m-, space-y- 등) |
| Typography | 1개 | 3개 (font-display) |

## 🚨 주의사항

### CSS Linter 경고
현재 VS Code에서 `@theme` 디렉티브에 대한 경고가 표시될 수 있습니다:
- `⚠ Unknown at rule @theme`
- 이는 Tailwind v4가 아직 안정 버전이 아니기 때문
- 기능적으로는 정상 작동

### 브라우저 호환성
- OKLCH 색상: 모던 브라우저만 지원 (IE 미지원)
- CSS 변수: IE 11+ 지원
- @theme 디렉티브: Tailwind CSS 처리 후 표준 CSS로 변환

### 마이그레이션 주의점
- 기존 하드코딩된 색상값을 점진적으로 토큰으로 대체
- shadcn/ui 기본 토큰과의 충돌 방지
- 다크모드 지원 확인 필요

---

> **업데이트 기록**
> - 2025-01-14: 초기 토큰 시스템 구축
> - 기존 signup 컴포넌트 패턴 분석 완료
> - Tailwind v4 @theme 디렉티브 적용