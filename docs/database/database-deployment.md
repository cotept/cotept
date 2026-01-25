# 코테피티 DB 설정 및 배포 가이드

이 문서는 코테피티(Cotept) 서비스의 데이터베이스 설정 및 배포에 관한 가이드입니다.

## 1. Oracle 19c 설정 가이드

### 1.1 스키마 설계 전략

코테피티 서비스의 데이터베이스는 기능별로 다음과 같이 스키마를 분리하는 것을 권장합니다:

- **COTEPT_APP**: 애플리케이션 핵심 데이터
  - 사용자, 멘토링, 결제 등의 비즈니스 로직 관련 테이블
  - 데이터 무결성이 중요한 트랜잭션 데이터
  
- **COTEPT_AUTH**: 인증 관련 데이터
  - 인증, 세션, 권한 관련 테이블
  - 보안이 중요한 민감 정보
  
- **COTEPT_SYSTEM**: 시스템 관련 데이터
  - 로그, 설정, 통계 등 시스템 운영 관련 테이블
  - 주로 읽기 전용이거나 대용량 로그 데이터

이러한 스키마 분리는 다음과 같은 이점을 제공합니다:
- 권한 관리 단순화
- 백업 및 복구 전략 최적화
- 데이터 접근 제어 강화

### 1.2 환경별 데이터베이스 구성

각 환경별로 다음과 같은 전략을 권장합니다:

**개발 환경 (DEV)**
- 단일 Oracle 19c 인스턴스
- 모든 스키마를 동일 DB에 구성
- 개발자에게 충분한 권한 부여

**테스트 환경 (TEST)**
- 운영과 동일한 구성으로 설정
- 통합 테스트, 성능 테스트용
- 실제 데이터 구조와 동일하게 유지

**운영 환경 (PROD)**
- Oracle 19c 메인 인스턴스
- 읽기 부하 분산을 위한 Active Data Guard 구성 (선택적)
- 엄격한 보안 정책 적용

### 1.3 Oracle 19c 성능 최적화 팁

1. **테이블스페이스 설계**
   - 데이터와 인덱스 분리
   - 데이터 성격에 따른 테이블스페이스 분리
   
   ```sql
   CREATE TABLESPACE cotept_data
      DATAFILE 'cotept_data01.dbf' SIZE 500M AUTOEXTEND ON;
      
   CREATE TABLESPACE cotept_index
      DATAFILE 'cotept_idx01.dbf' SIZE 250M AUTOEXTEND ON;
   ```

2. **파티셔닝 전략**
   - SESSION_LOGS, SYSTEM_LOGS 등 대용량 테이블은 파티셔닝 적용
   - 날짜 기반 파티셔닝 권장
   
   ```sql
   CREATE TABLE SESSION_LOGS (
     -- 기존 칼럼들
   )
   PARTITION BY RANGE (created_at) (
     PARTITION p_2024_q1 VALUES LESS THAN (TO_DATE('01-04-2024', 'DD-MM-YYYY')),
     PARTITION p_2024_q2 VALUES LESS THAN (TO_DATE('01-07-2024', 'DD-MM-YYYY')),
     PARTITION p_2024_q3 VALUES LESS THAN (TO_DATE('01-10-2024', 'DD-MM-YYYY')),
     PARTITION p_2024_q4 VALUES LESS THAN (TO_DATE('01-01-2025', 'DD-MM-YYYY')),
     PARTITION p_future VALUES LESS THAN (MAXVALUE)
   );
   ```

3. **인덱스 전략**
   - 자주 사용되는 조회 조건에 인덱스 생성
   - 복합 인덱스 활용
   - 인덱스 사용성 주기적 모니터링

## 2. OCI NoSQL 설정 가이드

### 2.1 OCI NoSQL 컬렉션 설계 원칙

1. **파티션 키 설계**
   - 주요 쿼리 패턴을 고려하여 설계
   - 데이터 분산을 균일하게 유지할 수 있는 키 선택
   - 핫 파티션 방지

2. **TTL(Time-To-Live) 설정**
   - 각 컬렉션별 데이터 보관 기간 설정
   - 자동 만료로 스토리지 비용 최적화
   - 정책에 따른 TTL 조정

3. **보조 인덱스 설계**
   - 주요 쿼리 패턴에 맞는 인덱스 생성
   - 불필요한 인덱스 최소화
   - 쿼리 성능과 쓰기 성능 간의 균형 고려

### 2.2 NoSQL 데이터 접근 패턴

주요 데이터 접근 패턴:

1. **session_codes (실시간 코드)**
   - 세션별 전체 코드 기록 조회
   - 특정 시간대 코드 변경 이력 조회
   - 최신 코드 상태 조회

2. **session_chats (실시간 채팅)**
   - 세션별 전체 채팅 이력 조회
   - 특정 사용자의 채팅 메시지 조회
   - 읽지 않은 메시지 조회

