# Package.json Exports 필드 가이드

## 개요

Node.js의 `package.json` "exports" 필드는 패키지 내보내기를 명시적으로 제어하는 ESM(ECMAScript Modules) 기능입니다. 이 문서는 Turborepo 모노레포 환경에서 `@repo/shared` 패키지의 exports 설정을 설명합니다.

## 기본 개념

### exports 필드란?

```json
{
  "exports": {
    "./path": "./dist/path.js"
  }
}
```

- **목적**: 패키지에서 외부로 노출할 모듈을 명시적으로 정의
- **장점**:
  - 명확한 공개 API 정의
  - 내부 구현 은닉
  - Tree-shaking 최적화
  - 조건부 내보내기 (development/production)

### 기존 방식과의 차이

**Legacy (package.json main/module)**:
```json
{
  "main": "./dist/index.js",
  "module": "./dist/index.mjs"
}
```
- 단일 진입점만 지정 가능
- 모든 내부 파일 접근 가능 (보안 취약)

**Modern (exports)**:
```json
{
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js"
  }
}
```
- 다중 진입점 지원
- 명시된 경로만 접근 가능
- 서브패키지 경로 지정 가능

## @repo/shared의 Exports 구조

### 전체 설정

```json
{
  "exports": {
    "./globals.css": "./src/styles/globals.css",
    "./postcss.config": "./postcss.config.mjs",
    "./lib/*": "./src/lib/*.ts",
    "./components/*": "./src/components/*.tsx",
    "./components/code-editor": "./src/components/code-editor/index.ts",
    "./hooks/*": "./src/hooks/*.ts",
    "./types/*": "./src/types/*.ts"
  }
}
```

### 패턴별 설명

#### 1. 정확한 경로 매칭 (Exact Match)

```json
"./globals.css": "./src/styles/globals.css"
```

**동작**:
```typescript
// ✅ 작동
import "@repo/shared/globals.css"

// ❌ 불가능
import "@repo/shared/styles/globals.css"
```

**특징**:
- 단일 파일에 대한 명시적 매핑
- CSS, config 파일 등에 사용

#### 2. 와일드카드 패턴 (Wildcard Pattern)

```json
"./lib/*": "./src/lib/*.ts"
```

**동작**:
```typescript
// ✅ 작동
import { utils } from "@repo/shared/lib/utils"
// → ./src/lib/utils.ts 매칭

// ✅ 작동
import { cn } from "@repo/shared/lib/cn"
// → ./src/lib/cn.ts 매칭

// ❌ 불가능 (확장자 불일치)
import { helper } from "@repo/shared/lib/helper"
// → ./src/lib/helper.tsx 는 매칭 안 됨 (.ts만 매칭)
```

**제약사항**:
- **확장자까지 정확히 매칭됨**
- `*.ts` 패턴은 `.tsx`, `.js` 파일을 매칭하지 않음
- 디렉토리 구조는 매칭하지 않음

#### 3. 컴포넌트 패턴의 특수 케이스

```json
"./components/*": "./src/components/*.tsx"
```

**단일 파일 컴포넌트**:
```typescript
// ✅ 작동
import { Button } from "@repo/shared/components/button"
// → ./src/components/button.tsx
```

**디렉토리 구조 컴포넌트 (문제 상황)**:
```
src/
└── components/
    └── code-editor/
        ├── index.ts          ← 진입점
        ├── code-editor.tsx
        └── code-editor-header.tsx
```

```typescript
// ❌ 작동 안 함
import { CodeEditor } from "@repo/shared/components/code-editor"
// → ./src/components/code-editor.tsx 를 찾으려 시도
// → 파일이 아닌 디렉토리이므로 실패!
```

**해결책: 명시적 경로 추가**

```json
"./components/code-editor": "./src/components/code-editor/index.ts"
```

```typescript
// ✅ 작동
import { CodeEditor } from "@repo/shared/components/code-editor"
// → ./src/components/code-editor/index.ts
```

## 핵심 원칙

### 1. 명시성 (Explicitness)

```json
{
  "exports": {
    "./components/code-editor": "./src/components/code-editor/index.ts",
    "./components/*": "./src/components/*.tsx"
  }
}
```

**매칭 순서**:
1. **구체적 경로 우선**: `./components/code-editor`
2. **와일드카드 후순위**: `./components/*`

더 구체적인 패턴이 먼저 평가되므로, code-editor는 명시적 규칙으로 처리됩니다.

### 2. 확장자 엄격성

```json
"./lib/*": "./src/lib/*.ts"
```

- `utils.ts` ✅ 매칭
- `utils.tsx` ❌ 매칭 안 됨
- `utils.js` ❌ 매칭 안 됨

**다중 확장자 지원** (비권장):
```json
"./lib/*": ["./src/lib/*.ts", "./src/lib/*.tsx"]
```

### 3. 디렉토리 구조 처리

Node.js ESM은 자동으로 `index.js`를 찾지 않습니다.

**잘못된 가정**:
```typescript
// ❌ 자동으로 index.ts를 찾아주지 않음
import { Component } from "@repo/shared/components/my-component"
```

**올바른 방법**:
```json
{
  "exports": {
    "./components/my-component": "./src/components/my-component/index.ts"
  }
}
```

## 실전 패턴

### 패턴 1: 단일 파일 컴포넌트 (기본)

```
src/components/
├── button.tsx
├── input.tsx
└── card.tsx
```

