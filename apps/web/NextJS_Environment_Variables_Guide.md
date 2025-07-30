# Next.js 환경변수 파일 로드 순서 및 Best Practice

## 환경변수 파일 로드 순서

Next.js는 다음 순서로 환경변수 파일을 로드합니다 (우선순위 높은 순):

1. **process.env** (시스템 환경변수)
2. **.env.$(NODE_ENV).local** (예: `.env.development.local`, `.env.production.local`)
3. **.env.local** (모든 환경에서 로드, git에서 제외되어야 함)
4. **.env.$(NODE_ENV)** (예: `.env.development`, `.env.production`)
5. **.env** (기본 환경변수)

**중요**: 우손 순위가 높은 환경 변수 파일의 변수가 우선 적용됩니다.

**예시:**

```bash
# .env.development.local에
DATABASE_URL=my-personal-database

# .env.development에
DATABASE_URL=team-shared-database

# 결과: my-personal-database 사용 (local이 우선순위 높음)
```

## 서버 환경에서의 실행

**개발서버/운영서버 모두 `next start` 명령어 동일**하지만, `NODE_ENV`에 따라 다른 파일 로드:

```bash
# 개발서버에서
NODE_ENV=development next start
# → .env, .env.development, .env.local, .env.development.local 로드

# 운영서버에서
NODE_ENV=production next start
# → .env, .env.production, .env.local, .env.production.local 로드
```

## 각 파일의 용도

### `.env`

- 모든 환경에서 공통으로 사용되는 기본값
- **공개해도 되는 설정값만** (앱 이름, 버전 등)
- Git에 커밋됨

### `.env.local`

- 모든 환경에서 로컬 머신에서만 사용
- 환경에 관계없이 로컬에서 오버라이드할 값
- **Git에서 제외** (`.gitignore`에 추가)

### `.env.development`

- 개발 환경에서만 사용
- **공개 저장소: 더미값/로컬호스트만** (실제 비밀정보 금지)
- **비공개 저장소: 실제 개발용 설정 가능**
- Git에 커밋됨

### `.env.development.local`

- 개발 환경에서 로컬 머신에서만 사용
- **실제 개발용 비밀정보** (API 키, DB 비밀번호 등)
- **Git에서 제외** (필수)

### `.env.production`

- 프로덕션 환경에서만 사용
- **공개 저장소: 공개 가능한 설정만** (API URL 등)
- **비공개 저장소: 실제 프로덕션 설정 가능**
- Git에 커밋됨

### `.env.production.local`

- 프로덕션 환경에서 서버에서만 사용
- **실제 프로덕션 비밀키, 데이터베이스 연결 정보**
- **Git에서 제외** (필수)

### `.env.example`

- **공개 저장소에서 필수**
- 개발자들이 복사해서 사용할 템플릿
- 모든 필요한 환경변수의 예시와 설명
- Git에 커밋됨

### `.env.test`

- 테스트 환경에서만 사용
- 테스트용 데이터베이스, Mock API 등

## 공개 저장소 권장 구성 방식

### `.env` (Git 커밋) - 공개 가능한 기본값만

```bash
# 공개해도 되는 애플리케이션 설정
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_VERSION=1.0.0
NEXT_PUBLIC_SUPPORT_EMAIL=support@myapp.com
JWT_EXPIRES_IN=24h
EMAIL_FROM=noreply@myapp.com
```

### `.env.development` (Git 커밋) - 더미값/로컬값만

```bash
# 개발 환경 기본 설정 (더미값만)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SMTP_HOST=localhost
SMTP_PORT=1025
DATABASE_URL=postgresql://user:password@localhost:5432/myapp_dev
JWT_SECRET=change-me-in-development
STRIPE_PUBLISHABLE_KEY=pk_test_change_me
```

### `.env.production` (Git 커밋) - 공개 가능한 설정만

```bash
# 프로덕션 공개 설정
NEXT_PUBLIC_API_URL=https://api.myapp.com
NEXT_PUBLIC_BASE_URL=https://myapp.com
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
DATABASE_HOST=prod-db.myapp.com
DATABASE_PORT=5432
# 실제 비밀값은 .env.production.local에서 설정
JWT_SECRET=MUST_BE_OVERRIDDEN_IN_PRODUCTION
```

### `.env.example` (Git 커밋) - 필수 템플릿

