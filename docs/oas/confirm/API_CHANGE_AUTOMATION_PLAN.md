# OAS 기반 API 변경 자동화 및 리포팅 전략

> **상태**: 제안

---

## 1. 목표

백엔드 API 명세(OAS) 변경 시, `oasdiff`와 AI를 활용하여 변경 사항을 자동으로 분석 및 요약하고, GitHub PR 코멘트와 Slack 알림을 생성하여 프론트엔드와 백엔드 간의 커뮤니케이션 비용을 최소화하고, API 변경 이력을 명확하게 추적하는 것을 목표로 합니다.

## 2. 핵심 아키텍처

```mermaid
graph TD
    A[개발자가 OAS 변경 후 PR 생성] --> B{GitHub Action 트리거};
    B --> C[1. Base/Head 브랜치 코드 Checkout];
    C --> D[2. oasdiff 설치 및 실행];
    D -- "Markdown 형식의 diff 결과" --> E[3. AI(Gemini)에 diff 결과 전달];
    E -- "분석 및 요약된 리뷰 코멘트" --> F[4. PR에 리뷰 코멘트 자동 작성];
    E -- "요약된 변경 내용" --> G[5. Slack 채널에 알림 전송];
```

## 3. 구현 계획

### 1단계: 사전 준비 - 보안 정보 설정

GitHub Action에서 사용할 민감한 정보들을 GitHub Secrets에 등록합니다.

1.  **Slack Webhook URL 생성**:
    *   Slack 앱 메뉴에서 "Incoming Webhooks"를 검색하여 활성화합니다.
    *   알림을 받을 채널을 선택하고 Webhook URL을 생성합니다.
2.  **GitHub Secrets 등록**:
    *   레포지토리의 `Settings > Secrets and variables > Actions`로 이동합니다.
    *   다음 이름으로 Secret을 등록합니다.
        *   `SLACK_WEBHOOK_URL`: 위에서 생성한 Slack Webhook URL
        *   `GEMINI_API_KEY`: Gemini API를 사용하기 위한 API 키

### 2단계: GitHub Action 워크플로우 파일 생성

`.github/workflows/` 디렉토리에 `api-diff-report.yml` 파일을 생성합니다.

-   **트리거 조건**: `packages/api-client/openapi-spec.yaml` 파일이 변경된 Pull Request가 생성되거나 업데이트될 때만 실행되도록 설정하여 불필요한 리소스 낭비를 막습니다.

```yaml
# .github/workflows/api-diff-report.yml

name: API Diff Report

on:
  pull_request:
    paths:
      - 'packages/api-client/openapi-spec.yaml'

jobs:
  report:
    runs-on: ubuntu-latest
    # ... (아래 3단계에서 계속)
```

### 3단계: 워크플로우 상세 구현

`api-diff-report.yml` 파일의 `jobs` 섹션을 구체적으로 작성합니다.

```yaml
# .github/workflows/api-diff-report.yml (계속)

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      # 1. Head 브랜치(PR 브랜치)의 코드를 checkout
      - name: Checkout Head Branch
        uses: actions/checkout@v4

      # 2. Base 브랜치(e.g., main)의 코드를 별도 디렉토리에 checkout
      - name: Checkout Base Branch
        uses: actions/checkout@v4
        with:
          ref: ${{ github.base_ref }}
          path: base

      # 3. oasdiff 설치
      - name: Install oasdiff
        run: go install github.com/tufin/oasdiff@latest

      # 4. oasdiff 실행하여 변경점 추출 (Markdown 포맷)
      - name: Run oasdiff
        id: diff
        run: |
          OAS_BASE_PATH="base/packages/api-client/openapi-spec.yaml"
          OAS_HEAD_PATH="packages/api-client/openapi-spec.yaml"
          DIFF_OUTPUT=$(oasdiff -base "$OAS_BASE_PATH" -revision "$OAS_HEAD_PATH" -format markdown)
          echo "diff_markdown<<EOF" >> $GITHUB_OUTPUT
          echo "$DIFF_OUTPUT" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      # 5. AI를 통해 diff 결과 분석 및 요약 (Gemini API 호출)
      - name: Analyze Diff with AI
        id: analysis
        run: |
          # Gemini API 호출 스크립트 실행 (Python 또는 Node.js)
          # 입력: ${{ steps.diff.outputs.diff_markdown }}
          # 출력: PR 코멘트, Slack 메시지
          # 예시 프롬프트:
          # "당신은 API 변경사항 전문 리뷰어입니다. 다음 oasdiff 결과를 바탕으로,
          #  프론트엔드 개발자가 이해하기 쉽게 변경사항을 요약해주세요.
          #  Breaking Changes는 ⚠️, Non-Breaking Changes는 ✨, 신규 Endpoint는 🚀 이모지를 사용해주세요."
          
          # 아래는 임시 결과물입니다. 실제로는 API 호출 코드로 대체해야 합니다.
          PR_COMMENT="### API 변경사항 요약

${{ steps.diff.outputs.diff_markdown }}"
          SLACK_MESSAGE="API 변경사항이 감지되었습니다: ${{ github.event.pull_request.html_url }}"
          
          echo "pr_comment<<EOF" >> $GITHUB_OUTPUT
          echo "$PR_COMMENT" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT
          
          echo "slack_message<<EOF" >> $GITHUB_OUTPUT
          echo "$SLACK_MESSAGE" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

      # 6. GitHub PR에 분석 결과 코멘트 작성
      - name: Create or Update PR Comment
        uses: peter-evans/create-or-update-comment@v4
        with:
          issue-number: ${{ github.event.pull_request.number }}
          body: ${{ steps.analysis.outputs.pr_comment }}

      # 7. Slack 채널로 알림 전송
      - name: Send Slack Notification
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": "${{ steps.analysis.outputs.slack_message }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "📝 *API 변경사항 알림*
<${{ github.event.pull_request.html_url }}|PR #${{ github.event.pull_request.number }}>에서 API 명세 변경이 감지되었습니다."
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

## 4. 기대 효과

- **커뮤니케이션 비용 절감**: API 변경 사항에 대한 수동적인 설명과 질문/답변 시간을 획기적으로 줄입니다.
- **명확한 변경 이력**: 모든 API 변경 내용이 해당 PR에 코멘트로 기록되어 추적이 용이합니다.
- **신속한 변경 전파**: 프론트엔드 개발자는 PR과 Slack을 통해 API 변경을 즉시 인지하고 대응할 수 있습니다.
- **휴먼 에러 방지**: 자동화된 프로세스를 통해 사람이 직접 변경점을 요약할 때 발생할 수 있는 누락이나 실수를 방지합니다.

## 5. 다음 단계

1.  Slack Webhook URL 생성 및 GitHub Secret(`SLACK_WEBHOOK_URL`) 등록
2.  Gemini API 키 발급 및 GitHub Secret(`GEMINI_API_KEY`) 등록
3.  `.github/workflows/api-diff-report.yml` 파일 작성 및 레포지토리 push
4.  AI 분석을 위한 스크립트(Python 또는 Node.js) 작성 (위 3단계의 5번 항목)
5.  테스트 PR을 생성하여 전체 워크플로우가 정상적으로 동작하는지 검증
