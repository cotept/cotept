# API 테스트 자동화: Newman + Postman 구현 가이드

## 개요

CotePT 프로젝트의 API 테스트 자동화를 위한 Newman + Postman 구현 계획 및 가이드입니다.

## 1. Newman 설치 및 기본 설정

### 1.1 Newman CLI 설치
```bash
# Newman 글로벌 설치
npm install -g newman

# 설치 확인
newman --version
```

### 1.2 프로젝트 디렉토리 구조
```
apps/api/
├── tests/
│   └── postman/
│       ├── collections/          # Postman 컬렉션 파일들
│       │   ├── auth-api.postman_collection.json
│       │   ├── user-api.postman_collection.json
│       │   ├── mail-api.postman_collection.json
│       │   └── baekjoon-api.postman_collection.json
│       ├── environments/         # 환경별 설정 파일들
│       │   ├── local.postman_environment.json
│       │   ├── development.postman_environment.json
│       │   └── production.postman_environment.json
│       └── data/                 # 테스트 데이터 파일들
│           ├── auth-test-data.csv
│           ├── user-test-data.csv
│           └── mail-test-data.csv
```

## 2. Postman 컬렉션 설계

### 2.1 모듈별 컬렉션 구성

#### Auth API 컬렉션 (`auth-api.postman_collection.json`)
- 회원가입 (POST /auth/register)
- 로그인 (POST /auth/login)
- 토큰 갱신 (POST /auth/refresh-token)
- 토큰 검증 (POST /auth/validate-token)
- 로그아웃 (POST /auth/logout)
- 소셜 로그인 (Google, GitHub, Kakao, Naver)
- 비밀번호 찾기/재설정

#### User API 컬렉션 (`user-api.postman_collection.json`)
- 사용자 목록 조회 (GET /users)
- 사용자 상세 조회 (GET /users/:id)
- 사용자 생성 (POST /users)
- 사용자 수정 (PATCH /users/:id)
- 사용자 삭제 (DELETE /users/:id)
- 비밀번호 변경 (PATCH /users/:id/change-password)

#### Mail API 컬렉션 (`mail-api.postman_collection.json`)
- 메일 전송 (POST /mail/send)
- 메일 감사 조회 (GET /mail/audit)
- 메일 감사 상세 (GET /mail/audit/:id)

#### Baekjoon API 컬렉션 (`baekjoon-api.postman_collection.json`)
- 사용자 정보 조회 (GET /baekjoon/user/:handle)
- 문제 정보 조회 (GET /baekjoon/problem/:problemId)

### 2.2 컬렉션 작성 규칙

#### Pre-request Scripts
```javascript
// 인증이 필요한 요청의 경우
if (pm.globals.get("access_token")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.globals.get("access_token")
    });
}
```

#### Test Scripts
```javascript
// 기본 응답 검증
pm.test("응답 상태코드가 200이다", function () {
    pm.response.to.have.status(200);
});

pm.test("응답 시간이 2초 이내이다", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("응답 형식이 JSON이다", function () {
    pm.response.to.be.json;
});

// 응답 데이터 검증
pm.test("응답 데이터 구조가 올바르다", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property("success");
    pm.expect(responseJson).to.have.property("data");
    pm.expect(responseJson).to.have.property("message");
});

// 토큰 저장 (로그인 요청의 경우)
if (pm.response.code === 200 && pm.response.json().data.accessToken) {
    pm.globals.set("access_token", pm.response.json().data.accessToken);
}
```

## 3. 환경별 설정 파일

### 3.1 Local 환경 (`local.postman_environment.json`)
```json
{
    "id": "local-env",
    "name": "Local Environment",
    "values": [
        {
            "key": "base_url",
            "value": "http://localhost:3000",
            "enabled": true
        },
        {
            "key": "api_version",
            "value": "v1",
            "enabled": true
        }
    ]
}
```

### 3.2 Development 환경 (`development.postman_environment.json`)
```json
{
    "id": "dev-env",
    "name": "Development Environment",
    "values": [
        {
            "key": "base_url",
            "value": "https://api-dev.cotept.com",
            "enabled": true
        },
        {
            "key": "api_version",
            "value": "v1",
            "enabled": true
        }
    ]
}
```

## 4. Package.json 스크립트 설정

