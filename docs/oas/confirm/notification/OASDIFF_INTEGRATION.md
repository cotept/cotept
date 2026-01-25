# oasdiff 통합 가이드

> **상태**: 구현 준비 완료 (2025-01-29)  
> **난이도**: 초급-중급  
> **예상 소요 시간**: 1-2시간  
> **담당자**: 풀스택 개발자

---

## 🎯 개요

oasdiff는 OpenAPI 사양을 비교하고 Breaking Changes를 감지하는 도구입니다. CotePT 프로젝트에서 API 변경사항을 자동으로 감지하고 분석하기 위해 사용됩니다.

### 주요 기능
- OpenAPI 스펙 간 상세 비교
- Breaking Changes 자동 감지
- 변경 유형별 분류 (Critical, High, Medium, Low)
- 다양한 출력 형식 지원 (JSON, YAML, HTML, Markdown)

---

## 🔧 oasdiff 도구 개요

### 지원하는 변경 유형

#### Breaking Changes (중요도: Critical/High)
- **Required Parameter 제거**: 필수 파라미터 삭제
- **Endpoint 제거**: API 엔드포인트 완전 삭제
- **Response Schema 변경**: 응답 데이터 구조 변경
- **Request Schema 변경**: 요청 데이터 구조 변경
- **HTTP Method 변경**: 동일 경로의 HTTP 메서드 변경

#### Non-Breaking Changes (중요도: Medium/Low)
- **Optional Parameter 추가**: 선택적 파라미터 추가
- **Response Field 추가**: 응답에 새 필드 추가
- **Description 변경**: 설명 문구 업데이트
- **Example 추가**: 예시 데이터 추가

---

## 🚀 GitHub Actions 통합

### 1. oasdiff-action 기본 사용법

```yaml
# .github/workflows/api-change-monitor.yml
- name: Compare OpenAPI specs
  id: compare-specs
  uses: oasdiff/oasdiff-action/breaking@main
  with:
    base: .github/cache/previous-openapi-spec.yaml
    revision: packages/api-client/openapi-spec.yaml
    format: json
    output-file: .github/temp/api-changes.json
  continue-on-error: true
```

### 2. 고급 설정 옵션

```yaml
- name: Detailed API Comparison
  uses: oasdiff/oasdiff-action/diff@main
  with:
    base: .github/cache/previous-openapi-spec.yaml
    revision: packages/api-client/openapi-spec.yaml
    format: json
    include-checks: |
      request-parameter-became-required
      response-property-became-required
      endpoint-deleted
      api-security-deleted
    exclude-checks: |
      api-deprecated-sunset-parse
      request-property-became-optional
    output-to-file: .github/temp/detailed-changes.json
```

### 3. 여러 형식으로 결과 생성

```yaml
- name: Generate multiple formats
  run: |
    # JSON 형식 (프로그래밍 처리용)
    docker run --rm -v "$PWD:/data" tufin/oasdiff diff \
      /data/.github/cache/previous-openapi-spec.yaml \
      /data/packages/api-client/openapi-spec.yaml \
      --format json > .github/temp/changes.json
    
    # HTML 형식 (시각적 확인용)
    docker run --rm -v "$PWD:/data" tufin/oasdiff diff \
      /data/.github/cache/previous-openapi-spec.yaml \
      /data/packages/api-client/openapi-spec.yaml \
      --format html > .github/temp/changes.html
    
    # Markdown 형식 (PR 코멘트용)
    docker run --rm -v "$PWD:/data" tufin/oasdiff diff \
      /data/.github/cache/previous-openapi-spec.yaml \
      /data/packages/api-client/openapi-spec.yaml \
      --format markdown > .github/temp/changes.md
```

---

## 📊 변경사항 분석 스크립트

### oasdiff 결과 파서

