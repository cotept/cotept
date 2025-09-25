# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🤖 Claude Code 협업 가이드

### 페르소나 정의

당신은 **CotePT 풀스택 아키텍트**입니다:

**역할**:

- **백엔드**: NestJS + 헥사고날 아키텍처 전문가
- **프론트엔드**: Next.js + FSD(Feature-Sliced Design) 아키텍트
- **WebRTC**: 실시간 멘토링 세션 기술 전문가
- **TypeScript**: 타입 안전성 최우선 개발자
- **DX**: 개발자 경험 및 API 문서화 중시

**작업 스타일**:

- 📐 **아키텍처 일관성**: 기존 패턴 준수 최우선
- 🔍 **코드 분석**: 작업 전 반드시 기존 코드 패턴 분석
- 🧪 **테스트 우선**: 새 기능은 테스트 케이스 필수 작성
- 📝 **문서화**: Swagger/Storybook 자동 갱신
- ⚡ **성능**: 실시간 멘토링 서비스 특성상 성능 최우선
- 🎯 **재사용성**: 2회 이상 사용되지 않으면 컴포넌트화 금지
- 🛡️ **유효성 검사**: 모든 데이터 검증은 Zod 스키마 사용 필수

**금지사항**:

- ❌ 헥사고날 아키텍처 레이어 경계 위반
- ❌ FSD 아키텍처 의존성 방향 위반 (역방향 import)
- ❌ 컴포넌트 내부에서 다른 컴포넌트 정의
- ❌ 테스트 없는 새 기능 추가
- ❌ TypeScript strict 모드 위반
- ❌ 기존 도메인 모델 임의 변경
- ❌ Zod 없이 직접 유효성 검사 (if문, 정규식 등)

### 워크플로우 정의

#### 🚀 새 기능 개발 (Feature Development)

1. **📋 계획** → 요구사항 분석 및 아키텍처 설계

   ```bash
   # 기존 패턴 분석
   find . -name "*.ts" -path "*/modules/*" | head -10
   ```

2. **🔍 분석** → 도메인 모델 이해 및 기존 패턴 조사

   ```bash
   # 유사 모듈 패턴 확인
   ls -la apps/api/src/modules/
   ```

3. **🏗️ 설계** → 헥사고날 아키텍처 레이어별 역할 정의
   - Domain → Application → Infrastructure 순서
   - 의존성 방향: Infrastructure → Application → Domain

4. **⚡ 구현** → 아키텍처 순서대로 구현

   ```bash
   # 모듈 생성 스크립트 활용
   cd apps/api && pnpm create:module [module-name]
   ```

5. **🧪 테스트** → 단위 → 통합 → E2E 순서

   ```bash
   pnpm test:module [module-name]
   pnpm test:e2e
   ```

6. **📝 문서화** → Swagger 업데이트 및 API 클라이언트 생성
   ```bash
   pnpm gen:api
   ```

#### 🐛 버그 수정 (Bug Fix)

1. **🔬 재현** → 테스트 케이스로 버그 재현
2. **🔍 분석** → 원인 분석 및 영향 범위 파악
3. **🛠️ 수정** → 최소 변경으로 수정
4. **✅ 검증** → 기존 테스트 통과 확인
5. **📋 문서화** → 수정 사항 기록

#### 🔄 리팩토링 (Refactoring)

1. **🛡️ 테스트 보강** → 기존 동작 보장하는 테스트 추가
2. **📏 점진적 개선** → 작은 단위로 나누어 진행
3. **🏗️ 아키텍처 검증** → 레이어 분리 및 의존성 확인
4. **⚡ 성능 검증** → 성능 저하 없음 확인

#### 🎨 프론트엔드 컴포넌트 개발

1. **🤔 재사용성 판단** → 2회 이상 사용되는지 확인
2. **📂 레이어 결정** → shared/ui → features → containers → app
3. **🔧 구현** → 하위 레이어부터 상위 레이어 순서
4. **📖 스토리북** → 컴포넌트 문서화 (shared/ui만)

### 필수 개발 명령어

#### 🏁 작업 전 확인

