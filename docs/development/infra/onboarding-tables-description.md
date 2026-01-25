# 온보딩 시스템 테이블 설계 명세서

## 개요
CotePT 온보딩 시스템의 4단계 플로우(기본 프로필 → 백준 연동 → 실력 분석 → 멘토 자격 검증)를 지원하는 테이블 설계 문서입니다.
Oracle Database 19c 환경에서 운영되며, 기존 테이블들과 연계하여 온보딩 전용 테이블만 추가 구현합니다.

## 기존 테이블 현황

### ✅ 이미 구현된 테이블들
- **USER_PROFILES** (1단계 기본 프로필): `apps/api/src/modules/user-profile/`
- **BAEKJOON_PROFILE** (2단계 백준 연동): `apps/api/src/modules/baekjoon/`
- **MENTOR_PROFILES** (4단계 멘토 프로필): `apps/api/src/modules/mentor/`
- **baekjoon_tags (NoSQL)** (3단계 실력 분석): Oracle NoSQL Database

### 기존 BAEKJOON_PROFILE 엔티티 구조
```typescript
// apps/api/src/modules/baekjoon/.../typeorm-baekjoon-profile.entity.ts
@Entity("BAEKJOON_PROFILE")
export class BaekjoonProfileEntity extends BaseEntity<BaekjoonProfileEntity> {
  @Column({ name: "baekjoon_id", length: 50, unique: true })
  baekjoonId: string // 백준 핸들

  @Column({ name: "current_tier", length: 20, nullable: true })
  currentTier?: string

  @Column({ name: "verification_status", type: "varchar2", length: 20, default: "PENDING" })
  verificationStatus: BaekjoonProfileVerificationStatusType

  @Column({ name: "is_mentor_eligible", type: "number", transformer: booleanTransformer, default: 0 })
  isMentorEligible: boolean
  // ... 기타 필드들
}
```

### 기존 USER_PROFILES 엔티티 구조
```typescript
// apps/api/src/modules/user-profile/.../user-profile.entity.ts
@Entity("USER_PROFILES")
export class UserProfileEntity extends BaseEntity<UserProfileEntity> {
  @Column({ name: "nickname", type: "varchar2", length: 50 })
  nickname: string

  @Column({ name: "full_name", type: "varchar2", length: 100, nullable: true })
  fullName?: string

  @Column({ name: "introduce", type: "varchar2", length: 280, nullable: true })
  introduce?: string // 트위터 스타일 소개글 (280자 제한)

  @Column({ name: "profile_image_url", type: "varchar2", length: 1000, nullable: true })
  profileImageUrl?: string
}
```

### 기존 NoSQL 백준 태그 구조
```typescript
// apps/api/src/modules/baekjoon/.../baekjoon.schema.ts
export interface BaekjoonTagDocument extends UserActivityDocument {
  type: "baekjoon_tags"
  data: {
    handle: string
    apiResponse: BojTag[] // solved.ac API 응답 그대로
    fetchedAt: string
  }
}
```

## 추가 구현 필요한 온보딩 전용 테이블들

### 1. ONBOARDING_STATES (온보딩 진행 상태)
사용자별 온보딩 단계 진행 상황을 추적하는 메인 테이블