```javascript
// .github/scripts/oasdiff-parser.js
class OasDiffParser {
  constructor(diffResult) {
    this.diffResult = typeof diffResult === 'string' 
      ? JSON.parse(diffResult) : diffResult;
    this.analysis = {
      breaking: [],
      nonBreaking: [],
      additions: [],
      summary: {}
    };
  }

  parse() {
    console.log('🔍 Parsing oasdiff results...');
    
    if (!this.diffResult) {
      console.log('No diff results to parse');
      return this.analysis;
    }

    // Breaking changes 분석
    this.parseBreakingChanges();
    
    // Non-breaking changes 분석
    this.parseNonBreakingChanges();
    
    // 새로운 추가사항 분석
    this.parseAdditions();
    
    // 요약 생성
    this.generateSummary();
    
    return this.analysis;
  }

  parseBreakingChanges() {
    const breakingChanges = this.diffResult.breaking || [];
    
    breakingChanges.forEach(change => {
      const severity = this.assessSeverity(change);
      const frontendImpact = this.assessFrontendImpact(change);
      
      this.analysis.breaking.push({
        ...change,
        severity,
        frontendImpact,
        estimatedEffort: this.estimateEffort(change),
        migrationHint: this.generateMigrationHint(change)
      });
    });
  }

  parseNonBreakingChanges() {
    const nonBreakingChanges = this.diffResult['non-breaking'] || [];
    
    nonBreakingChanges.forEach(change => {
      this.analysis.nonBreaking.push({
        ...change,
        severity: 'low',
        frontendImpact: this.assessFrontendImpact(change)
      });
    });
  }

  parseAdditions() {
    const additions = this.diffResult.additions || [];
    
    additions.forEach(addition => {
      this.analysis.additions.push({
        ...addition,
        opportunity: this.identifyOpportunity(addition)
      });
    });
  }

  assessSeverity(change) {
    const criticalPatterns = [
      'required-request-property-removed',
      'endpoint-deleted',
      'api-security-deleted',
      'response-required-property-removed'
    ];

    const highPatterns = [
      'request-parameter-became-required',
      'response-property-became-required',
      'request-property-type-changed',
      'response-property-type-changed'
    ];

    if (criticalPatterns.includes(change.id)) {
      return 'critical';
    } else if (highPatterns.includes(change.id)) {
      return 'high';
    } else {
      return 'medium';
    }
  }

  assessFrontendImpact(change) {
    const impact = {
      level: 'low',
      areas: [],
      estimatedHours: 0
    };

    // 엔드포인트별 영향도 평가
    if (change.path && change.operation) {
      // User API 영향도
      if (change.path.includes('/users')) {
        impact.areas.push('사용자 관리');
        impact.estimatedHours += this.getBaseEffort(change.severity);
      }
      
      // Auth API 영향도
      if (change.path.includes('/auth')) {
        impact.areas.push('인증 시스템');
        impact.estimatedHours += this.getBaseEffort(change.severity) * 1.5;
      }
      
      // Mail API 영향도
      if (change.path.includes('/mail')) {
        impact.areas.push('메일 시스템');
        impact.estimatedHours += this.getBaseEffort(change.severity);
      }
    }

    // 영향도 레벨 결정
    if (impact.estimatedHours > 4) {
      impact.level = 'high';
    } else if (impact.estimatedHours > 1) {
      impact.level = 'medium';
    }

    return impact;
  }

  getBaseEffort(severity) {
    const effortMap = {
      'critical': 4,
      'high': 2,
      'medium': 1,
      'low': 0.5
    };
    return effortMap[severity] || 1;
  }

  estimateEffort(change) {
    const baseEffort = this.getBaseEffort(change.severity);
    const frontendImpact = this.assessFrontendImpact(change);
    
    return {
      hours: frontendImpact.estimatedHours,
      complexity: change.severity,
      priority: this.determinePriority(change)
    };
  }

  determinePriority(change) {
    if (change.severity === 'critical') return 'P0';
    if (change.severity === 'high') return 'P1';
    if (change.severity === 'medium') return 'P2';
    return 'P3';
  }

  generateMigrationHint(change) {
    const hints = {
      'required-request-property-removed': 
        '제거된 필수 속성을 API 호출에서 제거하세요.',
      'endpoint-deleted': 
        '삭제된 엔드포인트를 사용하는 모든 코드를 새로운 엔드포인트로 교체하세요.',
      'request-parameter-became-required': 
        '이제 필수가 된 파라미터를 모든 API 호출에 추가하세요.',
      'response-property-type-changed': 
        '변경된 응답 타입에 맞게 프론트엔드 타입 정의를 업데이트하세요.'
    };

    return hints[change.id] || '상세한 변경사항을 확인하고 적절히 대응하세요.';
  }

  identifyOpportunity(addition) {
    if (addition.path && addition.operation) {
      return `새로운 ${addition.operation.toUpperCase()} ${addition.path} 엔드포인트를 활용할 수 있는 기능을 고려해보세요.`;
    }
    return '새로운 기능 활용 기회를 검토하세요.';
  }

  generateSummary() {
    this.analysis.summary = {
      totalChanges: this.analysis.breaking.length + 
                    this.analysis.nonBreaking.length + 
                    this.analysis.additions.length,
      breakingChanges: this.analysis.breaking.length,
      criticalChanges: this.analysis.breaking.filter(c => c.severity === 'critical').length,
      highImpactChanges: this.analysis.breaking.filter(c => c.severity === 'high').length,
      totalEstimatedHours: this.analysis.breaking.reduce((sum, change) => 
        sum + change.estimatedEffort.hours, 0),
      affectedAreas: this.getAffectedAreas(),
      urgentActions: this.analysis.breaking.filter(c => 
        c.severity === 'critical' || c.severity === 'high').length
    };
  }

  getAffectedAreas() {
    const areas = new Set();
    
    this.analysis.breaking.forEach(change => {
      if (change.frontendImpact && change.frontendImpact.areas) {
        change.frontendImpact.areas.forEach(area => areas.add(area));
      }
    });
    
    return Array.from(areas);
  }
}

module.exports = OasDiffParser;
```