```bash
# 개발자가 복사해서 사용: cp .env.example .env.development.local
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
SMTP_HOST=smtp.mailtrap.io
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
DATABASE_URL=postgresql://user:password@localhost:5432/myapp_dev
JWT_SECRET=your-32-character-secret-key
GITHUB_TOKEN=ghp_your_github_token
STRIPE_SECRET_KEY=sk_test_your_stripe_key
```

### `.env.development.local` (Git 제외) - 실제 개발 비밀값

```bash
# 개발자별 실제 설정값
SMTP_PASSWORD=real_mailtrap_password
DATABASE_URL=postgresql://myuser:mypass@localhost:5432/myapp_dev
JWT_SECRET=real-dev-jwt-secret-key-32-chars
GITHUB_TOKEN=ghp_real_personal_token
STRIPE_SECRET_KEY=sk_test_real_stripe_key
```

## Next.js Config Best Practice

### 현재 설정 분석

현재 `next.config.ts`는 기본적인 설정만 되어 있습니다:

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
}

export default nextConfig
```

### 개선된 종합 Best Practice 설정

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // ===== 기본 설정 =====
  reactStrictMode: true,          // React 개발 모드 강화
  poweredByHeader: false,         // X-Powered-By 헤더 제거 (보안)
  compress: true,                 // gzip 압축 활성화
  
  // ===== 앱 구조 & 경로 =====
  // basePath: "/my-app",         // 서브패스에 배포 시
  // assetPrefix: "https://cdn.example.com", // CDN 사용 시
  trailingSlash: false,           // URL 끝 슬래시 제거
  
  // ===== 성능 & 최적화 =====
  output: "standalone",           // Docker 배포 최적화
  productionBrowserSourceMaps: false, // 프로덕션 소스맵 비활성화
  
  // 패키지 트랜스파일 (ES Module 문제 해결)
  transpilePackages: [
    "@mui/x-charts",             // MUI X 패키지들
    "@mui/x-data-grid",
  ],
  
  // 이미지 최적화 설정
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,   // SVG 보안
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ===== 실험적 기능 =====
  experimental: {
    // 패키지 최적화 (일일이 추가 필요)
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material", 
      "lodash",
      "@chakra-ui/react",
      "date-fns",
      "react-icons",
      "lucide-react",
      "@headlessui/react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
    ],
    
    // 타입 안전한 라우팅
    typedRoutes: true,
    
    // 서버 컴포넌트 외부 패키지
    serverExternalPackages: [
      "prisma",
      "@prisma/client", 
      "sharp",
      "@node-rs/argon2",
      "bcrypt",
    ],
    
    // React 컴파일러 (React 19+)
    reactCompiler: {
      compilationMode: "annotation", // 선택적 적용
    },
    
    // Turbopack 설정
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
    
    // 기타 실험적 기능
    // ppr: "incremental",          // Partial Prerendering
    // reactViewTransitions: true,  // 페이지 전환 애니메이션
    // cssChunking: "strict",       // CSS 청킹 최적화
  },

  // ===== 보안 헤더 =====
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // 보안 헤더들
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // CSP 설정 (프로젝트에 맞게 조정)
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
          },
        ],
      },
    ]
  },

  // ===== 라우팅 설정 =====
  async redirects() {
    return [
      // 구 URL에서 새 URL로 리다이렉트
      {
        source: "/old-dashboard",
        destination: "/dashboard",
        permanent: true,
      },
      // www 없는 도메인으로 리다이렉트
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.example.com" }],
        destination: "https://example.com/:path*",
        permanent: true,
      },
    ]
  },

  async rewrites() {
    return [
      // API 프록시
      {
        source: "/api/external/:path*",
        destination: "https://external-api.com/:path*",
      },
      // 레거시 API 지원
      {
        source: "/v1/:path*",
        destination: "/api/v1/:path*",
      },
    ]
  },

  // ===== 환경변수 =====
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    BUILD_TIME: new Date().toISOString(),
  },

  // ===== 개발 설정 =====
  eslint: {
    // 빌드 시 ESLint 에러 무시 (CI에서만 체크하는 경우)
    ignoreDuringBuilds: false,
  },
  
  typescript: {
    // 빌드 시 TypeScript 에러 무시 (위험함)
    ignoreBuildErrors: false,
  },

  // ===== Webpack 커스터마이징 =====
  webpack: (config, { dev, isServer, webpack }) => {
    // 개발 환경 소스맵
    if (dev) {
      config.devtool = "eval-source-map"
    }

    // SVG 컴포넌트 변환
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    })

    // 프로덕션 최적화
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      }
    }

    // 번들 분석 (환경변수로 제어)
    if (process.env.ANALYZE === "true") {
      const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin
      config.plugins.push(new BundleAnalyzerPlugin())
    }

    return config
  },

  // ===== 캐싱 & 성능 =====
  // onDemandEntries: {
  //   maxInactiveAge: 25 * 1000,    // 개발 시 메모리 관리
  //   pagesBufferLength: 2,
  // },

  // ===== 로깅 =====
  logging: {
    fetches: {
      fullUrl: true,               // fetch 전체 URL 로깅
    },
  },

  // ===== 기타 고급 설정 =====
  // generateBuildId: async () => {
  //   return "my-build-id"          // 커스텀 빌드 ID
  // },
  
  // pageExtensions: ['tsx', 'ts', 'jsx', 'js'], // 페이지 파일 확장자
  
  // 성능 모니터링
  webVitalsAttribution: ["CLS", "LCP"],
}

export default nextConfig
```