```json
{
  "exports": {
    "./components/*": "./src/components/*.tsx"
  }
}
```

### 패턴 2: 복잡한 컴포넌트 (디렉토리)

```
src/components/
├── button.tsx
├── code-editor/
│   ├── index.ts
│   ├── code-editor.tsx
│   └── code-editor-header.tsx
└── carousel/
    ├── index.ts
    ├── carousel.tsx
    └── carousel-item.tsx
```

```json
{
  "exports": {
    "./components/*": "./src/components/*.tsx",
    "./components/code-editor": "./src/components/code-editor/index.ts",
    "./components/carousel": "./src/components/carousel/index.ts"
  }
}
```

### 패턴 3: 혼합 확장자

```
src/lib/
├── utils.ts
├── helpers.tsx
└── constants.js
```

**방법 A: 개별 지정** (권장)
```json
{
  "exports": {
    "./lib/utils": "./src/lib/utils.ts",
    "./lib/helpers": "./src/lib/helpers.tsx",
    "./lib/constants": "./src/lib/constants.js"
  }
}
```

**방법 B: 배열 패턴**
```json
{
  "exports": {
    "./lib/*": [
      "./src/lib/*.ts",
      "./src/lib/*.tsx",
      "./src/lib/*.js"
    ]
  }
}
```

## 디버깅 가이드

### 문제: "Cannot find module" 오류

```
Cannot find module '@repo/shared/components/code-editor'
or its corresponding type declarations.
```

**진단 체크리스트**:

1. **exports 필드 확인**
   ```bash
   cat packages/shared/package.json | grep -A 10 exports
   ```

2. **파일 존재 확인**
   ```bash
   ls packages/shared/src/components/code-editor/index.ts
   ```

3. **패턴 매칭 테스트**
   ```json
   {
     "exports": {
       "./components/*": "./src/components/*.tsx"  // ← .tsx만 매칭
     }
   }
   ```
   → `code-editor/index.ts`는 `.ts` 확장자이므로 매칭 안 됨!

4. **해결: 명시적 경로 추가**
   ```json
   {
     "exports": {
       "./components/*": "./src/components/*.tsx",
       "./components/code-editor": "./src/components/code-editor/index.ts"
     }
   }
   ```

### 문제: 패턴이 작동하지 않음

**Case 1: 확장자 불일치**
```json
"./lib/*": "./src/lib/*.ts"
```
```typescript
import { helper } from "@repo/shared/lib/helper"  // helper.tsx 파일
```
→ `.tsx` 파일은 `.ts` 패턴과 매칭 안 됨

**Case 2: 중첩 디렉토리**
```json
"./components/*": "./src/components/*.tsx"
```
```typescript
import { SubComponent } from "@repo/shared/components/complex/sub"
```
→ 와일드카드는 한 레벨만 매칭, 중첩 경로는 불가

**해결책**:
```json
{
  "exports": {
    "./components/*/*": "./src/components/*/*.tsx"
  }
}
```

## Best Practices

### ✅ DO

1. **구체적 경로를 먼저 정의**
   ```json
   {
     "exports": {
       "./components/code-editor": "./src/components/code-editor/index.ts",
       "./components/*": "./src/components/*.tsx"
     }
   }
   ```

2. **index 파일 명시**
   ```typescript
   // src/components/code-editor/index.ts
   export { CodeEditor } from "./code-editor"
   export { CodeEditorHeader } from "./code-editor-header"
   export type { CodeEditorProps } from "./code-editor.types"
   ```

3. **일관된 확장자 사용**
   - 컴포넌트: `.tsx`
   - 유틸리티: `.ts`
   - 타입: `.ts`

### ❌ DON'T

1. **자동 index 찾기 기대**
   ```json
   // ❌ 작동 안 함
   "./components/*": "./src/components/*"
   ```

2. **과도한 와일드카드**
   ```json
   // ❌ 보안 위험
   "./*": "./src/*"
   ```

3. **혼합 확장자 와일드카드**
   ```json
   // ❌ 유지보수 어려움
   "./lib/*": ["./src/lib/*.ts", "./src/lib/*.tsx", "./src/lib/*.js"]
   ```

## 타입스크립트와의 통합

### tsconfig.json paths

```json
{
  "compilerOptions": {
    "paths": {
      "@repo/shared/*": ["../packages/shared/src/*"],
      "@repo/shared/components/code-editor": [
        "../packages/shared/src/components/code-editor"
      ]
    }
  }
}
```

**주의**: `paths`는 개발 시 TypeScript 타입 해석용이며, 런타임에는 `package.json` exports가 사용됩니다.

### 타입 정의 export

```json
{
  "exports": {
    "./components/code-editor": {
      "types": "./src/components/code-editor/index.ts",
      "default": "./src/components/code-editor/index.ts"
    }
  }
}
```

## 요약

1. **exports 필드**: ESM 표준, 명시적 모듈 내보내기
2. **와일드카드 제약**: 확장자까지 정확히 매칭
3. **디렉토리 처리**: 명시적으로 index 파일 지정 필요
4. **매칭 순서**: 구체적 경로 > 와일드카드
5. **디버깅**: 확장자, 경로, 패턴을 체계적으로 확인

## 참고 자료

- [Node.js Package Entry Points](https://nodejs.org/api/packages.html#package-entry-points)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Turborepo Package Imports](https://turbo.build/repo/docs/handbook/sharing-code/internal-packages)
