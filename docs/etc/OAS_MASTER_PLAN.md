# OAS 마스터 플랜: API 클라이언트 자동화 및 협업 워크플로우

## 개요

이 문서는 우리 프로젝트에서 OpenAPI Specification(OAS)를 도입하고, 이를 기반으로 프론트엔드 API 통신 계층을 자동화하며, 나아가 팀 전체의 협업 효율을 극대화하기 위한 종합 계획을 정의합니다.

**목표:** API 명세 변경에 따른 반복적인 수작업을 완전히 제거하고, 타입 안정성을 보장하며, 모든 팀원이 API 변경 사항을 즉시 인지할 수 있는 투명하고 자동화된 워크플로우를 구축하여 개발자 경험(DX)을 최고 수준으로 끌어올립니다.

---

## 1. 왜 이 방식인가?: 아키텍처 일관성의 중요성

OAS를 통해 API 클라이언트를 생성하는 방법은 크게 두 가지로 나뉩니다. 이 중 우리 프로젝트에 가장 적합한 방식을 선택하는 것은 장기적인 유지보수성과 확장성에 결정적인 영향을 미칩니다.

- **A안: 생성된 함수를 그대로 사용**
- **B안: 기존 아키텍처(`ApiClient`)와 통합 (우리의 최종 선택)**

결론부터 말하자면, 우리는 **B안**을 채택합니다. 이는 단기적인 편의성보다 장기적인 프로젝트의 건강성을 우선시하는 전략적 결정이며, 그 이유는 다음과 같습니다.

### 아키텍처 접근 방식 비교

| 항목                | A안: 생성된 함수 그대로 사용                                                                                                             | B안: 기존 아키텍처와 통합 (채택)                                                                                     |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **아키텍처 일관성** | 🔴 **파편화**<br/>기존 클래스 기반(`ApiClient`) 스타일과 새로운 함수 기반 스타일이 혼재하여 코드의 일관성을 해치고 혼란을 야기합니다.    | 🟢 **통합**<br/>생성된 코드도 기존 `BaseApiService`를 상속받아, 프로젝트 전체가 하나의 아키텍처 스타일을 유지합니다. |
| **코드 재사용성**   | 🔴 **재사용 불가**<br/>`ApiClient`에 구현된 **인증 인터셉터, 에러 처리, 타임아웃 등**의 핵심 공통 로직을 전혀 재사용할 수 없습니다.      | 🟢 **완벽한 재사용**<br/>`BaseApiService`를 상속받는 것만으로 **모든 공통 로직이 자동으로 적용**됩니다.              |
| **유지보수성**      | 🔴 **재앙**<br/>인증 로직 변경 시, 생성된 **수십, 수백 개의 모든 함수 호출부**를 수정해야 합니다. 이는 "보일러플레이트 지옥"을 만듭니다. | 🟢 **최상**<br/>공통 로직 변경 시, `ApiClient` **단 한 곳만 수정**하면 모든 API에 즉시 반영됩니다.                   |
| **확장성**          | 🔴 **제한적**<br/>API 로깅, 캐싱 등 새로운 공통 기능을 추가하려면 모든 호출부를 수정해야 하므로 사실상 확장이 불가능합니다.              | 🟢 **유연함**<br/>`ApiClient`나 `BaseApiService`에 새로운 기능을 쉽게 추가하고 모든 API로 확장할 수 있습니다.        |
| **초기 개발 속도**  | 🟡 **단기적으로 빠름**<br/>템플릿 수정 없이 바로 사용 가능합니다.                                                                        | 🟡 **초기 투자 필요**<br/>초기에 템플릿을 수정하는 시간이 필요합니다. (하지만 이는 장기적인 이점으로 상쇄됨)         |

**결론:** `A안`은 프로젝트가 커질수록 유지보수 비용이 기하급수적으로 증가하는 **"기술 부채"** 를 쌓는 길입니다. 반면 `B안`은 이미 잘 구축된 `ApiClient`라는 자산을 최대한 활용하여, 장기적으로 안정적이고 확장 가능한 아키텍처를 구축하는 현명한 길입니다.

---

## 2. 실행 계획: 단계별 로드맵