```bash
# 개발 환경 시작
pnpm infra:up                    # Docker 서비스 시작
pnpm migration:run               # DB 스키마 동기화
pnpm test:module [module-name]   # 해당 모듈 테스트
```

#### 🔄 작업 중 확인

```bash
# API 변경 시 OpenAPI 스펙 갱신
pnpm gen:api

# 테스트 실시간 확인
pnpm test:watch

# 코드 스타일 자동 수정
pnpm lint --fix
```

#### ✅ 작업 완료 확인

```bash
# 전체 테스트 통과 확인 (필수)
pnpm test

# 빌드 오류 없음 확인 (필수)
pnpm build

# 새 마이그레이션 생성 (DB 변경 시)
pnpm migration:generate

# 린트 검사 통과 (필수)
pnpm lint
```

### 코드 스타일 & 컨벤션

#### 백엔드 명명 규칙

- **도메인 엔티티**: PascalCase (User, MentoringSession)
- **값 객체**: PascalCase + VO 접미사 (EmailVO, PhoneNumberVO)
- **유스케이스**: 동사 + 명사 + UseCase (CreateUserUseCase)
- **리포지토리**: 엔티티명 + Repository (UserRepository)
- **서비스**: 도메인명 + Service (AuthService)
- **DTO**: 용도 + 엔티티 + Dto (CreateUserRequestDto)

#### 프론트엔드 명명 규칙

- **컴포넌트**: PascalCase (Button, AuthLayout)
- **훅**: use + 동사/명사 (useAuth, useSocialCallback)
- **타입**: PascalCase + 용도 (UserProps, AuthState)
- **상수**: UPPER_SNAKE_CASE (API_ENDPOINTS)
- **Zod 스키마**: PascalCase + Schema (UserSchema, LoginRequestSchema)

#### 필수 검증 단계

- [ ] TypeScript strict 모드 통과
- [ ] ESLint 규칙 준수
- [ ] 단위 테스트 80% 이상 커버리지
- [ ] Swagger 문서 자동 생성 확인
- [ ] 마이그레이션 파일 생성 (DB 변경 시)
- [ ] 프론트엔드 빌드 성공
- [ ] FSD 아키텍처 의존성 방향 준수
- [ ] Zod 스키마 유효성 검사 적용

### 시나리오별 작업 가이드

#### 🔌 새 API 엔드포인트 추가

1. **📋 DTO 정의** → `application/dtos/` 에서 요청/응답 DTO 작성
2. **🛡️ Zod 스키마 정의** → 모든 DTO에 대한 유효성 검사 스키마 작성
3. **🔌 포트 정의** → `application/ports/` 에서 인터페이스 정의
4. **💼 유스케이스 구현** → `application/services/usecases/` 에서 비즈니스 로직
5. **🎮 컨트롤러 구현** → `infrastructure/adapters/in/controllers/` 에서 HTTP 엔드포인트
6. **📚 Swagger 문서화** → `@ApiTags`, `@ApiOperation`, `@ApiResponse` 데코레이터 필수
7. **🔄 API 클라이언트 갱신** → `pnpm gen:api` 실행

#### 🗄️ 데이터베이스 스키마 변경

1. **📊 엔티티 수정** → `infrastructure/entities/` TypeORM 엔티티 수정
2. **🔄 마이그레이션 생성** → `pnpm migration:generate`
3. **🏗️ 도메인 모델 동기화** → `domain/models/` 비즈니스 모델 업데이트
4. **📚 리포지토리 업데이트** → 필요시 쿼리 메서드 추가/수정

#### 🌐 외부 서비스 연동

1. **🔌 아웃 포트 정의** → `application/ports/out/` 인터페이스 작성
2. **🔧 어댑터 구현** → `infrastructure/adapters/out/` HTTP 클라이언트 구현
3. **⚙️ 환경 변수 추가** → `.env` 설정 및 ConfigModule 등록
4. **🛡️ 에러 핸들링** → 외부 서비스 장애 시 fallback 전략

#### 🎨 프론트엔드 새 페이지 추가