### 4.1 Newman 테스트 스크립트
```json
{
  "scripts": {
    "test:api": "newman run tests/postman/collections/auth-api.postman_collection.json && newman run tests/postman/collections/user-api.postman_collection.json && newman run tests/postman/collections/mail-api.postman_collection.json && newman run tests/postman/collections/baekjoon-api.postman_collection.json",
    "test:api:auth": "newman run tests/postman/collections/auth-api.postman_collection.json -e tests/postman/environments/local.postman_environment.json",
    "test:api:user": "newman run tests/postman/collections/user-api.postman_collection.json -e tests/postman/environments/local.postman_environment.json",
    "test:api:mail": "newman run tests/postman/collections/mail-api.postman_collection.json -e tests/postman/environments/local.postman_environment.json",
    "test:api:baekjoon": "newman run tests/postman/collections/baekjoon-api.postman_collection.json -e tests/postman/environments/local.postman_environment.json",
    "test:api:local": "newman run tests/postman/collections/ -e tests/postman/environments/local.postman_environment.json -r cli,html --reporter-html-export ./test-results/api-test-report.html",
    "test:api:ci": "newman run tests/postman/collections/ -e tests/postman/environments/development.postman_environment.json -r cli,json,junit --reporter-json-export ./test-results/newman-results.json --reporter-junit-export ./test-results/newman-results.xml"
  }
}
```

### 4.2 Newman 명령어 옵션 설명
- `-e, --environment`: 환경 파일 지정
- `-d, --iteration-data`: 테스트 데이터 파일 지정
- `-r, --reporters`: 리포터 형식 지정 (cli, html, json, junit)
- `--reporter-html-export`: HTML 리포트 저장 경로
- `--reporter-json-export`: JSON 리포트 저장 경로
- `--bail`: 첫 번째 오류 발생시 중단
- `--delay-request`: 요청 간 지연시간 설정

## 5. GitHub Actions CI/CD 통합

### 5.1 워크플로 파일 (`.github/workflows/api-tests.yml`)
```yaml
name: API Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Install Newman
      run: npm install -g newman
    
    - name: Start API server
      run: |
        npm run build
        npm run start:prod &
        sleep 30
    
    - name: Run API Tests
      run: npm run test:api:ci
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: api-test-results
        path: test-results/
```

## 6. 테스트 데이터 관리

### 6.1 CSV 데이터 파일 예시 (`auth-test-data.csv`)
```csv
email,password,name,role
test1@example.com,TestPass123!,테스트사용자1,MENTEE
test2@example.com,TestPass123!,테스트사용자2,MENTOR
test3@example.com,TestPass123!,테스트사용자3,ADMIN
```

### 6.2 데이터 드리븐 테스트 실행
```bash
newman run tests/postman/collections/user-api.postman_collection.json \
  -e tests/postman/environments/local.postman_environment.json \
  -d tests/postman/data/user-test-data.csv \
  --iteration-count 3
```

## 7. 베스트 프랙티스

### 7.1 테스트 작성 가이드
1. **명확한 테스트 이름**: 테스트의 목적이 명확히 드러나도록 작성
2. **환경별 분리**: 환경에 따라 다른 설정값 사용
3. **의존성 관리**: 테스트 간 의존성 최소화
4. **데이터 정리**: 테스트 후 생성된 데이터 정리
5. **에러 핸들링**: 예상되는 에러 케이스도 테스트

### 7.2 성능 고려사항
1. **병렬 실행**: 독립적인 테스트는 병렬로 실행
2. **요청 지연**: API 서버 부하 고려하여 적절한 지연시간 설정
3. **타임아웃 설정**: 적절한 타임아웃 값 설정

### 7.3 보안 고려사항
1. **민감 정보 관리**: 환경 변수나 암호화된 파일로 관리
2. **토큰 관리**: 테스트용 토큰은 제한된 권한으로 설정
3. **테스트 데이터**: 실제 사용자 데이터 사용 금지

## 8. 트러블슈팅

### 8.1 일반적인 문제들
- **CORS 에러**: 테스트 환경에서 CORS 설정 확인
- **인증 토큰 만료**: Pre-request 스크립트에서 토큰 갱신 로직 추가
- **네트워크 타임아웃**: 요청 타임아웃 설정 증가

### 8.2 디버깅 방법
```bash
# 상세한 로그 출력
newman run collection.json --verbose

# 특정 폴더만 실행
newman run collection.json --folder "User Management"

# 단일 반복 실행
newman run collection.json --iteration-count 1
```

## 9. 실행 예제

### 9.1 로컬 개발 환경에서 실행
```bash
# 전체 API 테스트 실행
npm run test:api:local

# 특정 모듈만 테스트
npm run test:api:auth
npm run test:api:user
```

### 9.2 CI 환경에서 실행
```bash
# CI용 테스트 (JUnit XML 리포트 생성)
npm run test:api:ci
```

## 10. 기존 테스트와의 통합

### 10.1 테스트 레벨 분리
- **Unit Tests (Jest)**: 개별 함수/클래스 테스트
- **Integration Tests (Jest + Supertest)**: 모듈 간 통합 테스트
- **E2E API Tests (Newman)**: 전체 API 워크플로 테스트

### 10.2 실행 순서
```bash
# 1. 단위 테스트
npm run test

# 2. 통합 테스트  
npm run test:e2e

# 3. API E2E 테스트
npm run test:api
```

이 가이드를 통해 체계적이고 자동화된 API 테스트 환경을 구축하여 코드 품질과 안정성을 향상시킬 수 있습니다.