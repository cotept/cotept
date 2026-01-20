# Core Instructions

- **Language:** Always answer in **Korean** (한국어) by default.
- **Looking:** check the project structure and understand the relationships between packages and apps.

## 프로젝트 구조 (Project Structure)

### 1. Monorepo (Turborepo + pnpm)

이 프로젝트는 Turborepo와 pnpm workspace를 사용하는 모노레포 구조입니다.

- **apps/**: 실제 애플리케이션 (`web`, `api`)
- **packages/**: 공유 패키지 (`shared`, `api-client`, 설정 파일들)
- **docker/**: Docker 컨테이너 설정
- **terraform/**: OCI(Oracle Cloud Infrastructure) 인프라 코드

### 2. Web Application (`apps/web`)

- **Framework**: Next.js 16 (App Router 사용)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4, CSS Modules
- **State Management**: Zustand, React Query (@tanstack/react-query)
- **Form Handling**: React Hook Form, Zod
- **Authentication**: NextAuth.js (v5 beta)
- **Directory Structure**:
  - `src/app`: 라우트 그룹을 활용한 구조 (`(auth)`, `(dashboard)`, `(main)`, `(mentoring)` 등)
  - `src/features`: 기능(Feature) 기반 아키텍처 적용
  - `src/containers`: 페이지 로직 컨테이너
  - `src/shared`: 웹 전용 공유 컴포넌트 및 유틸리티

### 3. API Server (`apps/api`)

- **Framework**: NestJS 11
- **Database**: TypeORM (PostgreSQL/Oracle), Redis
- **Architecture**: 모듈형 모놀리스 (Modular Monolith)
- **Key Modules**:
  - `auth`: 인증 (Passport, JWT)
  - `baekjoon`: 백준 알고리즘 사이트 연동 추정
  - `mentor`: 멘토링 관련 도메인
  - `user`, `user-profile`: 사용자 관리
  - `mail`: 메일 발송
- **Testing**: Jest (e2e, unit)

### 4. Shared Packages (`packages/`)

- **shared**: 공용 UI 컴포넌트, Hooks, 유틸리티 함수. (Web과 유사한 스택 사용)
- **api-client**: API 통신을 위한 공용 클라이언트
- **eslint-config / typescript-config**: 전역 설정 공유

## 주요 개발 규칙

- **컴포넌트**: `packages/shared`에 재사용 가능한 UI 컴포넌트를 정의하고 `apps/web`에서 사용
- **스타일링**: Tailwind CSS 4를 기반으로 커스텀 디자인 시스템 적용
- **데이터 페칭**: React Query를 사용하여 서버 상태 관리, form은 React Hook Form + Zod 검증
