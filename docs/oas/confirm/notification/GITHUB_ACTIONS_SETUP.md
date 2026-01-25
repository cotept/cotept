# GitHub Actions 워크플로우 설정 가이드

> **상태**: 구현 준비 완료 (2025-01-29)  
> **난이도**: 중급  
> **예상 소요 시간**: 2-3시간  
> **담당자**: 풀스택 개발자

---

## 🎯 개요

CotePT 프로젝트의 API 변경 자동 감지 및 알림 시스템을 위한 GitHub Actions 워크플로우를 설정합니다.

### 주요 기능
- API 코드 변경 자동 감지
- OpenAPI 스펙 생성 및 비교
- 변경사항 분석 및 알림 발송
- 캐시 기반 효율적인 실행

---

## 📁 파일 구조

```
.github/
├── workflows/
│   ├── api-change-monitor.yml      # 메인 워크플로우
│   └── api-spec-cache.yml          # 스펙 캐시 관리
├── scripts/
│   ├── api-change-analyzer.js      # 변경사항 분석
│   ├── gemini-reviewer.js          # AI 분석
│   └── slack-notifier.js           # 알림 발송
└── templates/
    ├── pr-comment.md               # PR 코멘트 템플릿
    └── slack-notification.json     # Slack 알림 템플릿
```

---

## 🔧 메인 워크플로우 (api-change-monitor.yml)

### 기본 구조

```yaml
name: API Change Monitor

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'apps/api/src/**/*.ts'
      - 'apps/api/src/**/*.dto.ts'
      - 'apps/api/src/modules/**/*.ts'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'apps/api/src/**/*.ts'
      - 'apps/api/src/**/*.dto.ts'
      - 'apps/api/src/modules/**/*.ts'

env:
  NODE_ENV: local
  EXPORT_OPENAPI: true

jobs:
  detect-api-changes:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8.15.6
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Start infrastructure
        run: pnpm infra:up
        
      - name: Wait for services
        run: sleep 30
      
      - name: Generate current OpenAPI spec
        run: |
          cd apps/api
          timeout 60s pnpm nest start --watch &
          sleep 45
          pkill -f "nest start"
          
      - name: Cache previous spec
        id: cache-spec
        uses: actions/cache@v4
        with:
          path: .github/cache/previous-openapi-spec.yaml
          key: openapi-spec-${{ github.event.before }}
          restore-keys: |
            openapi-spec-
      
      - name: Compare API specs
        id: compare-specs
        uses: oasdiff/oasdiff-action/breaking@main
        with:
          base: .github/cache/previous-openapi-spec.yaml
          revision: packages/api-client/openapi-spec.yaml
          format: json
        continue-on-error: true
      
      - name: Analyze changes with AI
        id: ai-analysis
        if: steps.compare-specs.outputs.breaking != ''
        run: |
          node .github/scripts/gemini-reviewer.js \
            --changes '${{ steps.compare-specs.outputs.breaking }}' \
            --spec packages/api-client/openapi-spec.yaml
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      
      - name: Comment on PR
        if: github.event_name == 'pull_request' && steps.compare-specs.outputs.breaking != ''
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const analysisResult = fs.readFileSync('.github/temp/ai-analysis.md', 'utf8');
            
            await github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: analysisResult
            });
      
      - name: Send Slack notification
        if: steps.compare-specs.outputs.breaking != ''
        uses: slackapi/slack-github-action@v1
        with:
          webhook-type: webhook-trigger
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload-file: .github/temp/slack-payload.json
      
      - name: Create GitHub Issue
        if: steps.compare-specs.outputs.breaking != '' && contains(steps.compare-specs.outputs.breaking, 'critical')
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const template = fs.readFileSync('.github/templates/issue-template.md', 'utf8');
            const changes = '${{ steps.compare-specs.outputs.breaking }}';
            
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `🚨 Critical API Changes Detected - ${new Date().toISOString().split('T')[0]}`,
              body: template.replace('{{CHANGES}}', changes),
              labels: ['api-breaking-change', 'critical', 'frontend-impact']
            });
      
      - name: Update spec cache
        if: github.ref == 'refs/heads/main'
        run: |
          mkdir -p .github/cache
          cp packages/api-client/openapi-spec.yaml .github/cache/previous-openapi-spec.yaml
      
      - name: Cleanup
        if: always()
        run: |
          pnpm infra:down
          rm -rf .github/temp/
```

---

## 📜 분석 스크립트 (api-change-analyzer.js)