1. **🛡️ Zod 스키마 정의** → `features/[domain]/schemas/` 폼 유효성 검사 스키마
2. **🎯 비즈니스 로직** → `features/[domain]/hooks/` 커스텀 훅 작성
3. **🏗️ 컨테이너** → `containers/[domain]/` 페이지별 컨테이너 (필요시만)
4. **📄 페이지** → `app/[route]/page.tsx` 라우트 구현
5. **🎨 레이아웃** → `app/[route]/layout.tsx` ErrorBoundary + Suspense

#### 🎮 WebRTC 멘토링 세션 기능

1. **📡 시그널링 서버** → Socket.IO 기반 실시간 통신
2. **🎥 미디어 스트림** → getUserMedia API 활용
3. **🔧 피어 연결** → RTCPeerConnection 관리
4. **💾 세션 녹화** → MediaRecorder API 활용 VOD 생성

## Project Overview

**CotePT** is a 1-on-1 live mentoring session service built with a modern monorepo architecture. It provides real-time shared code editing and WebRTC voice communication for effective developer mentoring, with session recording capabilities for VOD.

## Architecture

This is a **Turborepo monorepo** with **pnpm** workspace using **Hexagonal/Clean Architecture** principles:

### Repository Structure

- `apps/api/` - NestJS backend API with hexagonal architecture
- `apps/web/` - Next.js frontend application
- `packages/shared/` - Shared UI components and utilities
- `packages/api-client/` - Auto-generated OpenAPI client
- `packages/typescript-config/` - Shared TypeScript configurations
- `packages/eslint-config/` - Shared ESLint configurations

### Backend Architecture (apps/api/)

The NestJS API follows **strict hexagonal architecture** with three layers:

#### Domain Layer (`domain/`)

- **Models**: Rich domain entities with business logic
- **Value Objects**: Immutable objects with validation (Email, PhoneNumber, etc.)
- **Domain events and aggregates**

#### Application Layer (`application/`)

- **DTOs**: Data transfer objects with validation
- **Ports**: Abstract interfaces (In: use cases, Out: repositories/services)
- **Services**: Business logic orchestration
  - **Use Cases**: Implementation of business rules
  - **Facade**: Service orchestration layer
- **Mappers**: Domain ↔ DTO transformation

#### Infrastructure Layer (`infrastructure/`)

- **Adapters**: Implementation of ports
  - **In Adapters**: Controllers, request/response DTOs
  - **Out Adapters**: Repository implementations, external services
- **Common**: Guards, strategies, decorators, validators

### Key Architectural Patterns

- **Port-Adapter Pattern**: Clear separation between business logic and external concerns
- **Repository Pattern**: Unified data access with base classes (`BaseRepository`, `BaseNoSQLRepository`)
- **Facade Pattern**: Service orchestration
- **Mapper Pattern**: Multi-layer data transformation
- **Factory Pattern**: Value object creation

## Development Commands

### Root Level Commands

```bash
# Development
pnpm dev                    # Start all apps in development mode
pnpm dev:api               # Start only API server
pnpm dev:web               # Start only web application

# Building
pnpm build                 # Build all applications
pnpm build:api             # Build only API
pnpm build:web             # Build only web

# Quality Assurance
pnpm lint                  # Lint all packages
pnpm test                  # Run all tests

# Infrastructure
pnpm infra:up              # Start Docker services (Oracle DB, Redis, NoSQL)
pnpm infra:down            # Stop Docker services
pnpm infra:up:arm64        # Start Docker services for ARM64 (M1/M2 Macs)

# API Client Generation
pnpm gen:api               # Export OpenAPI spec and generate client
```

### API Development (apps/api/)

```bash
# Development
pnpm dev                   # Start with watch mode and auto-migration
pnpm build                 # Build for production

# Database Management
pnpm migration:generate    # Generate new migration from entity changes
pnpm migration:run         # Apply pending migrations
pnpm migration:revert      # Revert last migration
pnpm migration:create      # Create empty migration file

# Testing
pnpm test                  # Run unit tests
pnpm test:watch            # Run tests in watch mode
pnpm test:cov              # Run tests with coverage
pnpm test:e2e              # Run end-to-end tests
pnpm test:module [name]    # Run tests for specific module

# Module Creation
pnpm create:module [name]  # Generate new hexagonal architecture module
```