```sql
CREATE TABLE ONBOARDING_STATES (
  IDX                           NUMBER(19)        NOT NULL,
  USER_ID                       NUMBER(19)        NOT NULL,
  COTEPT_USER_ID                VARCHAR2(36)      NOT NULL,
  CURRENT_STEP                  NUMBER(1)         DEFAULT 1,
  PROFILE_SETUP_COMPLETED       NUMBER(1)         DEFAULT 0,
  BAEKJOON_VERIFICATION_COMPLETED NUMBER(1)       DEFAULT 0,
  SKILL_ANALYSIS_COMPLETED      NUMBER(1)         DEFAULT 0,
  MENTOR_ELIGIBILITY_CHECKED    NUMBER(1)         DEFAULT 0,
  MENTOR_PROFILE_CREATED        NUMBER(1)         DEFAULT 0,
  ONBOARDING_COMPLETED          NUMBER(1)         DEFAULT 0,
  COMPLETED_AT                  TIMESTAMP,
  CREATED_AT                    TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,
  UPDATED_AT                    TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT PK_ONBOARDING_STATES PRIMARY KEY (IDX),
  CONSTRAINT FK_ONBOARDING_STATES_USER FOREIGN KEY (USER_ID) REFERENCES USERS(IDX) ON DELETE CASCADE,
  CONSTRAINT UK_ONBOARDING_STATES_USER_ID UNIQUE (USER_ID),
  CONSTRAINT UK_ONBOARDING_STATES_COTEPT_USER_ID UNIQUE (COTEPT_USER_ID),
  CONSTRAINT CK_ONBOARDING_STATES_STEP CHECK (CURRENT_STEP BETWEEN 1 AND 4),
  CONSTRAINT CK_ONBOARDING_STATES_PROFILE_COMPLETED CHECK (PROFILE_SETUP_COMPLETED IN (0, 1)),
  CONSTRAINT CK_ONBOARDING_STATES_BAEKJOON_COMPLETED CHECK (BAEKJOON_VERIFICATION_COMPLETED IN (0, 1)),
  CONSTRAINT CK_ONBOARDING_STATES_SKILL_COMPLETED CHECK (SKILL_ANALYSIS_COMPLETED IN (0, 1)),
  CONSTRAINT CK_ONBOARDING_STATES_MENTOR_CHECKED CHECK (MENTOR_ELIGIBILITY_CHECKED IN (0, 1)),
  CONSTRAINT CK_ONBOARDING_STATES_MENTOR_CREATED CHECK (MENTOR_PROFILE_CREATED IN (0, 1)),
  CONSTRAINT CK_ONBOARDING_STATES_ONBOARDING_COMPLETED CHECK (ONBOARDING_COMPLETED IN (0, 1))
);

-- 인덱스
CREATE INDEX IDX_ONBOARDING_STATES_USER_ID ON ONBOARDING_STATES (USER_ID);
CREATE INDEX IDX_ONBOARDING_STATES_COTEPT_USER_ID ON ONBOARDING_STATES (COTEPT_USER_ID);
CREATE INDEX IDX_ONBOARDING_STATES_CURRENT_STEP ON ONBOARDING_STATES (CURRENT_STEP);
CREATE INDEX IDX_ONBOARDING_STATES_COMPLETED ON ONBOARDING_STATES (ONBOARDING_COMPLETED);

-- 시퀀스
CREATE SEQUENCE SEQ_ONBOARDING_STATES_IDX START WITH 1 INCREMENT BY 1;

-- 트리거
CREATE OR REPLACE TRIGGER TRG_ONBOARDING_STATES_BI
  BEFORE INSERT ON ONBOARDING_STATES
  FOR EACH ROW
BEGIN
  IF :NEW.IDX IS NULL THEN
    :NEW.IDX := SEQ_ONBOARDING_STATES_IDX.NEXTVAL;
  END IF;
END;

CREATE OR REPLACE TRIGGER TRG_ONBOARDING_STATES_BU
  BEFORE UPDATE ON ONBOARDING_STATES
  FOR EACH ROW
BEGIN
  :NEW.UPDATED_AT := CURRENT_TIMESTAMP;

  -- 온보딩 완료 조건 자동 체크
  IF :NEW.PROFILE_SETUP_COMPLETED = 1 AND
     :NEW.BAEKJOON_VERIFICATION_COMPLETED = 1 AND
     :NEW.SKILL_ANALYSIS_COMPLETED = 1 AND
     :NEW.MENTOR_ELIGIBILITY_CHECKED = 1 AND
     :NEW.ONBOARDING_COMPLETED = 0 THEN
    :NEW.ONBOARDING_COMPLETED := 1;
    :NEW.COMPLETED_AT := CURRENT_TIMESTAMP;
  END IF;
END;
```

