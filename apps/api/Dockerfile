# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm

# 워크스페이스 설정 파일 복사
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages

RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

# 워크스페이스 설정 복사
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./

# deps에서 설치된 모듈 복사
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages

# 소스 코드 복사
COPY apps/api ./apps/api

# 빌드
RUN pnpm turbo build --filter=api...

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app/apps/api
RUN npm install -g pnpm

# 로그 디렉토리 생성
RUN mkdir -p logs/{debug,info,warn,error} && \
    chown -R node:node logs

# 빌드된 앱과 의존성 복사 - apps/api 경로로
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=deps /app/node_modules ../../node_modules
COPY --from=deps /app/apps/api/node_modules ./node_modules

USER node

EXPOSE 3000
CMD ["node", "dist/main"]