### 1단계: 기반 구축 - 템플릿 커스터마이징

- **목표:** `openapi-generator-cli`가 우리 프로젝트의 아키텍처에 맞는 코드를 생성하도록 템플릿을 수정합니다.
- **실행 항목:**
  1.  `packages/api-client/custom-templates` 내의 `.mustache` 템플릿 파일을 수정합니다.
  2.  생성되는 API 서비스 클래스가 `BaseApiService`를 상속받도록 구조를 변경합니다.
  3.  각 API 메서드가 내부적으로 `this.get`, `this.post` 등 부모 클래스의 메서드를 호출하도록 로직을 수정합니다.

### 2단계: 자동화 - CI/CD 및 변경점 추적

- **목표:** API 클라이언트 생성 및 변경점 추적 과정을 자동화합니다.
- **실행 항목:**
  1.  `pnpm gen:api` 스크립트를 고도화합니다.
  2.  스크립트 실행 시, 기존 `openapi.yaml`을 `openapi.yaml.old`로 백업하는 로직을 추가합니다.
  3.  `oasdiff` CLI 도구를 사용하여 `openapi.yaml.old`와 새로 생성된 `openapi.yaml`의 차이점을 분석하고 결과를 출력합니다.

### 3단계: 정보 전파 - 협업 도구 연동 (GitHub Actions)

- **목표:** API 명세 변경 시, 모든 팀원이 관련 내용을 자동으로 알림 받도록 시스템을 구축합니다.
- **실행 항목:**
  1.  **GitHub Actions** 워크플로우를 설정하여, API 관련 코드 변경이 포함된 PR 생성 시 자동으로 실행되도록 합니다.
  2.  워크플로우 내에서 `oasdiff`를 실행하여 변경점을 **마크다운 형식**으로 생성합니다.
  3.  **자동 알림 전송:**
      - **Slack:** 지정된 채널에 변경 요약 메시지를 전송합니다.
      - **GitHub PR:** 해당 PR에 변경 요약 코멘트를 자동으로 게시합니다.
      - **Notion:** API 변경 로그 데이터베이스에 새로운 페이지로 요약 정보를 기록합니다.

#### 구현 예시: `.github/workflows/api-diff-notifier.yml`

````yaml
name: API Change Notification