### 주요 설정 그룹별 설명

#### 🔧 기본 설정
- **reactStrictMode**: 개발 시 잠재적 문제 발견
- **poweredByHeader**: 보안을 위해 헤더 제거
- **compress**: gzip 압축으로 전송 최적화

#### 🏗️ 앱 구조 & 경로
- **output**: Docker 배포를 위한 standalone 모드
- **trailingSlash**: 일관된 URL 형태 유지
- **transpilePackages**: ES Module 문제 해결

#### 🚀 성능 최적화
- **images**: 차세대 이미지 포맷 지원
- **optimizePackageImports**: 번들 크기 감소
- **webpack splitChunks**: vendor 번들 분리

#### 🛡️ 보안 강화
- **headers**: 종합적인 보안 헤더 설정
- **CSP**: Content Security Policy 적용
- **이미지 보안**: SVG 업로드 제한

#### 🔄 라우팅 관리
- **redirects**: SEO 친화적 URL 변경
- **rewrites**: API 프록시 및 레거시 지원

## 실제 서버 환경에서의 배포

### 개발서버 vs 운영서버 환경변수 설정

#### 개발서버 설정

```bash
# 개발서버에 직접 SSH 접속
ssh user@dev-server.myapp.com
cd /var/www/myapp

# .env 파일 (공통 설정)
cat > .env << EOF
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_VERSION=1.0.0
EOF

# .env.local 파일 (개발서버 전용)
cat > .env.local << EOF
NODE_ENV=development
NEXT_PUBLIC_API_URL=https://dev-api.myapp.com
NEXT_PUBLIC_BASE_URL=https://dev.myapp.com

DATABASE_URL=postgresql://dev_user:dev_pass@dev-db:5432/myapp_dev
JWT_SECRET=dev-server-jwt-secret-key-32chars
SMTP_PASSWORD=dev_smtp_password
GITHUB_TOKEN=ghp_dev_server_token
STRIPE_SECRET_KEY=sk_test_dev_server_key
EOF

# 앱 실행
NODE_ENV=development npm run start
```

#### 운영서버 설정

```bash
# 운영서버에 직접 SSH 접속
ssh user@prod-server.myapp.com
cd /var/www/myapp

# .env 파일 (공통 설정 - 동일)
cat > .env << EOF
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_VERSION=1.0.0
EOF

# .env.local 파일 (운영서버 전용)
cat > .env.local << EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.myapp.com
NEXT_PUBLIC_BASE_URL=https://myapp.com

DATABASE_URL=postgresql://prod_user:ultra_secure_pass@prod-db:5432/myapp_prod
JWT_SECRET=ultra-secure-production-jwt-secret-key
SMTP_PASSWORD=production_smtp_password
GITHUB_TOKEN=ghp_production_server_token
STRIPE_SECRET_KEY=sk_live_production_key
EOF

# 앱 실행
NODE_ENV=production npm run start
```

### CI/CD를 통한 자동 배포

#### GitHub Actions로 서버 배포

