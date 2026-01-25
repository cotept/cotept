# 📋 Husky & Commitlint 설정 가이드 (Monorepo)

이 문서는 프로젝트의 커밋 메시지 컨벤션을 강제하기 위한 설정 절차를 안내합니다.

## 1. 필수 패키지 설치

모노레포의 루트 디렉토리에서 아래 명령어를 실행하여 필요한 도구들을 설치합니다.

```bash

# pnpm 사용 시 (lint-staged, is-ci, eslint 포함)
pnpm add -D husky lint-staged is-ci @commitlint/cli @commitlint/config-conventional eslint -w

# npm 사용 시
npm install --save-dev husky lint-staged is-ci @commitlint/cli @commitlint/config-conventional eslint
```

## 2. Husky 초기화

Git hook 설정을 위한 Husky를 활성화합니다.

```bash

npx husky init
```

## 3. Commitlint 설정 파일 생성

루트 디렉토리에 commitlint.config.js 파일을 생성하고 아래 내용을 복사하여 붙여넣습니다. (요청하신 타입과 스코프가 모두 포함되어 있습니다.)

```JavaScript

// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'style', 'design', 'docs', 'test', 'chore', 'perf'],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'project', 'web', 'api', 'shared', 'api-client',
        'web/auth', 'web/profile', 'web/session', 'web/onboarding', 'web/ui', 'web/config'
      ],
    ],
    'header-max-length': [2, 'always', 50],
    'body-max-line-length': [2, 'always', 72],
    'subject-case': [0], // 한글 메시지 작성을 위해 케이스 검사 비활성화
  },
};
```

## 4. Commit-msg Hook 등록

커밋 시 메시지를 검사하도록 Husky 훅을 설정합니다.

```bash

echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
```

## 5. 자동 Linting 설정 (Lint-staged)

커밋 전에 스테이징된 파일(`*.ts`, `*.tsx` 등)에 대해서만 ESLint와 Prettier를 실행하도록 설정합니다.

### 5-1. package.json 설정

`package.json` 파일을 열어 `scripts`의 `prepare`를 수정하고, `lint-staged` 설정을 추가합니다.

```json
{
  "scripts": {
    // CI 환경에서는 Husky 설치를 건너뛰도록 설정
    "prepare": "is-ci || husky"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### 5-2. Pre-commit Hook 등록

커밋 직전에 `lint-staged`가 실행되도록 훅을 등록합니다.

```bash
echo "npx lint-staged" > .husky/pre-commit
```

## 6. 커밋 메시지 템플릿 설정 (선택 사항)

개발자가 커밋 시 가이드를 볼 수 있도록 템플릿을 등록합니다.

루트 디렉토리에 .gitmessage.txt 파일을 생성하고 가이드 텍스트를 입력합니다.

아래 명령어를 실행하여 Git 템플릿으로 등록합니다.

```bash

git config commit.template .gitmessage.txt
```

## 🚀 설정 확인 (Test)

설정이 잘 되었는지 확인하기 위해 일부러 규칙에 어긋나는 커밋을 시도해 봅니다.

```bash

# 실패 예시 (스코프 없음, 제목 50자 초과 등)
git commit -m "update: 잘못된 커밋 메시지 테스트입니다."

# 성공 예시
git commit -m "feat(web/auth): 소셜 로그인 UI 추가"
```
