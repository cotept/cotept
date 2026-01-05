# 멘토 프로필 설정 단계 구현 계획 (v2 - Enhanced)

## 개요

온보딩 플로우의 `MENTOR_SETUP` 단계를 **긴 폼 + 실시간 프리뷰 + 회사 이메일 인증** 방식으로 구현합니다.

- **좌측**: 입력 폼 (태그 선택 + Rich Text 소개글 + 회사 이메일)
- **우측**: 실시간 프리뷰 카드 (입력 내용 즉시 반영)
- **상단**: 진행 상황 인디케이터 ("기본 정보 입력 → 프리뷰 확인 → 제출")
- **제출**: 회사 이메일로 인증 메일 발송 → 승인 대기 프로세스 시작

## 전제 조건

### 이미 완료됨 ✅

- 백엔드 API: `GET /onboarding/mentor/tags`, `POST /onboarding/mentor-profile`
- 쿼리 훅: `useGetMentorTags()`
- 뮤테이션 훅: `useCreateMentorProfileOnboarding()`
- 검증 스키마: `MentorTagsRules`, `MentorIntroRules`
- 헬퍼 함수: `transformToMentorProfileDto()`
- UI 컴포넌트: `RichTextEditor` (TipTap), `Tooltip` (Radix UI)

### 백엔드 추가 필요 (구현 범위 외, 향후 구현)

- 회사 이메일 인증 메일 발송 API
- 이메일 인증 완료 API (일회용 링크)
- 멘토 승인 상태 관리 (PENDING_EMAIL → PENDING_REVIEW → APPROVED)

**현재 구현 범위**: 프론트엔드 UI/UX만 구현. 백엔드 연동은 추후 작업.

---

## 멘토 승인 플로우 (전체 프로세스)

```
1. 사용자가 멘토 프로필 작성
   ↓
2. 회사 이메일 입력
   ↓
3. "멘토 프로필 제출" 버튼 클릭
   ↓
4. 백엔드: 회사 이메일로 인증 메일 발송 (향후 구현)
   ↓
5. 프로필 상태: PENDING_EMAIL
   ↓
6. 사용자: 메일의 일회용 링크 클릭 (향후 구현)
   ↓
7. 프로필 상태: PENDING_REVIEW
   ↓
8. 운영자: 검토 후 승인 (향후 구현)
   ↓
9. 프로필 상태: APPROVED
   ↓
10. user.role → MENTOR로 변경
```

---

## 컴포넌트 구조

```
MentorProfileSetupStep (메인 컴포넌트)
├── useMentorProfileSetup (커스텀 훅)
│   ├── useGetMentorTags (태그 조회)
│   ├── useForm (react-hook-form + Zod)
│   └── useCreateMentorProfileOnboarding (제출)
└── UI 레이아웃
    ├── 상단: 진행 상황 인디케이터
    │   └── "기본 정보 입력 → 프리뷰 확인 → 제출"
    ├── 2단 레이아웃 (lg:grid-cols-2)
    │   ├── 좌측: 입력 폼
    │   │   ├── 직무 태그 select + Tooltip
    │   │   ├── 연차 태그 select + Tooltip
    │   │   ├── 회사 태그 select + Tooltip
    │   │   ├── 소개 제목 Input (optional)
    │   │   ├── 소개 내용 RichTextEditor (TipTap)
    │   │   │   └── ValidationIndicator (10 ~ 1000자)
    │   │   └── 회사 이메일 Input + Tooltip
    │   │       └── "회사 이메일로 인증 메일이 발송됩니다"
    │   └── 우측: 실시간 프리뷰 카드
    │       ├── 프로필 헤더
    │       │   ├── 닉네임 (onboarding 상태에서 가져옴)
    │       │   └── 태그 배지 (직무/연차/회사)
    │       ├── 소개글 미리보기 (HTML 렌더링)
    │       └── 이메일 인증 상태 배지
    │           └── "이메일 인증 대기 중" (제출 전)
    └── 하단: 제출 버튼
        └── "멘토 프로필 제출" (프리뷰 섹션 상단에 위치)
```

---

## 구현 단계

### Step 1: 커스텀 훅 (`useMentorProfileSetup.ts`)

**파일**: `/apps/web/src/features/onboarding/hooks/useMentorProfileSetup.ts` (신규 생성, ~180 lines)

**폼 스키마** (회사 이메일 포함):

