# CotePT Figma 디자인 가이드

## 🎯 Figma 프로젝트 설정

### 파일 구조
```
📁 CotePT Design System
├── 🎨 Design Tokens
├── 🧩 Components
├── 📱 Mobile Screens
├── 💻 Desktop Screens
└── 🔄 Prototypes
```

---

## 🎨 Design Tokens 설정

### 1. Color Styles 생성

**Primary Colors**
```
🔵 Primary/Blue/500     #2563EB
🔵 Primary/Blue/600     #1E40AF  (hover)
🔵 Primary/Blue/100     #DBEAFE  (light)
🔵 Primary/Blue/50      #EFF6FF  (background)
```

**Status Colors**
```
🟢 Success/Green/500    #10B981
🟠 Warning/Orange/500   #F59E0B
🔴 Error/Red/500        #EF4444
```

**Neutral Colors**
```
⚫ Gray/900             #111827  (text-primary)
⚫ Gray/600             #4B5563  (text-secondary)
⚫ Gray/300             #D1D5DB  (border)
⚫ Gray/100             #F3F4F6  (background)
⚫ Gray/50              #F9FAFB  (background-light)
⚪ White               #FFFFFF
```

### 2. Typography Styles 생성

**Headings**
```
H1/Bold      Pretendard Bold 32px, Line Height 40px
H2/SemiBold  Pretendard SemiBold 24px, Line Height 32px
H3/SemiBold  Pretendard SemiBold 20px, Line Height 28px
H4/Medium    Pretendard Medium 18px, Line Height 24px
```

**Body Text**
```
Body/Large   Pretendard Regular 16px, Line Height 24px
Body/Medium  Pretendard Regular 14px, Line Height 20px
Body/Small   Pretendard Regular 12px, Line Height 16px
```

**Special**
```
Code/Medium  JetBrains Mono Medium 14px, Line Height 20px
Caption      Pretendard Regular 11px, Line Height 16px
```

### 3. Effect Styles 생성

**Shadows**
```
Shadow/SM    0px 1px 2px rgba(0, 0, 0, 0.05)
Shadow/MD    0px 4px 6px rgba(0, 0, 0, 0.07)
Shadow/LG    0px 10px 15px rgba(0, 0, 0, 0.1)
Shadow/XL    0px 20px 25px rgba(0, 0, 0, 0.15)
```

**Border Radius**
```
Radius/SM    4px
Radius/MD    8px
Radius/LG    12px
Radius/XL    16px
Radius/Full  9999px
```

---

## 🧩 컴포넌트 라이브러리 구축

### 1. Atoms (기본 컴포넌트)

#### Button 컴포넌트
```
📦 Button
├── 🔵 Primary (Blue background, White text)
│   ├── Default (w: auto, h: 44px, padding: 12px 24px)
│   ├── Hover (Blue/600 background)
│   ├── Disabled (Gray/300 background)
│   ├── Loading (with spinner)
│   └── Small (h: 36px, padding: 8px 16px)
│
├── ⚪ Secondary (White background, Blue border)
│   ├── Default
│   ├── Hover
│   └── Disabled
│
└── 👻 Ghost (Transparent, Blue text)
    ├── Default
    ├── Hover (Blue/50 background)
    └── Disabled
```

**Button 프로퍼티:**
- `variant`: Primary | Secondary | Ghost
- `size`: Default | Small
- `state`: Default | Hover | Disabled | Loading
- `icon`: Boolean (좌측 아이콘 표시)

#### Input 컴포넌트
```
📦 Input
├── 📝 Text Input
│   ├── Default (h: 44px, border: Gray/300)
│   ├── Focus (border: Blue/500, shadow: Blue/100)
│   ├── Error (border: Red/500)
│   └── Disabled (background: Gray/50)
│
├── 🔒 Password Input (with toggle icon)
├── 🔍 Search Input (with search icon)
└── 📧 Email Input (with @ icon)
```

**Input 프로퍼티:**
- `type`: Text | Password | Email | Search
- `state`: Default | Focus | Error | Disabled
- `label`: String
- `placeholder`: String
- `helper-text`: String

#### Avatar 컴포넌트
```
📦 Avatar
├── 👤 User Avatar
│   ├── Small (32x32px)
│   ├── Medium (40x40px)
│   └── Large (64x64px)
│
└── 🏢 Status Indicator
    ├── Online (Green dot)
    ├── Away (Orange dot)
    └── Offline (Gray dot)
```

### 2. Molecules (조합 컴포넌트)

