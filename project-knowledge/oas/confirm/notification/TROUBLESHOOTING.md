# API 변경 자동화 시스템 문제 해결 가이드

> **상태**: 구현 준비 완료 (2025-01-29)  
> **대상**: CotePT 개발팀  
> **목적**: 자동화 시스템 운영 중 발생할 수 있는 문제 해결 방법 제공

---

## 🚨 긴급 상황 대응

### GitHub Actions 워크플로우 실패

#### 증상
- API 변경 감지가 되지 않음
- 워크플로우가 빨간색으로 표시됨
- Slack 알림이 오지 않음

#### 즉시 대응 (5분 이내)

```bash
# 1. 워크플로우 상태 확인
# GitHub > Actions 탭에서 실패한 워크플로우 클릭

# 2. 에러 로그 확인
# 실패한 단계의 로그를 펼쳐서 에러 메시지 확인

# 3. 긴급 수동 알림 (Slack)
# 팀 채널에 수동으로 API 변경사항 알림
```

#### 원인별 해결 방법

**Infrastructure 시작 실패**
```bash
# 증상: "pnpm infra:up" 단계 실패
# 원인: Docker 서비스 시작 실패

# 해결책 1: 워크플로우 재실행
# GitHub Actions > Re-run failed jobs 클릭

# 해결책 2: 타임아웃 증가
# .github/workflows/api-change-monitor.yml 수정
- name: Start infrastructure
  run: pnpm infra:up
  timeout-minutes: 10  # 기본 5분에서 10분으로 증가
```

**OpenAPI 스펙 생성 실패**
```bash
# 증상: "Generate current OpenAPI spec" 단계 실패
# 원인: NestJS 앱 시작 실패 또는 타임아웃

# 해결책 1: 앱 시작 시간 증가
- name: Generate current OpenAPI spec
  run: |
    cd apps/api
    timeout 90s pnpm nest start --watch &  # 60s -> 90s
    sleep 60  # 45s -> 60s
    pkill -f "nest start"

# 해결책 2: 환경 변수 확인
env:
  NODE_ENV: local
  EXPORT_OPENAPI: true
  # 누락된 환경 변수가 있는지 확인
```

**oasdiff 비교 실패**
```bash
# 증상: "Compare API specs" 단계 실패
# 원인: 이전 스펙 파일 없음 또는 형식 오류

# 해결책 1: 기본 스펙 파일 생성
- name: Create fallback spec
  if: steps.cache-spec.outputs.cache-hit != 'true'
  run: |
    mkdir -p .github/cache
    echo 'openapi: 3.0.0
    info:
      title: CotePT API
      version: 1.0.0
    paths: {}' > .github/cache/previous-openapi-spec.yaml

# 해결책 2: oasdiff 에러 무시
- name: Compare API specs
  id: compare-specs
  uses: oasdiff/oasdiff-action/breaking@main
  continue-on-error: true  # 에러가 발생해도 계속 진행
```

### Gemini AI 분석 실패

#### 증상
- AI 분석 단계에서 워크플로우 중단
- "AI 분석 실패" 로그 메시지
- PR 코멘트에 AI 분석 결과 없음

#### 해결 방법

**API 키 문제**
```bash
# 1. Secrets 확인
# GitHub > Settings > Secrets and variables > Actions
# GEMINI_API_KEY가 올바르게 설정되어 있는지 확인

# 2. API 키 테스트
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}"
```

**Rate Limit 초과**
```bash
# 증상: "429 Too Many Requests" 에러
# 해결책: 재시도 로직 추가

- name: Analyze changes with AI
  id: ai-analysis
  run: |
    # 재시도 로직 추가
    for i in {1..3}; do
      if node .github/scripts/gemini-reviewer.js \
        --changes '${{ steps.compare-specs.outputs.breaking }}' \
        --spec packages/api-client/openapi-spec.yaml; then
        break
      fi
      echo "Attempt $i failed, retrying in 30 seconds..."
      sleep 30
    done
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

**JSON 파싱 오류**
```bash
# 증상: "JSON 파싱 실패" 메시지
# 원인: Gemini AI 응답이 올바른 JSON 형식이 아님