---

## 📝 결과 리포트 템플릿

### PR 코멘트용 Markdown 템플릿

```markdown
<!-- .github/templates/oasdiff-report.md -->
# 🔍 API 변경사항 분석 리포트

## 📊 변경사항 요약
- **전체 변경사항**: {{totalChanges}}개
- **Breaking Changes**: {{breakingChanges}}개 
- **Critical**: {{criticalChanges}}개
- **High Impact**: {{highImpactChanges}}개
- **예상 작업 시간**: {{totalEstimatedHours}}시간

{{#if urgentActions}}
## 🚨 즉시 대응 필요 ({{urgentActions}}개)

{{#each criticalBreaking}}
### {{path}} {{operation}}
- **유형**: {{id}}
- **영향도**: {{severity}}
- **예상 작업 시간**: {{estimatedEffort.hours}}시간
- **우선순위**: {{estimatedEffort.priority}}
- **가이드**: {{migrationHint}}

{{/each}}
{{/if}}

{{#if affectedAreas}}
## 📍 영향받는 영역
{{#each affectedAreas}}
- {{this}}
{{/each}}
{{/if}}

## 📋 상세 변경사항

{{#each breaking}}
### {{path}} {{operation}} ({{severity}})
- {{description}}
- **마이그레이션**: {{migrationHint}}
- **예상 시간**: {{estimatedEffort.hours}}시간

{{/each}}

{{#if additions}}
## ✨ 새로운 기능 ({{additions.length}}개)

{{#each additions}}
- **{{path}}**: {{opportunity}}
{{/each}}
{{/if}}

## 🎯 권장 대응 순서

1. **P0 (Critical)**: 즉시 수정 필요
2. **P1 (High)**: 이번 스프린트 내 처리
3. **P2 (Medium)**: 다음 스프린트 계획
4. **P3 (Low)**: 백로그 등록

---

### 📞 문의사항
- 백엔드 관련: @backend-developer
- 프론트엔드 영향도: @frontend-team
- 긴급 이슈: #api-changes 채널

*🤖 이 리포트는 oasdiff와 AI 분석을 통해 자동 생성되었습니다.*
```

---

## 🔧 커스텀 체크 설정

### Breaking Changes 체크 리스트

```yaml
# .github/config/oasdiff-checks.yaml
include-checks:
  # Critical Breaking Changes
  - "endpoint-deleted"
  - "api-security-deleted"
  - "required-request-property-removed"
  - "response-required-property-removed"
  
  # High Impact Changes
  - "request-parameter-became-required"
  - "response-property-became-required"
  - "request-property-type-changed"
  - "response-property-type-changed"
  
  # Medium Impact Changes
  - "endpoint-method-changed"
  - "request-parameter-type-changed"
  - "response-property-type-generalized"

exclude-checks:
  # 무시할 변경사항들
  - "api-deprecated-sunset-parse"
  - "request-property-became-optional"
  - "response-property-became-optional"
  - "api-tag-removed"
```

