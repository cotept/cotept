# Gemini AI 코드 리뷰 자동화 설정

> **상태**: 구현 준비 완료 (2025-01-29)  
> **난이도**: 중급-고급  
> **예상 소요 시간**: 3-4시간  
> **담당자**: 풀스택 개발자

---

## 🎯 개요

Gemini AI를 활용하여 API 변경사항의 프론트엔드 영향도를 자동으로 분석하고, 마이그레이션 가이드를 생성하는 시스템입니다.

### 주요 기능
- **영향도 분석**: API 변경이 프론트엔드에 미치는 영향 자동 평가
- **마이그레이션 가이드**: 코드 수정 방법 및 예시 자동 생성
- **우선순위 설정**: 변경사항별 작업 우선순위 자동 분류
- **코드 예시**: 실제 수정 가능한 코드 스니펫 제공

---

## 🔑 Gemini API 설정

### 1. API 키 발급

```bash
# Google AI Studio에서 API 키 발급
# https://makersuite.google.com/app/apikey

# GitHub Secrets에 등록
# Settings > Secrets and variables > Actions
GEMINI_API_KEY=your_api_key_here
```

### 2. 권한 및 할당량 확인

```javascript
// .github/scripts/gemini-setup-check.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkGeminiSetup() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent('Hello, this is a test.');
    console.log('✅ Gemini API 연결 성공');
    console.log('📊 응답:', result.response.text());
    
    return true;
  } catch (error) {
    console.error('❌ Gemini API 연결 실패:', error.message);
    return false;
  }
}

checkGeminiSetup();
```

---

## 🧠 Gemini AI 통합 스크립트

### 메인 리뷰어 스크립트

```javascript
// .github/scripts/gemini-reviewer.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

class GeminiApiReviewer {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
  }

  async analyzeApiChanges(changes, currentSpec, projectContext) {
    console.log('🤖 Starting Gemini AI analysis...');
    
    const prompt = this.buildAnalysisPrompt(changes, currentSpec, projectContext);
    
    try {
      const result = await this.model.generateContent(prompt);
      const analysis = result.response.text();
      
      // 결과를 구조화된 형태로 파싱
      const structuredAnalysis = this.parseAnalysisResult(analysis);
      
      // 파일로 저장
      await this.saveAnalysisResults(structuredAnalysis);
      
      return structuredAnalysis;
    } catch (error) {
      console.error('❌ Gemini API 호출 실패:', error);
      throw error;
    }
  }

  buildAnalysisPrompt(changes, currentSpec, projectContext) {
    return `
# API 변경사항 프론트엔드 영향도 분석

당신은 CotePT 프로젝트의 시니어 풀스택 개발자입니다. 다음 API 변경사항을 분석하여 프론트엔드팀을 위한 상세한 마이그레이션 가이드를 작성해주세요.

## 프로젝트 컨텍스트
- **아키텍처**: Monorepo (Turborepo + pnpm)
- **백엔드**: NestJS with Hexagonal Architecture
- **프론트엔드**: Next.js with TanStack Query
- **API 클라이언트**: OpenAPI Generator (typescript-axios)
- **팀 구성**: 풀스택 1명, 프론트엔드 2명