```typescript
const MentorProfileSetupFormRules = z.object({
  jobTagId: z.number({ required_error: "직무를 선택해주세요" }),
  levelTagId: z.number({ required_error: "연차를 선택해주세요" }),
  companyTagId: z.number({ required_error: "회사 유형을 선택해주세요" }),
  introductionTitle: z.string().max(100).optional(),
  introductionContent: z
    .string()
    .min(50, "소개글은 50자 이상 작성해주세요")
    .max(5000, "소개글은 5000자 이하로 작성해주세요"),
  companyEmail: z
    .string()
    .email("올바른 이메일 형식이 아닙니다")
    .refine(
      (email) => !email.includes("@gmail") && !email.includes("@naver"),
      "회사 이메일을 입력해주세요 (개인 이메일 불가)",
    ),
})
```

**훅 반환 타입**:

```typescript
{
  // 폼
  form: UseFormReturn<MentorProfileSetupFormData>
  handleSubmit: (e: FormEvent) => void

  // 태그 데이터
  jobTags: MentorTagDto[]
  experienceTags: MentorTagDto[]
  companyTags: MentorTagDto[]
  isLoadingTags: boolean
  tagsError: Error | null

  // 프리뷰 데이터 (실시간 watch)
  previewData: {
    jobTag?: MentorTagDto
    levelTag?: MentorTagDto
    companyTag?: MentorTagDto
    introTitle?: string
    introContent: string  // HTML string from RichTextEditor
    companyEmail: string
  }

  // 검증 및 제출
  validationChecks: ValidationCheck[]
  isPending: boolean
}
```

**핵심 로직**:

1. **프리뷰 데이터 실시간 업데이트**:

```typescript
const watchedJobId = form.watch("jobTagId")
const watchedLevelId = form.watch("levelTagId")
const watchedCompanyId = form.watch("companyTagId")
const watchedTitle = form.watch("introductionTitle")
const watchedContent = form.watch("introductionContent")
const watchedEmail = form.watch("companyEmail")

const previewData = useMemo(
  () => ({
    jobTag: jobTags.find((t) => t.idx === watchedJobId),
    levelTag: experienceTags.find((t) => t.idx === watchedLevelId),
    companyTag: companyTags.find((t) => t.idx === watchedCompanyId),
    introTitle: watchedTitle,
    introContent: watchedContent,
    companyEmail: watchedEmail,
  }),
  [
    /* deps */
  ],
)
```

2. **제출 로직**:

```typescript
const handleSubmit = form.handleSubmit((formData) => {
  if (!session?.user?.id) {
    toast.error("사용자 정보를 찾을 수 없습니다")
    return
  }

  const dto = transformToMentorProfileDto(
    session.user.id,
    {
      jobTagId: formData.jobTagId,
      levelTagId: formData.levelTagId,
      companyTagId: formData.companyTagId,
    },
    {
      introductionTitle: formData.introductionTitle,
      introductionContent: formData.introductionContent,
    },
  )

  mutate({ onboardingCreateMentorProfileDto: dto })
})
```

---

### Step 2: 프리뷰 카드 컴포넌트

**파일**: `/apps/web/src/features/onboarding/components/MentorProfilePreviewCard.tsx` (신규 생성, ~100 lines)

**역할**:

- 실시간으로 업데이트되는 멘토 프로필 미리보기
- 태그 배지 표시
- Rich Text HTML 렌더링
- 이메일 인증 상태 표시

**Props**:

```typescript
interface MentorProfilePreviewCardProps {
  nickname: string // 온보딩 상태에서 전달
  jobTag?: MentorTagDto
  levelTag?: MentorTagDto
  companyTag?: MentorTagDto
  introTitle?: string
  introContent: string // HTML string
  companyEmail: string
  isSubmitted: boolean // 제출 여부
}
```

**UI 구조**:

```tsx
<Card className="sticky top-6 border-zinc-800 bg-zinc-900">
  <CardHeader>
    <div className="flex items-center gap-3">
      <Avatar>...</Avatar>
      <div>
        <h3>{nickname}</h3>
        <div className="mt-1 flex gap-2">
          {jobTag && <Badge variant="secondary">{jobTag.name}</Badge>}
          {levelTag && <Badge variant="outline">{levelTag.name}</Badge>}
          {companyTag && <Badge variant="outline">{companyTag.name}</Badge>}
        </div>
      </div>
    </div>
  </CardHeader>

  <CardContent>
    {introTitle && <h4 className="mb-2 font-semibold">{introTitle}</h4>}

    {/* Rich Text HTML 렌더링 */}
    {introContent ? (
      <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: introContent }} />
    ) : (
      <p className="text-muted-foreground text-sm">소개글을 작성해주세요...</p>
    )}

    {/* 이메일 인증 상태 */}
    <div className="mt-4 border-t border-zinc-800 pt-4">
      <Badge variant={isSubmitted ? "default" : "outline"}>
        {isSubmitted ? "이메일 인증 진행 중" : "이메일 인증 대기"}
      </Badge>
    </div>
  </CardContent>
</Card>
```

