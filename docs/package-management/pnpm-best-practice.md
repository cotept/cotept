# pnpm Workspace 실무 가이드

> CotePT 프로젝트의 패키지 관리 Best Practice

## 목차

1. [pnpm Workspace 개념](#1-pnpm-workspace-개념)
2. [의존성 설치 전략](#2-의존성-설치-전략)
3. [명령어 비교](#3-명령어-비교)
4. [실무 워크플로우](#4-실무-워크플로우)
5. [주의사항](#5-주의사항)
6. [치트시트](#6-치트시트)

---

## 1. pnpm Workspace 개념

### 1.1 호이스팅 메커니즘

pnpm은 동일한 버전의 패키지를 **단 한 번만 디스크에 저장**하고, 각 프로젝트는 심볼릭 링크로 접근합니다.

```bash
# 실제 파일 구조
project/
├── node_modules/
│   └── .pnpm/
│       └── class-variance-authority@0.7.1/  # 실제 파일 (1개만!)
│
├── apps/web/node_modules/
│   └── class-variance-authority -> ../../node_modules/.pnpm/...  # 심볼릭 링크
│
└── packages/shared/node_modules/
    └── class-variance-authority -> ../../node_modules/.pnpm/...  # 심볼릭 링크
```

**핵심**: 중복 설치가 아니라, 디스크 공간 절약!

### 1.2 Turborepo vs NX vs pnpm Workspace

| 항목 | Turborepo (CotePT) | NX | pnpm Workspace |
|------|-------------------|-----|----------------|
| 역할 | 빌드 캐싱 & 태스크 오케스트레이션 | 통합 모노레포 솔루션 | 패키지 의존성 관리 |
| 의존성 관리 | pnpm/npm/yarn에 위임 | 자체 통합 | 호이스팅 & 심볼릭 링크 |
| package.json | 각 패키지 명시 필수 | 루트 중심 (선택적) | 각 패키지 명시 권장 |
| Phantom Deps | 방지 | 발생 가능 | 명시적 선언으로 방지 |

**CotePT는 Turborepo + pnpm Workspace 조합을 사용합니다.**

### 1.3 명시적 의존성 선언의 중요성

```typescript
// X Phantom Dependency (Bad)
// apps/web/package.json에 CVA 없음
// packages/shared가 CVA 사용
// apps/web이 우연히 CVA에 접근 가능 (위험!)
import { cva } from "class-variance-authority" // 빌드는 되지만...

// ✓ Explicit Dependency (Good)
// apps/web/package.json에 CVA 명시
// 의존성이 명확하고 안전
import { cva } from "class-variance-authority" // 안전!
```

**장점**:
- ✓ Phantom Dependency 방지
- ✓ 패키지 독립성 보장
- ✓ 빌드 재현성 향상
- ✓ TypeScript 타입 해석 명확

---

## 2. 의존성 설치 전략

### 2.1 버전 일관성 유지

#### ✓ 올바른 버전 관리

```json
// packages/shared/package.json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1"
  }
}

// apps/web/package.json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1"  // ✓ 동일 버전
  }
}
```

**결과**: `.pnpm/class-variance-authority@0.7.1`에 **1번만 설치**

#### X 다른 버전 사용 시

```json
// packages/shared/package.json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1"
  }
}

// apps/web/package.json
{
  "dependencies": {
    "class-variance-authority": "^0.8.0"  // X 다른 버전
  }
}
```

**결과**: 두 버전 모두 설치 (진짜 중복 발생!)
```
.pnpm/
├── class-variance-authority@0.7.1/
└── class-variance-authority@0.8.0/
```

### 2.2 동일 버전으로 설치하는 방법

#### 방법 1: 버전 확인 후 명시적 설치 (권장)

```bash
# Step 1: 현재 설치된 버전 확인
pnpm list class-variance-authority --depth 0

# 출력 예시:
# packages/shared
# └── class-variance-authority@0.7.1

# Step 2: 동일 버전으로 설치
pnpm -F web add class-variance-authority@0.7.1

# 또는
cd apps/web
pnpm add class-variance-authority@0.7.1
```

#### 방법 2: 자동 매칭 (간편)

```bash
# lockfile에서 자동 매칭
pnpm -F web add class-variance-authority

# pnpm이 pnpm-lock.yaml을 보고 이미 설치된 0.7.1 재사용
```

#### 방법 3: 스크립트로 버전 추출

```bash
# lockfile에서 버전 추출 (jq 필요)
VERSION=$(pnpm list class-variance-authority --depth 0 --json | \
  jq -r '.[] | .dependencies["class-variance-authority"].version')

pnpm -F web add class-variance-authority@$VERSION

# 또는 package.json에서 추출 (grep 사용)
VERSION=$(grep "class-variance-authority" packages/shared/package.json | \
  grep -oP '"\^?\K[0-9.]+')

pnpm -F web add class-variance-authority@$VERSION
```

#### 비교표

| 방법 | 명령어 | 장점 | 단점 |
|------|--------|------|------|
| 명시적 버전 | `pnpm add pkg@0.7.1` | 가장 명확, 실수 방지 | 버전 수동 확인 필요 |
| 자동 매칭 | `pnpm add pkg` | 간편함 | lockfile 신뢰 필요 |
| 스크립트 | `VERSION=$(...) pnpm add pkg@$VERSION` | 자동화 가능 | 복잡함 |

**추천**: 방법 1 (명시적 버전 지정)

### 2.3 버전 통합 전략

```bash
# 1. 루트에서 버전 확인
pnpm list <package-name>

# 2. 버전 불일치 발견 시 사용처 확인
pnpm why <package-name>

# 3. 중복 제거
pnpm dedupe

# 4. 강제 버전 통일 (package.json 루트)
{
  "pnpm": {
    "overrides": {
      "class-variance-authority": "0.7.1"
    }
  }
}
```

---

## 3. 명령어 비교

### 3.1 `pnpm install` vs `pnpm install --frozen-lockfile`

| 명령어 | 동작 | 사용 시점 | lockfile 변경 |
|--------|------|-----------|---------------|
| `pnpm install` | lockfile 재계산 가능 | 로컬 개발, 의존성 추가 | ✓ 가능 |
| `pnpm install --frozen-lockfile` | lockfile 고정 | CI/CD, 프로덕션 배포 | X 금지 (에러 발생) |

### 3.2 `pnpm install` (일반 설치)

```bash
# 동작 방식
1. package.json 읽기
2. pnpm-lock.yaml과 비교
3. 버전 범위(^, ~) 내에서 최신 버전 확인
4. 필요시 lockfile 업데이트
5. node_modules 설치

# 예시
# package.json: "react": "^19.0.0"
# pnpm-lock.yaml: react@19.0.0
# npm registry 최신: react@19.0.3
# → lockfile 업데이트하고 19.0.3 설치
```

**문제점**:
- 팀원마다 다른 시점에 설치 → 다른 버전 가능
- "내 로컬에서는 되는데요?" 문제 발생

### 3.3 `pnpm install --frozen-lockfile` (고정 설치)

```bash
# 동작 방식
1. package.json 읽기
2. pnpm-lock.yaml과 비교
3. 불일치 발견 시 즉시 에러 종료
4. lockfile 그대로 사용하여 설치

# 예시
# lockfile에 react@19.0.0 → 무조건 19.0.0 설치
# 최신이 19.0.3이어도 무시
```

**장점**:
- ✓ 모든 환경에서 100% 동일한 버전
- ✓ 예기치 않은 버전 변경 방지
- ✓ 빌드 재현성 보장

**CI/CD와 프로덕션 환경에서는 필수!**

---

## 4. 실무 워크플로우

### 4.1 로컬 개발 환경

```bash
# 새 프로젝트 클론 시
git clone <repo>
pnpm install  # lockfile 그대로 설치

# 새 패키지 추가
pnpm add axios                    # dependencies
pnpm add -D typescript            # devDependencies
pnpm add -w lodash                # 루트(workspace)에 설치
pnpm -F web add axios             # apps/web에만 설치
pnpm -F @repo/shared add lodash   # packages/shared에만 설치

# 특정 버전 설치
pnpm add react@19.0.0    # 정확한 버전
pnpm add react@^19.0.0   # 범위 지정

# 패키지 제거
pnpm remove axios

# 의존성 업데이트
pnpm update                    # 버전 범위 내 업데이트
pnpm update react --latest     # 최신 메이저 버전
pnpm update --interactive      # 대화형 업데이트

# lockfile 재생성 (문제 발생 시)
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 4.2 CI/CD 환경

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8.15.6

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      # 필수: --frozen-lockfile 사용
      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test
```

### 4.3 Docker 빌드

```dockerfile
# Dockerfile
FROM node:20-alpine AS deps

RUN npm install -g pnpm@8.15.6

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/

# --frozen-lockfile + --prefer-offline (캐시 활용)
RUN pnpm install --frozen-lockfile --prefer-offline

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build
```

### 4.4 CotePT 프로젝트 적용 예시

```bash
# 1. 현재 버전 확인
cd /home/hsj95/workspace/dev/project/cotept
pnpm list class-variance-authority

# 2. apps/web에 CVA 추가
pnpm -F web add class-variance-authority@0.7.1

# 3. lockfile 확인
git diff pnpm-lock.yaml

# 4. 타입 체크
cd apps/web
pnpm typecheck

# 5. 빌드 확인
pnpm build

# 6. 커밋
git add apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): add CVA for Logo component variants"
```

---

## 5. 주의사항

### 5.1 절대 하지 말아야 할 것

```bash
# X lockfile 수동 편집
vim pnpm-lock.yaml  # 절대 금지!

# X lockfile 무시
echo "pnpm-lock.yaml" >> .gitignore  # 절대 금지!

# X node_modules 커밋
git add node_modules/  # 절대 금지!

# X 패키지 매니저 혼용 (하나만 사용)
npm install   # pnpm 프로젝트에서 금지
yarn add      # pnpm 프로젝트에서 금지
```

### 5.2 필수 규칙

```bash
# 1. lockfile은 항상 Git에 커밋
git add pnpm-lock.yaml
git commit -m "chore: update dependencies"

# 2. .gitignore 설정
node_modules/
.pnpm-store/
.pnpm-debug.log

# 3. .npmrc 설정 (프로젝트 루트)
# 버전 불일치 시 에러
strict-peer-dependencies=true

# 자동 설치 방지
auto-install-peers=false

# 호이스팅 설정
shamefully-hoist=false
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*

# lockfile 버전 고정
lockfile-version=6.0
```

### 5.3 자주 하는 실수

#### X 잘못된 방법

```bash
# 1. 버전 확인 없이 범위만 지정
pnpm -F web add class-variance-authority@^0.7.0
# → 0.7.2가 설치될 수 있음 (불일치!)

# 2. 최신 버전으로 업데이트
pnpm -F web add class-variance-authority@latest
# → shared는 0.7.1, web은 0.8.0 (중복!)

# 3. package.json 직접 수정 후 install
vim apps/web/package.json  # 수동으로 추가
pnpm install
# → 버전 불일치 가능성
```

#### ✓ 올바른 방법

```bash
# 1. 현재 버전 확인
pnpm list class-variance-authority --depth 0

# 2. 동일 버전 설치
pnpm -F web add class-variance-authority@0.7.1

# 3. 검증
pnpm list class-variance-authority --depth 0

# 4. 실제 파일 확인 (1개만 존재)
du -sh node_modules/.pnpm/class-variance-authority@0.7.1
```

### 5.4 버전 불일치 방지 스크립트

```json
// package.json (루트)
{
  "scripts": {
    "check-versions": "pnpm list --depth 0 --json | jq '.[] | .dependencies'",
    "sync-versions": "pnpm dedupe && pnpm install"
  }
}
```

```bash
# 중복 버전 확인
pnpm check-versions

# 버전 통합
pnpm sync-versions
```

---

## 6. 치트시트

### 6.1 설치

```bash
pnpm install                      # 일반 설치
pnpm install --frozen-lockfile    # CI/프로덕션용 (필수!)
pnpm install --prefer-offline     # 캐시 우선
```

### 6.2 패키지 관리

```bash
pnpm add <pkg>              # dependencies
pnpm add -D <pkg>           # devDependencies
pnpm add -O <pkg>           # optionalDependencies
pnpm add -w <pkg>           # 루트(workspace)에 설치

pnpm remove <pkg>           # 패키지 제거
```

### 6.3 Workspace 작업

```bash
pnpm -F web add axios                  # apps/web에만 설치
pnpm -F @repo/shared build             # shared 패키지만 빌드
pnpm -r build                          # 모든 패키지 빌드 (recursive)
pnpm -r --parallel build               # 병렬 빌드
```

### 6.4 정보 확인

```bash
pnpm list                   # 설치된 패키지 목록
pnpm list --depth 0         # 직접 의존성만
pnpm why <pkg>              # 왜 설치되었는지
pnpm outdated               # 업데이트 가능한 패키지
```

### 6.5 업데이트

```bash
pnpm update                      # 버전 범위 내 업데이트
pnpm update --latest             # 최신 버전으로 (major 포함)
pnpm update --interactive        # 대화형 업데이트
pnpm update <pkg>@latest         # 특정 패키지만 최신 버전
```

### 6.6 문제 해결

```bash
pnpm store prune                          # 사용하지 않는 패키지 정리
pnpm dedupe                               # 중복 제거
rm -rf node_modules pnpm-lock.yaml        # 완전 재설치
pnpm install
```

---

## 7. 팀 협업 규칙

### 7.1 Pull Request 체크리스트

```markdown
## 의존성 변경 시 필수 확인

- [ ] pnpm-lock.yaml 커밋 포함
- [ ] package.json 변경 사유 명시
- [ ] 버전 업데이트 시 CHANGELOG 작성
- [ ] CI 빌드 통과
- [ ] 새 패키지 추가 시 라이선스 확인
```

### 7.2 코드 리뷰 포인트

```typescript
// X Bad: Phantom Dependency
import { cva } from "class-variance-authority"  // package.json에 없음

// ✓ Good: Explicit Dependency
import { cva } from "class-variance-authority"  // package.json에 명시됨
```

### 7.3 의존성 추가 워크플로우

```bash
# 1. 필요한 패키지 확인
pnpm search <keyword>

# 2. 이미 설치된 버전 확인
pnpm list <pkg> --depth 0

# 3. 동일 버전으로 설치
pnpm -F <workspace> add <pkg>@<version>

# 4. 타입 체크
pnpm typecheck

# 5. 빌드 확인
pnpm build

# 6. 커밋
git add package.json pnpm-lock.yaml
git commit -m "feat: add <pkg> for <reason>"
```

---

## 8. 요약

### 핵심 원칙

1. **버전 일관성**: 모노레포 내 동일 패키지는 같은 버전 사용
2. **명시적 선언**: 사용하는 패키지는 반드시 package.json에 명시
3. **lockfile 관리**: 항상 Git 커밋, 절대 수동 편집 금지
4. **로컬 개발**: `pnpm install` (lockfile 업데이트 허용)
5. **CI/CD**: `pnpm install --frozen-lockfile` (lockfile 고정, 필수!)

### Quick Reference

```bash
# 가장 많이 사용하는 명령어
pnpm install                              # 로컬 개발
pnpm install --frozen-lockfile            # CI/CD (필수)
pnpm -F <workspace> add <pkg>@<version>   # 패키지 추가
pnpm list <pkg> --depth 0                 # 버전 확인
pnpm why <pkg>                            # 사용처 확인
pnpm dedupe                               # 중복 제거
```

### 문제 발생 시 체크리스트

1. `pnpm list` → 버전 불일치 확인
2. `pnpm why` → 의존성 그래프 확인
3. `pnpm dedupe` → 중복 제거
4. `rm -rf node_modules pnpm-lock.yaml && pnpm install` → 완전 재설치
5. `.npmrc` 설정 확인
6. CI 로그 확인 (`--frozen-lockfile` 사용 여부)

---

**문서 업데이트**: 2025-01-18
**작성자**: CotePT 개발팀