## 현재 API 스펙 정보
\`\`\`yaml
${currentSpec}
\`\`\`

## 감지된 변경사항
\`\`\`json
${JSON.stringify(changes, null, 2)}
\`\`\`

## 분석 요청사항

### 1. 영향도 분석
각 변경사항에 대해 다음을 분석해주세요:
- **Critical/High/Medium/Low** 우선순위 분류
- **예상 작업 시간** (시간 단위)
- **영향받는 프론트엔드 컴포넌트/기능** 식별
- **기술적 복잡도** 평가

### 2. 마이그레이션 가이드
각 Breaking Change에 대해:
- **수정해야 할 코드 위치** 명시
- **Before/After 코드 예시** 제공
- **TanStack Query 쿼리 수정 방법**
- **타입 정의 업데이트 방법**

### 3. 실행 계획
- **단계별 수정 순서** 제안
- **팀원별 역할 분담** 제안
- **테스트 전략** 제안

## 응답 형식

다음 JSON 구조로 응답해주세요:

\`\`\`json
{
  "summary": {
    "totalChanges": 0,
    "criticalCount": 0,
    "highCount": 0,
    "mediumCount": 0,
    "lowCount": 0,
    "estimatedTotalHours": 0,
    "recommendedSprintCount": 0
  },
  "changes": [
    {
      "id": "change-id",
      "path": "/api/path",
      "method": "GET",
      "type": "breaking",
      "severity": "high",
      "title": "변경사항 제목",
      "description": "상세 설명",
      "frontendImpact": {
        "estimatedHours": 2,
        "complexity": "medium",
        "affectedFiles": [
          "src/features/user/apis/queries.ts",
          "src/features/user/types/user.types.ts"
        ],
        "affectedFeatures": ["사용자 목록", "사용자 상세"]
      },
      "migration": {
        "steps": [
          "1. 타입 정의 업데이트",
          "2. API 호출 코드 수정",
          "3. 컴포넌트 로직 조정"
        ],
        "codeExamples": {
          "before": "// 이전 코드",
          "after": "// 수정된 코드"
        },
        "testingStrategy": "테스트 방법"
      }
    }
  ],
  "executionPlan": {
    "phases": [
      {
        "name": "Phase 1: Critical Changes",
        "duration": "1-2 days",
        "changes": ["change-id-1"],
        "assignee": "풀스택 개발자"
      }
    ],
    "teamAssignment": {
      "fullstack": ["critical-changes"],
      "frontend1": ["user-related-changes"],
      "frontend2": ["auth-related-changes"]
    }
  },
  "recommendations": [
    "권장사항 1",
    "권장사항 2"
  ]
}
\`\`\`

중요: JSON 형식을 정확히 지켜주시고, 실제 사용 가능한 코드 예시를 제공해주세요.
`;
  }

  parseAnalysisResult(analysisText) {
    try {
      // JSON 블록 추출
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // JSON 블록이 없으면 전체 텍스트를 파싱 시도
      return JSON.parse(analysisText);
    } catch (error) {
      console.warn('⚠️ JSON 파싱 실패, 텍스트 형태로 반환');
      return {
        rawAnalysis: analysisText,
        parseError: error.message
      };
    }
  }

  async saveAnalysisResults(analysis) {
    const tempDir = '.github/temp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // JSON 결과 저장
    fs.writeFileSync(
      path.join(tempDir, 'gemini-analysis.json'),
      JSON.stringify(analysis, null, 2)
    );

    // Markdown 리포트 생성
    const markdownReport = this.generateMarkdownReport(analysis);
    fs.writeFileSync(
      path.join(tempDir, 'ai-analysis.md'),
      markdownReport
    );

    // Slack 페이로드 생성
    const slackPayload = this.generateSlackPayload(analysis);
    fs.writeFileSync(
      path.join(tempDir, 'slack-payload.json'),
      JSON.stringify(slackPayload, null, 2)
    );
  }

  generateMarkdownReport(analysis) {
    if (analysis.parseError) {
      return `# 🤖 Gemini AI 분석 결과\n\n${analysis.rawAnalysis}`;
    }

    return `# 🤖 Gemini AI 분석 결과

## 📊 전체 요약
- **총 변경사항**: ${analysis.summary?.totalChanges || 0}개
- **Critical**: ${analysis.summary?.criticalCount || 0}개
- **High**: ${analysis.summary?.highCount || 0}개
- **Medium**: ${analysis.summary?.mediumCount || 0}개
- **Low**: ${analysis.summary?.lowCount || 0}개
- **예상 작업 시간**: ${analysis.summary?.estimatedTotalHours || 0}시간
- **권장 스프린트**: ${analysis.summary?.recommendedSprintCount || 1}개

${analysis.changes?.map(change => `
## 🔍 ${change.title} (${change.severity?.toUpperCase()})

**경로**: \`${change.path}\` ${change.method}  
**유형**: ${change.type}  
**예상 시간**: ${change.frontendImpact?.estimatedHours || 0}시간  

### 📝 상세 설명
${change.description}

### 🎯 프론트엔드 영향
- **복잡도**: ${change.frontendImpact?.complexity}
- **영향받는 기능**: ${change.frontendImpact?.affectedFeatures?.join(', ') || 'N/A'}
- **수정 파일**: 
${change.frontendImpact?.affectedFiles?.map(file => `  - \`${file}\``).join('\n') || '  - 없음'}