---

### Step 3: 메인 컴포넌트 (`MentorProfileSetupStep.tsx`)

**파일**: `/apps/web/src/features/onboarding/components/MentorProfileSetupStep.tsx` (기존 stub 교체, ~300 lines)

**UI 레이아웃**:

1. **상단: 진행 상황 인디케이터**:

```tsx
<div className="mb-6 text-center">
  <p className="text-muted-foreground text-sm">
    기본 정보 입력 → <span className="font-medium text-purple-400">프리뷰 확인</span> → 제출
  </p>
</div>
```

2. **2단 레이아웃**:

```tsx
<div className="grid lg:grid-cols-2 gap-8">
  {/* 좌측: 입력 폼 */}
  <div>
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 태그 선택 섹션 */}
        <div className="space-y-4">
          <h3 className="font-semibold">멘토 정보</h3>

          {/* 직무 태그 + Tooltip */}
          <FormField name="jobTagId">
            <FormLabel>
              직무 *
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="inline w-4 h-4 ml-1" />
                </TooltipTrigger>
                <TooltipContent>
                  주로 멘토링할 분야를 선택해주세요
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <select ...>{/* 태그 옵션 */}</select>
          </FormField>

          {/* 연차 태그 - 동일 패턴 */}
          {/* 회사 태그 - 동일 패턴 */}
        </div>

        {/* 소개글 작성 섹션 */}
        <div className="space-y-4">
          <h3 className="font-semibold">소개글 작성</h3>

          {/* 제목 (optional) */}
          <FormField name="introductionTitle">
            <Input placeholder="예: 5년차 백엔드 개발자, 카카오 합격 경험 공유" />
          </FormField>

          {/* 내용 (RichTextEditor) */}
          <FormField name="introductionContent">
            <Controller
              control={form.control}
              name="introductionContent"
              render={({ field }) => (
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="멘토링 경험, 강점, 합격 이력 등을 자유롭게 작성해주세요."
                  size="lg"
                  showToolbar={true}
                />
              )}
            />
            <ValidationIndicator checks={validationChecks} isDirty={...} />
          </FormField>
        </div>

        {/* 회사 이메일 입력 섹션 */}
        <div className="space-y-4">
          <h3 className="font-semibold">회사 이메일 인증</h3>

          <FormField name="companyEmail">
            <FormLabel>
              회사 이메일 *
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="inline w-4 h-4 ml-1" />
                </TooltipTrigger>
                <TooltipContent>
                  회사 이메일로 인증 메일이 발송됩니다.
                  개인 이메일(Gmail, Naver 등)은 사용할 수 없습니다.
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <Input
              type="email"
              placeholder="your.name@company.com"
              {...field}
            />
            <FormMessage />
          </FormField>
        </div>

        {/* 제출 버튼 */}
        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isPending || !form.formState.isValid}
        >
          {isPending ? <><InlineLoading className="mr-2" />제출 중...</> : "멘토 프로필 제출"}
        </Button>
      </form>
    </Form>
  </div>

  {/* 우측: 프리뷰 카드 */}
  <div>
    <MentorProfilePreviewCard
      nickname={onboardingData.profile?.nickname ?? "닉네임"}
      jobTag={previewData.jobTag}
      levelTag={previewData.levelTag}
      companyTag={previewData.companyTag}
      introTitle={previewData.introTitle}
      introContent={previewData.introContent}
      companyEmail={previewData.companyEmail}
      isSubmitted={false}
    />
  </div>
</div>
```

---

### Step 4: 컨테이너 통합

**파일**: `/apps/web/src/containers/onboarding/pages/OnBoardingContainer.tsx`

**변경사항**:

1. **Import 추가** (라인 ~17):

```typescript
import MentorProfileSetupStep from "@/features/onboarding/components/MentorProfileSetupStep"
import type { MentorTagsData, MentorIntroData } from "@/features/onboarding/lib/validations/onboarding-rules"
```