# 해결책: 폴백 처리 추가
# .github/scripts/gemini-reviewer.js 에서
parseAnalysisResult(analysisText) {
  try {
    const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(analysisText);
  } catch (error) {
    console.warn('⚠️ JSON 파싱 실패, 텍스트 형태로 폴백');
    return {
      summary: { totalChanges: 0, error: 'AI 분석 파싱 실패' },
      rawAnalysis: analysisText,
      fallback: true
    };
  }
}
```

### Slack 알림 실패

#### 증상
- 워크플로우는 성공했지만 Slack 알림이 없음
- "Slack notification failed" 에러

#### 해결 방법

**Webhook URL 문제**
```bash
# 1. Webhook URL 테스트
curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"테스트 메시지"}' \
    YOUR_SLACK_WEBHOOK_URL

# 2. GitHub Secrets 확인
# Settings > Secrets and variables > Actions
# SLACK_WEBHOOK_* 시크릿들이 올바른지 확인
```

**페이로드 형식 오류**
```bash
# 증상: Slack에서 "invalid_payload" 응답
# 해결책: 페이로드 구조 검증

# .github/scripts/slack-notifier.js 에서 디버그 로그 추가
console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));

const response = await axios.post(webhookUrl, payload);
console.log('📥 Slack response:', response.status, response.data);
```

---

## 🔧 일반적인 문제 해결

### 성능 문제

#### 워크플로우 실행 시간이 너무 긴 경우

**현재 상황 진단**
```bash
# 각 단계별 실행 시간 확인
# GitHub Actions 로그에서 각 단계의 소요 시간 분석

# 일반적인 시간 분배:
# - Infrastructure setup: 30-60초
# - OpenAPI spec generation: 45-90초  
# - oasdiff comparison: 10-30초
# - Gemini AI analysis: 30-120초
# - Slack notification: 5-15초
```

**최적화 방법**

```yaml
# 1. 병렬 처리 도입
jobs:
  infrastructure:
    runs-on: ubuntu-latest
    steps:
      - name: Start infrastructure
        run: pnpm infra:up

  spec-generation:
    needs: infrastructure
    runs-on: ubuntu-latest
    steps:
      # ...

# 2. 캐시 활용 강화
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.pnpm-store
      node_modules
      apps/api/node_modules
    key: deps-${{ hashFiles('**/pnpm-lock.yaml') }}

# 3. 조건부 실행 강화
- name: Skip if no breaking changes
  if: steps.compare-specs.outputs.breaking == ''
  run: echo "No breaking changes, skipping AI analysis"
```

#### Gemini API 응답 시간이 긴 경우

```javascript
// .github/scripts/gemini-reviewer.js 최적화
class GeminiApiReviewer {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-pro',  // 더 빠른 모델 사용
      generationConfig: {
        temperature: 0.1,    // 더 결정적인 응답
        maxOutputTokens: 4096,  // 토큰 수 제한
      }
    });
  }

  async analyzeApiChanges(changes, currentSpec, projectContext) {
    // 입력 크기 제한
    const optimizedChanges = this.optimizeInput(changes);
    const optimizedSpec = this.summarizeSpec(currentSpec);
    
    // 타임아웃 설정
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Gemini API timeout')), 60000)
    );
    
    const analysisPromise = this.model.generateContent(
      this.buildAnalysisPrompt(optimizedChanges, optimizedSpec, projectContext)
    );
    
    return Promise.race([analysisPromise, timeoutPromise]);
  }
}
```

### 데이터 정확성 문제

#### oasdiff가 변경사항을 놓치는 경우

```bash
# 증상: 명백한 Breaking Change가 있는데 감지되지 않음

# 디버깅 방법 1: 수동 비교
cd packages/api-client
docker run --rm -v "$PWD:/data" tufin/oasdiff diff \
  /data/previous-spec.yaml \
  /data/current-spec.yaml \
  --format json

# 디버깅 방법 2: 스펙 파일 검증
npx swagger-parser validate openapi-spec.yaml

# 해결책: 추가 체크 포함
# .github/workflows/api-change-monitor.yml
- name: Enhanced diff check
  run: |
    # 기본 oasdiff 체크
    oasdiff diff base.yaml revision.yaml --format json > basic-changes.json
    
    # 추가 체크: 엔드포인트 수 변경
    BASE_ENDPOINTS=$(yq '.paths | keys | length' base.yaml)
    REV_ENDPOINTS=$(yq '.paths | keys | length' revision.yaml)
    
    if [ "$BASE_ENDPOINTS" != "$REV_ENDPOINTS" ]; then
      echo "Endpoint count changed: $BASE_ENDPOINTS -> $REV_ENDPOINTS"
      echo "endpoint-count-changed" >> changes.txt
    fi