### 🛠️ 마이그레이션 가이드

#### 수정 단계
${change.migration?.steps?.map((step, idx) => `${idx + 1}. ${step}`).join('\n') || '단계 정보 없음'}

#### 코드 예시
**이전 코드:**
\`\`\`typescript
${change.migration?.codeExamples?.before || '// 예시 없음'}
\`\`\`

**수정된 코드:**
\`\`\`typescript
${change.migration?.codeExamples?.after || '// 예시 없음'}
\`\`\`

#### 테스트 전략
${change.migration?.testingStrategy || '테스트 정보 없음'}

`).join('') || ''}

## 🚀 실행 계획

${analysis.executionPlan?.phases?.map(phase => `
### ${phase.name}
- **기간**: ${phase.duration}
- **담당자**: ${phase.assignee}
- **변경사항**: ${phase.changes?.join(', ') || '없음'}
`).join('') || ''}

## 👥 팀 역할 분담
${Object.entries(analysis.executionPlan?.teamAssignment || {}).map(([role, tasks]) => `
- **${role}**: ${Array.isArray(tasks) ? tasks.join(', ') : tasks}
`).join('') || '역할 분담 정보 없음'}

## 💡 권장사항
${analysis.recommendations?.map(rec => `- ${rec}`).join('\n') || '권장사항 없음'}

---
*🤖 이 분석은 Gemini AI에 의해 자동 생성되었습니다. 추가 문의사항은 백엔드 개발자에게 연락하세요.*
`;
  }

  generateSlackPayload(analysis) {
    const criticalCount = analysis.summary?.criticalCount || 0;
    const highCount = analysis.summary?.highCount || 0;
    const totalHours = analysis.summary?.estimatedTotalHours || 0;

    const urgency = criticalCount > 0 ? 'danger' : 
                   highCount > 0 ? 'warning' : 'good';

    const emoji = criticalCount > 0 ? '🚨' : 
                  highCount > 0 ? '⚠️' : '📝';

    return {
      text: `${emoji} API 변경사항 감지`,
      attachments: [
        {
          color: urgency,
          title: `API 변경 분석 결과 - ${new Date().toLocaleDateString()}`,
          fields: [
            {
              title: "총 변경사항",
              value: `${analysis.summary?.totalChanges || 0}개`,
              short: true
            },
            {
              title: "Critical/High",
              value: `${criticalCount}/${highCount}개`,
              short: true
            },
            {
              title: "예상 작업시간",
              value: `${totalHours}시간`,
              short: true
            },
            {
              title: "권장 스프린트",
              value: `${analysis.summary?.recommendedSprintCount || 1}개`,
              short: true
            }
          ],
          actions: [
            {
              type: "button",
              text: "PR 상세보기",
              url: `https://github.com/your-org/cotept/pull/${process.env.GITHUB_PR_NUMBER || ''}`
            }
          ],
          footer: "CotePT API 모니터링",
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };
  }
}