#### MentorCard 컴포넌트
```
📦 MentorCard
├── 👤 Avatar (Large)
├── 📝 Info Section
│   ├── Name (H4/Medium)
│   ├── Rating (⭐ + number)
│   ├── Badge (Rank: Platinum, Diamond...)
│   ├── Specialties (tags)
│   └── Price (Body/Large, Bold)
│
├── 📊 Stats
│   ├── Session Count
│   └── Response Rate
│
└── 🎯 Actions
    ├── [프로필 보기] (Secondary Button)
    └── [즉시 예약] (Primary Button)
```

#### SessionCard 컴포넌트
```
📦 SessionCard
├── 📅 DateTime (Body/Medium, Gray/600)
├── 👥 Participants
│   ├── Mentor Avatar + Name
│   └── Mentee Avatar + Name
│
├── 📝 Session Info
│   ├── Topic (H4/Medium)
│   ├── Duration (Body/Small)
│   └── Status Badge
│
└── 🎯 Actions (상황별 다름)
    ├── [참여하기] (Upcoming)
    ├── [다시보기] (Completed)
    └── [취소하기] (Cancellable)
```

#### VODCard 컴포넌트
```
📦 VODCard
├── 🖼️ Thumbnail (16:9 ratio, 280x157px)
│   ├── Play Icon Overlay
│   ├── Duration Badge (우하단)
│   └── Premium Badge (좌상단, if premium)
│
├── 📝 Content Info
│   ├── Title (H4/Medium, 2 lines max)
│   ├── Mentor (Body/Small, Gray/600)
│   ├── Stats (⭐ rating • 👀 views)
│   └── Tags (category chips)
│
└── 🎯 Action
    └── [재생하기] (Primary Button, Small)
```

### 3. Organisms (복합 컴포넌트)

#### Header 컴포넌트
```
📦 Header
├── 🏠 Left Section
│   ├── Logo (CotePT)
│   └── Navigation (Desktop only)
│       ├── 대시보드
│       ├── 멘토 찾기
│       ├── VOD
│       └── 내 멘토링
│
├── 🔍 Center Section (Desktop)
│   └── Search Bar
│
└── 👤 Right Section
    ├── Notifications (🔔 with badge)
    ├── User Avatar + Dropdown
    │   ├── 프로필 설정
    │   ├── 구독 관리
    │   ├── 고객센터
    │   └── 로그아웃
    └── Mobile Menu Toggle (Mobile only)
```

#### MentorList 컴포넌트
```
📦 MentorList
├── 🔍 Filter Section
│   ├── Category Dropdown
│   ├── Price Range Slider
│   ├── Rating Filter
│   └── Language Filter
│
├── 📊 Sort Section
│   ├── 추천순
│   ├── 평점순
│   ├── 가격순
│   └── 리뷰순
│
└── 📜 List Section
    ├── MentorCard × N
    └── Pagination
```

---

## 📱 화면별 디자인 가이드

### 1. 인증 화면

#### 로그인 페이지 레이아웃
```
Desktop (1200px)           Mobile (375px)
┌─────────────────────┐   ┌─────────────────┐
│  [Logo]             │   │     [Logo]      │
│                     │   │                 │
│  ┌─────────────┐    │   │ ┌─────────────┐ │
│  │   Login     │    │   │ │   Login     │ │
│  │   Form      │    │   │ │   Form      │ │
│  │   (400px)   │    │   │ │  (full)     │ │
│  └─────────────┘    │   │ └─────────────┘ │
│                     │   │                 │
│  Social Buttons     │   │ Social Buttons  │
└─────────────────────┘   └─────────────────┘
```

**로그인 폼 구성:**
1. 이메일 Input (full width)
2. 비밀번호 Input (full width)
3. 로그인 Button (Primary, full width)
4. 구분선 "또는"
5. 소셜 로그인 버튼들 (각각 full width)
   - GitHub (Black background, White text)
   - Google (White background, Black text, border)
   - 카카오 (Yellow background, Black text)
   - 네이버 (Green background, White text)

### 2. 대시보드 화면