```yaml
# .github/workflows/deploy.yml
name: Deploy to Servers

on:
  push:
    branches: [main, develop]

jobs:
  deploy-dev:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build application
        run: |
          npm ci
          npm run build

      - name: Deploy to Development Server
        run: |
          # 빌드된 파일을 개발서버에 업로드
          scp -r .next/ user@dev-server:/var/www/myapp/
          scp package*.json user@dev-server:/var/www/myapp/

          # 개발서버에서 앱 재시작
          ssh user@dev-server "cd /var/www/myapp && \
            NODE_ENV=development pm2 restart myapp"

  deploy-prod:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build application
        run: |
          npm ci
          npm run build

      - name: Deploy to Production Server
        run: |
          # 빌드된 파일을 운영서버에 업로드
          scp -r .next/ user@prod-server:/var/www/myapp/
          scp package*.json user@prod-server:/var/www/myapp/

          # 운영서버에서 앱 재시작
          ssh user@prod-server "cd /var/www/myapp && \
            NODE_ENV=production pm2 restart myapp"
```

#### PM2를 이용한 프로세스 관리

```bash
# 개발서버에서 PM2 설정
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'myapp',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    }
  }]
}

# 운영서버에서 PM2 설정
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'myapp',
    script: 'npm',
    args: 'start',
    instances: 'max',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### Docker를 이용한 배포

#### Dockerfile

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 소스코드 복사 및 빌드
COPY . .
RUN npm run build

# 실행
EXPOSE 3000
CMD ["npm", "start"]
```

#### 개발서버용 Docker Compose

```yaml
# docker-compose.dev.yml
version: "3.8"
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - ./dev.env.local:/app/.env.local:ro
    restart: unless-stopped
```

#### 운영서버용 Docker Compose

```yaml
# docker-compose.prod.yml
version: "3.8"
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./prod.env.local:/app/.env.local:ro
    restart: unless-stopped
```

## 환경변수 보안 Best Practice

### 1. 기본 보안 원칙

- **민감한 정보는 절대 `NEXT_PUBLIC_` 접두사 사용 금지**
- **`.env.local` 파일들은 반드시 `.gitignore`에 추가**
- **프로덕션에서는 환경변수를 배포 플랫폼에서 직접 설정**

### 2. CI/CD 보안 고려사항

```typescript
// lib/env.ts - 환경변수 유효성 검사
import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test", "staging"]),
  DEPLOY_ENV: z.enum(["production", "staging", "feature"]).optional(),
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_API_URL: z.string().url(),
  // CI/CD 관련 환경변수
  CI: z.string().optional(),
  GITHUB_ACTIONS: z.string().optional(),
  VERCEL: z.string().optional(),
})

export const env = envSchema.parse(process.env)

// CI 환경에서만 사용할 검증
export const isCIEnvironment = () => {
  return !!(env.CI || env.GITHUB_ACTIONS || env.VERCEL)
}
```

### 3. 시크릿 관리 전략

```yaml
# GitHub Secrets 구조 예시
secrets:
  # 환경별 데이터베이스
  PROD_DATABASE_URL: "postgresql://..."
  STAGING_DATABASE_URL: "postgresql://..."

  # 환경별 API
  PROD_API_URL: "https://api.myapp.com"
  STAGING_API_URL: "https://api-staging.myapp.com"

  # 공통 시크릿
  AUTH_SECRET: "shared-secret-key"

  # 외부 서비스 키
  STRIPE_SECRET_KEY: "sk_live_..."
  AWS_ACCESS_KEY_ID: "AKIA..."
```

### 4. 공개 저장소 환경변수 전략

#### 온보딩 프로세스

```bash
# 새 개발자 설정 과정
git clone https://github.com/company/myapp.git
cd myapp
cp .env.example .env.development.local
# .env.development.local 파일을 실제값으로 수정
```

#### 환경변수 템플릿 (.env.example)

```bash
# 새 개발자를 위한 상세한 가이드와 함께
# 복사 후 실제값으로 변경: cp .env.example .env.development.local

# 기본 설정
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 이메일 설정 (Mailtrap 권장 - https://mailtrap.io)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password

# 데이터베이스 (로컬 PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/myapp_dev

# JWT 시크릿 (32자 이상 랜덤 문자열)
JWT_SECRET=your-super-secret-jwt-key-32-chars-minimum

# GitHub API (Personal Access Token 생성 필요)
GITHUB_TOKEN=ghp_your_personal_access_token_here

# Google API (OAuth 2.0 토큰)
GOOGLE_TOKEN=ya29.your_google_oauth_token_here

# 결제 API (Stripe 테스트 키)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

#### README.md에 포함할 설정 가이드

```markdown
## 개발 환경 설정