// 메인 실행 함수
async function main() {
  const args = process.argv.slice(2);
  const changesIndex = args.findIndex(arg => arg === '--changes');
  const specIndex = args.findIndex(arg => arg === '--spec');
  
  if (changesIndex === -1 || specIndex === -1) {
    console.error('Usage: node gemini-reviewer.js --changes "JSON_CHANGES" --spec "SPEC_PATH"');
    process.exit(1);
  }
  
  const changes = args[changesIndex + 1];
  const specPath = args[specIndex + 1];
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    // 현재 스펙 파일 읽기
    let currentSpec = '';
    if (fs.existsSync(specPath)) {
      currentSpec = fs.readFileSync(specPath, 'utf8');
    }

    // 프로젝트 컨텍스트 정보 수집
    const projectContext = {
      framework: 'Next.js + NestJS',
      architecture: 'Hexagonal Architecture',
      queryLibrary: 'TanStack Query',
      apiGenerator: 'OpenAPI Generator'
    };

    const reviewer = new GeminiApiReviewer(process.env.GEMINI_API_KEY);
    const analysis = await reviewer.analyzeApiChanges(
      JSON.parse(changes), 
      currentSpec, 
      projectContext
    );

    console.log('✅ Gemini AI 분석 완료');
    console.log(`📊 총 ${analysis.summary?.totalChanges || 0}개 변경사항 분석`);
    console.log(`🚨 Critical: ${analysis.summary?.criticalCount || 0}개`);
    console.log(`⚠️ High: ${analysis.summary?.highCount || 0}개`);
    console.log(`⏱️ 예상 작업시간: ${analysis.summary?.estimatedTotalHours || 0}시간`);

  } catch (error) {
    console.error('❌ Gemini AI 분석 실패:', error.message);
    
    // 폴백 분석 결과 생성
    const fallbackAnalysis = {
      summary: { totalChanges: 0, error: error.message },
      rawChanges: changes,
      fallback: true
    };
    
    const tempDir = '.github/temp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(tempDir, 'ai-analysis.md'),
      `# ❌ AI 분석 실패\n\n**오류**: ${error.message}\n\n**원본 변경사항**:\n\`\`\`json\n${changes}\n\`\`\``
    );
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = GeminiApiReviewer;
```

---

## 🎨 프롬프트 엔지니어링

### 컨텍스트 최적화

```javascript
// .github/scripts/context-builder.js
class ContextBuilder {
  static buildProjectContext() {
    return {
      architecture: {
        backend: "NestJS with Hexagonal Architecture",
        frontend: "Next.js with TanStack Query",
        database: "Oracle DB + Redis",
        monorepo: "Turborepo + pnpm"
      },
      team: {
        size: 3,
        roles: ["풀스택 1명", "프론트엔드 2명"],
        experience: "중급-고급"
      },
      codebase: {
        apiClient: "OpenAPI Generator (typescript-axios)",
        stateManagement: "TanStack Query + Zustand",
        uiFramework: "React + Tailwind CSS",
        authSystem: "Next-Auth (Auth.js)"
      },
      conventions: {
        naming: "camelCase for JS/TS, kebab-case for files",
        structure: "Feature-based folder structure",
        apiPattern: "BaseApiService inheritance"
      }
    };
  }

  static buildApiChangeContext(changes) {
    const changeTypes = this.categorizeChanges(changes);
    const affectedEndpoints = this.extractEndpoints(changes);
    
    return {
      changeTypes,
      affectedEndpoints,
      businessImpact: this.assessBusinessImpact(changes),
      technicalComplexity: this.assessTechnicalComplexity(changes)
    };
  }

  static categorizeChanges(changes) {
    return {
      breaking: changes.filter(c => c.type === 'breaking').length,
      nonBreaking: changes.filter(c => c.type === 'non-breaking').length,
      additions: changes.filter(c => c.type === 'addition').length
    };
  }

  static extractEndpoints(changes) {
    return [...new Set(changes.map(c => c.path))];
  }

  static assessBusinessImpact(changes) {
    const userRelated = changes.filter(c => c.path?.includes('/users')).length;
    const authRelated = changes.filter(c => c.path?.includes('/auth')).length;
    const mailRelated = changes.filter(c => c.path?.includes('/mail')).length;
    
    return { userRelated, authRelated, mailRelated };
  }

  static assessTechnicalComplexity(changes) {
    const schemaChanges = changes.filter(c => 
      c.id?.includes('schema') || c.id?.includes('type')).length;
    const parameterChanges = changes.filter(c => 
      c.id?.includes('parameter')).length;
    
    return { schemaChanges, parameterChanges };
  }
}
```

### 특화된 프롬프트 템플릿

```javascript
// .github/scripts/prompt-templates.js
class PromptTemplates {
  static getAnalysisPrompt(changes, spec, context) {
    const basePrompt = this.getBasePrompt();
    const contextPrompt = this.getContextPrompt(context);
    const changesPrompt = this.getChangesPrompt(changes);
    const outputFormatPrompt = this.getOutputFormatPrompt();
    
    return `${basePrompt}\n\n${contextPrompt}\n\n${changesPrompt}\n\n${outputFormatPrompt}`;
  }