```

#### Gemini AI 분석 결과가 부정확한 경우

**품질 검증 로직 추가**
```javascript
// .github/scripts/analysis-validator.js
class AnalysisValidator {
  static validateAnalysis(analysis, originalChanges) {
    const issues = [];
    
    // 1. 변경사항 수 일치 확인
    if (analysis.changes?.length !== originalChanges.length) {
      issues.push(`Changes count mismatch: expected ${originalChanges.length}, got ${analysis.changes?.length}`);
    }
    
    // 2. Critical 분류 검증
    const criticalChanges = analysis.changes?.filter(c => c.severity === 'critical') || [];
    const breakingChanges = originalChanges.filter(c => c.type === 'breaking');
    
    if (criticalChanges.length === 0 && breakingChanges.length > 0) {
      issues.push('Breaking changes not marked as critical');
    }
    
    // 3. 코드 예시 품질 확인
    analysis.changes?.forEach((change, index) => {
      const codeExample = change.migration?.codeExamples;
      if (codeExample && codeExample.before === codeExample.after) {
        issues.push(`Change ${index}: Before and after code examples are identical`);
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues,
      confidence: this.calculateConfidence(analysis, issues)
    };
  }
  
  static calculateConfidence(analysis, issues) {
    let confidence = 1.0;
    
    // 이슈별 신뢰도 감소
    issues.forEach(issue => {
      if (issue.includes('mismatch')) confidence -= 0.3;
      if (issue.includes('critical')) confidence -= 0.2;
      if (issue.includes('identical')) confidence -= 0.1;
    });
    
    return Math.max(0, confidence);
  }
}
```

### 알림 시스템 문제

#### 중복 알림 발생

```bash
# 증상: 같은 변경사항에 대해 여러 번 알림
# 원인: 워크플로우가 여러 번 실행되거나 캐시 문제

# 해결책 1: 중복 방지 로직
# .github/scripts/notification-deduplicator.js
class NotificationDeduplicator {
  static async shouldSendNotification(changes, prNumber) {
    const cacheKey = `notification-${prNumber}-${this.hashChanges(changes)}`;
    const lastSent = await this.getLastSentTime(cacheKey);
    const now = Date.now();
    
    // 1시간 이내 같은 내용 알림 방지
    if (lastSent && (now - lastSent) < 60 * 60 * 1000) {
      console.log('⏭️ Duplicate notification prevented');
      return false;
    }
    
    await this.setLastSentTime(cacheKey, now);
    return true;
  }
  
  static hashChanges(changes) {
    return require('crypto')
      .createHash('md5')
      .update(JSON.stringify(changes))
      .digest('hex')
      .substring(0, 8);
  }
}
```

#### 알림이 오지 않는 경우

```bash
# 진단 체크리스트
# 1. Webhook URL 확인
curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"test"}'

# 2. GitHub Secrets 확인
# GitHub > Settings > Secrets and variables > Actions

# 3. 워크플로우 조건 확인
# .github/workflows/api-change-monitor.yml
on:
  push:
    branches: [ main, develop ]  # 현재 브랜치가 포함되어 있는지 확인
    paths:
      - 'apps/api/src/**/*.ts'   # 변경된 파일 경로가 포함되는지 확인

# 4. 단계별 조건 확인
- name: Send Slack notification
  if: steps.compare-specs.outputs.breaking != ''  # 이 조건이 만족되는지 확인
```

---

## 🔍 디버깅 도구

### 로컬 테스트 환경

```bash
#!/bin/bash
# scripts/debug-pipeline.sh

echo "🔍 API 변경 감지 파이프라인 디버깅"

# 1. 환경 변수 확인
echo "📋 Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "EXPORT_OPENAPI: $EXPORT_OPENAPI"
echo "GEMINI_API_KEY: ${GEMINI_API_KEY:+set}"
echo "SLACK_WEBHOOK_*: ${SLACK_WEBHOOK_GENERAL:+set}"

# 2. 인프라 상태 확인
echo "🐳 Infrastructure status:"
docker-compose ps

# 3. OpenAPI 스펙 생성 테스트
echo "📄 Testing OpenAPI spec generation:"
cd apps/api
timeout 60s pnpm nest start --watch &
PID=$!
sleep 45
kill $PID

if [ -f "../../packages/api-client/openapi-spec.yaml" ]; then
  echo "✅ OpenAPI spec generated successfully"
  echo "📊 Spec size: $(wc -l < ../../packages/api-client/openapi-spec.yaml) lines"
else
  echo "❌ OpenAPI spec generation failed"
fi

# 4. oasdiff 테스트
echo "🔄 Testing oasdiff comparison:"
cd ../../
if [ -f ".github/cache/previous-openapi-spec.yaml" ]; then
  docker run --rm -v "$PWD:/data" tufin/oasdiff diff \
    /data/.github/cache/previous-openapi-spec.yaml \
    /data/packages/api-client/openapi-spec.yaml \
    --format json > debug-changes.json
  
