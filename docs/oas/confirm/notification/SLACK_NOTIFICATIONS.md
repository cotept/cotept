# Slack 알림 시스템 구성 가이드

> **상태**: 구현 준비 완료 (2025-01-29)  
> **난이도**: 초급-중급  
> **예상 소요 시간**: 1-2시간  
> **담당자**: 풀스택 개발자

---

## 🎯 개요

API 변경사항을 팀 Slack 채널로 자동 알림하는 시스템입니다. Breaking Changes 발생 시 즉시 알림을 보내고, 변경사항의 중요도에 따라 다른 채널과 형식으로 알림을 발송합니다.

### 주요 기능
- **즉시 알림**: Critical/High 변경사항 발생 시 실시간 알림
- **채널 분리**: 중요도별 다른 채널 알림
- **상세 리포트**: AI 분석 결과를 포함한 풍부한 정보 제공
- **액션 버튼**: PR 링크, 문서 링크 등 바로가기 제공

---

## 🔧 Slack 설정

### 1. Slack App 생성

```bash
# Slack API 웹사이트 접속
# https://api.slack.com/apps

# 1. "Create New App" 클릭
# 2. "From scratch" 선택
# 3. App Name: "CotePT API Monitor"
# 4. Workspace 선택

# 기본 정보 설정
App Name: CotePT API Monitor
Short Description: API 변경사항 자동 알림 시스템
Long Description: CotePT 프로젝트의 API 변경사항을 감지하고 팀에게 자동으로 알림을 보내는 시스템입니다.
```

### 2. Incoming Webhooks 활성화

```javascript
// Slack App 설정에서 Incoming Webhooks 활성화
// Features > Incoming Webhooks > On

// 채널별 Webhook URL 생성
const webhookUrls = {
  critical: 'https://hooks.slack.com/services/T.../B.../...',  // #api-critical
  general: 'https://hooks.slack.com/services/T.../B.../...',   // #api-changes
  dev: 'https://hooks.slack.com/services/T.../B.../...'       // #dev-team
};
```

### 3. Bot Token 설정 (선택사항)

```bash
# OAuth & Permissions에서 Scopes 설정
Bot Token Scopes:
  - chat:write
  - chat:write.public
  - channels:read
  - groups:read
  - im:read
  - mpim:read

# 설치 후 Bot User OAuth Token 복사
# xoxb-... 형태의 토큰
```

---

## 📱 알림 전략

### 채널별 알림 규칙

```javascript
// .github/scripts/slack-channel-strategy.js
class SlackChannelStrategy {
  static getChannelConfig() {
    return {
      // Critical Changes - 즉시 대응 필요
      critical: {
        channel: '#api-critical',
        webhook: process.env.SLACK_WEBHOOK_CRITICAL,
        triggers: ['critical', 'breaking'],
        mentions: ['@channel', '@backend-lead'],
        urgency: 'high',
        emoji: '🚨'
      },
      
      // High Impact Changes - 우선 대응
      high: {
        channel: '#api-changes',
        webhook: process.env.SLACK_WEBHOOK_GENERAL,
        triggers: ['high', 'medium'],
        mentions: ['@frontend-team'],
        urgency: 'medium',
        emoji: '⚠️'
      },
      
      // General Changes - 정보 공유
      general: {
        channel: '#dev-team',
        webhook: process.env.SLACK_WEBHOOK_DEV,
        triggers: ['low', 'addition'],
        mentions: [],
        urgency: 'low',
        emoji: '📝'
      }
    };
  }

  static selectChannel(changes) {
    const criticalCount = changes.filter(c => 
      c.severity === 'critical' || c.type === 'breaking').length;
    
    const highCount = changes.filter(c => 
      c.severity === 'high').length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 0) return 'high';
    return 'general';
  }
}
```

---

## 🔔 Slack 알림 스크립트

### 메인 알림 발송기