**컬럼 설명:**
- `IDX`: 기본키 (자동 생성)
- `USER_ID`: USERS 테이블 외래키 (CASCADE DELETE)
- `COTEPT_USER_ID`: NoSQL 연계용 사용자 ID
- `CURRENT_STEP`: 현재 온보딩 단계 (1-4)
- `PROFILE_SETUP_COMPLETED`: 1단계 완료 여부 (프로필 설정)
- `BAEKJOON_VERIFICATION_COMPLETED`: 2단계 완료 여부 (백준 연동)
- `SKILL_ANALYSIS_COMPLETED`: 3단계 완료 여부 (실력 분석)
- `MENTOR_ELIGIBILITY_CHECKED`: 4단계 완료 여부 (멘토 자격 확인)
- `MENTOR_PROFILE_CREATED`: 멘토 프로필 생성 여부
- `ONBOARDING_COMPLETED`: 전체 온보딩 완료 여부

### 2. BAEKJOON_VERIFICATIONS (백준 인증 정보)
백준 ID 소유권 인증 과정 및 결과를 저장하는 테이블

```sql
CREATE TABLE BAEKJOON_VERIFICATIONS (
  IDX                     NUMBER(19)        NOT NULL,
  USER_ID                 NUMBER(19)        NOT NULL,
  BAEKJOON_HANDLE         VARCHAR2(50)      NOT NULL,
  VERIFICATION_TOKEN      VARCHAR2(100)     NOT NULL,
  VERIFICATION_STATUS     VARCHAR2(20)      DEFAULT 'PENDING',
  VERIFICATION_ATTEMPTS   NUMBER(3)         DEFAULT 0,
  PROFILE_NAME_UPDATED    NUMBER(1)         DEFAULT 0,
  VERIFIED_AT             TIMESTAMP,
  EXPIRES_AT              TIMESTAMP         NOT NULL,
  CREATED_AT              TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,
  UPDATED_AT              TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT PK_BAEKJOON_VERIFICATIONS PRIMARY KEY (IDX),
  CONSTRAINT FK_BAEKJOON_VERIFICATIONS_USER FOREIGN KEY (USER_ID) REFERENCES USERS(IDX) ON DELETE CASCADE,
  CONSTRAINT UK_BAEKJOON_VERIFICATIONS_USER_ID UNIQUE (USER_ID),
  CONSTRAINT CK_BAEKJOON_VERIFICATIONS_STATUS CHECK (VERIFICATION_STATUS IN ('PENDING', 'VERIFIED', 'FAILED', 'EXPIRED')),
  CONSTRAINT CK_BAEKJOON_VERIFICATIONS_UPDATED CHECK (PROFILE_NAME_UPDATED IN (0, 1)),
  CONSTRAINT CK_BAEKJOON_VERIFICATIONS_ATTEMPTS CHECK (VERIFICATION_ATTEMPTS >= 0 AND VERIFICATION_ATTEMPTS <= 10)
);

-- 인덱스
CREATE INDEX IDX_BAEKJOON_VERIFICATIONS_USER_ID ON BAEKJOON_VERIFICATIONS (USER_ID);
CREATE INDEX IDX_BAEKJOON_VERIFICATIONS_HANDLE ON BAEKJOON_VERIFICATIONS (BAEKJOON_HANDLE);
CREATE INDEX IDX_BAEKJOON_VERIFICATIONS_STATUS ON BAEKJOON_VERIFICATIONS (VERIFICATION_STATUS);
CREATE INDEX IDX_BAEKJOON_VERIFICATIONS_EXPIRES ON BAEKJOON_VERIFICATIONS (EXPIRES_AT);

-- 시퀀스
CREATE SEQUENCE SEQ_BAEKJOON_VERIFICATIONS_IDX START WITH 1 INCREMENT BY 1;

-- 트리거
CREATE OR REPLACE TRIGGER TRG_BAEKJOON_VERIFICATIONS_BI
  BEFORE INSERT ON BAEKJOON_VERIFICATIONS
  FOR EACH ROW
BEGIN
  IF :NEW.IDX IS NULL THEN
    :NEW.IDX := SEQ_BAEKJOON_VERIFICATIONS_IDX.NEXTVAL;
  END IF;

  -- 기본 만료 시간 설정 (1시간)
  IF :NEW.EXPIRES_AT IS NULL THEN
    :NEW.EXPIRES_AT := CURRENT_TIMESTAMP + INTERVAL '1' HOUR;
  END IF;
END;

CREATE OR REPLACE TRIGGER TRG_BAEKJOON_VERIFICATIONS_BU
  BEFORE UPDATE ON BAEKJOON_VERIFICATIONS
  FOR EACH ROW
BEGIN
  :NEW.UPDATED_AT := CURRENT_TIMESTAMP;

  -- 인증 성공 시 시간 기록
  IF :OLD.VERIFICATION_STATUS != 'VERIFIED' AND :NEW.VERIFICATION_STATUS = 'VERIFIED' THEN
    :NEW.VERIFIED_AT := CURRENT_TIMESTAMP;
  END IF;
END;
```