2. **완료 핸들러 추가** (라인 ~69):

```typescript
const handleMentorProfileComplete = (data: { tags: MentorTagsData; intro: MentorIntroData }) => {
  // mentorProfile 데이터를 온보딩 상태에 저장
  updateAndGoNext("mentorProfile", data, ONBOARDING_STEPS.COMPLETE)
}
```

3. **Switch 케이스 교체** (라인 80-81):

```typescript
case ONBOARDING_STEPS.MENTOR_SETUP:
  return (
    <MentorProfileSetupStep
      onComplete={handleMentorProfileComplete}
      onboardingData={onboardingData}  // 닉네임 등 전달
    />
  )
```

---

## Tooltip 사용 예시

```tsx
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/shared/components/tooltip"
import { HelpCircle } from "lucide-react"
;<FormLabel>
  직무 *
  <Tooltip>
    <TooltipTrigger asChild>
      <HelpCircle className="text-muted-foreground ml-1 inline h-4 w-4 cursor-help" />
    </TooltipTrigger>
    <TooltipContent>
      <p>주로 멘토링할 분야를 선택해주세요</p>
    </TooltipContent>
  </Tooltip>
</FormLabel>
```

**Tooltip 가이드 문구**:

- **직무**: "주로 멘토링할 분야를 선택해주세요"
- **연차**: "현재 경력 수준을 선택해주세요"
- **회사**: "재직 중인 회사 유형을 선택해주세요"
- **회사 이메일**: "회사 이메일로 인증 메일이 발송됩니다. 개인 이메일(Gmail, Naver 등)은 사용할 수 없습니다."

---

## Rich Text Editor 사용

**Controller 패턴**:

```tsx
import { RichTextEditor } from "@repo/shared/components/rich-text-editor"
import { Controller } from "react-hook-form"
;<Controller
  control={form.control}
  name="introductionContent"
  render={({ field }) => (
    <RichTextEditor
      content={field.value}
      onChange={field.onChange}
      placeholder="멘토링 경험, 강점, 합격 이력 등을 자유롭게 작성해주세요."
      size="lg"
      showToolbar={true}
      disabled={isPending}
    />
  )}
/>
```

**HTML 렌더링** (프리뷰 카드):

```tsx
<div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: introContent }} />
```

---

## 에러 처리

| 시나리오          | 처리 방법                         |
| ----------------- | --------------------------------- |
| 태그 조회 실패    | 에러 메시지 + 새로고침 안내       |
| userId 없음       | Toast 에러 + 제출 방지            |
| API 제출 실패     | Toast 에러 + 폼 데이터 유지       |
| 네트워크 타임아웃 | React Query 자동 재시도 (3회)     |
| 검증 실패         | FormMessage + 제출 버튼 비활성화  |
| 개인 이메일 입력  | Zod refine으로 검증 + 에러 메시지 |

---

## 데이터 흐름

```
1. 사용자가 멘토 제안 수락
   ↓
2. MENTOR_SETUP 단계로 이동
   ↓
3. MentorProfileSetupStep 렌더링
   ↓
4. useGetMentorTags() → 태그 데이터 로드
   ↓
5. 사용자가 폼 입력 (태그 + 소개글 + 이메일)
   ↓
6. form.watch() → 프리뷰 카드 실시간 업데이트
   ↓
7. 폼 제출 → transformToMentorProfileDto() → API DTO 변환
   ↓
8. useCreateMentorProfileOnboarding() → POST /onboarding/mentor-profile
   ↓
9. 성공 → Toast: "회사 이메일로 인증 메일을 보냈습니다"
   ↓
10. onComplete 콜백 실행
   ↓
11. handleMentorProfileComplete → updateAndGoNext("mentorProfile", data)
   ↓
12. COMPLETE 단계로 이동
```

---

## 스타일링 가이드

### 레이아웃:

```tsx
<div className="grid gap-8 lg:grid-cols-2">
  <div className="space-y-6">{/* 좌측 폼 */}</div>
  <div>{/* 우측 프리뷰 */}</div>
</div>
```

### 프리뷰 카드 (sticky):

```tsx
<Card className="sticky top-6 bg-zinc-900 border-zinc-800">
```

### Select 스타일:

```tsx
className =
  "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
```

### 섹션 제목:

```tsx
<h3 className="mb-4 text-lg font-semibold">멘토 정보</h3>
```

---

## 구현 체크리스트

