# 모노레포 브랜치 관리 및 배포 전략 가이드

## 📋 목차

- [모노레포 브랜치 전략 옵션](#모노레포-브랜치-전략-옵션)
- [권장 전략: Git Flow + Monorepo](#권장-전략-git-flow--monorepo)
- [CI/CD 파이프라인 설정](#cicd-파이프라인-설정)
- [환경변수 관리 전략](#환경변수-관리-전략)
- [실제 워크플로우](#실제-워크플로우)
- [배포 환경 구성](#배포-환경-구성)
- [모니터링 및 롤백](#모니터링-및-롤백)

## 모노레포 브랜치 전략 옵션

### 1. 📁 단일 브랜치 전략 (현재 상황)

```
main (모든 서비스 프로덕션)
├── development (모든 서비스 개발)
├── feature/web-user-auth
├── feature/api-payment-module
├── feature/mobile-push-notification
└── hotfix/web-security-patch
```

**현재 구조:**

- `main` → 프로덕션 (web + api)
- `development` → 개발/스테이징 (web + api)

**장점:**

- 단순한 구조
- 모든 서비스 동시 배포 가능
- 통합 테스트 용이

**단점:**

- 한 서비스 버그가 전체 배포 블로킹
- 서비스별 독립적 배포 어려움
- 배포 주기가 가장 느린 서비스에 맞춰짐

### 2. 🏷️ 태그 기반 배포 전략

```
main
├── development
├── feature/web-dashboard
├── feature/api-auth-v2
└── release/web-v1.2.0
    release/api-v2.1.0
```

**태그 예시:**

- `web-v1.2.0` → apps/web 배포
- `api-v2.1.0` → apps/api 배포
- `shared-v1.0.0` → packages 라이브러리 배포

**장점:**

- 서비스별 독립적 버전 관리
- 선택적 배포 가능
- 명확한 릴리즈 히스토리

**단점:**

- 태그 관리 복잡성
- 의존성 버전 충돌 가능성

### 3. 🔄 서비스별 독립 브랜치

```
main
├── web/main          (웹 프로덕션)
├── web/development   (웹 개발)
├── api/main          (API 프로덕션)
├── api/development   (API 개발)
└── shared/main       (공통 라이브러리)
```

**장점:**

- 완전한 서비스 독립성
- 각 팀의 자율적 배포

**단점:**

- 브랜치 관리 복잡성 증가
- 공통 라이브러리 동기화 어려움
- 통합 테스트 복잡

## 권장 전략: Git Flow + Monorepo

### 브랜치 구조

```
main                    # 모든 서비스 안정 버전
├── development         # 통합 개발 브랜치
├── staging            # 스테이징 전용 브랜치 (선택)
├── feature/web-*       # 웹 앱 기능 브랜치
├── feature/api-*       # API 서버 기능 브랜치
├── feature/shared-*    # 공통 라이브러리 브랜치
├── hotfix/*           # 긴급 수정 브랜치
└── release/*          # 릴리스 준비 브랜치
```

### 브랜치별 역할

#### `main` (프로덕션)

- **목적**: 프로덕션 환경 배포
- **보호 설정**: 직접 push 금지, PR만 허용
- **자동 배포**: 프로덕션 서버에 자동 배포
- **환경**: `NODE_ENV=production`

#### `development` (개발/통합)

- **목적**: 개발 완료된 기능 통합
- **자동 배포**: 스테이징 서버에 자동 배포
- **환경**: `NODE_ENV=development`
- **테스트**: 통합 테스트 실행

#### `feature/*` (기능 개발)

- **명명 규칙**:
  - `feature/web-user-dashboard` (웹 기능)
  - `feature/api-auth-system` (API 기능)
  - `feature/shared-validation` (공통 라이브러리)
- **생성 기준**: `development`에서 분기
- **머지 대상**: `development`로 PR

#### `hotfix/*` (긴급 수정)

- **명명 규칙**: `hotfix/service-issue-description`
- **생성 기준**: `main`에서 분기
- **머지 대상**: `main`과 `development` 양쪽

#### `release/*` (릴리스 준비)

- **명명 규칙**: `release/v1.2.0`
- **목적**: 릴리스 전 최종 준비 작업
- **생성 기준**: `development`에서 분기
- **머지 대상**: `main`으로 PR 후 `development`에 백포트

### 브랜치 보호 규칙

```yaml
# GitHub 브랜치 보호 설정
main:
  protection_rules:
    required_status_checks:
      - "test-web"
      - "test-api"
      - "build-web"
      - "build-api"
    enforce_admins: true
    required_pull_request_reviews:
      required_approving_review_count: 2
      dismiss_stale_reviews: true
    restrictions:
      push: false # 직접 push 금지

development:
  protection_rules:
    required_status_checks:
      - "test-web"
      - "test-api"
    required_pull_request_reviews:
      required_approving_review_count: 1
```

## CI/CD 파이프라인 설정

### GitHub Actions 워크플로우

#### 변경 감지 및 서비스별 배포

```yaml
# .github/workflows/deploy.yml
name: Deploy Services

on:
  push:
    branches: [main, development]
  pull_request:
    branches: [main, development]

env:
  NODE_VERSION: "18"
  PNPM_VERSION: "8"

jobs:
  # 변경된 서비스 감지
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      web-changed: ${{ steps.changes.outputs.web }}
      api-changed: ${{ steps.changes.outputs.api }}
      shared-changed: ${{ steps.changes.outputs.shared }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Detect changes
        uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            web:
              - 'apps/web/**'
              - 'packages/**'
              - 'pnpm-lock.yaml'
            api:
              - 'apps/api/**'
              - 'packages/**'
              - 'pnpm-lock.yaml'
            shared:
              - 'packages/**'
              - 'pnpm-lock.yaml'

  # 공통 라이브러리 테스트
  test-shared:
    needs: detect-changes
    if: needs.detect-changes.outputs.shared-changed == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Test shared packages
        run: pnpm test:shared

  # 웹 앱 테스트 및 빌드
  test-build-web:
    needs: detect-changes
    if: needs.detect-changes.outputs.web-changed == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint web app
        run: pnpm lint:web

      - name: Test web app
        run: pnpm test:web

      - name: Build web app
        run: pnpm build:web
        env:
          NODE_ENV: ${{ github.ref == 'refs/heads/main' && 'production' || 'development' }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: web-build
          path: apps/web/.next

  # API 서버 테스트 및 빌드
  test-build-api:
    needs: detect-changes
    if: needs.detect-changes.outputs.api-changed == 'true'
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint API
        run: pnpm lint:api

      - name: Test API
        run: pnpm test:api
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test

      - name: Build API
        run: pnpm build:api

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: api-build
          path: apps/api/dist

  # 웹 앱 배포
  deploy-web:
    needs: [detect-changes, test-build-web]
    if: needs.detect-changes.outputs.web-changed == 'true' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/development')
    runs-on: ubuntu-latest
    environment: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: web-build
          path: .next

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: apps/web
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}

  # API 서버 배포
  deploy-api:
    needs: [detect-changes, test-build-api]
    if: needs.detect-changes.outputs.api-changed == 'true' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/development')
    runs-on: ubuntu-latest
    environment: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: api-build
          path: dist

      - name: Deploy to production server
        if: github.ref == 'refs/heads/main'
        run: |
          echo "Deploying API to production server"
          # 실제 배포 명령어 추가
          # ssh, rsync, 또는 컨테이너 배포

      - name: Deploy to staging server
        if: github.ref == 'refs/heads/development'
        run: |
          echo "Deploying API to staging server"
          # 실제 배포 명령어 추가
```

### 배포 환경별 워크플로우

#### 스테이징 배포 (development 브랜치)

```yaml
# .github/workflows/staging.yml
name: Deploy to Staging

on:
  push:
    branches: [development]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Setup environment
        run: |
          echo "NODE_ENV=development" >> $GITHUB_ENV
          echo "DEPLOY_ENV=staging" >> $GITHUB_ENV

      - name: Deploy web to staging
        run: |
          # Vercel staging 배포
          vercel --token ${{ secrets.VERCEL_TOKEN }} --scope ${{ secrets.VERCEL_ORG_ID }}

      - name: Deploy API to staging
        run: |
          # 스테이징 서버 배포
          ssh user@staging-server "cd /var/www/api && git pull && npm run build && pm2 restart api"

      - name: Run smoke tests
        run: |
          # 기본 헬스체크
          curl -f https://staging-web.myapp.com/health
          curl -f https://staging-api.myapp.com/health
```

#### 프로덕션 배포 (main 브랜치)

```yaml
# .github/workflows/production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Setup environment
        run: |
          echo "NODE_ENV=production" >> $GITHUB_ENV
          echo "DEPLOY_ENV=production" >> $GITHUB_ENV

      - name: Deploy web to production
        run: |
          # Vercel 프로덕션 배포
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

      - name: Deploy API to production
        run: |
          # 프로덕션 서버 배포 (Blue-Green 또는 Rolling Update)
          ./scripts/deploy-api-production.sh

      - name: Run health checks
        run: |
          # 프로덕션 헬스체크
          curl -f https://myapp.com/health
          curl -f https://api.myapp.com/health

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: "#deployments"
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 환경변수 관리 전략

### 1. 서비스별 환경변수 구조

```
project-root/
├── .env.example                    # 전체 프로젝트 템플릿
├── apps/
│   ├── web/
│   │   ├── .env.example           # 웹 앱 템플릿
│   │   ├── .env.development       # 웹 개발 설정
│   │   ├── .env.production        # 웹 프로덕션 공개 설정
│   │   └── .env.local            # 웹 로컬 비밀 설정 (Git 제외)
│   └── api/
│       ├── .env.example          # API 템플릿
│       ├── .env.development      # API 개발 설정
│       ├── .env.production       # API 프로덕션 공개 설정
│       └── .env.local           # API 로컬 비밀 설정 (Git 제외)
└── packages/
    └── shared/
        └── .env.example         # 공통 라이브러리 템플릿
```

### 2. 환경별 설정 예시

#### 웹 앱 환경변수

```bash
# apps/web/.env.development
NEXT_PUBLIC_APP_NAME=CoTept
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WEB_URL=http://localhost:3000
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_SENTRY_DSN=

# apps/web/.env.production
NEXT_PUBLIC_APP_NAME=CoTept
NEXT_PUBLIC_API_URL=https://api.myapp.com
NEXT_PUBLIC_WEB_URL=https://myapp.com
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn

# apps/web/.env.local (Git 제외)
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### API 서버 환경변수

```bash
# apps/api/.env.development
NODE_ENV=development
PORT=3001
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=debug

# apps/api/.env.production
NODE_ENV=production
PORT=3001
CORS_ORIGINS=https://myapp.com
LOG_LEVEL=info

# apps/api/.env.local (Git 제외)
DATABASE_URL=postgresql://user:password@localhost:5432/cotept_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
SMTP_PASSWORD=your-smtp-password
GITHUB_TOKEN=your-github-token
```

### 3. GitHub Secrets 구조

```yaml
# Repository Secrets
secrets:
  # 공통 설정
  VERCEL_TOKEN: "vercel-token"
  VERCEL_ORG_ID: "team-id"
  SLACK_WEBHOOK: "slack-webhook-url"

  # 웹 앱 관련
  VERCEL_WEB_PROJECT_ID: "web-project-id"
  NEXTAUTH_SECRET: "nextauth-secret"
  GOOGLE_CLIENT_ID: "google-client-id"
  GOOGLE_CLIENT_SECRET: "google-client-secret"

  # API 관련
  DATABASE_URL: "postgresql://..."
  REDIS_URL: "redis://..."
  JWT_SECRET: "jwt-secret"
  SMTP_PASSWORD: "smtp-password"

  # 환경별 구분
  STAGING_DATABASE_URL: "postgresql://staging..."
  PRODUCTION_DATABASE_URL: "postgresql://production..."

# Environment Secrets (production, staging)
production:
  NEXT_PUBLIC_SENTRY_DSN: "prod-sentry-dsn"
  DATABASE_URL: "prod-database-url"

staging:
  NEXT_PUBLIC_SENTRY_DSN: "staging-sentry-dsn"
  DATABASE_URL: "staging-database-url"
```

## 실제 워크플로우

### 일반적인 개발 과정

```bash
# 1. 새 기능 개발 시작
git checkout development
git pull origin development
git checkout -b feature/web-user-profile

# 2. 개발 작업
# apps/web/src/components/UserProfile.tsx 개발
# 테스트 코드 작성
# 로컬 테스트

# 3. 커밋 및 푸시
git add .
git commit -m "feat(web): add user profile component"
git push origin feature/web-user-profile

# 4. Pull Request 생성
# GitHub에서 feature/web-user-profile → development PR 생성
# 코드 리뷰 요청
# CI 테스트 통과 확인

# 5. 머지 후 스테이징 배포
# PR 머지 → development 브랜치 업데이트
# 자동으로 스테이징 환경에 배포
# QA 팀 테스트

# 6. 프로덕션 릴리스
git checkout main
git pull origin main
git merge development
git push origin main
# 자동으로 프로덕션 환경에 배포
```

### 긴급 수정 (Hotfix) 과정

```bash
# 1. 프로덕션 이슈 발견
# main 브랜치에서 핫픽스 브랜치 생성
git checkout main
git pull origin main
git checkout -b hotfix/web-security-vulnerability

# 2. 긴급 수정
# 보안 취약점 수정
# 테스트 작성 및 검증

# 3. 빠른 배포
git add .
git commit -m "fix(web): resolve security vulnerability"
git push origin hotfix/web-security-vulnerability

# 4. main에 직접 머지 (긴급)
git checkout main
git merge hotfix/web-security-vulnerability
git push origin main
# 즉시 프로덕션 배포

# 5. development에 백포트
git checkout development
git merge hotfix/web-security-vulnerability
git push origin development

# 6. 핫픽스 브랜치 정리
git branch -d hotfix/web-security-vulnerability
git push origin --delete hotfix/web-security-vulnerability
```

### 릴리스 과정 (대규모 업데이트)

```bash
# 1. 릴리스 브랜치 생성
git checkout development
git pull origin development
git checkout -b release/v2.0.0

# 2. 릴리스 준비 작업
# 버전 업데이트 (package.json)
# CHANGELOG.md 업데이트
# 최종 테스트
# 문서 업데이트

# 3. 릴리스 브랜치에서 최종 검증
git add .
git commit -m "chore: prepare release v2.0.0"
git push origin release/v2.0.0

# 4. main으로 머지
git checkout main
git merge release/v2.0.0
git tag v2.0.0
git push origin main
git push origin v2.0.0

# 5. development에 백포트
git checkout development
git merge release/v2.0.0
git push origin development

# 6. 릴리스 브랜치 정리
git branch -d release/v2.0.0
git push origin --delete release/v2.0.0
```

## 배포 환경 구성

### 환경 구분

| 환경         | 브랜치      | 도메인            | 목적              |
| ------------ | ----------- | ----------------- | ----------------- |
| **로컬**     | feature/\*  | localhost:3000    | 개발자 로컬 개발  |
| **스테이징** | development | staging.myapp.com | QA 및 통합 테스트 |
| **프로덕션** | main        | myapp.com         | 실제 서비스 운영  |

### 서버 구성

#### 스테이징 환경

```yaml
# docker-compose.staging.yml
version: "3.8"
services:
  web:
    image: node:18-alpine
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=https://staging-api.myapp.com
    ports:
      - "3000:3000"

  api:
    image: node:18-alpine
    environment:
      - NODE_ENV=development
      - DATABASE_URL=${STAGING_DATABASE_URL}
      - REDIS_URL=${STAGING_REDIS_URL}
    ports:
      - "3001:3001"

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=cotept_staging
      - POSTGRES_USER=staging_user
      - POSTGRES_PASSWORD=${STAGING_DB_PASSWORD}

  redis:
    image: redis:7-alpine
```

#### 프로덕션 환경

```yaml
# docker-compose.production.yml
version: "3.8"
services:
  web:
    image: node:18-alpine
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.myapp.com
    ports:
      - "3000:3000"
    deploy:
      replicas: 2

  api:
    image: node:18-alpine
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${PRODUCTION_DATABASE_URL}
      - REDIS_URL=${PRODUCTION_REDIS_URL}
    ports:
      - "3001:3001"
    deploy:
      replicas: 3

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=cotept_production
      - POSTGRES_USER=prod_user
      - POSTGRES_PASSWORD=${PRODUCTION_DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 모니터링 및 롤백

### 배포 모니터링

#### Health Check 스크립트

```bash
#!/bin/bash
# scripts/health-check.sh

ENV=${1:-staging}

if [ "$ENV" = "production" ]; then
  WEB_URL="https://myapp.com"
  API_URL="https://api.myapp.com"
else
  WEB_URL="https://staging.myapp.com"
  API_URL="https://staging-api.myapp.com"
fi

echo "🔍 Checking health for $ENV environment..."

# Web App Health Check
echo "Checking Web App..."
if curl -f "$WEB_URL/health" > /dev/null 2>&1; then
  echo "✅ Web App is healthy"
else
  echo "❌ Web App is down"
  exit 1
fi

# API Health Check
echo "Checking API..."
if curl -f "$API_URL/health" > /dev/null 2>&1; then
  echo "✅ API is healthy"
else
  echo "❌ API is down"
  exit 1
fi

# Database Check
echo "Checking Database..."
if curl -f "$API_URL/health/db" > /dev/null 2>&1; then
  echo "✅ Database is healthy"
else
  echo "❌ Database connection failed"
  exit 1
fi

echo "🎉 All services are healthy!"
```

#### 배포 후 자동 테스트

```yaml
# .github/workflows/post-deploy.yml
name: Post Deploy Tests

on:
  workflow_run:
    workflows: ["Deploy Services"]
    types: [completed]

jobs:
  smoke-tests:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Wait for deployment
        run: sleep 60

      - name: Run smoke tests
        run: |
          ENV=${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
          ./scripts/health-check.sh $ENV

      - name: Run E2E tests
        uses: cypress-io/github-action@v6
        with:
          config-file: cypress.config.js
          env: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

      - name: Notify if tests fail
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: "🚨 Post-deploy tests failed for ${{ github.ref }}"
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 롤백 전략

#### 자동 롤백 스크립트

```bash
#!/bin/bash
# scripts/rollback.sh

ENV=${1:-staging}
VERSION=${2}

if [ -z "$VERSION" ]; then
  echo "Usage: ./rollback.sh [staging|production] [version]"
  echo "Example: ./rollback.sh production v1.2.0"
  exit 1
fi

echo "🔄 Rolling back $ENV to version $VERSION..."

if [ "$ENV" = "production" ]; then
  # 프로덕션 롤백
  echo "Rolling back production..."
  git checkout main
  git reset --hard $VERSION
  git push origin main --force-with-lease
else
  # 스테이징 롤백
  echo "Rolling back staging..."
  git checkout development
  git reset --hard $VERSION
  git push origin development --force-with-lease
fi

echo "✅ Rollback completed. Deployment will trigger automatically."
```

#### GitHub Actions 수동 롤백

```yaml
# .github/workflows/rollback.yml
name: Manual Rollback

on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Environment to rollback"
        required: true
        type: choice
        options:
          - staging
          - production
      version:
        description: "Version to rollback to (e.g., v1.2.0)"
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Rollback to version
        run: |
          BRANCH=${{ inputs.environment == 'production' && 'main' || 'development' }}
          git checkout $BRANCH
          git reset --hard ${{ inputs.version }}
          git push origin $BRANCH --force-with-lease

      - name: Notify rollback
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              "text": "🔄 Rollback completed",
              "attachments": [
                {
                  "color": "warning",
                  "fields": [
                    {
                      "title": "Environment",
                      "value": "${{ inputs.environment }}",
                      "short": true
                    },
                    {
                      "title": "Version",
                      "value": "${{ inputs.version }}",
                      "short": true
                    }
                  ]
                }
              ]
            }
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 모니터링 도구 설정

### Sentry 에러 추적

```typescript
// apps/web/src/lib/sentry.ts
import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // 프로덕션에서만 에러 전송
    if (process.env.NEXT_PUBLIC_ENV !== "production") {
      return null
    }
    return event
  },
})
```

### Slack 알림 설정

```yaml
# .github/workflows/notify.yml
name: Deployment Notifications

on:
  workflow_run:
    workflows: ["Deploy Services"]
    types: [completed]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Notify deployment success
        if: ${{ github.event.workflow_run.conclusion == 'success' }}
        uses: 8398a7/action-slack@v3
        with:
          status: success
          channel: "#deployments"
          text: "✅ Deployment successful"
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

      - name: Notify deployment failure
        if: ${{ github.event.workflow_run.conclusion == 'failure' }}
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          channel: "#deployments"
          text: "❌ Deployment failed"
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 요약 및 권장사항

### 🎯 최종 권장 전략

1. **Git Flow + Path-based 배포**

   - `main` (프로덕션) ← `development` (스테이징)
   - 변경된 서비스만 선택적 배포
   - 브랜치 보호 규칙 적용

2. **환경별 자동 배포**

   - `development` → 스테이징 자동 배포
   - `main` → 프로덕션 자동 배포
   - 배포 후 자동 헬스체크

3. **모니터링 및 알림**

   - Sentry로 에러 추적
   - Slack으로 배포 상태 알림
   - 자동/수동 롤백 지원

4. **보안 및 품질 관리**
   - 브랜치 보호 규칙
   - 코드 리뷰 필수
   - 자동화된 테스트 및 린트

### 🔧 도입 순서

1. **1단계**: 브랜치 보호 규칙 설정
2. **2단계**: 기본 CI/CD 파이프라인 구축
3. **3단계**: 변경 감지 및 선택적 배포
4. **4단계**: 모니터링 및 알림 시스템
5. **5단계**: 롤백 및 복구 시스템

이 구조로 안전하고 효율적인 모노레포 관리가 가능합니다! 🚀

모노레포 브랜치 전략 옵션

1. 📁 서비스별 브랜치 전략

main (모든 서비스 프로덕션)
├── development (모든 서비스 개발)
├── feature/web-user-auth
├── feature/api-payment-module
├── feature/mobile-push-notification
└── hotfix/web-security-patch

장점:

- 단순한 구조
- 모든 서비스 동시 배포 가능

단점:

- 한 서비스 버그가 전체 배포 블로킹
- 서비스별 독립적 배포 어려움

2. 🏷️ 태그 기반 배포 전략 (추천)

main
├── development
├── feature/web-dashboard
├── feature/api-auth-v2
└── release/web-v1.2.0
release/api-v2.1.0

태그 예시:

- web-v1.2.0 → apps/web 배포
- api-v2.1.0 → apps/api 배포
- mobile-v0.9.0 → apps/mobile 배포

3. 🔄 서비스별 독립 브랜치

main
├── web/main (웹 프로덕션)
├── web/development (웹 개발)
├── api/main (API 프로덕션)
├── api/development (API 개발)
└── shared/main (공통 라이브러리)

권장 전략: Git Flow + Monorepo

gitGraph
commit id: "Initial"
branch development
commit id: "Setup monorepo"

      branch feature/web-auth
      commit id: "Add web auth"
      checkout development
      merge feature/web-auth

      branch feature/api-users
      commit id: "Add user API"
      checkout development
      merge feature/api-users

      checkout main
      merge development tag: "v1.0.0"

브랜치 구조

main # 모든 서비스 안정 버전
├── development # 통합 개발 브랜치
├── feature/web-_ # 웹 기능 브랜치
├── feature/api-_ # API 기능 브랜치
├── feature/shared-_ # 공통 라이브러리 브랜치
├── hotfix/_ # 긴급 수정
└── release/\* # 릴리스 준비

CI/CD 파이프라인 설정

GitHub Actions 예시

# .github/workflows/deploy.yml

name: Deploy Services

on:
push:
branches: [main, development]
tags: ['web-v*', 'api-v*']

jobs:
detect-changes:
runs-on: ubuntu-latest
outputs:
web-changed: ${{ steps.changes.outputs.web }}
api-changed: ${{ steps.changes.outputs.api }}
steps: - uses: actions/checkout@v4 - uses: dorny/paths-filter@v2
id: changes
with:
filters: |
web: - 'apps/web/**' - 'packages/**'
api: - 'apps/api/**' - 'packages/**'

    deploy-web:
      needs: detect-changes
      if: needs.detect-changes.outputs.web-changed == 'true'
      runs-on: ubuntu-latest
      steps:
        - name: Deploy Web App
          run: |
            if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
              echo "Deploying web to production"
            elif [[ "${{ github.ref }}" == "refs/heads/development" ]]; then
              echo "Deploying web to staging"
            fi

    deploy-api:
      needs: detect-changes
      if: needs.detect-changes.outputs.api-changed == 'true'
      runs-on: ubuntu-latest
      steps:
        - name: Deploy API
          run: |
            if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
              echo "Deploying API to production"
            elif [[ "${{ github.ref }}" == "refs/heads/development" ]]; then
              echo "Deploying API to staging"
            fi

환경변수 관리 전략

1. 서비스별 환경변수

# apps/web/.env.production

NEXT_PUBLIC_API_URL=https://api.myapp.com
NEXT_PUBLIC_WEB_VERSION=1.2.0

# apps/api/.env.production

DATABASE_URL=postgresql://prod-db
API_VERSION=2.1.0

2. 공통 환경변수

# .env.production (루트)

SHARED_SECRET=common-secret
LOG_LEVEL=info

# packages/shared/.env

SHARED_CONFIG=production

실제 워크플로우

개발 과정

# 1. 피처 브랜치 생성

git checkout -b feature/web-user-dashboard

# 2. 개발 완료 후 development에 머지

git checkout development
git merge feature/web-user-dashboard

# 3. 스테이징 배포 (자동)

# development 브랜치 → staging 환경

# 4. QA 완료 후 main에 머지

git checkout main
git merge development

# 5. 프로덕션 배포 (자동)

# main 브랜치 → production 환경

긴급 수정

# 1. main에서 핫픽스 브랜치 생성

git checkout main
git checkout -b hotfix/web-security-fix

# 2. 수정 후 main에 직접 머지

git checkout main
git merge hotfix/web-security-fix

# 3. development에도 백포트

git checkout development
git merge hotfix/web-security-fix

권장 전략 요약

🎯 최종 추천:

1. Git Flow + Path-based 배포
2. development → staging 자동 배포
3. main → production 자동 배포
4. 변경된 서비스만 선택적 배포
5. 태그 기반 수동 롤백 지원

이 구조가 가장 안전하고 확장 가능해요!
