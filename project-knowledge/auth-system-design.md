# 코테피티(Cotept) 권한 관리 시스템 설계 문서

이 문서는 코테피티 서비스의 RBAC(Role-Based Access Control)과 ABAC(Attribute-Based Access Control)를 결합한 권한 관리 시스템의 설계 내용을 담고 있습니다.

## 1. 개요

코테피티 서비스는 멘토와 멘티 간의 코딩 테스트 멘토링을 지원하는 플랫폼으로, 다양한 역할과 속성에 따른 세밀한 권한 제어가 필요합니다. 이에 역할 기반(RBAC)과 속성 기반(ABAC) 접근 제어를 결합하여 유연하고 강력한 권한 관리 시스템을 구현합니다.

## 2. 데이터베이스 스키마

### 2.1 ATTRIBUTES (속성 정의 테이블)

권한 결정에 사용되는 모든 속성 정의

```sql
CREATE TABLE ATTRIBUTES (
    attribute_id VARCHAR2(36) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    description VARCHAR2(500),
    attribute_type VARCHAR2(50) NOT NULL, -- 'USER', 'RESOURCE', 'CONTEXT'
    data_type VARCHAR2(20) NOT NULL, -- 'STRING', 'NUMBER', 'BOOLEAN', 'DATE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT uk_attribute_name UNIQUE (name)
);
```

### 2.2 POLICIES (정책 테이블)

접근 제어 정책 정의

```sql
CREATE TABLE POLICIES (
    policy_id VARCHAR2(36) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    description VARCHAR2(500),
    priority NUMBER(3) DEFAULT 0, -- 정책 우선순위
    active NUMBER(1) DEFAULT 1,
    action_type VARCHAR2(50) NOT NULL, -- 'ALLOW', 'DENY'
    resource_type VARCHAR2(50) NOT NULL, -- 'SESSION', 'VOD', 'REVIEW' 등
    operation VARCHAR2(50) NOT NULL, -- 'READ', 'WRITE', 'JOIN', 'CANCEL' 등
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT uk_policy_name UNIQUE (name)
);
```

### 2.3 POLICY_ATTRIBUTE_CONDITIONS (정책 속성 조건 테이블)

정책이 적용되기 위한 조건 정의

```sql
CREATE TABLE POLICY_ATTRIBUTE_CONDITIONS (
    condition_id VARCHAR2(36) PRIMARY KEY,
    policy_id VARCHAR2(36) NOT NULL,
    attribute_id VARCHAR2(36) NOT NULL,
    operator VARCHAR2(20) NOT NULL, -- 'EQUALS', 'NOT_EQUALS', 'GREATER_THAN' 등
    value_string VARCHAR2(1000),
    value_number NUMBER,
    value_boolean NUMBER(1),
    value_date TIMESTAMP,
    target_type VARCHAR2(20) NOT NULL, -- 'USER', 'RESOURCE', 'CONTEXT'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_condition_policy FOREIGN KEY (policy_id) REFERENCES POLICIES(policy_id) ON DELETE CASCADE,
    CONSTRAINT fk_condition_attribute FOREIGN KEY (attribute_id) REFERENCES ATTRIBUTES(attribute_id) ON DELETE CASCADE
);
```

### 2.4 ROLE_POLICIES (역할 정책 연결 테이블)

역할과 정책을 연결하여 RBAC와 ABAC 통합

```sql
CREATE TABLE ROLE_POLICIES (
    role_policy_id VARCHAR2(36) PRIMARY KEY,
    role VARCHAR2(20) NOT NULL, -- 'MENTEE', 'MENTOR', 'ADMIN'
    policy_id VARCHAR2(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_role_policy_policy FOREIGN KEY (policy_id) REFERENCES POLICIES(policy_id) ON DELETE CASCADE,
    CONSTRAINT uk_role_policy UNIQUE (role, policy_id)
);
```

## 3. 핵심 권한 속성

### 3.1 세션 관련 속성

| 속성 | 설명 | 타입 | 데이터 타입 |
|------|------|------|------------|
| isSessionOwner | 사용자가 해당 멘토링 세션의 소유자(멘토)인지 여부 | CONTEXT | BOOLEAN |
| isSessionParticipant | 사용자가 해당 세션의 참가자(멘티)인지 여부 | CONTEXT | BOOLEAN |
| sessionStatus | 세션의 상태 | RESOURCE | STRING |
| hasPaidForSession | 해당 세션에 대한 결제 여부 | CONTEXT | BOOLEAN |

### 3.2 계정 관련 속성

| 속성 | 설명 | 타입 | 데이터 타입 |
|------|------|------|------------|
| accountStatus | 계정 상태 | USER | STRING |
| verificationStatus | 인증 상태 | USER | STRING |
| tierLevel | solved.ac 티어 레벨 | USER | STRING |