```javascript
// .github/scripts/api-change-analyzer.js
const fs = require('fs');
const path = require('path');

class ApiChangeAnalyzer {
  constructor(changes, specPath) {
    this.changes = typeof changes === 'string' ? JSON.parse(changes) : changes;
    this.specPath = specPath;
    this.analysis = {
      summary: {},
      breaking: [],
      nonBreaking: [],
      additions: [],
      impact: {
        critical: [],
        high: [],
        medium: [],
        low: []
      }
    };
  }

  async analyze() {
    console.log('🔍 Analyzing API changes...');
    
    // 변경사항 분류
    this.categorizeChanges();
    
    // 영향도 평가
    this.assessImpact();
    
    // 요약 생성
    this.generateSummary();
    
    return this.analysis;
  }

  categorizeChanges() {
    if (!this.changes || !Array.isArray(this.changes)) {
      console.log('No changes detected');
      return;
    }

    this.changes.forEach(change => {
      switch (change.type) {
        case 'breaking':
          this.analysis.breaking.push(change);
          break;
        case 'non-breaking':
          this.analysis.nonBreaking.push(change);
          break;
        case 'addition':
          this.analysis.additions.push(change);
          break;
      }
    });
  }

  assessImpact() {
    // Breaking changes 영향도 평가
    this.analysis.breaking.forEach(change => {
      if (this.isCriticalChange(change)) {
        this.analysis.impact.critical.push(change);
      } else if (this.isHighImpactChange(change)) {
        this.analysis.impact.high.push(change);
      } else {
        this.analysis.impact.medium.push(change);
      }
    });

    // Non-breaking changes 영향도 평가
    this.analysis.nonBreaking.forEach(change => {
      if (this.isLowImpactChange(change)) {
        this.analysis.impact.low.push(change);
      } else {
        this.analysis.impact.medium.push(change);
      }
    });
  }

  isCriticalChange(change) {
    const criticalPatterns = [
      'required parameter removed',
      'endpoint removed',
      'response schema changed',
      'authentication changed'
    ];
    
    return criticalPatterns.some(pattern => 
      change.description?.toLowerCase().includes(pattern)
    );
  }

  isHighImpactChange(change) {
    const highImpactPatterns = [
      'parameter type changed',
      'response format changed',
      'validation rules changed'
    ];
    
    return highImpactPatterns.some(pattern => 
      change.description?.toLowerCase().includes(pattern)
    );
  }

  isLowImpactChange(change) {
    const lowImpactPatterns = [
      'description updated',
      'example added',
      'optional parameter added'
    ];
    
    return lowImpactPatterns.some(pattern => 
      change.description?.toLowerCase().includes(pattern)
    );
  }

  generateSummary() {
    this.analysis.summary = {
      totalChanges: this.changes.length,
      breaking: this.analysis.breaking.length,
      nonBreaking: this.analysis.nonBreaking.length,
      additions: this.analysis.additions.length,
      criticalImpact: this.analysis.impact.critical.length,
      highImpact: this.analysis.impact.high.length,
      mediumImpact: this.analysis.impact.medium.length,
      lowImpact: this.analysis.impact.low.length
    };
  }

  async generateReport() {
    const template = `
# 🔍 API 변경사항 분석 리포트

## 📊 요약
- **전체 변경사항**: ${this.analysis.summary.totalChanges}개
- **Breaking Changes**: ${this.analysis.summary.breaking}개
- **Non-Breaking Changes**: ${this.analysis.summary.nonBreaking}개
- **신규 추가**: ${this.analysis.summary.additions}개

## 🚨 영향도별 분류
- **Critical**: ${this.analysis.summary.criticalImpact}개
- **High**: ${this.analysis.summary.highImpact}개
- **Medium**: ${this.analysis.summary.mediumImpact}개
- **Low**: ${this.analysis.summary.lowImpact}개

${this.analysis.impact.critical.length > 0 ? this.generateCriticalSection() : ''}
${this.analysis.impact.high.length > 0 ? this.generateHighImpactSection() : ''}
${this.analysis.impact.medium.length > 0 ? this.generateMediumImpactSection() : ''}

## 📋 다음 단계
${this.generateActionItems()}

---
*이 리포트는 자동으로 생성되었습니다. 추가 문의사항은 백엔드 개발자에게 문의해주세요.*
`;

    return template;
  }

  generateCriticalSection() {
    if (this.analysis.impact.critical.length === 0) return '';
    
    return `
## 🚨 Critical Changes (즉시 대응 필요)

${this.analysis.impact.critical.map(change => `
### ${change.path} ${change.method?.toUpperCase()}
- **유형**: ${change.type}
- **설명**: ${change.description}
- **영향**: 프론트엔드 코드 수정 필수
- **대응**: 즉시 수정 필요

`).join('')}
`;
  }

  generateHighImpactSection() {
    if (this.analysis.impact.high.length === 0) return '';
    
    return `
## ⚠️ High Impact Changes (우선 대응)

${this.analysis.impact.high.map(change => `
### ${change.path} ${change.method?.toUpperCase()}
- **유형**: ${change.type}
- **설명**: ${change.description}
- **예상 작업 시간**: 1-2시간

`).join('')}
`;
  }

  generateMediumImpactSection() {
    if (this.analysis.impact.medium.length === 0) return '';
    
    return `