on:
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'apps/api/**'

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Head Branch
        uses: actions/checkout@v4
        with:
          path: head

      - name: Checkout Base Branch
        uses: actions/checkout@v4
        with:
          ref: ${{ github.base_ref }}
          path: base

      # 실제 프로젝트에서는 pnpm install, build, spec 생성 스크립트 실행 필요
      - name: Generate OpenAPI Spec (Placeholder)
        run: |
          echo "New Spec" > openapi-head.yaml
          echo "Old Spec" > openapi-base.yaml

      - name: Install and Run oasdiff
        run: |
          curl -sL https://github.com/Tufin/oasdiff/releases/latest/download/oasdiff_linux_amd64.tar.gz | tar -xz
          ./oasdiff diff openapi-base.yaml openapi-head.yaml -f markdown --fail-on-diff > diff-summary.md
        continue-on-error: true

      - name: Read Diff Summary
        id: diff
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            try {
              const summary = fs.readFileSync('diff-summary.md', 'utf8');
              core.setOutput('summary', summary);
            } catch (e) {
              core.setOutput('summary', 'API 변경 사항이 없습니다.');
            }

      - name: Send Slack Notification
        if: steps.diff.outputs.summary != 'API 변경 사항이 없습니다.'
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "blocks": [
                { "type": "section", "text": { "type": "mrkdwn", "text": "API 변경 사항이 감지되었습니다. (<${{ github.event.pull_request.html_url }}|PR #${{ github.event.pull_request.number }}>)" } },
                { "type": "divider" },
                { "type": "section", "text": { "type": "mrkdwn", "text": "```
${{ steps.diff.outputs.summary }}
```" } }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: Comment on PR
        if: steps.diff.outputs.summary != 'API 변경 사항이 없습니다.'
        uses: actions/github-script@v6
        with:
          script: |
            const summary = `${process.env.DIFF_SUMMARY}`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## OpenAPI 변경 요약

${summary}`
            });
        env:
          DIFF_SUMMARY: ${{ steps.diff.outputs.summary }}

      - name: Create Notion Page
        if: steps.diff.outputs.summary != 'API 변경 사항이 없습니다.'
        run: |
          # Notion API 호출 로직 (curl 또는 스크립트 사용)
          echo "Notion page created for PR #${{ github.event.pull_request.number }}"
````

---

## 3. 기대 효과

- **개발자 경험(DX) 극대화:** 개발자는 API 통신과 관련된 반복적인 작업을 전혀 신경 쓸 필요 없이, 비즈니스 로직에만 집중할 수 있습니다.
- **소통 비용 최소화:** API 변경 사항이 모든 협업 도구로 자동 전파되므로, "이 API 바뀌었나요?" 와 같은 불필요한 질문과 소통이 사라집니다.
- **휴먼 에러 방지:** 타입과 API 클라이언트가 자동으로 생성되므로, 수동으로 API를 호출하며 발생할 수 있는 오타나 누락 등의 실수를 원천적으로 차단합니다.
- **코드 품질 및 일관성:** 프로젝트 전체가 일관된 아키텍처를 유지하며, 코드의 예측 가능성과 안정성이 크게 향상됩니다.

---

## 4. 논의 과정 요약

우리의 논의는 `pnpm gen:api` 실행 시 발생한 `java: not found` 오류에서 시작되었습니다. 이 문제를 해결한 후, `Template directory does not exist` 오류를 통해 템플릿 경로 설정 문제를 발견하고 수정했습니다.

이 과정에서 "생성된 코드를 그대로 쓸 것인가, 아니면 우리 스타일대로 커스텀할 것인가?"라는 근본적인 질문에 도달했습니다. 팀원의 의견(생성된 함수를 그대로 사용)과 이 프로젝트의 기존 아키텍처(클래스 기반 `ApiClient`) 사이에서 깊이 있는 논의를 진행했습니다.

결론적으로, 장기적인 유지보수성과 확장성을 위해 **기존 아키텍처와 완벽하게 통합되도록 템플릿을 커스터마이징**하는 것이 압도적으로 유리하다는 결론에 도달했습니다. 더 나아가, 이 자동화의 가치를 극대화하기 위해 **GitHub Actions와 협업 도구를 연동하여 변경 사항을 팀 전체에 자동으로 전파**하는 시스템까지 계획하게 되었습니다.

````yaml
    1 # .github/workflows/api-diff-notifier.yml
    2
    3 name: API Change Notification
    4
    5 on:
    6   pull_request:
    7     branches: [ main, develop ] # main 또는 develop 브랜치로의 PR일 때
      실행
    8     paths:
    9       - 'apps/api/**' # 백엔드 API 관련 코드가 변경되었을 때만 실행
   10
   11 jobs:
   12   notify:
   13     runs-on: ubuntu-latest
   14     steps:
   15       # 1. PR 브랜치(head)의 코드를 체크아웃
   16       - name: Checkout Head Branch
   17         uses: actions/checkout@v4
   18         with:
   19           path: head
   20
   21       # 2. 기준 브랜치(base)의 코드를 체크아웃
   22       - name: Checkout Base Branch
   23         uses: actions/checkout@v4
   24         with:
   25           ref: ${{ github.base_ref }} # PR의 대상 브랜치 (e.g., main)
   26           path: base
   27
   28       # 3. (가상) 각 브랜치에서 openapi.yaml 생성
   29       # 실제로는 pnpm install, build, generate 스크립트를 실행해야
      합니다.
   30       # 이 부분은 프로젝트의 스크립트에 맞게 수정이 필요합니다.
   31       - name: Generate OpenAPI Spec for Head
   32         run: |
   33           cd head
   34           # pnpm install && pnpm --filter @repo/api build
   35           # pnpm --filter @repo/api generate:spec  # 예시 스크립트
   36           # cp apps/api/openapi.yaml ../openapi-head.yaml
   37           echo "New Spec" > ../openapi-head.yaml # 임시 파일 생성
   38
   39       - name: Generate OpenAPI Spec for Base
   40         run: |
   41           cd base
   42           # pnpm install && pnpm --filter @repo/api build
   43           # pnpm --filter @repo/api generate:spec
   44           # cp apps/api/openapi.yaml ../openapi-base.yaml
   45           echo "Old Spec" > ../openapi-base.yaml # 임시 파일 생성
   46
   47       # 4. oasdiff 설치 및 실행
   48       - name: Install and Run oasdiff
   49         run: |
   50           curl -sL
      https://github.com/Tufin/oasdiff/releases/latest/download/oasdiff_linux
      _amd64.tar.gz | tar -xz
   51           ./oasdiff diff ../openapi-base.yaml ../openapi-head.yaml -f
      markdown --fail-on-diff > ../diff-summary.md
   52         continue-on-error: true # diff가 없으면 에러가 날 수 있으므로
      계속 진행
   53
   54       # 5. diff 결과를 변수로 저장
   55       - name: Read Diff Summary
   56         id: diff
   57         uses: actions/github-script@v6
   58         with:
   59           script: |
   60             const fs = require('fs');
   61             try {
   62               const summary = fs.readFileSync('diff-summary.md', 'utf8'
      );
   63               core.setOutput('summary', summary);
   64             } catch (e) {
   65               core.setOutput('summary', 'API 변경 사항이 없습니다.');
   66             }

  3. 협업 도구 연동

  위 워크플로우에 이어서 각 도구에 알림을 보내는 단계를 추가합니다. (GitHub
  Secrets에 SLACK_WEBHOOK_URL, NOTION_API_KEY, NOTION_DATABASE_ID 등을 미리
  등록해야 합니다.)

    1 # ... (이전 단계에 이어서)
    2
    3       # 6. Slack으로 알림 보내기
    4       - name: Send Slack Notification
    5         if: steps.diff.outputs.summary != 'API 변경 사항이 없습니다.'
    6         uses: slackapi/slack-github-action@v1.24.0
    7         with:
    8           payload: |
    9             {
   10               "blocks": [
   11                 {
   12                   "type": "section",
   13                   "text": {
   14                     "type": "mrkdwn",
   15                     "text": "API 변경 사항이 감지되었습니다. (<${{
      github.event.pull_request.html_url }}|PR #${{
      github.event.pull_request.number }}>)"
   16                   }
   17                 },
   18                 {
   19                   "type": "divider"
   20                 },
   21                 {
   22                   "type": "section",
   23                   "text": {
   24                     "type": "mrkdwn",
   25                     "text": "```\n${{ steps.diff.outputs.summary }}\n
  `"
                    }
                  }
                ]
              }
          env:
            SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

  7. GitHub PR에 코멘트 달기
         - name: Comment on PR
          if: steps.diff.outputs.summary != 'API 변경 사항이 없습니다.'
          uses: actions/github-script@v6
          with:
            script: |
              const summary = ${process.env.DIFF_SUMMARY};
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: ## OpenAPI 변경 요약\n\n${summary}
              });
          env:
            DIFF_SUMMARY: ${{ steps.diff.outputs.summary }}

  8. Notion 데이터베이스에 기록하기
         - name: Create Notion Page
          if: steps.diff.outputs.summary != 'API 변경 사항이 없습니다.'
          run: |
            curl -X POST https://api.notion.com/v1/pages \
              -H "Authorization: Bearer ${{ secrets.NOTION_API_KEY }}" \
              -H "Content-Type: application/json" \
              -H "Notion-Version: 2022-06-28" \
              --data '{
                "parent": { "database_id": "${{ secrets.NOTION_DATABASE_ID }}" },
                "properties": {
                  "PR": { "title": [ { "text": { "content": "PR #${{
  github.event.pull_request.number }}: API 변경" } } ] },
                  "Link": { "url": "${{ github.event.pull_request.html_url }}" }
                },
                "children": [
                  {
                    "object": "block",
                    "type": "code",
                    "code": {
                      "caption": [{"type": "text", "text": {"content": "oasdiff
  summary"}}],
                      "rich_text": [{ "type": "text", "text": { "content": "${{
  steps.diff.outputs.summary }}" } }],
                      "language": "markdown"
                    }
                  }
                ]
              }'
````