3. **media_segments (VOD 세그먼트)**
   - 녹화 ID별 모든 세그먼트 조회
   - 특정 시간대 세그먼트 조회
   - 세그먼트 연속 스트리밍을 위한 순차적 접근

4. **user_activities (사용자 활동)**
   - 사용자별 최근 활동 조회
   - 활동 유형별 집계 통계
   - 시간대별 활동 패턴 분석

5. **user_solved_problems (백준 문제)**
   - 사용자별 전체 문제 풀이 내역 조회
   - 티어별 풀이 문제 통계
   - 멘토 자격 검증을 위한 상세 분석

### 2.3 데이터 일관성 및 동기화 전략

Oracle 19c와 OCI NoSQL 간의 데이터 일관성을 유지하기 위한 전략:

1. **이벤트 기반 동기화**
   - 주요 이벤트 발생 시 양쪽 데이터베이스 업데이트
   - 메시지 큐(ex: Oracle Advanced Queuing) 활용

2. **배치 프로세싱**
   - 정기적인 배치 작업으로 데이터 동기화
   - 로그 기반 복제 구현

3. **읽기 일관성 수준**
   - NoSQL: 최종 일관성(eventual consistency) 허용
   - Oracle: 강한 일관성(strong consistency) 유지

## 3. 초기 데이터 설정 및 마이그레이션

### 3.1 기본 데이터 설정

필수 초기 데이터:

```sql
-- 기본 관리자 계정 생성
INSERT INTO USERS (user_id, email, password_hash, salt, role, status, created_at)
VALUES (
  generate_uuid(),
  'admin@cotept.com',
  -- bcrypt로 해싱된 'admin123' 패스워드
  '$2a$10$X9vHMlVCRwWnx6QKfkzrxeIK5G8JgWVJsi1EWyU0wy59UPX0M5wuS',
  'randomsalt123456789',
  'ADMIN',
  'ACTIVE',
  CURRENT_TIMESTAMP
);

-- 기본 약관 데이터
INSERT INTO TERMS (terms_id, title, content, type, version, required, active, created_at)
VALUES (
  generate_uuid(),
  '서비스 이용약관',
  '코테피티 서비스 이용약관 내용...',
  'SERVICE',
  '1.0',
  1,
  1,
  CURRENT_TIMESTAMP
);

INSERT INTO TERMS (terms_id, title, content, type, version, required, active, created_at)
VALUES (
  generate_uuid(),
  '개인정보 처리방침',
  '코테피티 개인정보 처리방침 내용...',
  'PRIVACY',
  '1.0',
  1,
  1,
  CURRENT_TIMESTAMP
);

INSERT INTO TERMS (terms_id, title, content, type, version, required, active, created_at)
VALUES (
  generate_uuid(),
  '백준 ID 연동 및 이용약관',
  '백준 ID 연동 및 이용약관 내용...',
  'BAEKJOON',
  '1.0',
  1,
  1,
  CURRENT_TIMESTAMP
);
```

### 3.2 데이터 마이그레이션 도구

Oracle 데이터베이스 마이그레이션을 위한 도구:

1. **Flyway**
   - SQL 기반 마이그레이션
   - 버전 관리 용이
   - NestJS와 통합 가능

2. **Liquibase**
   - XML/YAML/JSON 기반 마이그레이션
   - 롤백 기능 제공
   - DB 독립적인 변경 관리

3. **Oracle Data Pump**
   - 대용량 데이터 마이그레이션
   - 스키마 전체 백업 및 복원
   - 테이블스페이스 레벨 제어

### 3.3 마이그레이션 전략

환경별 마이그레이션 전략:

1. **개발 환경**
   - 스키마 변경 후 데이터 삭제 허용
   - 빠른 반복 개발 지원

2. **테스트 환경**
   - 마이그레이션 스크립트 검증
   - 롤백 시나리오 테스트

3. **운영 환경**
   - 무중단 마이그레이션 계획
   - 백업 및 복구 계획 필수

## 4. 인증 시스템 설정

### 4.1 소셜 로그인 연동 방법

코테피티 서비스에서는 다음 소셜 로그인 제공자를 지원합니다:

1. **Google OAuth 연동**
   - Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
   - 승인된 리디렉션 URI 설정: `https://cotept.com/auth/google/callback`
   - 필요 권한 스코프: `email`, `profile`

2. **Kakao OAuth 연동**
   - Kakao Developers 콘솔에서 앱 생성
   - 리디렉션 URI 설정: `https://cotept.com/auth/kakao/callback`
   - 필요 권한 스코프: `profile_nickname`, `profile_image`, `account_email`

3. **Naver OAuth 연동**
   - Naver Developers 콘솔에서 애플리케이션 등록
   - 리디렉션 URI 설정: `https://cotept.com/auth/naver/callback`
   - 필요 권한 스코프: `name`, `email`, `profile_image`