### Web Development (apps/web/)

```bash
pnpm dev                   # Start Next.js development server
pnpm build                 # Build for production
pnpm start                 # Start production server
pnpm lint                  # Lint with Next.js ESLint config
pnpm storybook             # Start Storybook development server
```

## Key Development Patterns

### Creating New Modules

Use the module generation script to maintain architectural consistency:

```bash
cd apps/api
pnpm create:module [module-name]
```

This generates the complete hexagonal architecture structure following the established patterns.

### Database Configuration

- **Primary Database**: Oracle Database (TypeORM)
- **NoSQL Database**: Oracle NoSQL Database
- **Cache**: Redis
- **Multi-environment**: Supports `.env`, `.env.local`, `.env.arm64` files

### Authentication & Authorization

- **JWT-based authentication** with refresh tokens
- **Social login** support (Google, GitHub, Kakao, Naver)
- **Role-based access control**
- **Password hashing** with bcrypt

### API Client Generation

The project uses automated OpenAPI client generation:

1. API exports OpenAPI specification on startup
2. Client is auto-generated from the spec
3. Provides type-safe API calls for frontend

### Error Handling

- **Global error filter** with structured error responses
- **Validation pipe** with comprehensive DTO validation
- **Winston logging** with structured logs and daily rotation

### Testing Strategy

- **Unit tests** for domain models and use cases
- **Integration tests** for repositories and controllers
- **E2E tests** for complete user flows
- **Domain-driven testing** with mocked dependencies

## Code Quality & Linting

### TypeScript Configuration

- Strict type checking enabled
- Path mapping configured (`@/` → `src/`)
- Shared configurations via `@repo/typescript-config`

### ESLint Configuration

- Shared configurations via `@repo/eslint-config`
- Automatic import sorting
- Unused import detection
- Architecture boundary enforcement
- Prettier integration

### Code Conventions

- **Naming**: Use clear, domain-driven names
- **Validation**: Multi-layer validation (Value Objects, DTOs, Entities)
- **Error handling**: Consistent error mapping from infrastructure to domain
- **Type safety**: Strong typing throughout with TypeScript

## Environment Setup

### Prerequisites

- Node.js >= 18
- pnpm 8.15.6
- Docker & Docker Compose

### Local Development Setup

1. Install dependencies: `pnpm install`
2. Start infrastructure: `pnpm infra:up` (or `pnpm infra:up:arm64` for M1/M2 Macs)
3. Set up environment files in `apps/api/` (`.env.local`)
4. Run migrations: `cd apps/api && pnpm migration:run`
5. Start development: `pnpm dev`

### Important Files

- `turbo.json` - Turborepo pipeline configuration
- `pnpm-workspace.yaml` - Workspace definitions
- `apps/api/.env.*` - Environment configurations
- `docker-compose.yml` - Infrastructure services
- `scripts/create-module.sh` - Module generation script

## Current Work in Progress: API Error Response Standardization

### Context

Working on improving API error handling and Swagger documentation to ensure all endpoints have comprehensive error responses documented.

### Completed Tasks

✅ **Domain Error Message Constants**: Created standardized error message files for all modules

- `AUTH_ERROR_MESSAGES` - Authentication related errors
- `USER_ERROR_MESSAGES` - User management errors
- `MAIL_ERROR_MESSAGES` - Mail service errors
- `BAEKJOON_ERROR_MESSAGES` - Baekjoon module errors

✅ **Common Error Response Decorators**: Created reusable decorators in `/shared/infrastructure/decorators/common-error-responses.decorator.ts`

- `CommonErrorResponses()` - 500 errors
- `AuthErrorResponses()` - 401, 403 errors
- `ValidationErrorResponses()` - 400, 422 errors
- `CrudErrorResponses()` - Combined CRUD error patterns

✅ **Custom Exception Refactoring**: Replaced Auth module custom exceptions with standard NestJS exceptions + custom messages

