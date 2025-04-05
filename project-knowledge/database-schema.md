# 코테피티 데이터베이스 스키마 생성 SQL

이 문서는 코테피티(Cotept) 서비스를 위한 Oracle 19c 데이터베이스 스키마 생성 스크립트를 포함하고 있습니다.

## 목차

1. [사용자 관리 영역](#1-사용자-관리-영역)
2. [인증 및 검증 영역](#2-인증-및-검증-영역)
3. [멘토링 관리 영역](#3-멘토링-관리-영역)
4. [결제 및 정산 영역](#4-결제-및-정산-영역)
5. [시스템 관리 영역](#5-시스템-관리-영역)
6. [세션 관리 영역](#6-세션-관리-영역)
7. [초기 데이터 설정](#7-초기-데이터-설정)
8. [시퀀스 및 트리거](#8-시퀀스-및-트리거)

## 1. 사용자 관리 영역

### 1.1 사용자 테이블

```sql
CREATE TABLE USERS (
    user_id VARCHAR2(36) PRIMARY KEY,
    email VARCHAR2(100) UNIQUE NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    salt VARCHAR2(100) NOT NULL,
    role VARCHAR2(20) NOT NULL CHECK (role IN ('MENTEE', 'MENTOR', 'ADMIN')),
    status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
    phone_number VARCHAR2(20),
    phone_verified NUMBER(1) DEFAULT 0,
    ci_hash VARCHAR2(255),        -- 연계정보(CI) 암호화 값
    di_hash VARCHAR2(255),        -- 중복가입확인정보(DI) 암호화 값
    name VARCHAR2(100),           -- 실명
    birth_date VARCHAR2(10),      -- 생년월일 (YYYY-MM-DD)
    gender VARCHAR2(1),           -- 성별 ('M', 'F')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON USERS(email);
CREATE INDEX idx_users_role ON USERS(role);
CREATE INDEX idx_users_status ON USERS(status);
```

### 1.2 사용자 프로필 테이블

```sql
CREATE TABLE USER_PROFILES (
    profile_id VARCHAR2(36) PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    full_name VARCHAR2(100),
    profile_image_url VARCHAR2(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_profiles_user_id ON USER_PROFILES(user_id);
```

### 1.3 멘토 프로필 테이블

```sql
CREATE TABLE MENTOR_PROFILES (
    mentor_profile_id VARCHAR2(36) PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    company VARCHAR2(100),
    position VARCHAR2(100),
    introduction CLOB,
    hourly_rate NUMBER(10,2),
    verification_status VARCHAR2(20) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    company_email VARCHAR2(100),
    company_email_verified NUMBER(1) DEFAULT 0,
    visibility NUMBER(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_mentor_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT uk_mentor_user UNIQUE (user_id)
);

CREATE INDEX idx_mentor_verification ON MENTOR_PROFILES(verification_status);
CREATE INDEX idx_mentor_hourly_rate ON MENTOR_PROFILES(hourly_rate);
```

### 1.4 백준 프로필 테이블

```sql
CREATE TABLE BAEKJOON_PROFILES (
    baekjoon_profile_id VARCHAR2(36) PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    baekjoon_id VARCHAR2(50) UNIQUE,
    current_tier VARCHAR2(20),
    highest_tier VARCHAR2(20),
    last_verified_at TIMESTAMP,
    verification_status VARCHAR2(20) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    refresh_count NUMBER(3) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_baekjoon_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT uk_baekjoon_user UNIQUE (user_id)
);

CREATE INDEX idx_baekjoon_tier ON BAEKJOON_PROFILES(current_tier);
CREATE INDEX idx_baekjoon_verification ON BAEKJOON_PROFILES(verification_status);
```

### 1.5 해결한 문제 테이블

```sql
CREATE TABLE SOLVED_PROBLEMS (
    solved_id VARCHAR2(36) PRIMARY KEY,
    baekjoon_profile_id VARCHAR2(36) NOT NULL,
    problem_id VARCHAR2(20) NOT NULL,
    problem_tier VARCHAR2(20),
    solved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_solved_baekjoon FOREIGN KEY (baekjoon_profile_id) REFERENCES BAEKJOON_PROFILES(baekjoon_profile_id) ON DELETE CASCADE
);

CREATE INDEX idx_solved_problems_profile ON SOLVED_PROBLEMS(baekjoon_profile_id);
CREATE INDEX idx_solved_problems_tier ON SOLVED_PROBLEMS(problem_tier);
```

## 2. 인증 및 검증 영역

### 2.1 본인인증 제공자 테이블

```sql
CREATE TABLE IDENTITY_PROVIDERS (
    provider_id VARCHAR2(36) PRIMARY KEY,
    name VARCHAR2(50) UNIQUE NOT NULL,         -- 'NICE', 'PASS', 'KMC' 등
    provider_type VARCHAR2(50) NOT NULL,       -- 'phone', 'ipin', 'certificate' 등
    api_key VARCHAR2(255) NOT NULL,
    api_secret VARCHAR2(255) NOT NULL,
    config CLOB,                              -- 추가 설정 정보 (JSON 형식)
    active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 2.2 본인인증 이력 테이블

```sql
CREATE TABLE PHONE_VERIFICATIONS (
    verification_id VARCHAR2(36) PRIMARY KEY,
    user_id VARCHAR2(36),
    provider_id VARCHAR2(36) NOT NULL,
    request_id VARCHAR2(255) UNIQUE NOT NULL,  -- 본인인증 요청 고유 ID
    phone_number VARCHAR2(20),                 -- 인증된 휴대폰 번호
    name VARCHAR2(100),                        -- 인증된 실명
    birth_date VARCHAR2(10),                   -- 인증된 생년월일
    gender VARCHAR2(1),                        -- 인증된 성별
    ci VARCHAR2(255),                          -- 연계정보(CI)
    di VARCHAR2(255),                          -- 중복가입확인정보(DI)
    auth_result VARCHAR2(50),                  -- 인증 결과 코드
    response_data CLOB,                        -- 인증기관 응답 데이터 (JSON 형식)
    status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'EXPIRED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,                     -- 인증 완료 시간
    CONSTRAINT fk_phone_verify_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_phone_verify_provider FOREIGN KEY (provider_id) REFERENCES IDENTITY_PROVIDERS(provider_id)
);

CREATE INDEX idx_phone_verifications_user ON PHONE_VERIFICATIONS(user_id);
CREATE INDEX idx_phone_verifications_status ON PHONE_VERIFICATIONS(status);
CREATE INDEX idx_phone_verifications_ci ON PHONE_VERIFICATIONS(ci);
CREATE INDEX idx_phone_verifications_di ON PHONE_VERIFICATIONS(di);
```

### 2.3 OAuth 제공자 테이블

```sql
CREATE TABLE OAUTH_PROVIDERS (
    provider_id VARCHAR2(36) PRIMARY KEY,
    name VARCHAR2(50) UNIQUE NOT NULL,         -- 'google', 'kakao', 'naver', 'github' 등
    client_id VARCHAR2(255) NOT NULL,
    client_secret VARCHAR2(255) NOT NULL,
    auth_url VARCHAR2(500) NOT NULL,
    token_url VARCHAR2(500) NOT NULL,
    userinfo_url VARCHAR2(500) NOT NULL,
    redirect_url VARCHAR2(500) NOT NULL,
    scope VARCHAR2(500),
    active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 2.4 사용자 OAuth 계정 테이블

```sql
CREATE TABLE USER_OAUTH_ACCOUNTS (
    oauth_id VARCHAR2(36) PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    provider_id VARCHAR2(36) NOT NULL,
    provider_user_id VARCHAR2(255) NOT NULL,   -- 제공자가 부여한 사용자 ID
    access_token CLOB,
    refresh_token CLOB,
    token_expires_at TIMESTAMP,
    profile_data CLOB,                         -- 소셜 계정에서 가져온 프로필 정보 (JSON 형식)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_oauth_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_oauth_provider FOREIGN KEY (provider_id) REFERENCES OAUTH_PROVIDERS(provider_id),
    CONSTRAINT uk_provider_user UNIQUE (provider_id, provider_user_id)
);

CREATE INDEX idx_oauth_accounts_user ON USER_OAUTH_ACCOUNTS(user_id);
CREATE INDEX idx_oauth_accounts_provider ON USER_OAUTH_ACCOUNTS(provider_id);
CREATE INDEX idx_oauth_accounts_token_expires ON USER_OAUTH_ACCOUNTS(token_expires_at);
```

### 2.5 인증 이력 테이블

```sql
CREATE TABLE AUTH_VERIFICATIONS (
    verification_id VARCHAR2(36) PRIMARY KEY,
    user_id VARCHAR2(36),
    auth_type VARCHAR2(20) NOT NULL CHECK (auth_type IN ('PHONE', 'EMAIL', 'COMPANY')),
    target VARCHAR2(100) NOT NULL,
    verification_code VARCHAR2(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified NUMBER(1) DEFAULT 0,
    verified_at TIMESTAMP,
    attempt_count NUMBER(3) DEFAULT 0,
    ip_address VARCHAR2(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_verification_type ON AUTH_VERIFICATIONS(auth_type);
CREATE INDEX idx_verification_target ON AUTH_VERIFICATIONS(target);
CREATE INDEX idx_verification_expires ON AUTH_VERIFICATIONS(expires_at);
```

### 2.6 약관 테이블

```sql
CREATE TABLE TERMS (
    terms_id VARCHAR2(36) PRIMARY KEY,
    title VARCHAR2(200) NOT NULL,
    content CLOB NOT NULL,
    type VARCHAR2(50) NOT NULL,
    version VARCHAR2(20) NOT NULL,
    required NUMBER(1) DEFAULT 1,
    active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_terms_type ON TERMS(type);
CREATE INDEX idx_terms_active ON TERMS(active);
```

### 2.7 약관 동의 테이블

```sql
CREATE TABLE TERMS_AGREEMENTS (
    agreement_id VARCHAR2(36) PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    terms_id VARCHAR2(36) NOT NULL,
    agreed NUMBER(1) DEFAULT 1,
    agreed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR2(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agreement_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_agreement_terms FOREIGN KEY (terms_id) REFERENCES TERMS(terms_id) ON DELETE CASCADE,
    CONSTRAINT uk_user_terms UNIQUE (user_id, terms_id)
);

CREATE INDEX idx_agreements_user ON TERMS_AGREEMENTS(user_id);
```

## 3. 멘토링 관리 영역

### 3.1 멘토링 포스트 테이블

```sql
CREATE TABLE MENTORING_POSTS (
    post_id VARCHAR2(36) PRIMARY KEY,
    mentor_id VARCHAR2(36) NOT NULL,
    title VARCHAR2(200) NOT NULL,
    content CLOB,
    hourly_rate NUMBER(10,2) NOT NULL,
    active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_post_mentor FOREIGN KEY (mentor_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_mentor ON MENTORING_POSTS(mentor_id);
CREATE INDEX idx_posts_active ON MENTORING_POSTS(active);
CREATE INDEX idx_posts_hourly_rate ON MENTORING_POSTS(hourly_rate);
```

### 3.2 멘토 가능 시간 테이블

```sql
CREATE TABLE MENTORING_AVAILABILITIES (
    availability_id VARCHAR2(36) PRIMARY KEY,
    mentor_id VARCHAR2(36) NOT NULL,
    day_of_week NUMBER(1) NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time VARCHAR2(10) NOT NULL,
    end_time VARCHAR2(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_availability_mentor FOREIGN KEY (mentor_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_availabilities_mentor ON MENTORING_AVAILABILITIES(mentor_id);
CREATE INDEX idx_availabilities_day ON MENTORING_AVAILABILITIES(day_of_week);
```

### 3.3 멘토링 세션 테이블

```sql
CREATE TABLE MENTORING_SESSIONS (
    session_id VARCHAR2(36) PRIMARY KEY,
    mentor_id VARCHAR2(36) NOT NULL,
    mentee_id VARCHAR2(36) NOT NULL,
    post_id VARCHAR2(36) NOT NULL,
    status VARCHAR2(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED')),
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes NUMBER(3) NOT NULL,
    room_id VARCHAR2(100) UNIQUE,
    canceled_at TIMESTAMP,
    canceled_by VARCHAR2(36),
    cancel_reason VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_session_mentor FOREIGN KEY (mentor_id) REFERENCES USERS(user_id),
    CONSTRAINT fk_session_mentee FOREIGN KEY (mentee_id) REFERENCES USERS(user_id),
    CONSTRAINT fk_session_post FOREIGN KEY (post_id) REFERENCES MENTORING_POSTS(post_id)
);

CREATE INDEX idx_sessions_mentor ON MENTORING_SESSIONS(mentor_id);
CREATE INDEX idx_sessions_mentee ON MENTORING_SESSIONS(mentee_id);
CREATE INDEX idx_sessions_status ON MENTORING_SESSIONS(status);
CREATE INDEX idx_sessions_scheduled ON MENTORING_SESSIONS(scheduled_at);
```

### 3.4 세션 녹화 테이블

```sql
CREATE TABLE SESSION_RECORDINGS (
    recording_id VARCHAR2(36) PRIMARY KEY,
    session_id VARCHAR2(36) NOT NULL,
    object_storage_path VARCHAR2(500) NOT NULL,
    status VARCHAR2(20) DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'READY', 'ERROR')),
    duration_seconds NUMBER(10),
    thumbnail_url VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_recording_session FOREIGN KEY (session_id) REFERENCES MENTORING_SESSIONS(session_id) ON DELETE CASCADE,
    CONSTRAINT uk_recording_session UNIQUE (session_id)
);

CREATE INDEX idx_recordings_status ON SESSION_RECORDINGS(status);
```

### 3.5 리뷰 테이블

```sql
CREATE TABLE REVIEWS (
    review_id VARCHAR2(36) PRIMARY KEY,
    session_id VARCHAR2(36) NOT NULL,
    reviewer_id VARCHAR2(36) NOT NULL,
    rating NUMBER(1) NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content VARCHAR2(1000),
    visible NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_review_session FOREIGN KEY (session_id) REFERENCES MENTORING_SESSIONS(session_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES USERS(user_id),
    CONSTRAINT uk_session_reviewer UNIQUE (session_id, reviewer_id)
);

CREATE INDEX idx_reviews_rating ON REVIEWS(rating);
CREATE INDEX idx_reviews_session ON REVIEWS(session_id);
CREATE INDEX idx_reviews_visible ON REVIEWS(visible);
```

## 4. 결제 및 정산 영역

### 4.1 결제 테이블

```sql
CREATE TABLE PAYMENTS (
    payment_id VARCHAR2(36) PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    session_id VARCHAR2(36) NOT NULL,
    amount NUMBER(12,2) NOT NULL,
    payment_method VARCHAR2(50) NOT NULL,
    payment_status VARCHAR2(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    payment_key VARCHAR2(100),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    CONSTRAINT fk_payment_session FOREIGN KEY (session_id) REFERENCES MENTORING_SESSIONS(session_id),
    CONSTRAINT uk_payment_session UNIQUE (session_id)
);

CREATE INDEX idx_payments_user ON PAYMENTS(user_id);
CREATE INDEX idx_payments_status ON PAYMENTS(payment_status);
```

### 4.2 환불 테이블

```sql
CREATE TABLE REFUNDS (
    refund_id VARCHAR2(36) PRIMARY KEY,
    payment_id VARCHAR2(36) NOT NULL,
    reason VARCHAR2(500),
    amount NUMBER(12,2) NOT NULL,
    status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    refunded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_refund_payment FOREIGN KEY (payment_id) REFERENCES PAYMENTS(payment_id),
    CONSTRAINT uk_refund_payment UNIQUE (payment_id)
);

CREATE INDEX idx_refunds_status ON REFUNDS(status);
```

### 4.3 정산 테이블

```sql
CREATE TABLE SETTLEMENTS (
    settlement_id VARCHAR2(36) PRIMARY KEY,
    mentor_id VARCHAR2(36) NOT NULL,
    period_start_at TIMESTAMP NOT NULL,
    period_end_at TIMESTAMP NOT NULL,
    total_amount NUMBER(12,2) NOT NULL,
    fee_amount NUMBER(12,2) NOT NULL,
    settlement_amount NUMBER(12,2) NOT NULL,
    status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    settled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_settlement_mentor FOREIGN KEY (mentor_id) REFERENCES USERS(user_id)
);

CREATE INDEX idx_settlements_mentor ON SETTLEMENTS(mentor_id);
CREATE INDEX idx_settlements_period ON SETTLEMENTS(period_start_at, period_end_at);
CREATE INDEX idx_settlements_status ON SETTLEMENTS(status);
```

## 5. 시스템 관리 영역

### 5.1 알림 테이블

```sql
CREATE TABLE NOTIFICATIONS (
    notification_id VARCHAR2(36) PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    type VARCHAR2(50) NOT NULL,
    title VARCHAR2(200) NOT NULL,
    content VARCHAR2(1000),
    read NUMBER(1) DEFAULT 0,
    read_at TIMESTAMP,
    link_url VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON NOTIFICATIONS(user_id);
CREATE INDEX idx_notifications_read ON NOTIFICATIONS(read);
CREATE INDEX idx_notifications_type ON NOTIFICATIONS(type);
```

### 5.2 문의사항 테이블

```sql
CREATE TABLE INQUIRIES (
    inquiry_id VARCHAR2(36) PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    title VARCHAR2(200) NOT NULL,
    content CLOB NOT NULL,
    status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
    answer_content CLOB,
    answered_at TIMESTAMP,
    answered_by VARCHAR2(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_inquiry_user FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    CONSTRAINT fk_inquiry_answerer FOREIGN KEY (answered_by) REFERENCES USERS(user_id)
);

CREATE INDEX idx_inquiries_user ON INQUIRIES(user_id);
CREATE INDEX idx_inquiries_status ON INQUIRIES(status);
```

### 5.3 시스템 로그 테이블

```sql
CREATE TABLE SYSTEM_LOGS (
    log_id VARCHAR2(36) PRIMARY KEY,
    log_type VARCHAR2(50) NOT NULL,
    user_id VARCHAR2(36),
    action VARCHAR2(100) NOT NULL,
    details CLOB,
    ip_address VARCHAR2(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_logs_type ON SYSTEM_LOGS(log_type);
CREATE INDEX idx_logs_user ON SYSTEM_LOGS(user_id);
CREATE INDEX idx_logs_created ON SYSTEM_LOGS(created_at);
```

## 6. 세션 관리 영역

### 6.1 세션 로그 테이블

```sql
CREATE TABLE SESSION_LOGS (
    log_id VARCHAR2(36) PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    token VARCHAR2(255) UNIQUE NOT NULL,
    ip_address VARCHAR2(45),
    user_agent VARCHAR2(500),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    end_reason VARCHAR2(50),
    CONSTRAINT fk_session_log_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_session_logs_token ON SESSION_LOGS(token);
CREATE INDEX idx_session_logs_user ON SESSION_LOGS(user_id);
CREATE INDEX idx_session_logs_expires ON SESSION_LOGS(expires_at);
```

## 7. 초기 데이터 설정

### 본인인증 제공자 데이터 삽입

```sql
INSERT INTO IDENTITY_PROVIDERS (provider_id, name, provider_type, api_key, api_secret, config, active) VALUES (
    generate_uuid(),
    'PASS',
    'phone',
    'pass_api_key_here',
    'pass_api_secret_here',
    '{"redirectUrl": "https://cotept.com/auth/pass/callback", "clientId": "your_client_id", "timeout": 300}',
    1
);

INSERT INTO IDENTITY_PROVIDERS (provider_id, name, provider_type, api_key, api_secret, config, active) VALUES (
    generate_uuid(),
    'NICE',
    'phone',
    'nice_api_key_here',
    'nice_api_secret_here',
    '{"siteCode": "NICE001", "returnUrl": "https://cotept.com/auth/nice/callback", "timeout": 300}',
    0
);
```

### OAuth 제공자 데이터 삽입

```sql
INSERT INTO OAUTH_PROVIDERS (provider_id, name, client_id, client_secret, auth_url, token_url, userinfo_url, redirect_url, scope, active) VALUES (
    generate_uuid(),
    'google',
    'google_client_id_here',
    'google_client_secret_here',
    'https://accounts.google.com/o/oauth2/v2/auth',
    'https://oauth2.googleapis.com/token',
    'https://www.googleapis.com/oauth2/v3/userinfo',
    'https://cotept.com/auth/google/callback',
    'email profile',
    1
);

INSERT INTO OAUTH_PROVIDERS (provider_id, name, client_id, client_secret, auth_url, token_url, userinfo_url, redirect_url, scope, active) VALUES (
    generate_uuid(),
    'kakao',
    'kakao_client_id_here',
    'kakao_client_secret_here',
    'https://kauth.kakao.com/oauth/authorize',
    'https://kauth.kakao.com/oauth/token',
    'https://kapi.kakao.com/v2/user/me',
    'https://cotept.com/auth/kakao/callback',
    'profile_nickname profile_image account_email',
    1
);

INSERT INTO OAUTH_PROVIDERS (provider_id, name, client_id, client_secret, auth_url, token_url, userinfo_url, redirect_url, scope, active) VALUES (
    generate_uuid(),
    'naver',
    'naver_client_id_here',
    'naver_client_secret_here',
    'https://nid.naver.com/oauth2.0/authorize',
    'https://nid.naver.com/oauth2.0/token',
    'https://openapi.naver.com/v1/nid/me',
    'https://cotept.com/auth/naver/callback',
    'name email profile_image',
    1
);

INSERT INTO OAUTH_PROVIDERS (provider_id, name, client_id, client_secret, auth_url, token_url, userinfo_url, redirect_url, scope, active) VALUES (
    generate_uuid(),
    'github',
    'github_client_id_here',
    'github_client_secret_here',
    'https://github.com/login/oauth/authorize',
    'https://github.com/login/oauth/access_token',
    'https://api.github.com/user',
    'https://cotept.com/auth/github/callback',
    'user:email',
    1
);
```

## 8. 시퀀스 및 트리거

### UUID 생성 함수

```sql
CREATE OR REPLACE FUNCTION generate_uuid RETURN VARCHAR2 IS
    v_uuid VARCHAR2(36);
BEGIN
    v_uuid := LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                RAWTOHEX(SYS_GUID()),
                '([A-F0-9]{8})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{4})([A-F0-9]{12})',
                '\1-\2-\3-\4-\5'
            ),
            '([A-F])', '\L\1'
        )
    );
    RETURN v_uuid;
END;
/
```

### 타임스탬프 업데이트 트리거용 패키지

```sql
CREATE OR REPLACE PACKAGE update_timestamp_pkg IS
    PROCEDURE update_timestamp (p_table_name IN VARCHAR2, p_id_column IN VARCHAR2, p_id_value IN VARCHAR2);
END update_timestamp_pkg;
/

CREATE OR REPLACE PACKAGE BODY update_timestamp_pkg IS
    PROCEDURE update_timestamp (p_table_name IN VARCHAR2, p_id_column IN VARCHAR2, p_id_value IN VARCHAR2) IS
        v_sql VARCHAR2(4000);
    BEGIN
        v_sql := 'UPDATE ' || p_table_name || ' SET updated_at = CURRENT_TIMESTAMP WHERE ' || p_id_column || ' = :1';
        EXECUTE IMMEDIATE v_sql USING p_id_value;
    END update_timestamp;
END update_timestamp_pkg;
/
```

### 테이블 업데이트 트리거

```sql
CREATE OR REPLACE TRIGGER trg_users_update
BEFORE UPDATE ON USERS
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_user_profiles_update
BEFORE UPDATE ON USER_PROFILES
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/
```

## 9. VOD 및 구독 관련 테이블

### 9.1 VOD_COLLECTIONS (VOD 콜렉션)

```sql
CREATE TABLE VOD_COLLECTIONS (
    collection_id VARCHAR2(36) PRIMARY KEY,
    title VARCHAR2(200) NOT NULL,
    description CLOB,
    thumbnail_url VARCHAR2(500),
    is_featured NUMBER(1) DEFAULT 0,
    visibility VARCHAR2(20) DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'PRIVATE', 'PREMIUM')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR2(36),
    CONSTRAINT fk_collection_creator FOREIGN KEY (created_by) REFERENCES USERS(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_collections_visibility ON VOD_COLLECTIONS(visibility);
CREATE INDEX idx_collections_featured ON VOD_COLLECTIONS(is_featured);
```

### 9.2 VOD_COLLECTION_ITEMS (콜렉션 항목)

```sql
CREATE TABLE VOD_COLLECTION_ITEMS (
    item_id VARCHAR2(36) PRIMARY KEY,
    collection_id VARCHAR2(36) NOT NULL,
    recording_id VARCHAR2(36) NOT NULL,
    display_order NUMBER(3) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_collection_item_collection FOREIGN KEY (collection_id) REFERENCES VOD_COLLECTIONS(collection_id) ON DELETE CASCADE,
    CONSTRAINT fk_collection_item_recording FOREIGN KEY (recording_id) REFERENCES SESSION_RECORDINGS(recording_id) ON DELETE CASCADE,
    CONSTRAINT uk_collection_recording UNIQUE (collection_id, recording_id)
);

CREATE INDEX idx_collection_items_order ON VOD_COLLECTION_ITEMS(collection_id, display_order);
```

### 9.3 VOD_TAGS (VOD 태그)

```sql
CREATE TABLE VOD_TAGS (
    tag_id VARCHAR2(36) PRIMARY KEY,
    name VARCHAR2(50) NOT NULL,
    category VARCHAR2(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tag_name UNIQUE (name)
);
```

### 9.4 VOD_RECORDING_TAGS (녹화-태그 연결)

```sql
CREATE TABLE VOD_RECORDING_TAGS (
    recording_id VARCHAR2(36) NOT NULL,
    tag_id VARCHAR2(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_recording_tag PRIMARY KEY (recording_id, tag_id),
    CONSTRAINT fk_recording_tag_recording FOREIGN KEY (recording_id) REFERENCES SESSION_RECORDINGS(recording_id) ON DELETE CASCADE,
    CONSTRAINT fk_recording_tag_tag FOREIGN KEY (tag_id) REFERENCES VOD_TAGS(tag_id) ON DELETE CASCADE
);
```

### 9.5 VOD_VIEWS (시청 이력)

```sql
CREATE TABLE VOD_VIEWS (
    view_id VARCHAR2(36) PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    recording_id VARCHAR2(36) NOT NULL,
    progress_seconds NUMBER(10) DEFAULT 0,
    completed NUMBER(1) DEFAULT 0,
    last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_view_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_view_recording FOREIGN KEY (recording_id) REFERENCES SESSION_RECORDINGS(recording_id) ON DELETE CASCADE,
    CONSTRAINT uk_user_recording UNIQUE (user_id, recording_id)
);

CREATE INDEX idx_views_user ON VOD_VIEWS(user_id);
CREATE INDEX idx_views_recording ON VOD_VIEWS(recording_id);
CREATE INDEX idx_views_last_watched ON VOD_VIEWS(last_watched_at);
```

### 9.6 VOD_BOOKMARKS (북마크)

```sql
CREATE TABLE VOD_BOOKMARKS (
    bookmark_id VARCHAR2(36) PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    recording_id VARCHAR2(36) NOT NULL,
    time_seconds NUMBER(10) NOT NULL,
    title VARCHAR2(200),
    note VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookmark_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_bookmark_recording FOREIGN KEY (recording_id) REFERENCES SESSION_RECORDINGS(recording_id) ON DELETE CASCADE
);

CREATE INDEX idx_bookmarks_user ON VOD_BOOKMARKS(user_id);
CREATE INDEX idx_bookmarks_recording ON VOD_BOOKMARKS(recording_id);
```

### 9.7 HLS 스트리밍 관련 테이블

```sql
-- SESSION_RECORDINGS 테이블 확장
ALTER TABLE SESSION_RECORDINGS 
ADD (
    master_playlist_url VARCHAR2(500),         -- 마스터 m3u8 파일 URL
    encryption_key_url VARCHAR2(500),          -- 암호화 키 URL (암호화된 경우)
    encryption_method VARCHAR2(50),            -- 암호화 방식 (AES-128 등)
    duration_seconds NUMBER(10),               -- 총 영상 길이 (초)
    format VARCHAR2(20) DEFAULT 'HLS',         -- 스트리밍 포맷 (HLS/DASH/MP4)
    cdn_domain VARCHAR2(255),                  -- CDN 도메인 (선택적)
    storage_location VARCHAR2(20) DEFAULT 'S3', -- 저장 위치 (S3/LOCAL)
    is_processed NUMBER(1) DEFAULT 0           -- 트랜스코딩 완료 여부
);

-- HLS 품질 버전 테이블 (해상도별 플레이리스트)
CREATE TABLE VOD_QUALITY_VARIANTS (
    variant_id VARCHAR2(36) PRIMARY KEY,
    recording_id VARCHAR2(36) NOT NULL,
    resolution VARCHAR2(20) NOT NULL,         -- 1080p, 720p, 480p, 360p 등
    bitrate NUMBER(10) NOT NULL,              -- kbps 단위
    playlist_url VARCHAR2(500) NOT NULL,      -- 해당 화질 m3u8 URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_variant_recording FOREIGN KEY (recording_id) REFERENCES SESSION_RECORDINGS(recording_id) ON DELETE CASCADE
);

CREATE INDEX idx_quality_recording ON VOD_QUALITY_VARIANTS(recording_id);
```

## 10. 구독 플랜 관련 테이블

### 10.1 SUBSCRIPTION_PLANS (구독 플랜)

```sql
CREATE TABLE SUBSCRIPTION_PLANS (
    plan_id VARCHAR2(36) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    description CLOB,
    price_monthly NUMBER(10,2) NOT NULL,
    price_yearly NUMBER(10,2),
    max_vod_views NUMBER(5),
    max_mentoring_sessions NUMBER(3),
    vod_collection_access VARCHAR2(20) DEFAULT 'ALL' CHECK (vod_collection_access IN ('ALL', 'BASIC', 'NONE')),
    active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT uk_plan_name UNIQUE (name)
);
```

### 10.2 PLAN_FEATURES (플랜 특징)

```sql
CREATE TABLE PLAN_FEATURES (
    feature_id VARCHAR2(36) PRIMARY KEY,
    plan_id VARCHAR2(36) NOT NULL,
    feature_name VARCHAR2(100) NOT NULL,
    feature_description VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feature_plan FOREIGN KEY (plan_id) REFERENCES SUBSCRIPTION_PLANS(plan_id) ON DELETE CASCADE
);

CREATE INDEX idx_plan_features ON PLAN_FEATURES(plan_id);
```

### 10.3 USER_SUBSCRIPTIONS (사용자 구독)

```sql
CREATE TABLE USER_SUBSCRIPTIONS (
    subscription_id VARCHAR2(36) PRIMARY KEY,
    user_id VARCHAR2(36) NOT NULL,
    plan_id VARCHAR2(36) NOT NULL,
    status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    billing_cycle VARCHAR2(20) DEFAULT 'MONTHLY' CHECK (billing_cycle IN ('MONTHLY', 'YEARLY')),
    auto_renew NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_subscription_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_subscription_plan FOREIGN KEY (plan_id) REFERENCES SUBSCRIPTION_PLANS(plan_id)
);

CREATE INDEX idx_subscriptions_user ON USER_SUBSCRIPTIONS(user_id);
CREATE INDEX idx_subscriptions_status ON USER_SUBSCRIPTIONS(status);
CREATE INDEX idx_subscriptions_dates ON USER_SUBSCRIPTIONS(start_date, end_date);
```

### 10.4 SUBSCRIPTION_INVOICES (구독 인보이스)

```sql
CREATE TABLE SUBSCRIPTION_INVOICES (
    invoice_id VARCHAR2(36) PRIMARY KEY,
    subscription_id VARCHAR2(36) NOT NULL,
    payment_id VARCHAR2(36),
    amount NUMBER(12,2) NOT NULL,
    billing_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP NOT NULL,
    status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_invoice_subscription FOREIGN KEY (subscription_id) REFERENCES USER_SUBSCRIPTIONS(subscription_id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_payment FOREIGN KEY (payment_id) REFERENCES PAYMENTS(payment_id)
);

CREATE INDEX idx_invoices_subscription ON SUBSCRIPTION_INVOICES(subscription_id);
CREATE INDEX idx_invoices_status ON SUBSCRIPTION_INVOICES(status);
CREATE INDEX idx_invoices_dates ON SUBSCRIPTION_INVOICES(billing_date, due_date);
```

### 10.5 COUPON_CODES (쿠폰 코드)

```sql
CREATE TABLE COUPON_CODES (
    coupon_id VARCHAR2(36) PRIMARY KEY,
    code VARCHAR2(50) UNIQUE NOT NULL,
    description VARCHAR2(500),
    discount_type VARCHAR2(20) CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    discount_value NUMBER(10,2) NOT NULL,
    max_uses NUMBER(5),
    current_uses NUMBER(5) DEFAULT 0,
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP,
    plan_restriction VARCHAR2(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_coupon_plan FOREIGN KEY (plan_restriction) REFERENCES SUBSCRIPTION_PLANS(plan_id)
);

CREATE INDEX idx_coupons_code ON COUPON_CODES(code);
CREATE INDEX idx_coupons_validity ON COUPON_CODES(valid_from, valid_to);
```

### 10.6 COUPON_REDEMPTIONS (쿠폰 사용)

```sql
CREATE TABLE COUPON_REDEMPTIONS (
    redemption_id VARCHAR2(36) PRIMARY KEY,
    coupon_id VARCHAR2(36) NOT NULL,
    user_id VARCHAR2(36) NOT NULL,
    subscription_id VARCHAR2(36),
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_redemption_coupon FOREIGN KEY (coupon_id) REFERENCES COUPON_CODES(coupon_id) ON DELETE CASCADE,
    CONSTRAINT fk_redemption_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_redemption_subscription FOREIGN KEY (subscription_id) REFERENCES USER_SUBSCRIPTIONS(subscription_id) ON DELETE CASCADE,
    CONSTRAINT uk_user_coupon UNIQUE (user_id, coupon_id)
);

CREATE INDEX idx_redemptions_user ON COUPON_REDEMPTIONS(user_id);
```

## 11. OCI NoSQL 컬렉션 스키마

OCI NoSQL 데이터베이스에 다음 컬렉션을 생성합니다:

1. **session_codes** - 실시간 코드 편집 기록
2. **session_chats** - 실시간 채팅 메시지
3. **media_segments** - VOD 세그먼트 메타데이터
4. **user_activities** - 사용자 활동 로그
5. **user_solved_problems** - 백준 문제 풀이 데이터
6. **vod_analytics** - VOD 시청 통계 데이터
7. **user_watch_history** - 사용자별 시청 이력 상세 데이터

각 컬렉션의 스키마는 별도의 NoSQL 관리 도구나 API를 통해 생성합니다.
