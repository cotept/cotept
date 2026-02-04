# 코테피티(Cotept) 서비스 청사진 (Master Plan)

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [시스템 아키텍처](#3-시스템-아키텍처)
4. [전체 페이지 구조](#4-전체-페이지-구조)
5. [핵심 기능 명세](#5-핵심-기능-명세)
6. [데이터베이스 설계](#6-데이터베이스-설계)
7. [인증 시스템](#7-인증-시스템)
8. [실시간 멘토링 시스템](#8-실시간-멘토링-시스템)
9. [VOD 스트리밍 시스템](#9-vod-스트리밍-시스템)
10. [관리자 시스템](#10-관리자-시스템)
11. [개발 로드맵](#11-개발-로드맵)

---

## 1. 프로젝트 개요

### 서비스 설명

코테피티는 코딩테스트를 준비하는 개발자 취준생을 위한 **1:1 실시간 멘토링 플랫폼**입니다.

### 핵심 가치 제안

- **검증된 멘토**: solved.ac Platinum 3 이상 티어 보유자만 멘토 등록 가능
- **실시간 1:1 코드 협업**: Monaco Editor + Y.js 기반 실시간 코드 공유
- **음성 멘토링**: LiveKit WebRTC 기반 고품질 음성 통화
- **세션 녹화 & VOD**: 멘토링 세션 자동 녹화 및 HLS 적응형 스트리밍 제공

### 타겟 사용자

- **멘티**: 코딩테스트를 준비하는 취업 준비생
- **멘토**: Platinum 3 이상 알고리즘 실력을 가진 현직 개발자
- **관리자**: 서비스 운영 및 품질 관리 담당자

### 개발 목표

- **기간**: 2025년 상반기 (~ 6월)
- **목적**: 포트폴리오 + 실제 서비스 런칭
- **기술 어필**: VOD 스트리밍 기술, 실시간 협업, 헥사고날 아키텍처

---

## 2. 기술 스택

### 프론트엔드

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS, shadcn/ui
- **상태관리**: Zustand, React Query (TanStack Query)
- **실시간 에디터**: Monaco Editor + Y.js
- **VOD 플레이어**: HLS.js
- **WebRTC**: LiveKit Client SDK

### 백엔드

- **프레임워크**: NestJS
- **언어**: TypeScript
- **아키텍처**: Hexagonal Architecture + DDD
- **API**: REST API + WebSocket
- **인증**: JWT (Access Token + Refresh Token)
- **실시간 통신**: LiveKit Server SDK

### 데이터베이스

- **관계형 DB**: Oracle 19c
  - 사용자, 멘토링, 결제, 리뷰 등 트랜잭션 데이터
- **NoSQL**: OCI NoSQL
  - 실시간 코드 히스토리, 채팅 로그, VOD 분석 데이터
- **캐시 & 세션**: Redis
  - 세션 관리, 토큰 블랙리스트, 속도 제한

### 미디어 스트리밍

- **실시간 통신**: LiveKit (WebRTC SFU)
- **녹화**: LiveKit Egress
- **트랜스코딩**: FFmpeg
- **스트리밍 프로토콜**: HLS (HTTP Live Streaming)
- **플레이어**: HLS.js

### 인프라 (OCI - Oracle Cloud Infrastructure)

- **컴퓨팅**:
  - Ampere A1 (4 OCPU, 24GB RAM) - Always Free
  - AMD Instance (1/8 OCPU, 1GB) × 2 - Always Free
- **스토리지**:
  - OCI Object Storage (Standard + Archive)
- **컨테이너**:
  - OCI Container Instances 또는 OKE (Oracle Kubernetes Engine)
- **CDN**:
  - Cloudflare (정적 에셋)
  - BlazingCDN (VOD 스트리밍)
- **CI/CD**: GitHub Actions
- **보안**: OCI Vault (시크릿 관리)

### 외부 서비스

- **알림**:
  - Cloud Outbound Mailer (이메일)
- **백준 연동**: solved.ac API
- **소셜 로그인**: Google, GitHub OAuth

---

## 3. 시스템 아키텍처

### 전체 시스템 구성도

```
┌─────────────────────────────────────────────────────────────┐
│                     사용자 (Browser)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Next.js 16  │  │  Monaco      │  │  HLS.js      │      │
│  │  Frontend    │  │  Editor      │  │  Player      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          │                 │                 │
┌─────────▼─────────────────▼─────────────────▼───────────────┐
│                   Cloudflare CDN                             │
│           (SSL, DDoS Protection, Static Assets)              │
└─────────┬─────────────────┬─────────────────┬───────────────┘
          │                 │                 │
          │                 │                 │
    ┌─────▼─────┐     ┌─────▼─────┐    ┌────▼──────┐
    │  NestJS   │     │  LiveKit  │    │ BlazingCDN│
    │  Backend  │     │  Server   │    │ (VOD CDN) │
    │           │     │           │    └────┬──────┘
    │  - API    │     │  - WebRTC │         │
    │  - Auth   │     │  - SFU    │         │
    │  - Logic  │     │  - Room   │         │
    └─────┬─────┘     └─────┬─────┘         │
          │                 │               │
          │                 │               │
    ┌─────▼─────────────────▼───────────────▼──────┐
    │          OCI Object Storage                   │
    │                                                │
    │  /recordings/raw/     - 원본 녹화 파일        │
    │  /recordings/hls/     - HLS 변환 파일         │
    │  /thumbnails/         - 썸네일                │
    │  /static/             - 정적 파일              │
    └────────────────┬───────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
    ┌─────▼─────┐     ┌────────▼────────┐
    │ Oracle 19c│     │  OCI NoSQL      │
    │           │     │                 │
    │ - Users   │     │ - Code History  │
    │ - Sessions│     │ - Chat Logs     │
    │ - Reviews │     │ - VOD Analytics │
    └─────┬─────┘     └─────────────────┘
          │
    ┌─────▼─────┐
    │   Redis   │
    │           │
    │ - Session │
    │ - Cache   │
    │ - Queue   │
    └───────────┘
```

### 데이터 흐름

#### 실시간 멘토링 세션

```
사용자 입장
  ↓
NestJS에서 LiveKit Token 발급
  ↓
LiveKit Room 참여 (WebRTC 연결)
  ↓
실시간 음성 통화 + 코드 공유 (Y.js WebSocket)
  ↓
LiveKit Egress 자동 녹화
  ↓
세션 종료
  ↓
OCI Object Storage에 녹화 파일 업로드
  ↓
WebHook → NestJS
  ↓
FFmpeg 트랜스코딩 (백그라운드)
  ↓
HLS 변환 완료
  ↓
DB 업데이트 (VOD 준비 완료)
```

#### VOD 시청

```
사용자 VOD 목록 조회
  ↓
NestJS API → Oracle DB 쿼리
  ↓
VOD 상세 페이지 접속
  ↓
HLS Master Playlist 로드
  ↓
HLS.js가 네트워크 상태에 따라 적절한 화질 선택
  ↓
BlazingCDN에서 세그먼트 스트리밍
  ↓
시청 진행률, 북마크 등 OCI NoSQL에 저장
```

---

## 4. 전체 페이지 구조

### 4.1 공개 페이지 (11개)

| #   | 페이지명          | 경로                   | 설명                          |
| --- | ----------------- | ---------------------- | ----------------------------- |
| 1   | 메인/랜딩         | `/`                    | 서비스 소개, 가치 제안, CTA   |
| 2   | 온보딩            | `/onboarding`          | 신규 사용자 가이드            |
| 3   | 회원가입          | `/auth/register`       | 이메일 또는 소셜 회원가입     |
| 4   | 로그인            | `/auth/login`          | 이메일 또는 소셜 로그인       |
| 5   | 아이디 찾기       | `/auth/find-id`        | 이메일/전화번호로 아이디 찾기 |
| 6   | 비밀번호 찾기     | `/auth/reset-password` | 비밀번호 재설정 링크 발송     |
| 7   | 이용약관          | `/terms/service`       | 서비스 이용약관               |
| 8   | 개인정보처리방침  | `/terms/privacy`       | 개인정보 처리 방침            |
| 9   | 백준 ID 연동 약관 | `/terms/baekjoon`      | 백준 ID 연동 동의             |
| 10  | FAQ               | `/support/faq`         | 자주 묻는 질문                |
| 11  | 공지사항          | `/notices`             | 서비스 공지사항 목록 및 상세  |

### 4.2 멘티 페이지 (17개)

| #   | 페이지명                 | 경로                 | 설명                     |
| --- | ------------------------ | -------------------- | ------------------------ |
| 12  | 멘토링 목록              | `/mentoring`         | 멘토 검색/필터링         |
| 13  | 멘토링 상세              | `/mentoring/:postId` | 멘토 정보, 리뷰, 예약    |
| 14  | 멘토링 신청 모달         | -                    | 일정 선택 및 예약        |
| 15  | 마이페이지 - 대시보드    | `/my/dashboard`      | 개요, 다가오는 세션      |
| 16  | 마이페이지 - 멘토링 내역 | `/my/sessions`       | 신청/진행/완료 세션 목록 |
| 17  | 마이페이지 - 리뷰 관리   | `/my/reviews`        | 내가 쓴 리뷰 관리        |
| 18  | 마이페이지 - 알림 센터   | `/my/notifications`  | 알림 목록 및 설정        |
| 19  | 마이페이지 - 문의 내역   | `/my/inquiries`      | 1:1 문의 내역            |
| 20  | 마이페이지 - 프로필 설정 | `/my/settings`       | 개인정보, 백준 연동      |
| 21  | VOD 메인/목록            | `/vod`               | VOD 검색/필터/정렬       |
| 22  | VOD 상세/재생            | `/vod/:recordingId`  | HLS 플레이어, 북마크     |
| 23  | VOD 플레이리스트         | `/vod/playlists`     | 큐레이션된 VOD 묶음      |
| 24  | VOD 플레이리스트 상세    | `/vod/playlists/:id` | 플레이리스트 내 VOD 목록 |
| 25  | 내 VOD 라이브러리        | `/my/vod`            | 시청 이력, 북마크        |
| 26  | 리뷰 작성 모달           | -                    | 세션 완료 후 리뷰 작성   |
| 27  | 문의하기                 | `/support/inquiry`   | 1:1 문의 작성            |
| 28  | 백준 ID 연동             | `/settings/baekjoon` | 백준 ID 인증 및 연동     |

### 4.3 멘토 페이지 (9개)

| #   | 페이지명                | 경로                        | 설명                     |
| --- | ----------------------- | --------------------------- | ------------------------ |
| 29  | 멘토 대시보드           | `/mentor/dashboard`         | 멘토 활동 개요           |
| 30  | 멘토링 포스트 작성      | `/mentor/posts/new`         | 새 멘토링 포스트 작성    |
| 31  | 멘토링 포스트 목록/수정 | `/mentor/posts`             | 내 포스트 관리           |
| 32  | 멘토링 포스트 상세/수정 | `/mentor/posts/:postId`     | 포스트 수정              |
| 33  | 멘토링 불가 일자 설정   | `/mentor/availability`      | 멘토링 가능 시간 설정    |
| 34  | 멘토링 요청 관리        | `/mentor/requests`          | 신규 예약 요청 승인/거부 |
| 35  | 예약된 세션 목록        | `/mentor/sessions/upcoming` | 예정된 세션 목록         |
| 36  | 진행한 세션 이력        | `/mentor/sessions/history`  | 완료된 세션 목록         |
| 37  | 받은 리뷰 목록          | `/mentor/reviews`           | 멘티가 작성한 리뷰       |

### 4.4 공통 세션 페이지 (2개)

| #   | 페이지명                  | 경로                        | 설명                    |
| --- | ------------------------- | --------------------------- | ----------------------- |
| 38  | 멘토링 세션 준비 (대기실) | `/session/:sessionId/lobby` | 입장 전 설정 확인       |
| 39  | 멘토링 세션 (실시간)      | `/session/:sessionId`       | 실시간 음성 + 코드 협업 |

### 4.5 관리자 페이지 (22개)

| #   | 페이지명            | 경로                         | 설명                   |
| --- | ------------------- | ---------------------------- | ---------------------- |
| 40  | 관리자 대시보드     | `/admin/dashboard`           | 서비스 전체 개요       |
| 41  | 회원 목록           | `/admin/users`               | 전체 회원 목록         |
| 42  | 회원 상세           | `/admin/users/:userId`       | 회원 정보 및 활동 내역 |
| 43  | 멘토 목록           | `/admin/mentors`             | 멘토 목록 및 상태      |
| 44  | 멘토 상세           | `/admin/mentors/:mentorId`   | 멘토 정보 및 통계      |
| 45  | 멘토 신청 검증      | `/admin/mentor-applications` | 멘토 신청 승인/거부    |
| 46  | 관리자 목록         | `/admin/admins`              | 관리자 계정 관리       |
| 47  | 세션 현황 모니터링  | `/admin/sessions/live`       | 실시간 진행 중인 세션  |
| 48  | 세션 통계           | `/admin/sessions/stats`      | 일/주/월 세션 통계     |
| 49  | 세션 목록           | `/admin/sessions`            | 전체 세션 목록         |
| 50  | 리뷰 관리           | `/admin/reviews`             | 부적절한 리뷰 관리     |
| 51  | 신고 관리           | `/admin/reports`             | 사용자 신고 처리       |
| 52  | 문의사항 관리       | `/admin/inquiries`           | 1:1 문의 답변          |
| 53  | 공지사항 관리       | `/admin/notices`             | 공지사항 작성/수정     |
| 54  | FAQ 관리            | `/admin/faq`                 | FAQ 작성/수정          |
| 55  | VOD 관리 대시보드   | `/admin/vod/dashboard`       | VOD 전체 개요          |
| 56  | VOD 목록 관리       | `/admin/vod/list`            | 전체 VOD 목록          |
| 57  | VOD 상세 관리       | `/admin/vod/:recordingId`    | VOD 메타데이터 수정    |
| 58  | VOD 업로드/처리     | `/admin/vod/upload`          | 수동 업로드 및 처리    |
| 59  | 트랜스코딩 모니터링 | `/admin/vod/transcode`       | 인코딩 작업 모니터링   |
| 60  | VOD 통계 및 분석    | `/admin/vod/analytics`       | 시청 통계 및 분석      |
| 61  | VOD 콜렉션 관리     | `/admin/vod/collections`     | 플레이리스트 관리      |

**총 페이지 수: 61개**

---

## 5. 핵심 기능 명세

### 5.1 인증 및 사용자 관리

#### 회원가입

- **이메일 회원가입**
  - 이메일 인증 (인증 코드 발송)
  - 비밀번호 설정 (bcrypt 해싱)
  - 약관 동의 (서비스, 개인정보, 백준 ID 연동)

- **소셜 회원가입**
  - Google, GitHub OAuth
  - 기존 계정 연동 (같은 이메일 자동 매칭)
  - 추가 정보 입력 (닉네임 등)

#### 로그인

- **이메일 로그인**
  - JWT Access Token (15분) + Refresh Token (7일)
  - Refresh Token은 HTTP-only Cookie
  - Access Token은 메모리 저장 (XSS 방지)

- **소셜 로그인**
  - OAuth 2.0 인증 흐름
  - 자동 계정 생성 또는 연동

#### 보안 기능

- **토큰 관리**
  - 토큰 블랙리스트 (Redis)
  - 토큰 로테이션 (패밀리 ID 기반)
  - Silent Refresh

- **CSRF 보호**
  - 이중 제출 쿠키 (Double Submit Cookie)
  - Origin/Referer 검증

- **속도 제한 (Rate Limiting)**
  - 로그인 시도: 5회/10분
  - 이메일 인증: 3회/시간
  - API 요청: 100회/분

#### 계정 복구

- **아이디 찾기**: 이메일/전화번호로 마스킹된 아이디 조회
- **비밀번호 재설정**: 이메일로 재설정 링크 발송 (1회용, 30분 유효)

### 5.2 백준 ID 연동

#### 연동 프로세스

```
백준 ID 입력
  ↓
solved.ac API 호출
  ↓
티어 및 문제 풀이 정보 조회
  ↓
DB 저장 (Oracle + OCI NoSQL)
  ↓
멘토 자격 검증 (Platinum 3 이상)
  ↓
멘토 전환 제안 (해당되는 경우)
```

#### 자동 갱신

- 24시간마다 자동 갱신
- 갱신 실패 시 알림
- 수동 갱신 버튼 제공 (1일 3회 제한)

#### 데이터 저장

- **Oracle DB**: 티어, 검증 상태, 마지막 갱신 시간
- **OCI NoSQL**: 풀이 문제 상세 정보 (JSON)

### 5.3 멘토 관리

#### 멘토 등록

```
회원가입 완료
  ↓
백준 ID 연동
  ↓
티어 확인 (Platinum 3 이상)
  ↓
멘토 전환 제안
  ↓
멘토 프로필 작성
  - 직무, 경력, 자기소개
  - 회사 이메일 인증 (선택)
  ↓
관리자 검토
  ↓
승인 → 멘토 활동 시작
```

#### 멘토링 포스트 관리

- **포스트 작성**
  - 제목, 소개, 시간당 요금
  - 멘토링 가능 시간 설정 (요일별)
  - 공개/비공개 설정

- **포스트 수정/삭제**
  - 실시간 반영
  - 예약된 세션에는 영향 없음

#### 일정 관리

- **가능 시간 설정**
  - 요일별 시간대 설정
  - 불가 일자 지정 (휴가 등)

- **예약 관리**
  - 자동 승인 또는 수동 승인
  - 예약 취소 정책

### 5.4 멘토링 예약 및 세션

#### 예약 시스템

```
멘티가 멘토링 포스트에서 일정 선택
  ↓
예약 요청 생성
  ↓
멘토 승인 (자동 또는 수동)
  ↓
알림 발송 (이메일 + 푸시)
  ↓
세션 시작 30분 전 알림
```

#### 세션 흐름

```
세션 시작 시간
  ↓
대기실 입장 (마이크/카메라 테스트)
  ↓
멘토링 룸 입장
  ↓
LiveKit Room 생성 및 참여
  ↓
실시간 음성 통화 + 코드 협업
  ↓
LiveKit Egress 자동 녹화
  ↓
세션 종료 (60분)
  ↓
리뷰 작성 요청
```

#### 세션 기능

- **음성 통화**: LiveKit WebRTC (고품질 음성)
- **코드 공유**: Monaco Editor + Y.js (실시간 동기화)
- **채팅**: 텍스트 채팅 (OCI NoSQL 저장)
- **화면 공유**: (추후 추가 고려)
- **녹화**: 자동 녹화 (음성 + 코드 히스토리)

### 5.5 VOD 스트리밍 시스템

#### VOD 생성 파이프라인

```
LiveKit Egress 녹화 완료
  ↓
OCI Object Storage 업로드 (MP4)
  ↓
WebHook → NestJS
  ↓
FFmpeg 트랜스코딩 큐에 추가
  ↓
다중 해상도 HLS 생성
  - 1080p (5000kbps)
  - 720p (2800kbps)
  - 480p (1400kbps)
  - 360p (800kbps)
  ↓
썸네일 추출 (10초 간격)
  ↓
CDN 배포 (BlazingCDN)
  ↓
DB 업데이트 (READY 상태)
  ↓
멘티/멘토에게 알림
```

#### VOD 플레이어 기능

- **적응형 스트리밍**: 네트워크 상태에 따라 자동 화질 전환
- **수동 화질 선택**: 1080p, 720p, 480p, 360p
- **재생 속도 조절**: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- **구간 반복**: A-B 구간 반복 재생
- **10초 전/후 이동**: 단축키 지원
- **북마크**: 특정 시점에 메모 추가
- **챕터**: 세션 중요 구간 자동 추출
- **이어보기**: 마지막 시청 위치 저장
- **키보드 단축키**:
  - Space: 재생/일시정지
  - ←/→: 10초 전/후
  - ↑/↓: 볼륨 조절
  - F: 전체화면
  - M: 음소거

#### VOD 검색 및 필터링

- **검색**: 제목, 멘토 이름, 태그
- **필터링**:
  - 카테고리 (DP, 그리디, 그래프 등)
  - 난이도 (Bronze ~ Platinum)
  - 멘토
  - 시청 여부
- **정렬**:
  - 최신순
  - 인기순 (조회수)
  - 평점순

#### VOD 플레이리스트

- **큐레이션**: 관리자가 테마별로 VOD 묶음 생성
- **학습 경로**: 초급 → 중급 → 고급 순서
- **멘토 시리즈**: 특정 멘토의 VOD 모음

#### VOD 분석 (OCI NoSQL)

- **시청 통계**:
  - 총 시청 횟수
  - 완주율 (끝까지 본 비율)
  - 평균 시청 시간
  - 구간별 재시청률
- **사용자 행동**:
  - 이탈 구간 분석
  - 북마크가 많은 구간
  - 반복 재생된 구간

### 5.6 리뷰 시스템

#### 리뷰 작성

```
세션 완료
  ↓
7일 이내 리뷰 작성 가능
  ↓
별점 (1~5점) + 텍스트 리뷰
  ↓
자동 필터링 (욕설, 개인정보)
  ↓
DB 저장
  ↓
멘토 평균 평점 업데이트
```

#### 리뷰 관리

- **멘티**: 내가 쓴 리뷰 수정/삭제 (7일 이내)
- **멘토**: 받은 리뷰 조회만 가능
- **관리자**: 부적절한 리뷰 숨김 처리

### 5.7 알림 시스템

#### 알림 채널

- **이메일**: Cloud Outbound Mailer
- **SMS**: SENS (중요 알림만)
- **푸시**: (추후 추가 고려)
- **인앱**: 알림 센터

#### 알림 종류

- **예약 관련**:
  - 예약 확정
  - 예약 취소
  - 세션 시작 30분 전
  - 세션 시작 5분 전

- **리뷰 관련**:
  - 새 리뷰 작성됨
  - 리뷰 작성 가능

- **멘토 관련**:
  - 멘토 신청 승인/거부
  - 새 예약 요청

- **시스템 관련**:
  - VOD 준비 완료
  - 백준 ID 갱신 실패
  - 공지사항

### 5.8 관리자 기능

#### 대시보드

- **주요 지표**:
  - 총 회원 수
  - 활성 멘토 수
  - 금일/금주/금월 세션 수
  - VOD 총 개수 및 스토리지 사용량

- **실시간 모니터링**:
  - 현재 진행 중인 세션
  - 최근 에러 로그
  - API 요청 통계

#### 멘토 관리

- **신청 검토**:
  - 백준 ID 확인
  - 티어 검증
  - 프로필 검토
  - 승인/거부 처리

- **활동 모니터링**:
  - 세션 횟수
  - 평균 평점
  - 취소율
  - 경고/정지 이력

#### 세션 관리

- **실시간 모니터링**:
  - 진행 중인 세션 목록
  - LiveKit Room 상태 확인
  - 강제 종료 (긴급 상황)

- **통계 및 분석**:
  - 일/주/월별 세션 수
  - 평균 세션 시간
  - 멘토별/멘티별 통계

#### VOD 관리

- **메타데이터 편집**:
  - 제목, 설명, 태그 수정
  - 썸네일 변경
  - 공개/비공개 설정

- **트랜스코딩 관리**:
  - 재인코딩 요청
  - 작업 큐 모니터링
  - 실패한 작업 재시도

- **스토리지 관리**:
  - 파일 크기 및 저장 위치
  - 콜드 스토리지 이동
  - 비용 분석

#### 신고 관리

- **신고 처리**:
  - 부적절한 리뷰
  - 문제 있는 세션
  - 사용자 신고

- **제재 조치**:
  - 경고
  - 일시 정지
  - 계정 비활성화

---

## 6. 데이터베이스 설계

### 6.1 Oracle 19c 스키마

#### 사용자 관리

```sql
-- USERS: 기본 사용자 정보
- user_id (PK)
- email (UNIQUE)
- password_hash
- salt
- role (MENTEE, MENTOR, ADMIN)
- status (ACTIVE, SUSPENDED, DEACTIVATED)
- phone_number
- phone_verified
- ci_hash, di_hash (본인인증)
- created_at, updated_at

-- USER_PROFILES: 사용자 프로필
- profile_id (PK)
- user_id (FK)
- full_name
- profile_image_url
- created_at, updated_at

-- MENTOR_PROFILES: 멘토 프로필
- mentor_profile_id (PK)
- user_id (FK)
- company
- position
- introduction (CLOB)
- hourly_rate
- verification_status (PENDING, APPROVED, REJECTED)
- company_email
- company_email_verified
- visibility
- created_at, updated_at

-- BAEKJOON_PROFILES: 백준 프로필
- baekjoon_profile_id (PK)
- user_id (FK)
- baekjoon_id (UNIQUE)
- current_tier
- highest_tier
- last_verified_at
- verification_status
- refresh_count
- created_at, updated_at

-- SOLVED_PROBLEMS: 해결한 문제 (메타데이터만)
- solved_id (PK)
- baekjoon_profile_id (FK)
- problem_id
- problem_tier
- solved_at
- created_at
```

#### 인증 및 세션

```sql
-- OAUTH_PROVIDERS: OAuth 제공자
- provider_id (PK)
- name (google, github)
- client_id, client_secret
- auth_url, token_url, userinfo_url
- redirect_url, scope
- active
- created_at, updated_at

-- USER_OAUTH_ACCOUNTS: 사용자별 OAuth 계정
- oauth_id (PK)
- user_id (FK)
- provider_id (FK)
- provider_user_id
- access_token, refresh_token (CLOB)
- token_expires_at
- profile_data (CLOB, JSON)
- created_at, updated_at

-- IDENTITY_PROVIDERS: 본인인증 제공자
- provider_id (PK)
- name (PASS, NICE 등)
- provider_type (phone, ipin, certificate)
- api_key, api_secret
- config (CLOB, JSON)
- active
- created_at, updated_at

-- PHONE_VERIFICATIONS: 본인인증 이력
- verification_id (PK)
- user_id (FK)
- provider_id (FK)
- request_id
- phone_number, name, birth_date, gender
- ci, di
- auth_result
- response_data (CLOB, JSON)
- status
- created_at, verified_at

-- AUTH_VERIFICATIONS: 이메일/SMS 인증
- verification_id (PK)
- user_id (FK)
- auth_type (PHONE, EMAIL, COMPANY)
- target
- verification_code
- expires_at
- verified
- verified_at
- attempt_count
- ip_address
- created_at

-- SESSION_LOGS: 세션 로그
- log_id (PK)
- user_id (FK)
- token
- ip_address
- user_agent
- expires_at
- created_at
- ended_at
- end_reason

-- TERMS: 약관
- terms_id (PK)
- title
- content (CLOB)
- type (SERVICE, PRIVACY, BAEKJOON)
- version
- required
- active
- created_at, updated_at

-- TERMS_AGREEMENTS: 약관 동의
- agreement_id (PK)
- user_id (FK)
- terms_id (FK)
- agreed
- agreed_at
- ip_address
- created_at
```

#### 멘토링 관리

```sql
-- MENTORING_POSTS: 멘토링 포스트
- post_id (PK)
- mentor_id (FK → USERS)
- title
- content (CLOB)
- hourly_rate
- active
- created_at, updated_at

-- MENTORING_AVAILABILITIES: 멘토 가능 시간
- availability_id (PK)
- mentor_id (FK)
- day_of_week (0-6)
- start_time, end_time
- created_at, updated_at

-- MENTORING_SESSIONS: 멘토링 세션
- session_id (PK)
- mentor_id (FK → USERS)
- mentee_id (FK → USERS)
- post_id (FK → MENTORING_POSTS)
- status (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELED)
- scheduled_at
- duration_minutes
- room_id (LiveKit Room ID)
- canceled_at, canceled_by, cancel_reason
- created_at, updated_at

-- SESSION_RECORDINGS: 세션 녹화
- recording_id (PK)
- session_id (FK, UNIQUE)
- object_storage_path
- status (PROCESSING, READY, ERROR)
- duration_seconds
- thumbnail_url
- master_playlist_url
- encryption_key_url, encryption_method
- format (HLS, DASH, MP4)
- cdn_domain
- storage_location
- is_processed
- created_at, updated_at

-- REVIEWS: 리뷰
- review_id (PK)
- session_id (FK)
- reviewer_id (FK → USERS)
- rating (1-5)
- content (VARCHAR2)
- visible
- created_at, updated_at
```

#### VOD 관리

```sql
-- VOD_COLLECTIONS: VOD 콜렉션
- collection_id (PK)
- title
- description (CLOB)
- thumbnail_url
- is_featured
- visibility (PUBLIC, PRIVATE, PREMIUM)
- created_at, updated_at
- created_by (FK → USERS)

-- VOD_COLLECTION_ITEMS: 콜렉션 항목
- item_id (PK)
- collection_id (FK)
- recording_id (FK)
- display_order
- created_at

-- VOD_TAGS: VOD 태그
- tag_id (PK)
- name (UNIQUE)
- category
- created_at

-- VOD_RECORDING_TAGS: 녹화-태그 연결
- recording_id (PK, FK)
- tag_id (PK, FK)
- created_at

-- VOD_VIEWS: 시청 이력
- view_id (PK)
- user_id (FK)
- recording_id (FK)
- progress_seconds
- completed
- last_watched_at
- created_at

-- VOD_BOOKMARKS: 북마크
- bookmark_id (PK)
- user_id (FK)
- recording_id (FK)
- time_seconds
- title
- note
- created_at

-- VOD_QUALITY_VARIANTS: HLS 품질 버전
- variant_id (PK)
- recording_id (FK)
- resolution (1080p, 720p, 480p, 360p)
- bitrate
- playlist_url
- created_at
```

#### 시스템 관리

```sql
-- NOTIFICATIONS: 알림
- notification_id (PK)
- user_id (FK)
- type
- title
- content
- read
- read_at
- link_url
- created_at

-- INQUIRIES: 문의사항
- inquiry_id (PK)
- user_id (FK)
- title
- content (CLOB)
- status (PENDING, IN_PROGRESS, RESOLVED, REJECTED)
- answer_content (CLOB)
- answered_at
- answered_by (FK → USERS)
- created_at, updated_at

-- SYSTEM_LOGS: 시스템 로그
- log_id (PK)
- log_type
- user_id (FK)
- action
- details (CLOB)
- ip_address
- created_at
```

#### 권한 관리 (RBAC + ABAC)

```sql
-- ATTRIBUTES: 속성 정의
- attribute_id (PK)
- name (UNIQUE)
- description
- attribute_type (USER, RESOURCE, CONTEXT)
- data_type (STRING, NUMBER, BOOLEAN, DATE)
- created_at, updated_at

-- POLICIES: 정책
- policy_id (PK)
- name (UNIQUE)
- description
- priority
- active
- action_type (ALLOW, DENY)
- resource_type (SESSION, VOD, REVIEW 등)
- operation (READ, WRITE, JOIN, CANCEL 등)
- created_at, updated_at

-- POLICY_ATTRIBUTE_CONDITIONS: 정책 조건
- condition_id (PK)
- policy_id (FK)
- attribute_id (FK)
- operator (EQUALS, NOT_EQUALS, GREATER_THAN 등)
- value_string, value_number, value_boolean, value_date
- target_type (USER, RESOURCE, CONTEXT)
- created_at

-- ROLE_POLICIES: 역할-정책 연결
- role_policy_id (PK)
- role (MENTEE, MENTOR, ADMIN)
- policy_id (FK)
- created_at
```

### 6.2 OCI NoSQL 컬렉션

#### session_codes: 실시간 코드 히스토리

```json
{
  "session_id": "uuid", // Partition Key
  "timestamp": 1234567890, // Sort Key
  "user_id": "uuid",
  "code_snapshot": "string",
  "language": "python"
}
```

#### session_chats: 세션 채팅 로그

```json
{
  "session_id": "uuid", // Partition Key
  "timestamp": 1234567890, // Sort Key
  "user_id": "uuid",
  "message": "string",
  "read": false
}
```

#### user_solved_problems: 백준 문제 풀이 상세

```json
{
  "user_id": "uuid", // Partition Key
  "baekjoon_id": "string",
  "updated_at": 1234567890,
  "problem_count": 1234,
  "tier_stats": {
    "bronze": 100,
    "silver": 200,
    "gold": 150,
    "platinum": 50
  },
  "problems": [
    {
      "problem_id": "1000",
      "title": "A+B",
      "tier": "Bronze V",
      "solved_at": "2024-01-01"
    }
  ]
}
```

#### vod_analytics: VOD 시청 분석

```json
{
  "recording_id": "uuid", // Partition Key
  "date": "2024-01-01", // Sort Key
  "views_count": 123,
  "complete_views_count": 45,
  "average_watch_time": 1800,
  "completion_rate": 0.75,
  "viewer_demographics": {
    "age_groups": {},
    "regions": {}
  },
  "popular_segments": [
    {
      "start": 300,
      "end": 600,
      "replay_count": 50
    }
  ]
}
```

#### user_watch_history: 사용자 시청 이력 상세

```json
{
  "user_id": "uuid", // Partition Key
  "timestamp": 1234567890, // Sort Key
  "recording_id": "uuid",
  "duration_seconds": 1800,
  "completed": true,
  "device_info": {
    "platform": "desktop",
    "browser": "chrome"
  }
}
```

#### user_activities: 사용자 활동 로그

```json
{
  "user_id": "uuid", // Partition Key
  "timestamp": 1234567890, // Sort Key
  "activity_type": "login",
  "details": {
    "ip": "192.168.1.1",
    "user_agent": "..."
  },
  "ip_address": "192.168.1.1"
}
```

### 6.3 Redis 데이터 구조

#### 세션 관리

```
session:{token} → {user_id, username, roles, permissions, ...}
user_sessions:{user_id} → Set[token1, token2, ...]
```

#### 토큰 블랙리스트

```
blacklist:{token} → "revoked"  (TTL: 토큰 만료 시간)
refresh_family:{user_id}:{family_id} → {refresh_token, ...}
```

#### 인증 코드

```
email_verify:{email} → "123456"  (TTL: 5분)
sms_verify:{phone} → "123456"    (TTL: 3분)
```

#### CSRF 토큰

```
csrf:{user_id} → "random_token"  (TTL: 1시간)
```

#### 속도 제한

```
rate_limit:login:{ip} → count  (TTL: 10분)
rate_limit:email_verify:{email} → count  (TTL: 1시간)
```

#### 캐시

```
user:{user_id} → {user data}  (TTL: 1시간)
mentor_posts → [list of posts]  (TTL: 5분)
```

---

## 7. 인증 시스템

### 7.1 JWT 기반 인증

#### 토큰 구조

**Access Token (15분)**

```json
{
  "sub": "user_id",
  "username": "user123",
  "role": "MENTEE",
  "permissions": ["sessions:read", "posts:read"],
  "iat": 1234567890,
  "exp": 1234568790
}
```

**Refresh Token (7일)**

```json
{
  "sub": "user_id",
  "family_id": "uuid",
  "iat": 1234567890,
  "exp": 1234972890
}
```

#### 토큰 저장

- **Access Token**: 메모리 (변수) - XSS 방지
- **Refresh Token**: HTTP-only, Secure, SameSite=Strict 쿠키

#### 인증 흐름

```
로그인 요청
  ↓
사용자 인증 (이메일/비밀번호 또는 OAuth)
  ↓
Access Token + Refresh Token 발급
  ↓
Access Token을 Authorization 헤더에 포함하여 API 요청
  ↓
Access Token 만료
  ↓
Silent Refresh (백그라운드)
  ↓
Refresh Token으로 새 Access Token 발급
  ↓
새 Refresh Token도 발급 (토큰 로테이션)
  ↓
계속 서비스 이용
```

### 7.2 보안 기능

#### 토큰 블랙리스트

```
로그아웃 요청
  ↓
현재 Access Token을 Redis에 저장
  ↓
TTL = 토큰 원래 만료 시간
  ↓
이후 해당 토큰으로 요청 시 거부
```

#### 토큰 로테이션

```
Refresh Token 사용
  ↓
패밀리 ID 확인 (Redis)
  ↓
유효한 패밀리 ID인 경우:
  - 기존 패밀리 삭제
  - 새 패밀리 ID로 새 Refresh Token 발급
  ↓
유효하지 않은 패밀리 ID인 경우:
  - 토큰 도난으로 간주
  - 해당 사용자의 모든 세션 무효화
  - 사용자에게 알림
```

#### CSRF 보호

```
로그인 성공
  ↓
CSRF 토큰 생성 (랜덤 문자열)
  ↓
Redis에 저장: csrf:{user_id} → token
  ↓
쿠키와 응답 본문에 모두 전달
  ↓
상태 변경 요청 시 헤더에 CSRF 토큰 포함
  ↓
서버에서 쿠키의 토큰과 헤더의 토큰 비교
  ↓
일치하면 요청 허용
```

### 7.3 소셜 로그인

#### OAuth 2.0 흐름

```
사용자가 "Google로 로그인" 클릭
  ↓
Google 인증 페이지로 리다이렉트
  ↓
사용자 로그인 및 권한 승인
  ↓
콜백 URL로 인증 코드 전달
  ↓
NestJS에서 인증 코드로 Access Token 요청
  ↓
Google API로 사용자 프로필 조회
  ↓
기존 사용자 확인 (이메일 기준)
  ↓
있으면: 로그인 처리
없으면: 신규 회원가입 처리
  ↓
JWT 토큰 발급
```

#### 계정 연동

- 같은 이메일로 여러 소셜 계정 연동 가능
- 연동된 계정으로 로그인 시 동일한 사용자로 인식

<!-- ### 7.4 본인인증 (PASS)

#### 인증 흐름

```
회원가입 시 본인인증 요청
  ↓
PASS API 호출 (본인인증 시작)
  ↓
사용자 휴대폰으로 PASS 앱 푸시 알림
  ↓
PASS 앱에서 본인인증 수행
  ↓
PASS 서버에서 결과 콜백
  ↓
CI/DI 정보 수신
  ↓
CI/DI 해시화하여 DB 저장
  ↓
중복 가입 여부 확인 (DI 기준)
  ↓
회원가입 계속 진행
``` -->

---

## 8. 실시간 멘토링 시스템

### 8.1 LiveKit 아키텍처

#### 배포 전략

**Phase 1: 개발/테스트 (~ 3월)**

- LiveKit Cloud (관리형 서비스)
- 빠른 프로토타이핑
- 무료 티어 활용

**Phase 2: 프로덕션 (4월 ~)**

- Self-hosted on OCI
- Ampere A1 (4 OCPU, 24GB RAM)
- 최대 20-30 동시 세션 지원

#### LiveKit 구성 요소

```
┌─────────────────┐
│  LiveKit Server │
│  (SFU)          │
│                 │
│  - Room Mgmt    │
│  - WebRTC Conn  │
│  - Auth/Token   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼─────┐
│Egress │ │Ingress │
│       │ │        │
│Record │ │Stream  │
└───────┘ └────────┘
```

### 8.2 실시간 코드 협업

#### Y.js CRDT 동기화

**아키텍처**

```
┌──────────────┐         ┌──────────────┐
│  Mentee      │         │  Mentor      │
│  Monaco + Y  │         │  Monaco + Y  │
└──────┬───────┘         └──────┬───────┘
       │                        │
       │    WebSocket (Y.js)    │
       └──────────┬─────────────┘
                  │
           ┌──────▼──────┐
           │  NestJS WS  │
           │  Y Server   │
           └──────┬──────┘
                  │
           ┌──────▼──────┐
           │  OCI NoSQL  │
           │  Code Log   │
           └─────────────┘
```

**동기화 방식**

- **Option A**: LiveKit Data Channel 사용

  ```typescript
  room.localParticipant.publishData(encoder.encode(yUpdate), DataPacket_Kind.RELIABLE)
  ```

- **Option B**: 별도 WebSocket 서버 (선호)
  - Y.js 전용 WebSocket 서버
  - LiveKit은 음성만 담당
  - 더 안정적인 코드 동기화

#### Monaco Editor 설정

```typescript
// 실시간 협업 설정
const ytext = ydoc.getText("monaco")
const binding = new MonacoBinding(ytext, editor.getModel(), new Set([editor]), awareness)

// 커서 및 셀렉션 동기화
awareness.setLocalStateField("user", {
  name: user.name,
  color: user.color,
  cursor: editor.getPosition(),
})
```

### 8.3 세션 워크플로우

#### 세션 생성

```typescript
// 1. DB에 세션 생성
const session = await this.sessionsRepository.create({
  mentor_id,
  mentee_id,
  post_id,
  scheduled_at,
  duration_minutes: 60,
  status: "SCHEDULED",
})

// 2. LiveKit Room 생성
const room = await this.livekit.createRoom({
  name: `session-${session.id}`,
  emptyTimeout: 300, // 5분
  maxParticipants: 2,
})

// 3. LiveKit Token 발급 (멘토/멘티용)
const tokenMentor = await this.livekit.createToken({
  identity: mentor_id,
  name: mentor.name,
  metadata: JSON.stringify({ role: "mentor" }),
})

const tokenMentee = await this.livekit.createToken({
  identity: mentee_id,
  name: mentee.name,
  metadata: JSON.stringify({ role: "mentee" }),
})

// 4. 토큰 반환
return { room_id: room.name, tokenMentor, tokenMentee }
```

#### 세션 시작

```typescript
// 1. 대기실에서 마이크/네트워크 테스트
// 2. LiveKit Room 입장
const room = new Room()
await room.connect(LIVEKIT_URL, token)

// 3. 오디오 트랙 활성화
await room.localParticipant.setMicrophoneEnabled(true)

// 4. 녹화 시작 (서버에서 자동)
await this.recordingAdapter.startRecording(session.id, room.name)
```

#### 세션 종료

```typescript
// 1. LiveKit Room 퇴장
await room.disconnect()

// 2. 녹화 중지 (서버에서 자동)
await this.recordingAdapter.stopRecording(egressId)

// 3. DB 세션 상태 업데이트
await this.sessionsRepository.update(session.id, {
  status: "COMPLETED",
  ended_at: new Date(),
})

// 4. 리뷰 작성 알림
await this.notificationService.sendReviewRequest(mentee_id, session.id)
```

---

## 9. VOD 스트리밍 시스템

### 9.1 녹화 파이프라인

#### 전체 흐름

```
LiveKit Egress 녹화 시작
  ↓
세션 진행 (음성 + 코드)
  ↓
세션 종료 → Egress 자동 종료
  ↓
MP4 파일 생성
  ↓
OCI Object Storage 업로드
  /recordings/raw/{session_id}/{timestamp}.mp4
  ↓
WebHook → NestJS
  ↓
트랜스코딩 작업 큐에 추가 (Bull Queue)
  ↓
FFmpeg 백그라운드 작업 시작
  ↓
다중 해상도 HLS 생성
  - 1080p: /recordings/hls/{id}/1080p/
  - 720p:  /recordings/hls/{id}/720p/
  - 480p:  /recordings/hls/{id}/480p/
  - 360p:  /recordings/hls/{id}/360p/
  ↓
마스터 플레이리스트 생성
  /recordings/hls/{id}/master.m3u8
  ↓
썸네일 추출 (10초 간격)
  /thumbnails/{id}/thumb_00001.jpg
  ↓
CDN 배포 (BlazingCDN)
  ↓
DB 업데이트 (status: READY)
  ↓
멘티/멘토에게 알림
```

### 9.2 HLS 적응형 스트리밍

#### 마스터 플레이리스트 (master.m3u8)

```m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480
480p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p/playlist.m3u8
```

#### 품질별 플레이리스트 (1080p/playlist.m3u8)

```m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXTINF:6.000000,
segment_000.ts
#EXTINF:6.000000,
segment_001.ts
#EXTINF:6.000000,
segment_002.ts
...
#EXT-X-ENDLIST
```

#### FFmpeg 트랜스코딩 명령어

```bash
# 1080p
ffmpeg -i input.mp4 \
  -vf scale=1920:1080 \
  -c:v libx264 -b:v 5000k \
  -c:a aac -b:a 128k \
  -hls_time 6 \
  -hls_playlist_type vod \
  -hls_segment_filename "recordings/hls/{id}/1080p/segment_%03d.ts" \
  "recordings/hls/{id}/1080p/playlist.m3u8"

# 720p
ffmpeg -i input.mp4 \
  -vf scale=1280:720 \
  -c:v libx264 -b:v 2800k \
  -c:a aac -b:a 128k \
  -hls_time 6 \
  -hls_playlist_type vod \
  -hls_segment_filename "recordings/hls/{id}/720p/segment_%03d.ts" \
  "recordings/hls/{id}/720p/playlist.m3u8"

# 480p, 360p도 동일한 방식
```

#### 썸네일 추출

```bash
ffmpeg -i input.mp4 \
  -vf "fps=1/10,scale=320:180" \
  "thumbnails/{id}/thumb_%05d.jpg"
```

### 9.3 HLS.js 플레이어 구현

#### 기본 설정

```typescript
import Hls from "hls.js"

const video = document.querySelector("video")
const hls = new Hls({
  debug: false,
  enableWorker: true,
  lowLatencyMode: false,
  backBufferLength: 90,
  maxBufferLength: 30,
  maxMaxBufferLength: 60,
})

// HLS 소스 로드
hls.loadSource(masterPlaylistUrl)
hls.attachMedia(video)

// 자동 재생
hls.on(Hls.Events.MANIFEST_PARSED, () => {
  video.play()
})
```

#### 품질 수동 선택

```typescript
// 사용 가능한 품질 목록
const levels = hls.levels.map((level, index) => ({
  index,
  height: level.height,
  bitrate: level.bitrate,
}))

// 품질 변경
function changeQuality(levelIndex) {
  hls.currentLevel = levelIndex
}

// 자동 품질 조절
function enableAutoQuality() {
  hls.currentLevel = -1 // -1 = auto
}
```

#### 이어보기 기능

```typescript
// 시청 진행률 저장 (5초마다)
setInterval(() => {
  const progress = video.currentTime
  saveProgress(recordingId, progress)
}, 5000)

// 로드 시 이전 위치로 이동
const savedProgress = await getProgress(recordingId)
if (savedProgress) {
  video.currentTime = savedProgress
}
```

#### 북마크 기능

```typescript
function addBookmark() {
  const time = video.currentTime
  const title = prompt("북마크 제목")
  const note = prompt("메모 (선택)")

  await createBookmark({
    recording_id: recordingId,
    time_seconds: time,
    title,
    note,
  })
}

// 북마크 이동
function jumpToBookmark(time) {
  video.currentTime = time
}
```

#### 구간 반복

```typescript
let loopStart = null
let loopEnd = null

function setLoopStart() {
  loopStart = video.currentTime
}

function setLoopEnd() {
  loopEnd = video.currentTime
}

video.addEventListener("timeupdate", () => {
  if (loopStart && loopEnd && video.currentTime >= loopEnd) {
    video.currentTime = loopStart
  }
})
```

### 9.4 CDN 전략

#### 멀티 CDN 구성

- **Cloudflare**: 정적 에셋 (HTML, CSS, JS, 이미지)
- **BlazingCDN**: VOD 스트리밍 (HLS 세그먼트)

#### URL 구조

```
https://cdn.cotept.com/static/...        (Cloudflare)
https://vod.cotept.com/hls/...          (BlazingCDN)
https://vod.cotept.com/thumbnails/...   (BlazingCDN)
```

#### 캐싱 정책

```
master.m3u8:        Cache-Control: max-age=3600
playlist.m3u8:      Cache-Control: max-age=3600
segment_*.ts:       Cache-Control: max-age=31536000 (1년)
thumb_*.jpg:        Cache-Control: max-age=31536000 (1년)
```

### 9.5 스토리지 관리

#### 스토리지 계층

```
Hot Storage (OCI Object Storage Standard)
  - 최근 30일 VOD
  - 자주 접근하는 콘텐츠
  - 빠른 검색 필요

Cold Storage (OCI Archive Storage)
  - 30일 이상 된 VOD
  - 거의 접근하지 않는 콘텐츠
  - 비용 절감
```

#### 자동 아카이빙

```typescript
// 매일 자정 실행되는 Cron Job
@Cron('0 0 * * *')
async archiveOldRecordings() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const oldRecordings = await this.recordingsRepository.findOlderThan(
    thirtyDaysAgo
  );

  for (const recording of oldRecordings) {
    // OCI Object Storage에서 Archive Tier로 이동
    await this.ociStorage.moveToArchive(recording.object_storage_path);

    // DB 업데이트
    await this.recordingsRepository.update(recording.id, {
      storage_tier: 'ARCHIVE'
    });
  }
}
```

---

## 10. 관리자 시스템

### 10.1 대시보드

#### 주요 지표

```typescript
// 실시간 통계
{
  totalUsers: 12345,
  activeMentors: 234,
  todaySessions: 45,
  thisWeekSessions: 312,
  thisMonthSessions: 1456,
  totalVODs: 5678,
  storageUsed: "2.5 TB",
  activeSessionsNow: 3
}
```

#### 차트 데이터

- 일별 세션 수 (최근 30일)
- 주별 신규 가입자 (최근 12주)
- VOD 시청 추이 (최근 30일)
- 멘토별 세션 분포

### 10.2 멘토 관리

#### 신청 검토 프로세스

```
멘토 신청 접수
  ↓
관리자 검토 페이지에 표시
  ↓
백준 ID 자동 검증 (solved.ac API)
  ↓
티어 확인 (Platinum 3 이상)
  ↓
프로필 검토 (직무, 경력, 자기소개)
  ↓
회사 이메일 인증 여부 확인
  ↓
승인/거부 결정
  ↓
멘토에게 결과 알림
  ↓
승인 시: 멘토 활동 시작 가능
거부 시: 거부 사유 전달
```

#### 멘토 통계

```typescript
{
  mentor_id: "uuid",
  total_sessions: 123,
  average_rating: 4.8,
  cancel_rate: 0.02,
  total_earnings: 1234000,
  warnings: 0,
  suspension_history: []
}
```

### 10.3 세션 모니터링

#### 실시간 세션 목록

```typescript
// /admin/sessions/live
;[
  {
    session_id: "uuid",
    room_id: "session-uuid",
    mentor: { name, profile_image },
    mentee: { name, profile_image },
    started_at: "2024-01-15T10:00:00Z",
    duration: "35분 경과",
    status: "IN_PROGRESS",
    participants: 2,
  },
]
```

#### 강제 종료 기능

```typescript
async forceEndSession(sessionId: string, reason: string) {
  // 1. LiveKit Room 종료
  await this.livekit.deleteRoom(`session-${sessionId}`);

  // 2. 녹화 중지
  await this.recordingAdapter.stopRecording(egressId);

  // 3. DB 업데이트
  await this.sessionsRepository.update(sessionId, {
    status: 'CANCELED',
    canceled_by: 'admin',
    cancel_reason: reason
  });

  // 4. 참가자에게 알림
  await this.notificationService.sendSessionForceEnded(
    sessionId,
    reason
  );
}
```

### 10.4 VOD 관리

#### 메타데이터 편집

```typescript
// /admin/vod/:recordingId
{
  recording_id: "uuid",
  title: "DP 기초부터 심화까지",
  description: "동적 계획법의 모든 것",
  tags: ["DP", "알고리즘", "고급"],
  category: "동적 계획법",
  difficulty: "GOLD",
  thumbnail_url: "...",
  visibility: "PUBLIC",
  featured: false
}
```

#### 트랜스코딩 재실행

```typescript
async retranscode(recordingId: string) {
  // 1. 기존 HLS 파일 삭제
  await this.ociStorage.deleteDirectory(
    `recordings/hls/${recordingId}`
  );

  // 2. 원본 파일 경로 조회
  const recording = await this.recordingsRepository.findById(recordingId);

  // 3. 트랜스코딩 작업 재추가
  await this.transcodeQueue.add('transcode', {
    recording_id: recordingId,
    source_path: recording.object_storage_path
  });

  // 4. 상태 업데이트
  await this.recordingsRepository.update(recordingId, {
    status: 'PROCESSING'
  });
}
```

#### 스토리지 비용 분석

```typescript
// /admin/vod/storage
{
  total_storage: "2.5 TB",
  standard_tier: "1.8 TB",
  archive_tier: "0.7 TB",
  monthly_cost_estimate: {
    standard: "$45",
    archive: "$1.75",
    total: "$46.75"
  },
  breakdown: {
    raw_recordings: "800 GB",
    hls_1080p: "500 GB",
    hls_720p: "300 GB",
    hls_480p: "200 GB",
    hls_360p: "100 GB",
    thumbnails: "50 GB",
    archived: "700 GB"
  }
}
```

### 10.5 신고 관리

#### 신고 유형

- 부적절한 리뷰
- 세션 중 문제 행동
- 멘토 자격 의심
- 기타

#### 처리 프로세스

```
신고 접수
  ↓
관리자 검토
  ↓
증거 자료 확인 (녹화 영상, 채팅 로그)
  ↓
판단
  ↓
조치
  - 경고
  - 일시 정지 (7일/30일)
  - 계정 비활성화
  ↓
신고자 및 피신고자에게 알림
```

---

## 11. 개발 로드맵

### Phase 1: 인프라 및 기본 구조 (2주)

**Week 1-2 (2월 1주 ~ 2주)**

- [x] 프로젝트 초기화 (Next.js 16, NestJS)
- [ ] OCI 인프라 설정
  - [ ] Oracle 19c 설정
  - [ ] Redis 설정
  - [ ] OCI Object Storage 설정
- [ ] GitHub Actions CI/CD 구성
- [ ] 헥사고날 아키텍처 폴더 구조 설정

### Phase 2: 인증 시스템 (3주)

**Week 3-5 (2월 3주 ~ 3월 1주)**

- [ ] JWT 인증 구현
  - [ ] Access Token + Refresh Token
  - [ ] 토큰 블랙리스트 (Redis)
  - [ ] 토큰 로테이션
- [ ] 이메일 회원가입/로그인
- [ ] 소셜 로그인 (Google, GitHub)
- [ ] CSRF 보호
- [ ] 계정 복구 (아이디 찾기, 비밀번호 재설정)

### Phase 3: 사용자 및 멘토 관리 (2주)

**Week 6-7 (3월 2주 ~ 3주)**

- [ ] 사용자 프로필 관리
- [ ] 백준 ID 연동 (solved.ac API)
- [ ] 멘토 등록 시스템
  - [ ] 멘토 프로필 작성
  - [ ] 관리자 검토 시스템
- [ ] 멘토링 포스트 CRUD
- [ ] 멘토 가능 시간 설정

### Phase 4: 멘토링 예약 및 세션 (3주)

**Week 8-10 (3월 4주 ~ 4월 2주)**

- [ ] 멘토링 목록/검색/필터
- [ ] 예약 시스템
  - [ ] 일정 선택
  - [ ] 예약 승인/거부
- [ ] 알림 시스템 (이메일, SMS)
- [ ] LiveKit 통합
  - [ ] LiveKit Cloud 연결 (개발용)
  - [ ] Room 생성 및 Token 발급
- [ ] 실시간 세션 페이지
  - [ ] 음성 통화 (LiveKit)
  - [ ] 코드 협업 (Monaco + Y.js)
  - [ ] 채팅

### Phase 5: VOD 녹화 및 스트리밍 (4주)

**Week 11-14 (4월 3주 ~ 5월 2주)**

- [ ] LiveKit Egress 녹화 구현
- [ ] WebHook 처리
- [ ] FFmpeg 트랜스코딩 파이프라인
  - [ ] 다중 해상도 HLS 생성
  - [ ] 썸네일 추출
- [ ] CDN 연동 (BlazingCDN)
- [ ] HLS.js 플레이어 구현
  - [ ] 적응형 스트리밍
  - [ ] 품질 선택
  - [ ] 재생 속도 조절
  - [ ] 북마크
  - [ ] 이어보기
- [ ] VOD 목록/검색/필터
- [ ] VOD 플레이리스트

### Phase 6: 리뷰 및 부가 기능 (1주)

**Week 15 (5월 3주)**

- [ ] 리뷰 시스템
- [ ] 내 VOD 라이브러리
- [ ] FAQ 페이지
- [ ] 문의하기 시스템

### Phase 7: 관리자 시스템 (2주)

**Week 16-17 (5월 4주 ~ 6월 1주)**

- [ ] 관리자 대시보드
- [ ] 회원/멘토 관리
- [ ] 멘토 신청 검증
- [ ] 세션 모니터링
- [ ] VOD 관리
  - [ ] 메타데이터 편집
  - [ ] 트랜스코딩 모니터링
  - [ ] 스토리지 관리
- [ ] 신고 관리
- [ ] 문의/공지사항/FAQ 관리

### Phase 8: LiveKit Self-hosted 마이그레이션 (1주)

**Week 18 (6월 2주)**

- [ ] OCI에 LiveKit Server 배포
- [ ] LiveKit Egress 배포
- [ ] 성능 테스트 및 최적화

### Phase 9: 테스트 및 최적화 (2주)

**Week 19-20 (6월 3주 ~ 4주)**

- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] E2E 테스트
- [ ] 성능 최적화
- [ ] 보안 점검
- [ ] 사용자 경험 개선

### Phase 10: 베타 런칭 및 피드백 (진행 중)

**Week 21+ (7월 ~)**

- [ ] 베타 사용자 모집
- [ ] 피드백 수집 및 개선
- [ ] 버그 수정
- [ ] 기능 추가/개선

---

## 부록

### A. 기술 결정 사항 (ADR)

#### ADR-001: LiveKit vs Pion

**결정**: LiveKit 채택
**이유**:

- 빠른 개발 (3-6주 절약)
- 프로덕션 레벨 안정성
- 녹화 기능 built-in
- OCI Self-hosted 가능

#### ADR-002: 결제 시스템 제외

**결정**: 결제 기능 구현 안 함
**이유**:

- 실무 경험 이미 보유
- 포트폴리오 핵심이 아님
- 개발 시간 절약 (VOD에 집중)

#### ADR-003: HLS vs DASH

**결정**: HLS 채택
**이유**:

- 더 넓은 브라우저 지원
- Apple 디바이스 호환성
- HLS.js 라이브러리 성숙도

#### ADR-004: 멀티 CDN 전략

**결정**: Cloudflare + BlazingCDN
**이유**:

- 정적 에셋과 VOD 분리
- 비용 최적화
- 성능 향상

### B. API 엔드포인트 목록

#### 인증 (Auth)

```
POST   /api/auth/register              # 회원가입
POST   /api/auth/login                 # 로그인
POST   /api/auth/logout                # 로그아웃
POST   /api/auth/refresh               # 토큰 갱신
POST   /api/auth/find-id               # 아이디 찾기
POST   /api/auth/reset-password        # 비밀번호 재설정 요청
POST   /api/auth/reset-password/verify # 비밀번호 재설정 실행
GET    /api/auth/social/:provider      # 소셜 로그인
GET    /api/auth/social/:provider/callback # OAuth 콜백
```

#### 사용자 (Users)

```
GET    /api/users/me                   # 내 정보
PATCH  /api/users/me                   # 내 정보 수정
GET    /api/users/me/profile           # 내 프로필
PATCH  /api/users/me/profile           # 프로필 수정
POST   /api/users/me/baekjoon          # 백준 ID 연동
PATCH  /api/users/me/baekjoon/refresh  # 백준 정보 갱신
```

#### 멘토 (Mentors)

```
POST   /api/mentors/apply              # 멘토 신청
GET    /api/mentors/posts              # 멘토링 포스트 목록
POST   /api/mentors/posts              # 포스트 작성
GET    /api/mentors/posts/:id          # 포스트 상세
PATCH  /api/mentors/posts/:id          # 포스트 수정
DELETE /api/mentors/posts/:id          # 포스트 삭제
GET    /api/mentors/availability       # 가능 시간 조회
POST   /api/mentors/availability       # 가능 시간 설정
GET    /api/mentors/dashboard          # 멘토 대시보드
GET    /api/mentors/reviews            # 받은 리뷰
```

#### 멘토링 (Mentoring)

```
GET    /api/mentoring/posts            # 멘토링 목록
GET    /api/mentoring/posts/:id        # 멘토링 상세
POST   /api/mentoring/sessions         # 예약 생성
GET    /api/mentoring/sessions/:id     # 세션 상세
PATCH  /api/mentoring/sessions/:id     # 세션 수정
DELETE /api/mentoring/sessions/:id     # 예약 취소
POST   /api/mentoring/sessions/:id/join # 세션 입장 토큰
GET    /api/mentoring/my-sessions      # 내 세션 목록
```

#### 리뷰 (Reviews)

```
POST   /api/reviews                    # 리뷰 작성
GET    /api/reviews/:id                # 리뷰 상세
PATCH  /api/reviews/:id                # 리뷰 수정
DELETE /api/reviews/:id                # 리뷰 삭제
GET    /api/users/me/reviews           # 내가 쓴 리뷰
```

#### VOD

```
GET    /api/vod                        # VOD 목록
GET    /api/vod/:id                    # VOD 상세
POST   /api/vod/:id/bookmark           # 북마크 추가
GET    /api/vod/:id/bookmarks          # 북마크 목록
DELETE /api/vod/bookmark/:id           # 북마크 삭제
POST   /api/vod/:id/view               # 시청 기록
GET    /api/vod/:id/progress           # 시청 진행률
GET    /api/vod/playlists              # 플레이리스트 목록
GET    /api/vod/playlists/:id          # 플레이리스트 상세
GET    /api/users/me/vod               # 내 라이브러리
```

#### 알림 (Notifications)

```
GET    /api/notifications              # 알림 목록
PATCH  /api/notifications/:id/read     # 읽음 처리
DELETE /api/notifications/:id          # 알림 삭제
```

#### 문의 (Inquiries)

```
POST   /api/inquiries                  # 문의 작성
GET    /api/inquiries                  # 내 문의 목록
GET    /api/inquiries/:id              # 문의 상세
```

#### 관리자 (Admin)

```
GET    /api/admin/dashboard            # 대시보드
GET    /api/admin/users                # 회원 목록
GET    /api/admin/users/:id            # 회원 상세
PATCH  /api/admin/users/:id            # 회원 정보 수정
GET    /api/admin/mentors              # 멘토 목록
GET    /api/admin/mentor-applications  # 멘토 신청 목록
PATCH  /api/admin/mentor-applications/:id # 승인/거부
GET    /api/admin/sessions/live        # 실시간 세션
POST   /api/admin/sessions/:id/force-end # 강제 종료
GET    /api/admin/sessions/stats       # 세션 통계
GET    /api/admin/vod                  # VOD 목록
PATCH  /api/admin/vod/:id              # VOD 메타데이터 수정
POST   /api/admin/vod/:id/retranscode  # 재인코딩
GET    /api/admin/vod/transcode/queue  # 트랜스코딩 큐
GET    /api/admin/reports              # 신고 목록
PATCH  /api/admin/reports/:id          # 신고 처리
GET    /api/admin/inquiries            # 문의 목록
POST   /api/admin/inquiries/:id/answer # 문의 답변
```

#### WebHook

```
POST   /api/webhooks/livekit           # LiveKit WebHook
```

### C. 환경 변수

```env
# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=https://cotept.com
BACKEND_URL=https://api.cotept.com

# Database
DB_HOST=localhost
DB_PORT=1521
DB_USERNAME=cotept_user
DB_PASSWORD=
DB_NAME=COTEPT

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=


# solved.ac
SOLVEDAC_API_KEY=

# LiveKit
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# OCI
OCI_ACCESS_KEY=
OCI_SECRET_KEY=
OCI_REGION=ap-seoul-1
OCI_ENDPOINT=https://compat.objectstorage.ap-seoul-1.oraclecloud.com
OCI_BUCKET_RECORDINGS=cotept-recordings
OCI_BUCKET_THUMBNAILS=cotept-thumbnails

# CDN
CLOUDFLARE_DOMAIN=cdn.cotept.com
BLAZING_CDN_DOMAIN=vod.cotept.com

# Monitoring
SENTRY_DSN=
```

---

**문서 버전**: 1.0
**최종 수정일**: 2025-02-01
**작성자**: 승재 + Claude (워커)