### 3.3 구독 관련 속성

| 속성 | 설명 | 타입 | 데이터 타입 |
|------|------|------|------------|
| hasActiveSubscription | VOD 구독 여부 | USER | BOOLEAN |
| membershipType | 멤버십 유형 | USER | STRING |
| canAccessPremiumContent | 프리미엄 콘텐츠 접근 권한 | USER | BOOLEAN |

### 3.4 리뷰 관련 속성

| 속성 | 설명 | 타입 | 데이터 타입 |
|------|------|------|------------|
| hasCompletedSession | 멘토링 세션을 완료했는지 여부 | CONTEXT | BOOLEAN |
| hasAlreadyReviewed | 이미 리뷰를 작성했는지 여부 | CONTEXT | BOOLEAN |
| isWithinReviewPeriod | 리뷰 작성 가능 기간 내인지 여부 | CONTEXT | BOOLEAN |
| isReviewAuthor | 리뷰 작성자인지 여부 | CONTEXT | BOOLEAN |

## 4. 주요 정책 예시

### 4.1 세션 참가 정책

```
정책명: SessionJoinPolicy
설명: 멘토링 세션 참가 권한 정책
리소스 타입: SESSION
작업: JOIN
조건:
- isSessionOwner가 true이거나
- isSessionParticipant가 true이고
- sessionStatus가 'SCHEDULED' 또는 'IN_PROGRESS'여야 함
```

### 4.2 VOD 시청 정책

```
정책명: VodViewPolicy
설명: VOD 시청 권한 정책
리소스 타입: VOD
작업: VIEW
조건:
- isSessionParticipant가 true이거나
- hasActiveSubscription이 true여야 함
```

### 4.3 리뷰 작성 정책

```
정책명: ReviewCreatePolicy
설명: 리뷰 작성 권한 정책
리소스 타입: REVIEW
작업: CREATE
조건:
- hasCompletedSession이 true이고
- hasAlreadyReviewed가 false이고
- isWithinReviewPeriod가 true여야 함
```

## 5. 권한 평가 프로세스

1. **속성 평가**:
   - 사용자 속성: 사용자 DB에서 조회
   - 리소스 속성: 리소스 DB에서 조회
   - 컨텍스트 속성: 사용자-리소스 관계를 코드로 계산

2. **정책 조회**:
   - 사용자 역할에 연결된 정책 조회
   - 요청된 리소스 타입과 작업에 관련된 정책 조회

3. **정책 평가**:
   - 우선순위가 높은 정책부터 평가
   - 각 정책의 모든 조건 평가
   - 모든 조건을 충족하는 정첫 정책의 action_type에 따라 결정

4. **캐싱 적용**:
   - 속성 값과 정책 평가 결과를 Redis에 캐싱
   - 사용자, 리소스 변경 시 관련 캐시 무효화

## 6. 구현 코드 구조

```
src/auth/
├── entities/
│   ├── attribute.entity.ts
│   ├── policy.entity.ts
│   ├── policy-attribute-condition.entity.ts
│   └── role-policy.entity.ts
├── services/
│   ├── attribute-evaluation.service.ts
│   ├── policy-evaluation.service.ts
│   ├── attribute-cache.service.ts
│   └── policy-cache.service.ts
├── guards/
│   └── permission.guard.ts
├── decorators/
│   └── requires-permission.decorator.ts
└── auth.module.ts
```

## 7. 컨트롤러 사용 예시

```typescript
@Controller('sessions')
export class SessionController {
  
  // 세션 상세 조회
  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequiresPermission('SESSION', 'READ')
  async getSession(@Param('id') id: string) {
    // 권한이 있는 경우에만 실행됨
  }
  
  // 세션 참가
  @Post(':id/join')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequiresPermission('SESSION', 'JOIN')
  async joinSession(@Param('id') id: string) {
    // 권한이 있는 경우에만 실행됨
  }
}
```

## 8. 데이터베이스 레코드 예시

### 8.1 ATTRIBUTES 테이블 레코드 예시

| attribute_id | name | description | attribute_type | data_type | created_at |
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
| a1b2c3d4-e5f6-7890-abcd-ef1234567890 | isSessionOwner | 사용자가 해당 멘토링 세션의 소유자(멘토)인지 여부 | CONTEXT | BOOLEAN | 2023-06-15 09:00:00 |
| b2c3d4e5-f6a7-8901-bcde-f23456789012 | isSessionParticipant | 사용자가 해당 세션의 참가자(멘티)인지 여부 | CONTEXT | BOOLEAN | 2023-06-15 09:01:00 |
| c3d4e5f6-a7b8-9012-cdef-3456789012ab | sessionStatus | 세션의 상태 | RESOURCE | STRING | 2023-06-15 09:02:00 |
| d4e5f6a7-b8c9-0123-defg-456789012abc | hasActiveSubscription | VOD 구독 여부 | USER | BOOLEAN | 2023-06-15 09:03:00 |