  static getBasePrompt() {
    return `
# CotePT API 변경사항 분석 전문가

당신은 CotePT 프로젝트의 시니어 풀스택 개발자로, 다음과 같은 전문성을 가지고 있습니다:

## 전문 분야
- 🏗️ **아키텍처**: Hexagonal Architecture, Clean Code, SOLID 원칙
- ⚛️ **프론트엔드**: React, Next.js, TanStack Query, TypeScript
- 🚀 **백엔드**: NestJS, OpenAPI, TypeORM, 마이크로서비스
- 👥 **팀 리드**: 3인 개발팀 리더십, 코드 리뷰, 멘토링

## 분석 목표
API 변경사항을 분석하여 프론트엔드 팀이 효율적으로 대응할 수 있도록 실용적이고 구체적인 가이드를 제공합니다.
`;
  }

  static getContextPrompt(context) {
    return `
## 프로젝트 컨텍스트

### 기술 스택
- **백엔드**: ${context.architecture.backend}
- **프론트엔드**: ${context.architecture.frontend}
- **데이터베이스**: ${context.architecture.database}
- **모노레포**: ${context.architecture.monorepo}

### 팀 구성
- **인원**: ${context.team.size}명 (${context.team.roles.join(', ')})
- **경험 수준**: ${context.team.experience}

### 코드베이스 특성
- **API 클라이언트**: ${context.codebase.apiClient}
- **상태 관리**: ${context.codebase.stateManagement}
- **UI 프레임워크**: ${context.codebase.uiFramework}
- **인증 시스템**: ${context.codebase.authSystem}
`;
  }

  static getChangesPrompt(changes) {
    return `
## 분석 대상 변경사항

\`\`\`json
${JSON.stringify(changes, null, 2)}
\`\`\`

## 분석 요구 사항

### 1. 우선순위 분석
각 변경사항을 다음 기준으로 분류:
- **P0 (Critical)**: 서비스 중단 위험이 있는 변경
- **P1 (High)**: 주요 기능에 영향을 주는 변경
- **P2 (Medium)**: 일반적인 기능 수정이 필요한 변경
- **P3 (Low)**: 선택적 대응이 가능한 변경

### 2. 영향도 분석
- **프론트엔드 컴포넌트**: 수정이 필요한 구체적인 파일 경로
- **TanStack Query**: 쿼리 키, queryFn, 타입 변경 사항
- **API 클라이언트**: 생성된 클라이언트 코드 변경점
- **비즈니스 로직**: 사용자 경험에 미치는 영향

### 3. 작업량 추정
- **개발 시간**: 실제 구현에 필요한 시간 (시간 단위)
- **테스트 시간**: QA 및 테스트에 필요한 시간
- **코드 리뷰**: 리뷰 및 수정에 필요한 시간
- **배포 리스크**: 배포 시 고려사항
`;
  }