1. 환경변수 파일 생성
   \`\`\`bash
   cp .env.example .env.development.local
   \`\`\`

2. 필요한 서비스 가입

   - [Mailtrap](https://mailtrap.io) - 개발용 이메일 테스트
   - [GitHub](https://github.com/settings/tokens) - Personal Access Token
   - [Stripe](https://dashboard.stripe.com/test/apikeys) - 테스트 API 키

3. 로컬 데이터베이스 설정
   \`\`\`bash
   createdb myapp_dev
   npm run db:migrate
   \`\`\`
```

## .gitignore 설정

```gitignore
# 환경변수 파일
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.staging.local
.env.feature.local

# 빌드 출력
.next/
dist/
build/

# 의존성
node_modules/

# 로그
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 런타임 데이터
.vercel
```

## `@next/env` 패키지 활용

Next.js 외부에서 환경변수를 로드해야 할 때 사용하는 공식 패키지입니다.

### 설치 및 기본 사용법

```bash
npm install @next/env
```

```javascript
import { loadEnvConfig } from "@next/env"

const projectDir = process.cwd()
loadEnvConfig(projectDir)

// 이제 process.env에서 .env 파일들의 값을 사용할 수 있음
console.log(process.env.DATABASE_URL)
```

### 주요 사용 사례

#### 1. 테스트 환경 설정

```javascript
// jest.config.js 또는 테스트 글로벌 설정
import { loadEnvConfig } from "@next/env"

export default async () => {
  const projectDir = process.cwd()
  loadEnvConfig(projectDir)
}
```

#### 2. ORM 설정 파일

```javascript
// prisma/schema.prisma 또는 drizzle.config.ts
import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL, // .env 파일에서 로드됨
  },
}
```

#### 3. 빌드 스크립트

```javascript
// scripts/build.js
import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())

// 환경변수를 사용한 빌드 로직
if (process.env.ANALYZE === "true") {
  // 번들 분석 실행
}
```

### ESM 환경에서 사용 시 주의사항

**CommonJS 환경:**

```javascript
const { loadEnvConfig } = require("@next/env")
loadEnvConfig(process.cwd())
```

**ESM 환경 (권장):**

```javascript
import { loadEnvConfig } from "@next/env"
loadEnvConfig(process.cwd())
```

**ESM 호환성 문제 시:**

```javascript
import pkg from "@next/env"
const { loadEnvConfig } = pkg
loadEnvConfig(process.cwd())
```

## 환경변수 디버깅 도구

```typescript
// lib/debug-env.ts (개발/스테이징에서만 사용)
import { loadEnvConfig } from "@next/env"

export const debugEnvironment = () => {
  if (process.env.NODE_ENV === "production") return

  // Next.js 환경변수 로딩 재현
  loadEnvConfig(process.cwd())

  console.log("🔧 Environment Debug Info:")
  console.log("NODE_ENV:", process.env.NODE_ENV)
  console.log("DEPLOY_ENV:", process.env.DEPLOY_ENV)

  // 로드된 환경변수 파일들 확인
  const envFiles = [".env", ".env.local", `.env.${process.env.NODE_ENV}`, `.env.${process.env.NODE_ENV}.local`]
  console.log("📁 Loaded env files:", envFiles)

  // 공개 환경변수만 로깅
  console.log("🌍 Public variables:")
  Object.keys(process.env)
    .filter((key) => key.startsWith("NEXT_PUBLIC_"))
    .forEach((key) => {
      console.log(`  ${key}:`, process.env[key])
    })
}

## Next.js 실험적 기능 상세 설명

### 1. optimizePackageImports
**목적:** 대형 라이브러리에서 실제 사용하는 모듈만 번들에 포함

**⚠️ 단점: 일일이 추가해야 함**
```javascript
// 설정 전 - 전체 라이브러리 임포트
import { Button } from '@mui/material' // 전체 MUI 번들 포함