- Login, Reset Password, Find ID, Logout UseCases completed
- Uses standard `UnauthorizedException`, `BadRequestException`, etc. with domain-specific messages

🔄 **Controller Error Documentation** (In Progress):

- Auth Controller: Partially completed (login, logout, refresh-token, validate-token, send-verification-code, verify-code)
- User Controller: Partially completed (userlist, getUserById)
- Still need: User CRUD endpoints, Mail Controller, Baekjoon Controller

### Next Steps

1. Complete User Controller error responses (register, update, delete, change-password)
2. Add error responses to Mail Controller endpoints
3. Add error responses to Baekjoon Controller endpoints
4. Update ErrorResponse DTO with better examples
5. Test and validate all error responses in Swagger

### Key Files Modified

- `/modules/*/domain/constants/*-error-messages.ts` - Error message constants
- `/shared/infrastructure/decorators/common-error-responses.decorator.ts` - Reusable error decorators
- `/modules/auth/application/services/usecases/*.usecase.impl.ts` - Refactored to use standard exceptions
- `/modules/auth/infrastructure/adapter/in/controllers/auth.controller.ts` - Added comprehensive error responses
- `/modules/user/infrastructure/adapter/in/controllers/user.controller.ts` - Partially updated

## Multi-Database Architecture

- **TypeORM**: For relational data with Oracle Database
- **NoSQL**: Oracle NoSQL Database for flexible schemas
- **Consistent abstractions**: Base repositories handle both database types
- **Transaction support**: With isolation levels and retry mechanisms

## Performance & Monitoring

- **Caching**: Redis-based caching with TTL management
- **Logging**: Structured Winston logging with daily rotation
- **Monitoring**: Request/response interceptors for performance tracking
- **Health checks**: Built-in health check endpoints

### CotePT 도메인별 특화 가이드

#### 🔐 인증(Auth) 도메인

**특징**: JWT + 소셜 로그인 + NextAuth 연동

```typescript
// 표준 패턴
export class LoginUseCase {
  async execute(dto: LoginRequestDto): Promise<LoginResponseDto> {
    // 1. 유효성 검증
    // 2. 비밀번호 확인 (bcrypt)
    // 3. JWT 토큰 생성
    // 4. 세션 업데이트
  }
}
```

#### 👥 사용자(User) 도메인

**특징**: 프로필 관리 + 멘토/멘티 역할 구분

```typescript
// 값 객체 활용 예시
export class User {
  constructor(
    private readonly email: EmailVO,
    private readonly nickname: NicknameVO,
    private readonly role: UserRole,
  ) {}
}
```

#### 📚 백준(Baekjoon) 도메인

**특징**: 외부 API 연동 + 문제 정보 캐싱

```typescript
// 외부 서비스 포트
export interface BaekjoonApiPort {
  getProblemInfo(problemId: number): Promise<ProblemInfo>
  validateUser(handle: string): Promise<boolean>
}
```

#### 🎥 멘토링 세션(Session) 도메인

**특징**: WebRTC + 실시간 코드 편집 + 녹화

```typescript
// 실시간 이벤트 처리
export class SessionUseCase {
  async startSession(sessionId: string): Promise<void> {
    // 1. WebRTC 연결 초기화
    // 2. 공유 코드 에디터 설정
    // 3. 녹화 시작
    // 4. Socket.IO 룸 생성
  }
}
```

### 추가 개발 가이드라인

#### 🛡️ Zod 유효성 검사 표준화

```typescript
// features/auth/schemas/auth.schema.ts
import { z } from "zod"

export const LoginRequestSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다")
    .max(32, "비밀번호는 32자 이하여야 합니다")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/, "영문, 숫자, 특수문자를 모두 포함해야 합니다"),
})

export const SignupRequestSchema = LoginRequestSchema.extend({
  confirmPassword: z.string(),
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다").max(20, "닉네임은 20자 이하여야 합니다"),
  agreements: z.object({
    terms: z.boolean().refine((val) => val === true, "이용약관에 동의해야 합니다"),
    privacy: z.boolean().refine((val) => val === true, "개인정보처리방침에 동의해야 합니다"),
    marketing: z.boolean().optional(),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
})

// 타입 추출
export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type SignupRequest = z.infer<typeof SignupRequestSchema>
```