4. **GitHub OAuth 연동**
   - GitHub 설정에서 OAuth 앱 등록
   - 리디렉션 URI 설정: `https://cotept.com/auth/github/callback`
   - 필요 권한 스코프: `user:email`

각 소셜 로그인 제공자의 클라이언트 ID와 시크릿은 환경별로 다르게 설정해야 합니다. 개발 환경에서는 테스트용 애플리케이션을, 프로덕션 환경에서는 실제 서비스용 애플리케이션을 사용하세요.

### 4.2 PASS 본인인증 연동 방법

한국 PASS 인증 서비스 연동을 위한 설정:

1. **PASS 서비스 계약 및 API 키 발급**
   - 통신 3사 PASS 인증 서비스 계약 체결
   - 상용 API 키 및 시크릿 발급
   - 서비스 도메인 등록

2. **리디렉션 URI 설정**
   - PASS 관리자 콘솔에서 승인된 리디렉션 URI 설정
   - 개발, 테스트, 프로덕션 환경별 URI 등록

3. **CI/DI 처리 방법**
   - CI(연계정보)와 DI(중복가입확인정보)는 암호화하여 저장
   - 사용자 계정 연동 시 DI를 활용한 중복 가입 검증 구현

4. **암호화 키 관리**
   - PASS 인증 정보 암호화에 사용되는 키는 OCI Vault에 안전하게 보관
   - 환경별로 별도의 암호화 키 사용

## 5. 데이터베이스 모니터링 및 유지보수

### 5.1 OCI 모니터링 구성

OCI Database Management 서비스를 활용한 모니터링:

1. **성능 모니터링**
   - CPU, 메모리, I/O 사용량
   - 쿼리 성능 및 실행 계획
   - 대기 이벤트 분석

2. **알림 설정**
   - 리소스 사용량 임계치 알림
   - 백업 실패 알림
   - 가용성 모니터링

3. **자동화된 유지보수**
   - 자동 백업 구성
   - 통계 수집 자동화
   - 인덱스 재구성 자동화

### 5.2 백업 및 복구 전략

환경별 백업 전략:

1. **개발 환경**
   - 주간 백업
   - 7일 보관

2. **테스트 환경**
   - 일일 백업
   - 14일 보관

3. **운영 환경**
   - 일일 전체 백업
   - 시간별 증분 백업
   - 31일 보관
   - 월 1회 장기 보관 백업

### 5.3 정기 유지보수 체크리스트

분기별 유지보수 작업:

1. **성능 검토**
   - 느린 쿼리 식별 및 최적화
   - 인덱스 사용률 분석
   - 리소스 사용 패턴 검토

2. **보안 검토**
   - 계정 및 권한 감사
   - 패치 적용 상태 확인
   - 보안 설정 검토

3. **용량 계획**
   - 스토리지 증가 추세 분석
   - 스키마 크기 분석
   - 향후 확장 계획 수립

## 6. DB 보안 설정

### 6.1 사용자 및 권한 관리

최소 권한 원칙에 따른 사용자 구성:

```sql
-- 애플리케이션 사용자 생성 (읽기/쓰기 권한)
CREATE USER cotept_app_user IDENTIFIED BY "StrongPassword";
GRANT CONNECT, RESOURCE TO cotept_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON COTEPT_APP.USERS TO cotept_app_user;
-- 필요한 테이블별 권한 부여

-- 읽기 전용 사용자 생성 (보고서, 대시보드용)
CREATE USER cotept_read_user IDENTIFIED BY "ReadOnlyPass";
GRANT CONNECT TO cotept_read_user;
GRANT SELECT ON COTEPT_APP.USERS TO cotept_read_user;
GRANT SELECT ON COTEPT_APP.MENTORING_SESSIONS TO cotept_read_user;
-- 필요한 테이블별 SELECT 권한 부여
```

### 6.2 데이터 암호화

민감 데이터 암호화 전략:

1. **컬럼 레벨 암호화**
   - 개인정보, 결제정보 등 민감 데이터 암호화
   - Oracle TDE(Transparent Data Encryption) 활용

   ```sql
   ALTER TABLE USERS MODIFY (
     phone_number ENCRYPT USING 'AES256'
   );
   ```

2. **저장 데이터 암호화**
   - 테이블스페이스 암호화
   - 백업 암호화

3. **전송 데이터 암호화**
   - SSL/TLS 설정
   - 네트워크 암호화

### 6.3 감사 및 로깅

데이터베이스 활동 감사:

1. **Oracle Audit 설정**
   ```sql
   -- DDL 문 감사
   AUDIT CREATE TABLE, ALTER TABLE, DROP TABLE BY ACCESS;
   
   -- 민감 테이블 접근 감사
   AUDIT SELECT, INSERT, UPDATE, DELETE ON COTEPT_APP.USERS BY ACCESS;
   ```