// 설정 후 - 필요한 컴포넌트만 임포트  
import { Button } from '@mui/material' // Button 컴포넌트만 포함
```

**실제 설정의 번거로움:**
```javascript
optimizePackageImports: [
  "@mui/material",           // 1. MUI 코어
  "@mui/icons-material",     // 2. MUI 아이콘도 따로
  "@mui/x-data-grid",        // 3. MUI X 컴포넌트들도 각각
  "@mui/x-date-pickers",     // 4. 더 추가...
  "react-icons/ai",          // 5. react-icons도 세분화
  "react-icons/bi", 
  "react-icons/fa",
  "@radix-ui/react-dialog",  // 6. Radix UI 각 컴포넌트별로
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-select",
  // 새 라이브러리 추가할 때마다 여기도 업데이트해야 함
]
```

**성능 효과:**
- 번들 크기 30-50% 감소
- 초기 로딩 시간 단축
- Tree-shaking 최적화
- **하지만 설정 유지보수 부담**

### 2. typedRoutes
**목적:** 타입 안전한 라우팅으로 잘못된 링크 방지
```typescript
// .next/types/link.d.ts 자동 생성
import Link from 'next/link'

// 타입 안전한 링크
<Link href="/dashboard/users">Users</Link> // ✅ 정상
<Link href="/invalid-route">Invalid</Link> // ❌ 타입 에러
```

**사용 조건:**
- App Router 필수
- TypeScript 프로젝트
- Next.js 14.1+

### 3. serverComponentsExternalPackages
**목적:** 서버 컴포넌트 번들링에서 특정 패키지 제외
```javascript
// Prisma 같은 라이브러리는 서버에서만 사용
export default {
  experimental: {
    serverComponentsExternalPackages: ['prisma', '@prisma/client']
  }
}
```

**필요한 경우:**
- Native 바이너리 포함 패키지
- 서버 전용 라이브러리
- 번들링 문제가 있는 패키지

### 4. reactCompiler (React 19)
**목적:** 자동 최적화로 수동 메모이제이션 불필요
```jsx
// 기존 - 수동 최적화
const ExpensiveComponent = memo(({ data }) => {
  const processed = useMemo(() => processData(data), [data])
  return <div>{processed}</div>
})

// React Compiler - 자동 최적화
const ExpensiveComponent = ({ data }) => {
  const processed = processData(data) // 자동으로 최적화됨
  return <div>{processed}</div>
}
```

### 5. staticGenerationMaxConcurrency
**목적:** 정적 생성 시 동시 처리 페이지 수 제한
```javascript
// 기본값: CPU 코어 수
// 설정값: 8 (메모리 사용량 vs 빌드 속도 균형)
staticGenerationMaxConcurrency: 8
```

**주의사항:**
- 높은 값: 빌드 속도 향상, 메모리 사용량 증가
- 낮은 값: 메모리 안정성, 빌드 속도 저하

### 6. turbo (Turbopack)
**목적:** Webpack 대체 고성능 번들러

**SVG 설정 (Turbopack용):**
```javascript
turbo: {
  rules: {
    "*.svg": {
      loaders: ["@svgr/webpack"], // SVG를 React 컴포넌트로
      as: "*.js",
    },
  },
}
```

**SVG 사용법:**
```jsx
// 설치: npm install --save-dev @svgr/webpack
import IconName from './path/to/icon.svg'

function MyComponent() {
  return <IconName className="w-6 h-6" />
}
```

**Webpack + Turbopack 동시 설정 필요:**
```javascript
export default {
  // Webpack 설정 (프로덕션 빌드용)
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    })
    return config
  },
  
  // Turbopack 설정 (개발 서버용)
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
}
```

**성능 향상:**
- 개발 서버 시작 76.7% 빠름
- Hot Reload 96.3% 빠름
- 프로덕션 빌드 (알파)

### 7. reactViewTransitions
**목적:** 페이지 간 부드러운 전환 애니메이션
```tsx
// 자동으로 페이지 전환 애니메이션 적용
export default function Page() {
  return (
    <div style={{ viewTransitionName: 'main-content' }}>
      <h1>페이지 콘텐츠</h1>
    </div>
  )
}
```

### 8. nodeMiddleware
**목적:** 미들웨어에서 Node.js 런타임 사용
```javascript
// middleware.ts에서 Node.js API 사용 가능
import { NextRequest } from 'next/server'
import fs from 'fs' // Node.js API 사용 가능