  echo "📊 Changes detected: $(jq length debug-changes.json) items"
else
  echo "⚠️ No previous spec found for comparison"
fi

# 5. Gemini AI 연결 테스트
echo "🤖 Testing Gemini AI connection:"
node -e "
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
model.generateContent('Hello').then(r => console.log('✅ Gemini AI connected')).catch(e => console.log('❌ Gemini AI failed:', e.message));
"

# 6. Slack 연결 테스트
echo "📱 Testing Slack webhook:"
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🧪 Debug test from local environment"}' \
  "$SLACK_WEBHOOK_GENERAL" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Slack webhook working"
else
  echo "❌ Slack webhook failed"
fi

echo "🏁 Debug pipeline completed"
```

### 로그 분석 도구

```bash
#!/bin/bash
# scripts/analyze-logs.sh

echo "📊 GitHub Actions 로그 분석"

# 최근 워크플로우 실행 조회 (GitHub CLI 필요)
gh run list --workflow=api-change-monitor.yml --limit=10 --json conclusion,startedAt,url

# 실패한 워크플로우의 로그 다운로드
FAILED_RUN_ID=$(gh run list --workflow=api-change-monitor.yml --status=failure --limit=1 --json databaseId --jq '.[0].databaseId')

if [ -n "$FAILED_RUN_ID" ]; then
  echo "📥 Downloading logs for failed run: $FAILED_RUN_ID"
  gh run download $FAILED_RUN_ID
  
  # 에러 패턴 분석
  echo "🔍 Common error patterns:"
  find . -name "*.txt" -exec grep -l "Error\|Failed\|Exception" {} \; | head -5 | while read file; do
    echo "📄 $file:"
    grep -n "Error\|Failed\|Exception" "$file" | head -3
    echo "---"
  done
fi
```

### 성능 모니터링

```javascript
// .github/scripts/performance-monitor.js
class PerformanceMonitor {
  static measureWorkflowPerformance() {
    const steps = [
      'infrastructure-setup',
      'spec-generation', 
      'diff-comparison',
      'ai-analysis',
      'notification-sending'
    ];

    const results = {};
    
    steps.forEach(step => {
      const startTime = process.env[`${step.toUpperCase()}_START_TIME`];
      const endTime = process.env[`${step.toUpperCase()}_END_TIME`];
      
      if (startTime && endTime) {
        results[step] = {
          duration: endTime - startTime,
          status: 'completed'
        };
      }
    });

    // 성능 임계값 확인
    const thresholds = {
      'infrastructure-setup': 120, // 2분
      'spec-generation': 180,      // 3분
      'diff-comparison': 60,       // 1분
      'ai-analysis': 300,          // 5분
      'notification-sending': 30   // 30초
    };

    const alerts = [];
    Object.entries(results).forEach(([step, data]) => {
      if (data.duration > thresholds[step] * 1000) {
        alerts.push(`⚠️ ${step} took ${data.duration/1000}s (threshold: ${thresholds[step]}s)`);
      }
    });

    return { results, alerts };
  }
}
```

---

## 📞 에스컬레이션 프로세스

### Level 1: 자동 복구 시도

```yaml
# 워크플로우 자체에서 자동 재시도
- name: API Change Monitor with Retry
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: |
      # 전체 파이프라인 실행
      bash .github/scripts/run-pipeline.sh
```

### Level 2: 팀 내 해결

**증상별 담당자**
- **인프라 문제**: 풀스택 개발자
- **AI 분석 문제**: 풀스택 개발자
- **Slack 알림 문제**: 프론트엔드 개발자 (Slack 관리자)
- **프로세스 문제**: 전체 팀 논의

**대응 시간**
- **Critical 시스템 장애**: 1시간 이내
- **일반적인 오류**: 당일 대응
- **성능 저하**: 3일 이내 개선

### Level 3: 외부 지원

**외부 서비스 장애**
- **GitHub Actions**: GitHub Status 페이지 확인
- **Gemini AI**: Google Cloud Status 확인
- **Slack**: Slack Status 페이지 확인

**지원 요청 채널**
- **기술적 문제**: GitHub Community, Stack Overflow
- **서비스 장애**: 각 서비스 공식 지원 채널
- **긴급 상황**: 임시 수동 프로세스로 전환

---

## 🛡️ 예방 조치

### 정기 점검 (매주 금요일)

```bash
#!/bin/bash
# scripts/weekly-health-check.sh

echo "🔍 주간 시스템 헬스체크"

# 1. GitHub Actions 실행 성공률 확인
SUCCESS_RATE=$(gh run list --workflow=api-change-monitor.yml --limit=20 --json conclusion | jq '[.[] | select(.conclusion == "success")] | length / 20 * 100')
echo "📊 Success rate (last 20 runs): ${SUCCESS_RATE}%"

# 2. 평균 실행 시간 확인
AVERAGE_TIME=$(gh run list --workflow=api-change-monitor.yml --limit=10 --json createdAt,updatedAt | jq '[.[] | ((.updatedAt | fromdateiso8601) - (.createdAt | fromdateiso8601))] | add / length')
echo "⏱️ Average execution time: ${AVERAGE_TIME}s"

# 3. Secrets 만료 확인 (수동)
echo "🔑 Please check the following secrets expiration:"
echo "- GEMINI_API_KEY"
echo "- SLACK_WEBHOOK_URLs"

# 4. 디스크 사용량 확인
echo "💾 Cache usage:"
du -sh .github/cache/ 2>/dev/null || echo "No cache directory"

# 5. 의존성 업데이트 확인
echo "📦 Outdated dependencies:"
cd .github/scripts && npm outdated
```

### 모니터링 대시보드

```javascript
// scripts/generate-dashboard.js
const fs = require('fs');

class DashboardGenerator {
  static async generateHealthReport() {
    const report = {
      timestamp: new Date().toISOString(),
      system: {
        githubActions: await this.checkGitHubActionsHealth(),
        geminiAI: await this.checkGeminiAIHealth(),
        slack: await this.checkSlackHealth()
      },
      metrics: {
        successRate: await this.calculateSuccessRate(),
        averageResponseTime: await this.calculateAverageResponseTime(),
        errorRate: await this.calculateErrorRate()
      }
    };

    // README에 상태 배지 업데이트
    const badge = this.generateStatusBadge(report);
    fs.writeFileSync('.github/STATUS.md', this.formatReport(report));
    
    return report;
  }