#### 멘티 대시보드 레이아웃
```
Desktop Layout (1200px+)
┌─────────────────────────────────────────────┐
│                 Header                      │
├─────────────────────────────────────────────┤
│ ┌─ Welcome Section ─┐ ┌─ Quick Actions ──┐ │
│ │ 안녕하세요! 👋     │ │ 🔥 즉시 멘토링  │ │
│ │ 오늘도 화이팅!     │ │                 │ │
│ └─────────────────── │ │ [멘토 찾기]     │ │
│                      │ └─────────────────┘ │
├──────────────────────┴─────────────────────┤
│ ┌─ 예약된 멘토링 ─────────────────────────┐ │
│ │ SessionCard × 2                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─ 최근 VOD ─────────────────────────────┐ │
│ │ VODCard × 3 (가로 배치)                │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

```
Mobile Layout (375px)
┌─────────────────┐
│     Header      │
├─────────────────┤
│ Welcome Section │
│                 │
│ Quick Actions   │
├─────────────────┤
│ 예약된 멘토링   │
│ SessionCard     │
│ SessionCard     │
├─────────────────┤
│ 최근 VOD        │
│ VODCard         │
│ VODCard         │
│ (세로 배치)     │
└─────────────────┘
```

### 3. 멘토링 세션 화면

#### 세션 룸 레이아웃
```
Desktop (1400px+)
┌─────────────────────────────────────────────┐
│            Session Header                   │
├─────────────────┬───────────────────────────┤
│                 │ ┌─ Voice Call ─────────┐ │
│                 │ │ 👤 Mentor Avatar     │ │
│                 │ │ 🎤 [Mute] [End]     │ │
│                 │ └─────────────────────┘ │
│   Code Editor   │                         │
│   (Monaco)      │ ┌─ Chat ──────────────┐ │
│                 │ │ Messages...         │ │
│                 │ │                     │ │
│                 │ │ [Input Message]     │ │
│                 │ └─────────────────────┘ │
├─────────────────┴───────────────────────────┤
│ 🔴 Recording • Timer • Session Info         │
└─────────────────────────────────────────────┘
```

**비율:**
- 코드 에디터: 70% 너비
- 사이드바: 30% 너비
- 음성 통화: 사이드바 상단 40%
- 채팅: 사이드바 하단 60%

---

## 🎨 Figma 작업 플로우

### 1. 프로젝트 설정
1. **새 파일 생성**: "CotePT Design System"
2. **페이지 구성**:
   - 🎨 Design Tokens
   - 🧩 Components
   - 📱 Mobile Screens
   - 💻 Desktop Screens
   - 🔄 Prototypes

### 2. Design Tokens 페이지 작업
1. **Color Palette** 생성
   - Primary, Success, Warning, Error, Neutral 섹션
   - 각 색상별 Shade 표시 (50, 100, 300, 500, 600, 900)

2. **Typography Scale** 생성
   - Heading, Body, Code, Caption 섹션
   - 각 텍스트 스타일 시각적 표시

3. **Spacing System** 생성
   - 4px 기준 스페이싱 (4, 8, 12, 16, 20, 24, 32, 40, 48, 64px)

### 3. Components 페이지 작업
1. **Component 생성 순서**:
   - Atoms → Molecules → Organisms 순서
   - 각 컴포넌트별 Variants 설정
   - Auto Layout 적극 활용

2. **컴포넌트 네이밍 규칙**:
   ```
   Category/ComponentName
   예: Button/Primary, Input/Text, Card/Mentor
   ```

### 4. Screens 페이지 작업
1. **Frame 설정**:
   - Mobile: iPhone 14 (390x844)
   - Desktop: Desktop (1440x1024)

2. **화면 구성 순서**:
   - 로그인/회원가입 → 대시보드 → 멘토 찾기 → 세션 룸 → VOD

### 5. Prototypes 페이지 작업
1. **사용자 플로우** 연결
2. **인터랙션** 설정
3. **애니메이션** 적용

---

## 📐 그리드 시스템

### Desktop Grid (1200px Container)
```
12 Column Grid
Column Width: 80px
Gutter: 20px
Margin: 120px (양쪽)
```

### Mobile Grid (375px)
```
4 Column Grid
Column Width: 77.5px
Gutter: 16px
Margin: 20px (양쪽)
```

---

## 🎯 디자인 원칙

### 1. 일관성 (Consistency)
- 모든 컴포넌트에서 동일한 디자인 토큰 사용
- 버튼, 입력 필드 등의 높이 통일 (44px)
- 일관된 간격 시스템 적용

### 2. 접근성 (Accessibility)
- 색상 대비 비율 4.5:1 이상 유지
- 터치 영역 최소 44x44px
- 포커스 인디케이터 명확히 표시

### 3. 사용성 (Usability)
- 중요한 액션은 Primary 버튼으로
- 로딩 상태 명확히 표시
- 에러 메시지 구체적이고 도움이 되는 내용

### 4. 확장성 (Scalability)
- 컴포넌트 기반 설계
- Auto Layout 적극 활용
- 다양한 콘텐츠 길이 대응

---

이 가이드를 따라 Figma에서 디자인 시스템을 구축하고 화면을 디자인하시면 일관성 있고 확장 가능한 UI를 만들 수 있습니다. 특정 컴포넌트나 화면에 대한 더 자세한 가이드가 필요하시면 알려주세요!