### 8.2 POLICIES 테이블 레코드 예시

| policy_id | name | description | priority | active | action_type | resource_type | operation | created_at |
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
| p1b2c3d4-e5f6-7890-abcd-ef1234567890 | SessionJoinPolicy | 멘토링 세션 참가 권한 정책 | 10 | 1 | ALLOW | SESSION | JOIN | 2023-06-16 10:00:00 |
| p2c3d4e5-f6a7-8901-bcde-f23456789012 | VodViewPolicy | VOD 시청 권한 정책 | 20 | 1 | ALLOW | VOD | VIEW | 2023-06-16 10:01:00 |
| p3d4e5f6-a7b8-9012-cdef-3456789012ab | ReviewCreatePolicy | 리뷰 작성 권한 정책 | 30 | 1 | ALLOW | REVIEW | CREATE | 2023-06-16 10:02:00 |

### 8.3 POLICY_ATTRIBUTE_CONDITIONS 테이블 레코드 예시

| condition_id | policy_id | attribute_id | operator | value_string | value_boolean | target_type | created_at |
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
| c1b2c3d4-e5f6-7890-abcd-ef1234567890 | p1b2c3d4-e5f6-7890-abcd-ef1234567890 | a1b2c3d4-e5f6-7890-abcd-ef1234567890 | EQUALS | NULL | 1 | CONTEXT | 2023-06-17 11:00:00 |
| c2c3d4e5-f6a7-8901-bcde-f23456789012 | p1b2c3d4-e5f6-7890-abcd-ef1234567890 | c3d4e5f6-a7b8-9012-cdef-3456789012ab | IN | SCHEDULED,IN_PROGRESS | NULL | RESOURCE | 2023-06-17 11:02:00 |
| c3d4e5f6-a7b8-9012-cdef-3456789012ab | p2c3d4e5-f6a7-8901-bcde-f23456789012 | d4e5f6a7-b8c9-0123-defg-456789012abc | EQUALS | NULL | 1 | USER | 2023-06-17 11:04:00 |

### 8.4 ROLE_POLICIES 테이블 레코드 예시

| role_policy_id | role | policy_id | created_at |
|:-----------|:-----------|:-----------|:-----------|
| rp1b2c3d4-e5f6-7890-abcd-ef1234567890 | MENTOR | p1b2c3d4-e5f6-7890-abcd-ef1234567890 | 2023-06-18 12:00:00 |
| rp2c3d4e5-f6a7-8901-bcde-f23456789012 | MENTEE | p1b2c3d4-e5f6-7890-abcd-ef1234567890 | 2023-06-18 12:02:00 |
| rp3d4e5f6-a7b8-9012-cdef-3456789012ab | MENTEE | p2c3d4e5-f6a7-8901-bcde-f23456789012 | 2023-06-18 12:03:00 |

## 9. 성능 최적화 전략

1. **Redis 캐싱**:
   - 속성 값 캐싱 (AttributeCacheService)
   - 정책 평가 결과 캐싱 (PolicyCacheService)
   - 역할별 정책 목록 캐싱

2. **캐시 TTL 전략**:
   - 사용자 속성: 1시간
   - 리소스 속성: 30분
   - 컨텍스트 속성: 5분
   - 권한 결정 결과: 5분
   - 역할 정책: 1시간

3. **캐시 무효화 전략**:
   - 사용자 정보 변경 시 관련 캐시 무효화
   - 리소스 정보 변경 시 관련 캐시 무효화
   - 정책 변경 시 모든 권한 캐시 무효화

## 10. 결론

RBAC와 ABAC를 결합함으로써 코테피티 서비스는 다음과 같은 이점을 얻을 수 있습니다:

1. **기본적인 역할 기반 제어**: 멘토, 멘티, 관리자 등 역할별 기본 권한 정의
2. **상황별 세부 권한 제어**: 사용자와 리소스의 관계나 상태에 따른 세밀한 권한 제어
3. **유연한 정책 관리**: 코드 변경 없이 데이터베이스에서 정책 추가/수정 가능
4. **보안 강화**: 다층적 권한 체계로 무단 접근 차단
5. **성능 최적화**: Redis 캐싱으로 빠른 권한 결정 제공

이러한 권한 시스템을 통해 "멘토는 자신의 세션만 관리할 수 있다", "세션 완료 후 7일 이내에만 리뷰를 작성할 수 있다" 등의 복잡한 비즈니스 규칙을 효과적으로 구현할 수 있습니다.