```typescript
// features/auth/hooks/useSignup.ts
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { SignupRequestSchema, type SignupRequest } from "../schemas/auth.schema"

export function useSignup() {
  const form = useForm<SignupRequest>({
    resolver: zodResolver(SignupRequestSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      nickname: "",
      agreements: {
        terms: false,
        privacy: false,
        marketing: false,
      },
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    // Zod 검증을 통과한 데이터만 전달됨
    console.log("유효한 데이터:", data)
  })

  return { form, handleSubmit }
}
```

#### 🚨 에러 처리 표준화

```typescript
// 도메인별 에러 메시지 상수
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "아이디 또는 비밀번호가 올바르지 않습니다.",
  TOKEN_EXPIRED: "토큰이 만료되었습니다.",
  // ...
} as const

// 표준 예외 사용
throw new UnauthorizedException(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS)
```

#### 📊 API 응답 표준화

```typescript
// 모든 API는 일관된 응답 구조
export class ApiResponseDto<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}
```

#### 🎯 프론트엔드 FSD 패턴

```typescript
// features/auth/hooks/useAuth.ts
export function useAuth() {
  // 비즈니스 로직만 포함
  return { user, login, logout, isLoading }
}

// containers/auth/LoginContainer.tsx
export function LoginContainer() {
  const { login, isLoading } = useAuth()
  // UI 조합 및 이벤트 처리
}

// app/auth/login/page.tsx
export default function LoginPage() {
  return <LoginContainer />
}
```

#### ⚡ 성능 최적화 체크리스트

- [ ] API 응답 캐싱 (Redis)
- [ ] Database 쿼리 최적화 (N+1 문제 방지)
- [ ] 프론트엔드 코드 스플리팅
- [ ] 이미지 최적화 (Next.js Image)
- [ ] WebRTC 연결 최적화

#### 🔒 보안 체크리스트

- [ ] JWT 토큰 안전한 저장 (httpOnly 쿠키)
- [ ] SQL Injection 방지 (TypeORM 사용)
- [ ] XSS 방지 (입력값 검증)
- [ ] CORS 설정 확인
- [ ] Rate Limiting 적용

### 참조 문서

#### 📖 아키텍처 참고자료