```javascript
// .github/scripts/slack-notifier.js
const axios = require('axios');

class SlackNotifier {
  constructor() {
    this.webhooks = {
      critical: process.env.SLACK_WEBHOOK_CRITICAL,
      general: process.env.SLACK_WEBHOOK_GENERAL,
      dev: process.env.SLACK_WEBHOOK_DEV
    };
    
    this.botToken = process.env.SLACK_BOT_TOKEN;
  }

  async sendApiChangeNotification(analysis, prNumber, commitSha) {
    console.log('📱 Sending Slack notifications...');
    
    try {
      const channelType = this.determineChannelType(analysis);
      const payload = this.buildPayload(analysis, prNumber, commitSha, channelType);
      
      // Webhook을 통한 알림 발송
      await this.sendWebhookNotification(channelType, payload);
      
      // Critical한 경우 추가 알림
      if (channelType === 'critical') {
        await this.sendUrgentNotification(analysis, prNumber);
      }
      
      console.log('✅ Slack notification sent successfully');
      
    } catch (error) {
      console.error('❌ Slack notification failed:', error.message);
      throw error;
    }
  }

  determineChannelType(analysis) {
    const criticalCount = analysis.summary?.criticalCount || 0;
    const highCount = analysis.summary?.highCount || 0;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 0) return 'general';
    return 'dev';
  }

  buildPayload(analysis, prNumber, commitSha, channelType) {
    const config = this.getChannelConfig(channelType);
    const summary = analysis.summary || {};
    
    const payload = {
      text: this.buildMainText(summary, config.emoji),
      attachments: [
        this.buildSummaryAttachment(summary, config),
        ...this.buildChangeAttachments(analysis.changes || [], config),
        this.buildActionAttachment(prNumber, commitSha)
      ]
    };

    return payload;
  }

  getChannelConfig(channelType) {
    const configs = {
      critical: {
        color: 'danger',
        emoji: '🚨',
        urgency: 'URGENT',
        mentions: ['<!channel>'],
        title: 'Critical API Changes Detected'
      },
      general: {
        color: 'warning', 
        emoji: '⚠️',
        urgency: 'HIGH',
        mentions: ['<!here>'],
        title: 'API Changes Require Attention'
      },
      dev: {
        color: 'good',
        emoji: '📝',
        urgency: 'INFO',
        mentions: [],
        title: 'API Changes Detected'
      }
    };

    return configs[channelType] || configs.dev;
  }

  buildMainText(summary, emoji) {
    const totalChanges = summary.totalChanges || 0;
    const criticalCount = summary.criticalCount || 0;
    const highCount = summary.highCount || 0;
    
    if (criticalCount > 0) {
      return `${emoji} *URGENT: Critical API Changes Detected!*\n${totalChanges}개 변경사항 중 ${criticalCount}개가 Critical 수준입니다.`;
    } else if (highCount > 0) {
      return `${emoji} *API Changes Detected*\n${totalChanges}개 변경사항 중 ${highCount}개가 High Impact입니다.`;
    } else {
      return `${emoji} API Changes Detected\n${totalChanges}개의 변경사항이 감지되었습니다.`;
    }
  }

  buildSummaryAttachment(summary, config) {
    const estimatedHours = summary.estimatedTotalHours || 0;
    const sprintCount = summary.recommendedSprintCount || 1;
    
    return {
      color: config.color,
      title: config.title,
      fields: [
        {
          title: "총 변경사항",
          value: `${summary.totalChanges || 0}개`,
          short: true
        },
        {
          title: "Critical/High",
          value: `${summary.criticalCount || 0}/${summary.highCount || 0}개`,
          short: true
        },
        {
          title: "예상 작업시간",
          value: `${estimatedHours}시간`,
          short: true
        },
        {
          title: "권장 스프린트",
          value: `${sprintCount}개`,
          short: true
        },
        {
          title: "위험도",
          value: this.formatRiskLevel(summary.riskLevel),
          short: true
        },
        {
          title: "담당자",
          value: this.getAssigneeInfo(summary),
          short: true
        }
      ],
      footer: "CotePT API Monitor",
      ts: Math.floor(Date.now() / 1000)
    };
  }

  buildChangeAttachments(changes, config) {
    // Critical과 High 변경사항만 상세 표시
    const importantChanges = changes.filter(c => 
      c.severity === 'critical' || c.severity === 'high'
    ).slice(0, 5); // 최대 5개만

    return importantChanges.map(change => ({
      color: change.severity === 'critical' ? 'danger' : 'warning',
      title: `${change.title} (${change.priority})`,
      text: this.formatChangeText(change),
      fields: [
        {
          title: "API 경로",
          value: `\`${change.method} ${change.path}\``,
          short: true
        },
        {
          title: "예상 작업시간",
          value: `${change.frontendImpact?.estimatedHours || 0}시간`,
          short: true
        },
        {
          title: "영향받는 기능",
          value: change.frontendImpact?.affectedFeatures?.join(', ') || 'N/A',
          short: false
        }
      ],
      mrkdwn_in: ["text"]
    }));
  }

  buildActionAttachment(prNumber, commitSha) {
    const baseUrl = 'https://github.com/your-org/cotept';
    
    return {
      color: '#2eb886',
      title: "다음 단계",
      text: "자세한 변경사항을 확인하고 대응 계획을 수립하세요.",
      actions: [
        {
          type: "button",
          text: "PR 상세보기",
          url: `${baseUrl}/pull/${prNumber || ''}`,
          style: "primary"
        },
        {
          type: "button", 
          text: "변경사항 비교",
          url: `${baseUrl}/commit/${commitSha || ''}`,
        },
        {
          type: "button",
          text: "API 문서",
          url: `${baseUrl}/blob/main/docs/api.md`
        }
      ]
    };
  }

  formatChangeText(change) {
    const description = change.description || '';
    const migrationHint = change.migration?.steps?.[0] || '';
    
    return `*${description}*\n\n:point_right: ${migrationHint}`;
  }

  formatRiskLevel(riskLevel) {
    const riskEmojis = {
      low: ':green_heart: Low',
      medium: ':yellow_heart: Medium', 
      high: ':orange_heart: High',
      critical: ':red_circle: Critical'
    };
    
    return riskEmojis[riskLevel] || ':question: Unknown';
  }

  getAssigneeInfo(summary) {
    const totalHours = summary.estimatedTotalHours || 0;
    
    if (totalHours > 8) {
      return '전체 팀 (3명)';
    } else if (totalHours > 4) {
      return '풀스택 + 프론트엔드 1명';
    } else {
      return '풀스택 개발자';
    }
  }

  async sendWebhookNotification(channelType, payload) {
    const webhookUrl = this.webhooks[channelType];
    
    if (!webhookUrl) {
      throw new Error(`Webhook URL not found for channel type: ${channelType}`);
    }

    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.status !== 200) {
      throw new Error(`Webhook request failed: ${response.status}`);
    }
  }

  async sendUrgentNotification(analysis, prNumber) {
    // Critical 변경사항에 대한 추가 DM 발송 (Bot Token 필요)
    if (!this.botToken) return;

    const urgentMessage = {
      channel: '@backend-lead', // 또는 특정 사용자 ID
      text: `🚨 *URGENT: Critical API Changes*\n\nPR #${prNumber}에서 Critical 수준의 API 변경이 감지되었습니다. 즉시 확인이 필요합니다.`,
      attachments: [
        {
          color: 'danger',
          fields: [
            {
              title: "Critical Changes",
              value: `${analysis.summary?.criticalCount || 0}개`,
              short: true
            },
            {
              title: "Action Required",
              value: "즉시 대응 필요",
              short: true
            }
          ]
        }
      ]
    };

    try {
      await axios.post('https://slack.com/api/chat.postMessage', urgentMessage, {
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📨 Urgent DM sent successfully');
    } catch (error) {
      console.warn('⚠️ Failed to send urgent DM:', error.message);
    }
  }
}

// 메인 실행 함수
async function main() {
  const args = process.argv.slice(2);
  const analysisFile = args.find(arg => arg.endsWith('.json'));
  
  if (!analysisFile) {
    console.error('Usage: node slack-notifier.js analysis.json');
    process.exit(1);
  }

  try {
    const fs = require('fs');
    const analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
    
    // 환경 변수에서 PR 정보 가져오기
    const prNumber = process.env.GITHUB_PR_NUMBER;
    const commitSha = process.env.GITHUB_SHA;

    const notifier = new SlackNotifier();
    await notifier.sendApiChangeNotification(analysis, prNumber, commitSha);
    
    console.log('✅ Slack notification completed');
    
  } catch (error) {
    console.error('❌ Slack notification failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SlackNotifier;
```

---

## 🎨 메시지 템플릿

### Critical Changes 템플릿

```json
{
  "text": "🚨 *URGENT: Critical API Changes Detected!*",
  "attachments": [
    {
      "color": "danger",
      "title": "즉시 대응이 필요한 변경사항",
      "fields": [
        {
          "title": "Critical Changes",
          "value": "3개",
          "short": true
        },
        {
          "title": "예상 작업시간",
          "value": "12시간",
          "short": true
        },
        {
          "title": "영향받는 기능",
          "value": "사용자 인증, 데이터 조회",
          "short": false
        }
      ]
    },
    {
      "color": "danger",
      "title": "🔥 Breaking Changes",
      "text": "• `/users` GET - Required parameter 'email' removed\n• `/auth/login` POST - Response schema changed\n• `/api/data` DELETE - Endpoint removed",
      "mrkdwn_in": ["text"]
    },
    {
      "color": "#2eb886",
      "title": "Next Actions",
      "actions": [
        {
          "type": "button",
          "text": "View PR",
          "url": "https://github.com/your-org/cotept/pull/123",
          "style": "primary"
        },
        {
          "type": "button",
          "text": "API Docs",
          "url": "https://github.com/your-org/cotept/blob/main/docs/api.md"
        }
      ]
    }
  ]
}
```

### High Impact 템플릿

```json
{
  "text": "⚠️ *API Changes Require Attention*",
  "attachments": [
    {
      "color": "warning",
      "title": "High Impact Changes Detected",
      "fields": [
        {
          "title": "Changes",
          "value": "5개 (High: 2개, Medium: 3개)",
          "short": true
        },
        {
          "title": "Sprint Impact", 
          "value": "현재 스프린트 내 대응 권장",
          "short": true
        }
      ]
    },
    {
      "color": "warning",
      "title": "Summary",
      "text": "프론트엔드 타입 정의와 API 호출 코드 수정이 필요합니다. Gemini AI가 생성한 마이그레이션 가이드를 PR에서 확인하세요.",
      "mrkdwn_in": ["text"]
    }
  ]
}
```

### General Changes 템플릿

```json
{
  "text": "📝 API Changes Detected",
  "attachments": [
    {
      "color": "good",
      "title": "일반 변경사항",
      "fields": [
        {
          "title": "Changes",
          "value": "3개 (Low: 2개, Addition: 1개)",
          "short": true
        },
        {
          "title": "Action",
          "value": "검토 후 다음 스프린트 계획",
          "short": true
        }
      ]
    },
    {
      "color": "good", 
      "title": "New Features Available",
      "text": "• New `/api/stats` endpoint added\n• Optional `pagination` parameter added to `/users`",
      "mrkdwn_in": ["text"]
    }
  ]
}
```

---

## 🔧 GitHub Actions 통합

### Workflow에서 Slack 알림 호출

```yaml
# .github/workflows/api-change-monitor.yml
- name: Send Slack notification
  if: steps.compare-specs.outputs.breaking != ''
  run: |
    node .github/scripts/slack-notifier.js .github/temp/gemini-analysis.json
  env:
    SLACK_WEBHOOK_CRITICAL: ${{ secrets.SLACK_WEBHOOK_CRITICAL }}
    SLACK_WEBHOOK_GENERAL: ${{ secrets.SLACK_WEBHOOK_GENERAL }}
    SLACK_WEBHOOK_DEV: ${{ secrets.SLACK_WEBHOOK_DEV }}
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
    GITHUB_PR_NUMBER: ${{ github.event.number }}
    GITHUB_SHA: ${{ github.sha }}
```

### 조건부 알림 발송

```yaml
- name: Determine notification strategy
  id: notification-strategy
  run: |
    ANALYSIS_FILE=".github/temp/gemini-analysis.json"
    
    if [ -f "$ANALYSIS_FILE" ]; then
      CRITICAL_COUNT=$(jq '.summary.criticalCount // 0' "$ANALYSIS_FILE")
      HIGH_COUNT=$(jq '.summary.highCount // 0' "$ANALYSIS_FILE")
      
      if [ "$CRITICAL_COUNT" -gt 0 ]; then
        echo "strategy=critical" >> $GITHUB_OUTPUT
      elif [ "$HIGH_COUNT" -gt 0 ]; then
        echo "strategy=high" >> $GITHUB_OUTPUT
      else
        echo "strategy=general" >> $GITHUB_OUTPUT
      fi
    else
      echo "strategy=none" >> $GITHUB_OUTPUT
    fi

- name: Send Critical Alert
  if: steps.notification-strategy.outputs.strategy == 'critical'
  run: |
    echo "🚨 Sending critical alert to #api-critical"
    node .github/scripts/slack-notifier.js .github/temp/gemini-analysis.json
  env:
    NOTIFICATION_LEVEL: critical

- name: Send General Notification
  if: steps.notification-strategy.outputs.strategy != 'none'
  run: |
    echo "📝 Sending notification to appropriate channel"
    node .github/scripts/slack-notifier.js .github/temp/gemini-analysis.json
  env:
    NOTIFICATION_LEVEL: ${{ steps.notification-strategy.outputs.strategy }}
```

---

## 🧪 테스트 및 디버깅

### 로컬 테스트 스크립트

```bash
#!/bin/bash
# scripts/test-slack-local.sh

echo "📱 Testing Slack notifications locally..."

# 테스트 분석 데이터 생성
cat > test-analysis.json << 'EOF'
{
  "summary": {
    "totalChanges": 3,
    "criticalCount": 1,
    "highCount": 1,
    "mediumCount": 1,
    "lowCount": 0,
    "estimatedTotalHours": 8,
    "recommendedSprintCount": 1,
    "riskLevel": "high"
  },
  "changes": [
    {
      "id": "endpoint-deleted",
      "path": "/users/profile",
      "method": "GET",
      "type": "breaking",
      "severity": "critical",
      "priority": "P0",
      "title": "User profile endpoint removed",
      "description": "GET /users/profile endpoint has been removed",
      "frontendImpact": {
        "estimatedHours": 4,
        "complexity": "high",
        "affectedFeatures": ["사용자 프로필"]
      }
    }
  ]
}
EOF

# Slack 알림 테스트
echo "Sending test notification..."
export GITHUB_PR_NUMBER="123"
export GITHUB_SHA="abc123"

node .github/scripts/slack-notifier.js test-analysis.json

# 정리
rm test-analysis.json

echo "✅ Slack test completed"
```

### Webhook 연결 테스트

```javascript
// scripts/test-slack-webhook.js
const axios = require('axios');

async function testSlackWebhook() {
  const webhookUrl = process.env.SLACK_WEBHOOK_GENERAL;
  
  if (!webhookUrl) {
    console.error('❌ SLACK_WEBHOOK_GENERAL 환경 변수가 설정되지 않았습니다.');
    return;
  }

  const testPayload = {
    text: "🧪 CotePT API Monitor 테스트",
    attachments: [
      {
        color: "good",
        title: "연결 테스트",
        text: "Slack 알림 시스템이 정상적으로 작동합니다.",
        fields: [
          {
            title: "테스트 시간",
            value: new Date().toLocaleString('ko-KR'),
            short: true
          },
          {
            title: "상태",
            value: "✅ 성공",
            short: true
          }
        ]
      }
    ]
  };

  try {
    const response = await axios.post(webhookUrl, testPayload);
    
    if (response.status === 200) {
      console.log('✅ Slack webhook 테스트 성공');
    } else {
      console.error('❌ Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Slack webhook 테스트 실패:', error.message);
  }
}

testSlackWebhook();
```

---

## ⚙️ 설정 최적화

### 알림 빈도 제어

```javascript
// .github/scripts/notification-throttle.js
class NotificationThrottle {
  static shouldSendNotification(changes, lastNotificationTime) {
    const now = Date.now();
    const timeSinceLastNotification = now - lastNotificationTime;
    
    // Critical changes - 항상 알림
    const criticalCount = changes.filter(c => c.severity === 'critical').length;
    if (criticalCount > 0) return true;
    
    // High changes - 30분 간격
    const highCount = changes.filter(c => c.severity === 'high').length;
    if (highCount > 0 && timeSinceLastNotification > 30 * 60 * 1000) return true;
    
    // Medium/Low changes - 2시간 간격
    if (timeSinceLastNotification > 2 * 60 * 60 * 1000) return true;
    
    return false;
  }

  static async updateLastNotificationTime() {
    // GitHub Actions 환경에서는 파일 기반 상태 관리
    const fs = require('fs');
    const stateFile = '.github/cache/last-notification.json';
    
    const state = {
      lastNotification: Date.now(),
      updatedBy: process.env.GITHUB_ACTOR,
      commit: process.env.GITHUB_SHA
    };
    
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  }
}
```

### 사용자 맞춤 알림

```javascript
// .github/scripts/user-preferences.js
class UserPreferences {
  static getNotificationPreferences() {
    return {
      '@backend-lead': {
        channels: ['critical', 'high'],
        directMessage: true,
        urgencyThreshold: 'high'
      },
      '@frontend-team': {
        channels: ['high', 'general'],
        directMessage: false,
        urgencyThreshold: 'medium'
      },
      '@qa-team': {
        channels: ['general'],
        directMessage: false,
        urgencyThreshold: 'low'
      }
    };
  }

  static shouldMentionUser(user, changes) {
    const prefs = this.getNotificationPreferences()[user];
    if (!prefs) return false;

    const maxSeverity = Math.max(...changes.map(c => this.getSeverityLevel(c.severity)));
    const threshold = this.getSeverityLevel(prefs.urgencyThreshold);
    
    return maxSeverity >= threshold;
  }

  static getSeverityLevel(severity) {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[severity] || 1;
  }
}
```

---

## 🔗 관련 문서

- [API 변경 자동화 개요](./API_CHANGE_AUTOMATION.md)
- [GitHub Actions 설정](./GITHUB_ACTIONS_SETUP.md)
- [Gemini AI 통합](./GEMINI_AI_SETUP.md)
- [팀 워크플로우](./TEAM_WORKFLOW.md)

---

## 📝 업데이트 이력

- **2025-01-29**: Slack 알림 시스템 초기 설정 가이드 작성
- **향후 계획**: 사용자 피드백 기반 알림 최적화

---

> 💡 **팁**: Slack 알림은 너무 빈번하면 무시되기 쉽습니다. Critical과 High 수준의 변경사항에만 집중하여 알림의 가치를 유지하세요.