export function middleware(request: NextRequest) {
  // Node.js 기능 활용
}
```

## 프로덕션 사용 가이드라인

### ✅ 안정적 (프로덕션 권장)
- `optimizePackageImports` - 성능 향상 확실
- `typedRoutes` - 개발 경험 개선
- `serverComponentsExternalPackages` - 필요시 사용

### ⚠️ 주의 필요 (테스트 후 사용)
- `reactCompiler` - React 19 의존성
- `staticGenerationMaxConcurrency` - 메모리 사용량 모니터링
- `turbo` - 호환성 확인 필요

### 🚫 프로덕션 비권장
- `turbopack` (프로덕션) - 아직 알파 단계
- `reactViewTransitions` - 브라우저 호환성
- `nodeMiddleware` - Edge Runtime 제한

## Next.js Config 전체 옵션 참고

### 📚 공식 문서
**전체 옵션:** [next.config.js 공식 문서](https://nextjs-ko.org/docs/app/api-reference/next-config-js)

### 🔧 기본 설정 옵션

#### 앱 구조 & 경로
- **[`appDir`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/appDir)** - App Router 활성화
- **[`basePath`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/basePath)** - 앱 기본 경로 설정
- **[`assetPrefix`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/assetPrefix)** - CDN 정적 파일 경로
- **[`distDir`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/distDir)** - 빌드 출력 디렉토리
- **[`pageExtensions`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/pageExtensions)** - 페이지 파일 확장자

#### 성능 & 최적화
- **[`images`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/images)** - 이미지 최적화 설정
- **[`optimizePackageImports`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/optimizePackageImports)** - 패키지 import 최적화
- **[`transpilePackages`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/transpilePackages)** - 패키지 트랜스파일
- **[`compress`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/compress)** - gzip 압축 활성화
- **[`productionBrowserSourceMaps`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/productionBrowserSourceMaps)** - 프로덕션 소스맵

#### 라우팅 & 네비게이션
- **[`redirects`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/redirects)** - URL 리다이렉트
- **[`rewrites`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/rewrites)** - URL 리라이팅
- **[`headers`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/headers)** - HTTP 헤더 설정
- **[`trailingSlash`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/trailingSlash)** - URL 끝 슬래시 처리

#### 환경 & 보안
- **[`env`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/env)** - 환경변수 설정
- **[`crossOrigin`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/crossOrigin)** - CORS 설정
- **[`poweredByHeader`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/poweredByHeader)** - X-Powered-By 헤더
- **[`httpAgentOptions`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/httpAgentOptions)** - HTTP 에이전트 설정

#### 개발 & 빌드
- **[`reactStrictMode`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/reactStrictMode)** - React Strict Mode
- **[`eslint`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/eslint)** - ESLint 설정
- **[`typescript`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/typescript)** - TypeScript 설정
- **[`devIndicators`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/devIndicators)** - 개발 표시기
- **[`onDemandEntries`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/onDemandEntries)** - 개발 시 메모리 관리

#### 고급 설정
- **[`webpack`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/webpack)** - Webpack 커스터마이징
- **[`turbo`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/turbo)** - Turbopack 설정
- **[`output`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/output)** - 출력 모드 설정
- **[`generateBuildId`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/generateBuildId)** - 빌드 ID 생성
- **[`generateEtags`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/generateEtags)** - ETag 생성

### 🧪 실험적 기능
- **[`reactCompiler`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/reactCompiler)** - React 컴파일러
- **[`typedRoutes`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/typedRoutes)** - 타입 안전 라우팅
- **[`ppr`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/ppr)** - Partial Prerendering
- **[`serverActions`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/serverActions)** - 서버 액션
- **[`serverExternalPackages`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/serverExternalPackages)** - 서버 외부 패키지

### 📊 캐싱 & 성능 모니터링
- **[`staleTimes`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/staleTimes)** - 캐시 유효 시간
- **[`webVitalsAttribution`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/webVitalsAttribution)** - Web Vitals 분석
- **[`incrementalCacheHandlerPath`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/incrementalCacheHandlerPath)** - 증분 캐시 핸들러
- **[`logging`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/logging)** - 로깅 설정

### 🔧 기타 옵션
- **[`cssChunking`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/cssChunking)** - CSS 청킹
- **[`urlImports`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/urlImports)** - URL에서 모듈 import
- **[`exportPathMap`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/exportPathMap)** - 정적 export 경로
- **[`mdxRs`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/mdxRs)** - MDX Rust 컴파일러
- **[`instrumentationHook`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/instrumentationHook)** - 계측 훅
- **[`swrDelta`](https://nextjs-ko.org/docs/app/api-reference/next-config-js/swrDelta)** - SWR 델타 업데이트
```