**컬럼 설명:**
- `BAEKJOON_HANDLE`: 백준 사용자 ID
- `VERIFICATION_TOKEN`: 인증용 랜덤 토큰 (예: "배부른고양이223")
- `VERIFICATION_STATUS`: 인증 상태 (PENDING/VERIFIED/FAILED/EXPIRED)
- `VERIFICATION_ATTEMPTS`: 인증 시도 횟수 (최대 10회)
- `PROFILE_NAME_UPDATED`: 프로필 이름 변경 여부
- `EXPIRES_AT`: 인증 토큰 만료 시간 (1시간)

## 기존 테이블과의 연계 방안

### 온보딩 플로우와 기존 테이블 매핑

#### 1단계: 기본 프로필 설정 ✅
- **기존 테이블**: `USER_PROFILES` (이미 구현됨)
- **데이터**: 닉네임, 프로필 이미지, 기본 멘티 프로필 생성
- **상태 업데이트**: `ONBOARDING_STATES.PROFILE_SETUP_COMPLETED = 1`

#### 2단계: 백준 ID 연동 (부분 구현됨)
- **기존 테이블**: `BAEKJOON_PROFILE` (이미 구현됨)
- **추가 테이블**: `BAEKJOON_VERIFICATIONS` (인증 과정 추적용)
- **프로세스**:
  1. 백준 ID 입력 → `BAEKJOON_VERIFICATIONS` 레코드 생성
  2. 인증 토큰 생성 및 프로필 이름 변경 요청
  3. solved.ac API 검증 성공 → 기존 `BAEKJOON_PROFILE` 업데이트
- **상태 업데이트**: `ONBOARDING_STATES.BAEKJOON_VERIFICATION_COMPLETED = 1`

#### 3단계: 실력 분석 ✅
- **기존 구조**: Oracle NoSQL의 `baekjoon_tags` 문서 (이미 구현됨)
- **데이터**: solved.ac API에서 태그별 레이팅 정보 수집
- **시각화**: 방사형 차트용 데이터 (8개 주요 알고리즘 카테고리)
- **상태 업데이트**: `ONBOARDING_STATES.SKILL_ANALYSIS_COMPLETED = 1`

#### 4단계: 멘토 자격 검증 ✅
- **기존 테이블**: `MENTOR_PROFILES` (이미 구현됨)
- **조건**: `BaekjoonUser.isMentorEligible()` (플래티넘3 이상, TierLevel >= 18)
- **멘토 프로필 생성**: 기존 테이블 활용
- **상태 업데이트**:
  - `ONBOARDING_STATES.MENTOR_ELIGIBILITY_CHECKED = 1`
  - `ONBOARDING_STATES.MENTOR_PROFILE_CREATED = 1` (멘토 프로필 생성 시)

## 테이블 관계도

```
USERS (1) ←→ (1) ONBOARDING_STATES
              │
              ├→ (1) BAEKJOON_VERIFICATIONS
              │
              ├→ (1) BAEKJOON_PROFILE (기존)
              │
              ├→ (N) USER_PROFILES (기존)
              │
              ├→ (0..1) MENTOR_PROFILES (기존)
              │
              └→ baekjoon_tags (NoSQL, 기존)
```

## 마이그레이션 전략

### 단계별 구현 순서
1. **ONBOARDING_STATES** 테이블 생성 (온보딩 진행 상태 추적)
2. **BAEKJOON_VERIFICATIONS** 테이블 생성 (인증 과정 관리)
3. 기존 모듈들과 연계하는 온보딩 서비스 구현
4. 온보딩 API 엔드포인트 구현

### 기존 시스템 영향도
- **최소 침해**: 기존 테이블 구조는 변경하지 않음
- **점진적 확장**: 온보딩 전용 테이블만 추가하여 기능 확장
- **호환성 유지**: 기존 API들의 변경 없이 온보딩 플로우 추가