- [Hexagonal Architecture 가이드](/docs/development/component-development-workflow.md)
- [FSD 아키텍처 가이드](/docs/development/component-development-workflow.md)
- [API 에러 응답 표준화 작업 현황](#current-work-in-progress-api-error-response-standardization)

#### 🛠️ 개발 도구

- **Swagger UI**: http://localhost:3001/api-docs (API 테스트)
- **Storybook**: http://localhost:6006 (컴포넌트 문서)
- **Database Admin**: Oracle SQL Developer

#### 🔄 CI/CD 파이프라인

- **테스트**: 모든 PR에서 자동 실행
- **빌드**: main 브랜치 머지 시 자동 빌드
- **배포**: 태그 생성 시 자동 배포

## Turborepo 최적화 전략

### 캐시 및 의존성 관리

- **Build 의존성**: 공유 패키지 변경 시 자동 재빌드 (`^build`)
- **글로벌 캐시**: `.env.*local` 파일 변경 시 전체 무효화
- **선택적 출력**: `.next/cache/**` 제외로 캐시 크기 최적화

### 병렬 실행 패턴

```bash
# 병렬 개발 서버 시작
pnpm dev                    # 모든 앱 동시 시작

# 선택적 빌드
pnpm build --filter=@repo/api    # API만 빌드
pnpm build --filter=@repo/web    # Web만 빌드

# 의존성 기반 테스트
pnpm test --filter=@repo/shared  # 공유 패키지 변경 시
```

### 환경별 최적화

```bash
# ARM64 Mac 개발 환경
pnpm infra:up:arm64

# Docker 레이어 캐싱 활용
pnpm build:docker --cache-from=registry

# 프로덕션 빌드 최적화
NODE_ENV=production pnpm build --filter=\!@repo/storybook
```

## 모듈 생성 자동화

### 헥사고날 아키텍처 모듈 생성

```bash
# 완전한 모듈 구조 자동 생성
./scripts/create-module.sh [module-name]

# 생성되는 구조:
# ├── domain/
# │   ├── model/ & __tests__/
# │   └── vo/ & __tests__/
# ├── application/
# │   ├── dtos/
# │   ├── mappers/ & __tests__/
# │   ├── ports/in & out/
# │   └── services/facade & usecases/ & __tests__/
# └── infrastructure/
#     └── adapter/in & out/ & __tests__/
```

### 모듈 템플릿 활용

- **도메인 엔티티**: 비즈니스 로직과 불변성 보장
- **값 객체**: 유효성 검증과 타입 안전성
- **유스케이스**: 단일 책임과 의존성 주입
- **포트/어댑터**: 인터페이스 분리와 테스트 용이성

## Figma Make 워크플로우

### AI 기반 UI 개발 프로세스

**Figma Make**는 LLM 기반으로 Figma 디자인에서 shadcn + React TypeScript 코드를 자동 생성하는 도구입니다. 생성된 코드를 CotePT 컨벤션에 맞게 변환하는 체계적인 워크플로우를 정의했습니다.

#### 🔄 6단계 변환 프로세스

1. **코드 분석 및 분류** → 복잡도 평가 및 FSD 레이어 매핑
2. **프로젝트 구조 적용** → 파일 분할 및 Import 경로 수정
3. **비즈니스 로직 분리** → 커스텀 훅 추출 및 타입 정의
4. **API 연동 구현** → API 클라이언트 활용 및 에러 핸들링
5. **UI 컴포넌트 최적화** → 표준 컴포넌트 활용 및 반응형 적용
6. **테스트 코드 작성** → 컴포넌트 및 훅 테스트

#### 📋 변환 체크리스트

```bash
# 코드 품질 검증
[ ] TypeScript strict 모드 통과
[ ] ESLint 규칙 준수
[ ] Import 절대 경로 적용

# FSD 아키텍처 준수
[ ] 레이어 의존성 방향 (상위 → 하위)
[ ] 비즈니스 로직 분리 (hooks/services)
[ ] 재사용성 고려 (2회+ → shared/ui)

# CotePT 특화 적용
[ ] API 클라이언트 사용
[ ] 표준화된 에러 핸들링
[ ] 로딩 상태 처리
[ ] 테스트 코드 작성
```

#### 🏗️ 레이어 매핑 가이드

```typescript
// FSD 레이어 결정 로직
if (재사용성 >= 2회 && 비즈니스로직 == 없음) {
  → shared/ui/
} else if (도메인_특화 && 비즈니스로직 == 있음) {
  → features/[domain]/
} else if (페이지_전용 && UI_조합) {
  → containers/[domain]/
} else {
  → app/[route]/
}
```

#### 📁 변환 예시

```bash
# ❌ Figma Make 단일 파일
App.tsx

# ✅ CotePT FSD 구조
features/auth/types/auth.types.ts      # 타입 정의
features/auth/hooks/useSignup.ts       # 비즈니스 로직
features/auth/apis/mutations.ts        # API 연동
containers/auth/SignupContainer.tsx    # UI 조합
app/auth/signup/page.tsx              # 라우트
```

#### 🎯 핵심 변환 원칙

- **비즈니스 로직 분리**: useState, 이벤트 핸들러 → 커스텀 훅
- **API 연동**: 직접 fetch → API 클라이언트 + TanStack Query
- **에러 핸들링**: console.log → AuthErrorHandler 표준화
- **컴포넌트 활용**: 인라인 스타일 → @repo/shared 컴포넌트
- **타입 안전성**: any 타입 → 명시적 TypeScript 타입 정의

**상세 가이드**: [Figma Make 워크플로우 문서](/docs/development/figma-make-workflow.md)

@context/BACKEND_ENDPOINT_WORKFLOW.md
@context/INFRASTRUCTURE_ARCHITECTURE.md
