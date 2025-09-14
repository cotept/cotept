# 🎓 Tailwind CSS v4 학습 로드맵

CotePT 프로젝트를 위한 Tailwind CSS v4 디자인 토큰 시스템 학습 가이드입니다.

## 📚 1단계: 기초 개념 (1-2주)

### A. Tailwind v4 핵심 변화 이해

**📖 학습 자료:**
- [Tailwind CSS v4 공식 문서](https://tailwindcss.com/blog/tailwindcss-v4)
- [v3 vs v4 차이점 정리](https://tailwindcss.com/docs/theme)

**핵심 개념:**
- ✅ **CSS-First 설정**: JavaScript config → CSS @theme
- ✅ **@theme 디렉티브**: `@theme { --color-primary: red; }`
- ✅ **자동 유틸리티 생성**: `--color-brand-purple` → `bg-brand-purple`

### B. @theme 디렉티브 실습

```css
/* 간단한 실습 예제 */
@theme {
  --color-custom: blue;
  --size-custom: 2rem;
  --spacing-custom: 1rem;
}

/* 이제 사용 가능: */
/* bg-custom, text-custom, w-custom, p-custom */
```

## 🎨 2단계: OKLCH 색상 시스템 (1주)

### A. OKLCH 기본 이해

```css
/* OKLCH 구조: oklch(명도 채도 색조) */
oklch(0.7 0.15 180)
/*   │    │    └── 색조 (Hue): 0-360도
     │    └────── 채도 (Chroma): 0-0.4
     └─────────── 명도 (Lightness): 0-1 */
```

**색조 각도 참고:**
- 🔴 **Red**: 0° ~ 30°
- 🟠 **Orange**: 30° ~ 60°
- 🟡 **Yellow**: 60° ~ 120°
- 🟢 **Green**: 120° ~ 180°
- 🔵 **Blue**: 180° ~ 270°
- 🟣 **Purple**: 270° ~ 330°
- 🩷 **Pink**: 330° ~ 360°

### B. CotePT 브랜드 색상 분석

```css
/* 현재 CotePT 색상들 */
--color-brand-purple: oklch(0.646 0.222 41.116);  /* 이상한 각도? */
--color-brand-pink: oklch(0.769 0.188 70.08);     /* 이상한 각도? */

/* 정상적인 Purple/Pink 각도 */
--color-purple-proper: oklch(0.646 0.222 280);    /* 280도 = 보라색 */
--color-pink-proper: oklch(0.769 0.188 340);      /* 340도 = 분홍색 */
```

**학습 도구:**
- [OKLCH 색상 피커](https://oklch.com/)
- 색상 팔레트 생성기 사용해보기

## 🧩 3단계: Container Queries (1-2주)

### A. 기본 개념

```css
/* 미디어 쿼리 vs 컨테이너 쿼리 */

/* 기존 방식 (화면 크기 기준) */
@media (min-width: 768px) {
  .card { padding: 2rem; }
}

/* v4 방식 (컨테이너 크기 기준) */
.container {
  container-type: inline-size;  /* 컨테이너 쿼리 활성화 */
}

@container (min-width: 400px) {
  .card { padding: 2rem; }
}
```

### B. CotePT 적용 예시

```css
.auth-container {
  container-type: inline-size;
}

.auth-card {
  padding: 1.5rem;

  /* 컨테이너가 500px 이상일 때만 여백 증가 */
  @container (min-width: 500px) {
    padding: 2rem;
  }
}
```

## 🎯 4단계: 커스텀 유틸리티 (1주)

### A. @layer 활용

```css
@layer components {
  .btn-auth {
    @apply bg-brand-purple text-white px-4 py-2 rounded-lg
           hover:bg-brand-purple/90 transition-colors;
  }
}

@layer utilities {
  .text-gradient-brand {
    background: linear-gradient(135deg, theme(colors.brand.purple), theme(colors.brand.pink));
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
```

### B. theme() 함수 활용

```css
/* 토큰 값을 CSS에서 참조 */
.custom-component {
  background: theme(colors.brand.purple);
  padding: theme(spacing.auth.padding);
  border-radius: theme(borderRadius.lg);
}
```

## ⚡ 5단계: 최신 CSS 기능 (선택사항, 1-2주)

### A. @property (CSS 등록된 커스텀 속성)

```css
@property --brand-hue {
  syntax: '<angle>';
  initial-value: 280deg;
  inherits: false;
}

.animated-brand {
  background: oklch(0.7 0.2 var(--brand-hue));
  animation: hue-shift 3s infinite;
}

@keyframes hue-shift {
  to { --brand-hue: 340deg; }
}
```

### B. color-mix() 함수

```css
/* 색상 믹싱으로 변형 생성 */
.hover-variant {
  background: color-mix(in oklch, theme(colors.brand.purple) 80%, white);
}
```

## 📖 추천 학습 순서 & 자료

### Week 1-2: 기초
1. Tailwind v4 공식 문서 읽기
2. @theme 디렉티브로 간단한 토큰 만들어보기
3. 기존 프로젝트에서 일부 색상을 토큰으로 변환

### Week 3: OKLCH
1. oklch.com에서 색상 실험
2. CotePT 브랜드 색상을 OKLCH로 재정의
3. 명도/채도 변화로 호버 상태 만들기

### Week 4-5: Container Queries
1. 간단한 카드 컴포넌트로 실습
2. 반응형 레이아웃을 컨테이너 쿼리로 변환
3. CotePT auth 카드에 적용해보기

### Week 6: 커스텀 유틸리티
1. @layer components로 버튼 컴포넌트 만들기
2. theme() 함수로 토큰 참조하기
3. 복합 스타일을 유틸리티로 추상화

## 🛠️ 실습 프로젝트 제안

### 프로젝트 1: 컬러 팔레트 제너레이터
OKLCH 조작 연습을 위한 간단한 도구로, 기준 색상에서 명도/채도를 조절해서 팔레트를 생성하는 프로젝트

### 프로젝트 2: 반응형 카드 갤러리
Container Queries 연습을 위해 카드 크기에 따라 레이아웃이 자동 변경되는 갤러리 구현

## 📊 학습 우선순위

| 우선순위 | 기능 | 설명 |
|---------|------|------|
| **필수** | @theme 디렉티브, OKLCH 기초 | 기본 토큰 시스템 이해 |
| **중요** | Container Queries | 모던 반응형 디자인의 핵심 |
| **유용** | 커스텀 유틸리티 (@layer 활용) | 재사용 가능한 컴포넌트 스타일 |
| **고급** | @property, color-mix() | 당장은 필요 없음, 미래 학습 |

## 🔗 유용한 링크

- [Tailwind CSS v4 공식 문서](https://tailwindcss.com/blog/tailwindcss-v4)
- [OKLCH 색상 피커](https://oklch.com/)
- [Container Queries MDN 문서](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [CSS @property MDN 문서](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)

---

> **참고**: 이 로드맵은 CotePT 프로젝트의 디자인 시스템 구축을 위해 최적화되었습니다. 기본 토큰 시스템은 이미 구현되어 있으므로, 학습과 동시에 실제 프로젝트에 적용해볼 수 있습니다.