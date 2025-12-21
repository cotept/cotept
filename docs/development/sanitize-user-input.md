# 멘토 프로필 프리뷰 & 에디터 보안 가이드

## 왜 Sanitization 이 필요한가

- TipTap 에디터는 HTML 문자열을 그대로 출력하므로 악성 스크립트 삽입(XSS) 위험 존재.
- 실시간 프리뷰에서 `dangerouslySetInnerHTML`을 사용하면 입력 단계에서도 공격이 발생할 수 있음.
- 서버 저장 후 다른 사용자가 볼 때도 동일한 위협이 있으니 **클라이언트 + 서버** 모두에서 정제가 필요.

## 적용 범위

1. 멘토 프로필 프리뷰 (`MentorProfilePreviewCard`)
2. 서버로 전송하는 소개글(`introductionContent`)
3. 이후 대시보드나 상세 페이지 등 소개글을 다시 렌더링하는 모든 곳

## Sanitization 전략

### 0. 공용 Sanitizer 유틸

- `packages/shared/src/lib/sanitize.ts`에서 `sanitizeHtml`, `sanitizeToPlainText`를 export합니다.
- `@repo/shared/lib/sanitize`를 import하면 프론트/백엔드 모두 같은 allowlist와 DOMPurify 훅을 그대로 사용할 수 있습니다.
- 옵션이 더 필요하면 `sanitizeHtml(dirty, { ALLOWED_TAGS: [...추가] })`처럼 덮어쓰면 됩니다.

### 1. 클라이언트 (프론트)

- 라이브러리: `dompurify` (추천), SSR 지원 + 커스텀 allowlist 가능.
- TipTap → HTML 변경 시 `sanitizeHTML = DOMPurify.sanitize(html, options)`로 한번 필터링.
- 프리뷰에선 sanitize 결과만 `dangerouslySetInnerHTML`로 넣기.
- Allowed tags 예시: `['p','strong','em','ul','ol','li','a','code','blockquote','br']`
- Attributes는 `href`, `target`, `rel` 정도로 제한.

### 2. 서버 (백엔드)

- 동일하게 `sanitize-html` 같은 라이브러리 사용하여 재검증.
- 백엔드에서 허용하지 않는 태그는 모두 제거 후 저장.
- 저장된 HTML을 다시 렌더링할 때도 추가 Sanitization 또는 Markdown 변환으로 방어.

### 3. Validation & Length

- Zod 스키마에서 글자 수만 체크하지 말고, sanitize 이후 길이를 다시 확인.
- 악성 스크립트를 넣어 길이가 길어지는 경우를 대비해 서버에서 최종 길이 검증.

## 구현 체크리스트

1. `@repo/shared/lib/sanitize` 활용 (추가 설치 불필요)
2. `useMentorProfileSetup` 훅에서:
   - TipTap `onChange` → HTML 수신
   - `const safeHTML = sanitizeHtml(html)`
   - form 값으로 `safeHTML` 저장 및 프리뷰에 전달
3. 서버 DTO 수신 시:
   - `sanitizeHtml(dto.introductionContent)`로 재검증 후 저장
4. 프리뷰/상세 컴포넌트:
   - 항상 sanitization 통과한 문자열만 `dangerouslySetInnerHTML`에 사용
5. 테스트:
   - `<script>alert(1)</script>` 입력 → 프리뷰/저장 시 제거되는지 확인
   - 허용 태그(굵게, 리스트 등)가 정상적으로 남는지 확인

## 옵션 예시

```ts
const sanitizeOptions = {
  ALLOWED_TAGS: ["p", "strong", "em", "u", "ul", "ol", "li", "a", "code", "blockquote", "br"],
  ALLOWED_ATTR: {
    a: ["href", "target", "rel"],
  },
  ADD_ATTR: ["target"],
  ADD_TAGS: [],
  FORBID_TAGS: ["style", "img", "iframe"],
}
```