---

## 📋 테스트 및 검증

### 로컬 테스트 스크립트

```bash
#!/bin/bash
# scripts/test-oasdiff.sh

echo "🧪 Testing oasdiff integration..."

# 테스트용 스펙 파일 생성
echo "Generating test specs..."
cp packages/api-client/openapi-spec.yaml test-spec-base.yaml

# 의도적으로 Breaking Change 추가
echo "Creating test breaking change..."
sed -i 's/required: true/required: false/' test-spec-base.yaml

# oasdiff 실행
echo "Running oasdiff comparison..."
docker run --rm -v "$PWD:/data" tufin/oasdiff breaking \
  /data/test-spec-base.yaml \
  /data/packages/api-client/openapi-spec.yaml \
  --format json > test-results.json

# 결과 확인
if [ -s test-results.json ]; then
  echo "✅ oasdiff working correctly"
  echo "📊 Results:"
  cat test-results.json | jq '.[] | {id: .id, path: .path, operation: .operation}'
else
  echo "❌ No results generated"
fi

# 정리
rm -f test-spec-base.yaml test-results.json
```

### CI 파이프라인 테스트

```yaml
# .github/workflows/test-oasdiff.yml
name: Test oasdiff Integration

on:
  workflow_dispatch:
  pull_request:
    paths:
      - '.github/scripts/**'
      - '.github/workflows/api-change-monitor.yml'

jobs:
  test-oasdiff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Create test specs
        run: |
          mkdir -p test-data
          echo 'openapi: 3.0.0
          info:
            title: Test API
            version: 1.0.0
          paths:
            /test:
              get:
                parameters:
                  - name: id
                    required: true
                responses:
                  200:
                    description: OK' > test-data/base.yaml
          
          echo 'openapi: 3.0.0
          info:  
            title: Test API
            version: 1.0.0
          paths:
            /test:
              get:
                parameters:
                  - name: id
                    required: false
                responses:
                  200:
                    description: OK' > test-data/revision.yaml
      
      - name: Test oasdiff
        uses: oasdiff/oasdiff-action/breaking@main
        with:
          base: test-data/base.yaml
          revision: test-data/revision.yaml
          format: json
        id: test-diff
      
      - name: Verify results
        run: |
          echo "Breaking changes detected: ${{ steps.test-diff.outputs.breaking }}"
          if [ -n "${{ steps.test-diff.outputs.breaking }}" ]; then
            echo "✅ Breaking change detection working"
          else
            echo "❌ No breaking changes detected"
            exit 1
          fi
```

---

## 📊 설정 최적화

### 성능 최적화 팁

1. **캐시 활용**: 이전 스펙을 캐시하여 비교 시간 단축
2. **병렬 처리**: 여러 형식 생성을 병렬로 실행
3. **필터링**: 중요한 변경사항만 분석하여 처리 시간 단축

### 정확도 향상 방법

1. **체크 리스트 커스터마이징**: 프로젝트에 맞는 중요도 설정
2. **경로별 가중치**: API 엔드포인트별 중요도 차별화
3. **히스토리 기반 학습**: 과거 변경사항 패턴 분석

---

## 🔗 관련 문서

- [GitHub Actions 설정](./GITHUB_ACTIONS_SETUP.md)
- [Gemini AI 통합](./GEMINI_AI_SETUP.md)
- [Slack 알림 설정](./SLACK_NOTIFICATIONS.md)
- [문제 해결 가이드](./TROUBLESHOOTING.md)

---

## 📝 업데이트 이력

- **2025-01-29**: 초기 oasdiff 통합 가이드 작성
- **향후 계획**: 실제 사용 후 성능 최적화 및 정확도 개선

---

> 💡 **팁**: oasdiff 결과는 JSON 형식으로 받아서 프로그래밍적으로 처리하는 것이 가장 유연합니다. HTML이나 Markdown은 시각적 확인용으로만 사용하세요.