## 📝 Medium Impact Changes (일반 대응)

${this.analysis.impact.medium.map(change => `
- ${change.path} ${change.method?.toUpperCase()}: ${change.description}
`).join('')}
`;
  }

  generateActionItems() {
    const items = [];
    
    if (this.analysis.impact.critical.length > 0) {
      items.push('🚨 Critical Changes 즉시 확인 및 수정');
    }
    
    if (this.analysis.impact.high.length > 0) {
      items.push('⚠️ High Impact Changes 이번 스프린트 내 처리');
    }
    
    if (this.analysis.impact.medium.length > 0) {
      items.push('📝 Medium Impact Changes 다음 스프린트 계획');
    }
    
    if (items.length === 0) {
      items.push('✅ 영향도가 낮은 변경사항들로 즉시 대응 불필요');
    }
    
    return items.map(item => `- ${item}`).join('\n');
  }
}

// 스크립트 실행 부분
async function main() {
  const args = process.argv.slice(2);
  const changesIndex = args.findIndex(arg => arg === '--changes');
  const specIndex = args.findIndex(arg => arg === '--spec');
  
  if (changesIndex === -1 || specIndex === -1) {
    console.error('Usage: node api-change-analyzer.js --changes "JSON_CHANGES" --spec "SPEC_PATH"');
    process.exit(1);
  }
  
  const changes = args[changesIndex + 1];
  const specPath = args[specIndex + 1];
  
  try {
    const analyzer = new ApiChangeAnalyzer(changes, specPath);
    const analysis = await analyzer.analyze();
    const report = await analyzer.generateReport();
    
    // 결과를 임시 파일에 저장
    const tempDir = '.github/temp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(tempDir, 'analysis.json'), JSON.stringify(analysis, null, 2));
    fs.writeFileSync(path.join(tempDir, 'report.md'), report);
    
    console.log('✅ Analysis completed');
    console.log(`📊 Total changes: ${analysis.summary.totalChanges}`);
    console.log(`🚨 Critical: ${analysis.summary.criticalImpact}`);
    console.log(`⚠️ High: ${analysis.summary.highImpact}`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ApiChangeAnalyzer;
```

---

## 🔒 필수 Secrets 설정

GitHub 저장소 Settings > Secrets and variables > Actions에서 다음 시크릿을 설정:

```bash
# Gemini AI API 키
GEMINI_API_KEY=your_gemini_api_key_here

# Slack Webhook URL
SLACK_WEBHOOK_URL=https://hooks.slack.com/your/webhook/url

# Slack Bot Token (선택사항)
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
```

---

## 📋 체크리스트

### 초기 설정
- [ ] `.github/workflows/` 디렉토리 생성
- [ ] `api-change-monitor.yml` 파일 생성 및 설정
- [ ] `.github/scripts/` 디렉토리 생성
- [ ] `api-change-analyzer.js` 스크립트 작성
- [ ] GitHub Secrets 설정 완료

### 테스트 및 검증
- [ ] 더미 API 변경으로 워크플로우 테스트
- [ ] Breaking Changes 감지 테스트
- [ ] PR 코멘트 생성 테스트
- [ ] Slack 알림 발송 테스트

### 최적화
- [ ] 캐시 설정으로 실행 시간 단축
- [ ] 에러 핸들링 강화
- [ ] 로그 개선 및 디버깅 정보 추가

---

## 🚨 주의사항

### 실행 시간 관리
- NestJS 앱 시작 시간: 약 45초
- 인프라 준비 시간: 약 30초
- 전체 워크플로우: 약 3-5분

### 리소스 사용량
- GitHub Actions 분당 사용량 고려
- 불필요한 트리거 방지를 위한 경로 필터링 필수
- 캐시 활용으로 중복 작업 방지

### 에러 처리
- 인프라 시작 실패 시 재시도 로직
- API 스펙 생성 실패 시 알림
- 외부 API (Gemini, Slack) 호출 실패 대응

---

## 🔗 관련 문서

- [oasdiff 통합 가이드](./OASDIFF_INTEGRATION.md)
- [Gemini AI 설정](./GEMINI_AI_SETUP.md)
- [Slack 알림 설정](./SLACK_NOTIFICATIONS.md)
- [문제 해결 가이드](./TROUBLESHOOTING.md)

---

## 📝 업데이트 이력

- **2025-01-29**: 초기 가이드 작성 및 워크플로우 설계 완료
- **향후 계획**: 실제 구현 후 성능 최적화 및 세부 조정

---

> 💡 **팁**: 처음 설정할 때는 `continue-on-error: true` 옵션을 활용하여 부분적 실패에도 워크플로우가 계속 진행되도록 하고, 안정화 후 제거하는 것을 권장합니다.