2. **애플리케이션 레벨 감사**
   - SYSTEM_LOGS 테이블을 통한 활동 기록
   - 주요 데이터 변경 이력 기록

3. **접근 제어 로깅**
   - 로그인 시도
   - 권한 변경
   - 실패한 액세스 시도

## 7. Redis 세션 관리 구성

### 7.1 Redis 설정 (redis.conf)

```
# 기본 설정
port 6379
bind 127.0.0.1
protected-mode yes

# 성능 설정
maxmemory 2gb
maxmemory-policy allkeys-lru

# 영속성 설정
appendonly yes
appendfsync everysec
dir /var/lib/redis

# 보안 설정
requirepass StrongPasswordHere

# 세션 관련 최적화
databases 2
```

### 7.2 Redis 세션 데이터 구조

```json
// 키: "session:{token}"
{
  "user_id": 123,
  "username": "user123",
  "roles": "MENTEE",
  "permissions": ["users:read", "posts:write"],
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2025-03-23T12:34:56Z",
  "last_active_at": "2025-03-23T13:45:12Z"
}
```

### 7.3 사용자별 활성 세션 인덱스

```
// 키: "user_sessions:{user_id}"
// 값: 세트(Set) 타입으로 해당 사용자의 모든 활성 세션 토큰 목록 저장
["token1", "token2", "token3"]
```

### 7.4 Redis 모니터링 및 관리

1. **주요 모니터링 지표**
   - 메모리 사용량: `INFO memory`
   - 연결 수: `INFO clients`
   - 명령어 처리 통계: `INFO stats`
   - 키스페이스 정보: `INFO keyspace`

2. **권장 모니터링 도구**
   - Redis CLI: `redis-cli monitor`
   - Redis Insight: GUI 기반 모니터링 및 관리 도구
   - Prometheus + Redis Exporter: 지표 수집 및 알림
   - Grafana: 시각화 대시보드

## 8. 환경별 구성 예시

### 8.1 개발 환경 Docker Compose 설정

```yaml
version: '3'

services:
  oracle:
    image: gvenzl/oracle-xe:19
    ports:
      - "1521:1521"
    environment:
      - ORACLE_PASSWORD=oracle
      - ORACLE_DATABASE=COTEPTDEV
    volumes:
      - oracle-data:/opt/oracle/oradata
      - ./sql/init:/container-entrypoint-initdb.d

  redis:
    image: redis:latest
    ports:
      - "6379:6379"
    volumes:
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
      - redis-data:/data
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]

  redis-commander:
    image: rediscommander/redis-commander:latest
    environment:
      - REDIS_HOSTS=local:redis:6379
      - HTTP_USER=admin
      - HTTP_PASSWORD=adminpassword
    ports:
      - "8081:8081"
    depends_on:
      - redis

volumes:
  oracle-data:
  redis-data:
```

### 8.2 운영 환경 OCI 구성

1. **Oracle Database 서비스**
   - Oracle Cloud Infrastructure Database 서비스 활용
   - 고가용성을 위한 RAC 구성 고려
   - 자동 백업 및 패치 적용 활성화

2. **Redis 클러스터**
   - OCI Compute Instance에 Redis 클러스터 배포
   - 고가용성을 위한 Redis Sentinel 구성
   - OCI Block Volume으로 데이터 영속성 보장

3. **OCI NoSQL 데이터베이스**
   - 관리형 NoSQL 서비스 활용
   - 용량 자동 확장 설정
   - 백업 및 복구 정책 구성

### 8.3 보안 설정

1. **네트워크 보안**
   - 프라이빗 서브넷에 데이터베이스 배치
   - 보안 리스트로 접근 제한
   - 암호화된 통신 강제

2. **인증 정보 관리**
   - OCI Vault에 모든 비밀 정보 저장
   - API 키, 암호, 인증서 중앙 관리
   - 정기적인 비밀 정보 로테이션

## 9. 모니터링 및 알림 구성

### 9.1 OCI 모니터링 서비스 설정

1. **OCI 모니터링 메트릭 수집**
   - CPU, 메모리, 디스크 사용량
   - 데이터베이스 성능 메트릭
   - 네트워크 트래픽

2. **알림 설정**
   - 임계치 초과 시 Slack 알림
   - 심각도별 알림 채널 분리
   - 자동 복구 작업 연결

### 9.2 로그 집계 및 분석

1. **OCI Logging 서비스**
   - 모든 데이터베이스 로그 집계
   - 로그 기반 알림 구성
   - 로그 분석 대시보드

2. **Audit 로그 보관**
   - 감사 로그 장기 보관
   - 법적 요구사항 준수
   - 로그 접근 제한 및 감사