  static getOutputFormatPrompt() {
    return `
## 응답 형식

반드시 다음 JSON 구조로 응답하세요. 모든 필드는 실제 값으로 채워져야 합니다:

\`\`\`json
{
  "summary": {
    "totalChanges": 실제_변경사항_수,
    "criticalCount": P0_변경사항_수,
    "highCount": P1_변경사항_수,
    "mediumCount": P2_변경사항_수,
    "lowCount": P3_변경사항_수,
    "estimatedTotalHours": 총_예상_작업시간,
    "recommendedSprintCount": 권장_스프린트_수,
    "riskLevel": "low|medium|high|critical"
  },
  "changes": [
    {
      "id": "oasdiff에서_제공한_변경사항_ID",
      "path": "API_경로",
      "method": "HTTP_메서드",
      "type": "breaking|non-breaking|addition",
      "severity": "critical|high|medium|low",
      "priority": "P0|P1|P2|P3",
      "title": "한줄_요약_제목",
      "description": "상세한_변경사항_설명",
      "frontendImpact": {
        "estimatedHours": 예상_작업시간_숫자,
        "complexity": "low|medium|high",
        "riskLevel": "low|medium|high",
        "affectedFiles": [
          "실제_파일_경로들"
        ],
        "affectedFeatures": [
          "영향받는_기능_목록"
        ],
        "breaking": true|false
      },
      "migration": {
        "urgency": "immediate|this-sprint|next-sprint|backlog",
        "steps": [
          "구체적인_단계별_작업_내용"
        ],
        "codeExamples": {
          "before": "// 실제_수정_전_코드",
          "after": "// 실제_수정_후_코드"
        },
        "testingStrategy": "구체적인_테스트_방법",
        "rollbackPlan": "롤백_계획",
        "dependencies": [
          "의존성_변경사항들"
        ]
      }
    }
  ],
  "executionPlan": {
    "phases": [
      {
        "name": "단계명",
        "priority": "P0|P1|P2|P3",
        "duration": "예상_기간",
        "changes": ["포함된_변경사항_ID들"],
        "assignee": "권장_담당자",
        "dependencies": ["선행_단계들"],
        "risks": ["잠재적_위험요소들"]
      }
    ],
    "teamAssignment": {
      "fullstack": "풀스택_개발자_담당_업무",
      "frontend1": "프론트엔드1_담당_업무", 
      "frontend2": "프론트엔드2_담당_업무"
    },
    "timeline": {
      "totalDays": 전체_예상_일수,
      "parallelizable": true|false,
      "criticalPath": ["중요_경로_단계들"]
    }
  },
  "recommendations": [
    "구체적이고_실행가능한_권장사항들"
  ],
  "monitoringPlan": {
    "metrics": ["모니터링할_지표들"],
    "alerts": ["설정할_알림들"],
    "rollbackTriggers": ["롤백_조건들"]
  }
}
\`\`\`

## 중요 지침
1. **실용성**: 실제로 실행 가능한 구체적인 가이드 제공
2. **정확성**: CotePT 프로젝트 구조에 맞는 정확한 파일 경로 사용
3. **우선순위**: 비즈니스 영향도를 고려한 현실적인 우선순위 설정
4. **코드 품질**: 실제 작동하는 Before/After 코드 예시 제공
5. **팀 고려**: 3인 팀의 역할과 능력을 고려한 작업 분배
`;
  }
}
```

---

## 🧪 테스트 및 검증

### 로컬 테스트 환경

```javascript
// scripts/test-gemini-local.js
const GeminiApiReviewer = require('../.github/scripts/gemini-reviewer');
require('dotenv').config();