## Oracle 19c 특화 고려사항

### 1. 데이터 타입
- `VARCHAR2`: Oracle 전용 가변길이 문자열 (최대 4000바이트)
- `NUMBER(19)`: 64비트 정수 호환 (TypeORM bigint)
- `NUMBER(1)`: Boolean 값 (0/1)
- `TIMESTAMP`: 밀리초 단위 시간 정보 포함

### 2. 제약조건 및 인덱스
- `CHECK` 제약조건으로 비즈니스 규칙 강제 (온보딩 단계, 상태 값 등)
- `UNIQUE` 제약조건으로 중복 방지 (사용자별 온보딩 상태 등)
- 복합 인덱스로 쿼리 성능 최적화
- `FOREIGN KEY CASCADE DELETE`로 참조 무결성 보장

### 3. 트리거 기반 자동화
- 자동 IDX 생성 (시퀀스 + BEFORE INSERT 트리거)
- 자동 UPDATED_AT 갱신 (BEFORE UPDATE 트리거)
- 비즈니스 로직 자동 처리:
  - 온보딩 완료 조건 자동 체크
  - 인증 성공 시 VERIFIED_AT 자동 설정

### 4. 성능 최적화
- 단계별 진행 상태 조회를 위한 인덱스
- 만료된 인증 토큰 정리를 위한 EXPIRES_AT 인덱스
- 온보딩 완료율 분석을 위한 복합 인덱스

## 온보딩 모듈 구현 전략

### 모듈 구조 (예상)
```typescript
onboarding/
├── domain/
│   ├── model/
│   │   ├── onboarding-state.ts
│   │   └── baekjoon-verification.ts
│   └── vo/
├── application/
│   ├── dto/
│   ├── services/
│   │   ├── usecases/
│   │   │   ├── start-onboarding.usecase.ts
│   │   │   ├── verify-baekjoon.usecase.ts
│   │   │   ├── complete-step.usecase.ts
│   │   │   └── get-onboarding-progress.usecase.ts
│   │   └── facade/
│   └── ports/
└── infrastructure/
    └── adapters/
        ├── in/controllers/
        └── out/persistence/
```

### API 엔드포인트 계획
```typescript
// 온보딩 API 엔드포인트 (예상)
GET    /api/v1/onboarding/progress/:userId    // 온보딩 진행 상태 조회
POST   /api/v1/onboarding/start              // 온보딩 시작
POST   /api/v1/onboarding/profile/setup      // 1단계: 프로필 설정
POST   /api/v1/onboarding/baekjoon/verify    // 2단계: 백준 인증 시작
GET    /api/v1/onboarding/baekjoon/status    // 2단계: 인증 상태 확인
POST   /api/v1/onboarding/skill/analyze      // 3단계: 실력 분석
POST   /api/v1/onboarding/mentor/check       // 4단계: 멘토 자격 확인
POST   /api/v1/onboarding/complete           // 온보딩 완료
```

### 기존 시스템과의 통합
- **USER_PROFILES 모듈**: 1단계 프로필 설정 시 활용
- **BAEKJOON 모듈**: 2, 3단계 백준 연동 및 실력 분석 시 활용
- **MENTOR 모듈**: 4단계 멘토 프로필 생성 시 활용
- **NoSQL 연계**: 백준 태그 분석 데이터 조회

## 운영 고려사항

### 1. 데이터 정합성
- 온보딩 단계별 완료 조건 검증
- 백준 인증 토큰 만료 시간 관리 (1시간)
- 중복 인증 방지 (사용자당 하나의 진행 중인 인증)

### 2. 성능 모니터링
- solved.ac API 호출 빈도 제한 준수
- 온보딩 완료율 및 단계별 이탈률 분석
- 인증 시도 실패율 모니터링

### 3. 보안 및 개인정보
- 백준 인증 토큰의 안전한 생성 및 관리
- API 응답 데이터 선별적 저장
- 사용자 동의 기반 데이터 수집

이 설계는 기존 시스템을 최대한 활용하면서 온보딩 플로우만을 위한 최소한의 테이블을 추가하여, 4단계 온보딩 프로세스를 완벽히 지원합니다.