### Hook (`useMentorProfileSetup.ts`):

- [ ] 폼 스키마 정의 (회사 이메일 포함)
- [ ] useGetMentorTags() 통합
- [ ] useForm 초기화 (Zod resolver)
- [ ] useCreateMentorProfileOnboarding() 통합
- [ ] handleSubmit 로직
- [ ] 프리뷰 데이터 실시간 생성 (useMemo)
- [ ] ValidationChecks 생성
- [ ] 에러 처리 (toast)

### Preview Card (`MentorProfilePreviewCard.tsx`):

- [ ] Props 타입 정의
- [ ] 프로필 헤더 (닉네임 + 아바타)
- [ ] 태그 배지 (직무/연차/회사)
- [ ] 소개글 미리보기 (HTML 렌더링)
- [ ] 이메일 인증 상태 배지
- [ ] Sticky 포지셔닝

### Component (`MentorProfileSetupStep.tsx`):

- [ ] 로딩/에러 상태 UI
- [ ] 진행 상황 인디케이터
- [ ] 2단 레이아웃 (lg:grid-cols-2)
- [ ] 직무/연차/회사 태그 select + Tooltip
- [ ] 소개 제목 Input
- [ ] 소개 내용 RichTextEditor
- [ ] ValidationIndicator
- [ ] 회사 이메일 Input + Tooltip
- [ ] 제출 버튼 (로딩 상태)
- [ ] 프리뷰 카드 통합

### Container (`OnBoardingContainer.tsx`):

- [ ] Import 추가
- [ ] handleMentorProfileComplete 핸들러
- [ ] Switch case 교체
- [ ] onboardingData props 전달

### 테스트:

- [ ] 태그 조회 성공/실패
- [ ] 폼 입력 → 프리뷰 실시간 업데이트
- [ ] Rich Text 편집 → HTML 렌더링
- [ ] 회사 이메일 검증 (개인 이메일 차단)
- [ ] 폼 제출 성공 → COMPLETE 단계 이동
- [ ] 폼 제출 실패 → 에러 메시지
- [ ] Tooltip 표시 확인

---

## 구현 파일 목록

### 신규 생성:

- `/apps/web/src/features/onboarding/hooks/useMentorProfileSetup.ts` (~180 lines)
- `/apps/web/src/features/onboarding/components/MentorProfilePreviewCard.tsx` (~100 lines)

### 수정:

- `/apps/web/src/features/onboarding/components/MentorProfileSetupStep.tsx` (stub → 완전 구현, ~300 lines)
- `/apps/web/src/containers/onboarding/pages/OnBoardingContainer.tsx` (3곳 수정)

### 참조 (수정 불필요):

- `/packages/shared/src/components/rich-text-editor.tsx`
- `/packages/shared/src/components/tooltip.tsx`
- `/apps/web/src/features/onboarding/lib/validations/onboarding-rules.ts`
- `/apps/web/src/features/onboarding/api/queries.ts`
- `/apps/web/src/features/onboarding/api/mutations.ts`

---

## 성공 기준

- ✅ 2단 레이아웃 (폼 + 프리뷰)
- ✅ 태그 3개(직무/연차/회사) 선택 가능 + Tooltip 안내
- ✅ Rich Text Editor로 소개글 작성 (50-5000자)
- ✅ 실시간 프리뷰 업데이트
- ✅ HTML 렌더링 (prose 스타일)
- ✅ 회사 이메일 입력 + 검증 (개인 이메일 차단)
- ✅ Tooltip으로 의미있는 정보 전달
- ✅ 진행 상황 인디케이터 표시
- ✅ 제출 성공 → Toast 메시지 → COMPLETE 단계
- ✅ 에러 처리 (로딩/실패)
- ✅ 반응형 디자인 (모바일: 1단, 데스크톱: 2단)
- ✅ 기존 단계들과 일관된 UI/UX

## 개선점

### 입력폼

- 태그는 다중 체크박스 셀렉션 태그 뱃지를 선택하는 UX (몇개 제안 후 필요하면 사용자 입력)
- 태그 내용은 채용 플랫폼(잡코리아, 잡플래닛, 사람인 원티드 참조)

### 멘토 인증

- 현시점에서는 인증단계 제거 회사 이메일 인증 X
- 추후 추가할 거라서 일단 현재는 스킵 다만 나중에 추가하기 용이하도록 코드를 작성해야 한다.
- 소개글 작성 (10-1000자) 로 수정 5000자는 너무 길다.