async function testGeminiLocally() {
  const mockChanges = [
    {
      id: "required-request-property-removed",
      path: "/users",
      method: "GET", 
      type: "breaking",
      description: "Required property 'email' was removed from request"
    }
  ];

  const mockSpec = `
openapi: 3.0.0
info:
  title: CotePT API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get users
      responses:
        200:
          description: Success
  `;

  try {
    console.log('🧪 Starting local Gemini test...');
    
    const reviewer = new GeminiApiReviewer(process.env.GEMINI_API_KEY);
    const result = await reviewer.analyzeApiChanges(
      mockChanges, 
      mockSpec, 
      { framework: 'Next.js' }
    );

    console.log('✅ Test completed successfully');
    console.log('📊 Result summary:', result.summary);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGeminiLocally();
```

### 품질 검증 스크립트

```javascript
// .github/scripts/gemini-quality-check.js
class GeminiQualityChecker {
  static validateAnalysisResult(analysis) {
    const issues = [];

    // 필수 필드 검증
    if (!analysis.summary) {
      issues.push('summary 필드 누락');
    }

    if (!analysis.changes || !Array.isArray(analysis.changes)) {
      issues.push('changes 배열 누락');
    }

    // 실용성 검증
    analysis.changes?.forEach((change, index) => {
      if (!change.migration?.codeExamples?.before || 
          !change.migration?.codeExamples?.after) {
        issues.push(`Change ${index}: 코드 예시 누락`);
      }

      if (!change.frontendImpact?.affectedFiles || 
          change.frontendImpact.affectedFiles.length === 0) {
        issues.push(`Change ${index}: 영향받는 파일 정보 누락`);
      }

      if (typeof change.frontendImpact?.estimatedHours !== 'number') {
        issues.push(`Change ${index}: 예상 작업시간이 숫자가 아님`);
      }
    });

    // 코드 품질 검증
    this.validateCodeExamples(analysis, issues);

    return {
      isValid: issues.length === 0,
      issues,
      score: this.calculateQualityScore(analysis, issues)
    };
  }

  static validateCodeExamples(analysis, issues) {
    analysis.changes?.forEach((change, index) => {
      const before = change.migration?.codeExamples?.before;
      const after = change.migration?.codeExamples?.after;

      if (before && after) {
        // TypeScript 문법 기본 검증
        if (!before.includes('//') && !before.includes('import')) {
          issues.push(`Change ${index}: Before 코드가 너무 간단함`);
        }

        if (!after.includes('//') && !after.includes('import')) {
          issues.push(`Change ${index}: After 코드가 너무 간단함`);
        }

        // CotePT 특화 패턴 검증
        if (change.path?.includes('/api/') && !after.includes('ApiService')) {
          issues.push(`Change ${index}: CotePT ApiService 패턴 미반영`);
        }
      }
    });
  }

  static calculateQualityScore(analysis, issues) {
    let score = 100;
    
    // 이슈별 점수 차감
    issues.forEach(issue => {
      if (issue.includes('누락')) score -= 20;
      if (issue.includes('코드')) score -= 15;
      if (issue.includes('파일')) score -= 10;
      if (issue.includes('시간')) score -= 5;
    });

    // 보너스 점수
    if (analysis.executionPlan?.phases?.length > 0) score += 5;
    if (analysis.recommendations?.length > 0) score += 5;
    if (analysis.monitoringPlan) score += 10;

    return Math.max(0, Math.min(100, score));
  }
}

module.exports = GeminiQualityChecker;
```

---

## 📊 성능 최적화

### 요청 최적화

```javascript
// .github/scripts/gemini-optimizer.js
class GeminiOptimizer {
  static optimizePrompt(changes, spec) {
    // 토큰 수 제한
    const maxSpecLength = 2000;
    const maxChangesCount = 10;

    // 스펙 요약
    const summarizedSpec = this.summarizeSpec(spec, maxSpecLength);
    
    // 변경사항 우선순위 필터링
    const prioritizedChanges = this.prioritizeChanges(changes, maxChangesCount);

    return {
      spec: summarizedSpec,
      changes: prioritizedChanges
    };
  }

  static summarizeSpec(spec, maxLength) {
    if (spec.length <= maxLength) return spec;

    // 중요 섹션만 추출
    const lines = spec.split('\n');
    const importantLines = lines.filter(line => 
      line.includes('paths:') ||
      line.includes('components:') ||
      line.includes('get:') ||
      line.includes('post:') ||
      line.includes('put:') ||
      line.includes('delete:') ||
      line.includes('parameters:') ||
      line.includes('responses:')
    );

    const summary = importantLines.join('\n');
    return summary.length <= maxLength ? summary : summary.substring(0, maxLength);
  }

  static prioritizeChanges(changes, maxCount) {
    if (changes.length <= maxCount) return changes;

    // 우선순위별 정렬
    const priorityOrder = { 'breaking': 1, 'non-breaking': 2, 'addition': 3 };
    
    return changes
      .sort((a, b) => {
        const priorityA = priorityOrder[a.type] || 4;
        const priorityB = priorityOrder[b.type] || 4;
        return priorityA - priorityB;
      })
      .slice(0, maxCount);
  }

  static async batchAnalysis(changes, spec, batchSize = 5) {
    const batches = [];
    for (let i = 0; i < changes.length; i += batchSize) {
      batches.push(changes.slice(i, i + batchSize));
    }

    const results = [];
    for (const batch of batches) {
      const batchResult = await this.analyzeBatch(batch, spec);
      results.push(batchResult);
      
      // API 호출 제한 대응
      await this.delay(1000);
    }

    return this.mergeResults(results);
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static mergeResults(results) {
    return results.reduce((merged, result) => {
      merged.changes = [...(merged.changes || []), ...(result.changes || [])];
      merged.summary = this.mergeSummaries(merged.summary, result.summary);
      return merged;
    }, { changes: [], summary: {} });
  }
}
```

---

## 🔗 관련 문서

- [API 변경 자동화 개요](./API_CHANGE_AUTOMATION.md)
- [GitHub Actions 설정](./GITHUB_ACTIONS_SETUP.md)
- [oasdiff 통합](./OASDIFF_INTEGRATION.md)
- [Slack 알림 설정](./SLACK_NOTIFICATIONS.md)

---

## 📝 업데이트 이력

- **2025-01-29**: Gemini AI 통합 가이드 초기 작성
- **향후 계획**: 프롬프트 최적화 및 품질 개선

---

> 💡 **중요**: Gemini AI는 강력하지만 완벽하지 않습니다. 생성된 분석 결과는 반드시 개발자가 검토하고 검증한 후 사용하세요.