  static generateStatusBadge(report) {
    const successRate = report.metrics.successRate;
    const color = successRate > 95 ? 'green' : 
                  successRate > 85 ? 'yellow' : 'red';
    
    return `![API Monitor Status](https://img.shields.io/badge/API_Monitor-${successRate}%25-${color})`;
  }
}
```

---

## 📚 참고 자료

### GitHub Actions 디버깅
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [워크플로우 구문](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [디버깅 가이드](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)

### oasdiff 사용법
- [oasdiff GitHub](https://github.com/Tufin/oasdiff)
- [oasdiff-action](https://github.com/oasdiff/oasdiff-action)
- [Breaking Changes 가이드](https://www.oasdiff.com/breaking-changes)

### Gemini AI 문제 해결
- [Gemini API 문서](https://ai.google.dev/docs/gemini_api)
- [Rate Limits](https://ai.google.dev/docs/gemini_api_overview#rate_limits)
- [Error Codes](https://ai.google.dev/docs/gemini_api_overview#error_codes)

### Slack 웹훅
- [Slack Webhook 가이드](https://api.slack.com/messaging/webhooks)
- [메시지 형식](https://api.slack.com/reference/messaging/payload)
- [문제 해결](https://api.slack.com/messaging/webhooks#troubleshooting)

---

## 🔗 관련 문서

- [API 변경 자동화 시스템](./API_CHANGE_AUTOMATION.md)
- [GitHub Actions 설정](./GITHUB_ACTIONS_SETUP.md)
- [Gemini AI 설정](./GEMINI_AI_SETUP.md)
- [Slack 알림 시스템](./SLACK_NOTIFICATIONS.md)
- [팀 워크플로우](./TEAM_WORKFLOW.md)

---

## 📝 업데이트 이력

- **2025-01-29**: 문제 해결 가이드 초기 작성
- **향후 계획**: 실제 운영 중 발생하는 문제 사례 추가

---

> 🆘 **긴급 상황 시**: 자동화 시스템이 완전히 중단된 경우, [팀 워크플로우 가이드](./TEAM_WORKFLOW.md)의 수동 프로세스로 전환하여 API 변경사항을 놓치지 않도록 하세요.