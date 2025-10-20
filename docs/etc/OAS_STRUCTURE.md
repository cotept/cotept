# OpenAPI Specification (OAS) 3.0 구조 가이드 - Part 1: 기본 구조

## 📋 목차

- [1. 기본 구조](#1-기본-구조)
- [2. Info Object](#2-info-object)
- [3. Servers](#3-servers)

## 1. 기본 구조

OpenAPI 문서의 최상위 구조는 다음과 같습니다:

```yaml
openapi: 3.0.3 # OpenAPI 버전 (필수)
info: # API 메타데이터 (필수)
  title: API Title
  version: 1.0.0
servers: # 서버 정보 (선택)
  - url: https://api.example.com
paths: # API 경로들 (필수)
  /users:
    get:
      # 엔드포인트 정의
components: # 재사용 가능한 컴포넌트들 (선택)
  schemas:
    # 데이터 모델 정의
  parameters:
    # 재사용 가능한 파라미터
  responses:
    # 재사용 가능한 응답
  securitySchemes:
    # 보안 스키마
security: # 글로벌 보안 요구사항 (선택)
  - bearerAuth: []
tags: # API 그룹화를 위한 태그 (선택)
  - name: Users
    description: User operations
externalDocs: # 외부 문서 링크 (선택)
  url: https://docs.example.com
```

### 1.1 필수 필드

```yaml
# 최소한의 유효한 OpenAPI 문서
openapi: 3.0.3
info:
  title: My API
  version: 1.0.0
paths: {} # 빈 paths도 허용
```

### 1.2 권장 필드

```yaml
openapi: 3.0.3
info:
  title: 실무 프로젝트 API
  version: 1.0.0
  description: 실제 서비스에서 사용하는 API
  contact:
    email: support@example.com
servers:
  - url: https://api.example.com
    description: Production
paths:
  /health:
    get:
      summary: Health check
      responses:
        "200":
          description: OK
```

## 2. Info Object

Info 객체는 API의 메타데이터를 정의합니다.

### 2.1 기본 정보

```yaml
info:
  title: 전자상거래 API # API 제목 (필수)
  version: 2.1.0 # API 버전 (필수)
  summary: E-commerce platform API # 짧은 요약 (선택)
  description: | # 상세 설명 (선택)
    전자상거래 플랫폼을 위한 RESTful API입니다.

    ## 주요 기능
    - 사용자 관리
    - 상품 관리  
    - 주문 처리
    - 결제 시스템

    ## 인증 방식
    모든 API는 JWT Bearer Token 인증을 사용합니다.
```

### 2.2 연락처 및 라이선스 정보

```yaml
info:
  title: My API
  version: 1.0.0

  # 연락처 정보 (선택)
  contact:
    name: API Support Team
    url: https://example.com/support
    email: api-support@example.com

  # 라이선스 정보 (선택)
  license:
    name: MIT License
    url: https://opensource.org/licenses/MIT
    identifier: MIT

  # 서비스 약관 (선택)
  termsOfService: https://example.com/terms
```

### 2.3 사용자 정의 확장 필드

```yaml
info:
  title: My API
  version: 1.0.0

  # 사용자 정의 확장 필드 (x- 접두사)
  x-logo:
    url: https://example.com/logo.png
    altText: Company Logo
  x-api-category: e-commerce
  x-audience: external
  x-maturity: stable
```

### 2.4 실무 예시

```yaml
info:
  title: 쇼핑몰 API
  version: 3.2.1
  summary: 온라인 쇼핑몰을 위한 RESTful API
  description: |
    ## 개요
    이 API는 온라인 쇼핑몰의 모든 기능을 제공합니다.

    ## 인증
    - **JWT Bearer Token**: 대부분의 API에서 사용
    - **API Key**: 공개 API에서 사용

    ## 요청 제한
    - 인증된 사용자: 시간당 1000회
    - 비인증 사용자: 시간당 100회

    ## 지원 형식
    - JSON (기본)
    - XML (일부 API)

    ## 버전 정책
    - 메이저 버전은 URL에 포함 (/api/v3/)
    - 마이너 버전은 헤더로 지정 가능

  contact:
    name: 개발팀
    email: dev-team@myshop.com
    url: https://myshop.com/dev-support

  license:
    name: Proprietary
    url: https://myshop.com/license

  termsOfService: https://myshop.com/terms

  x-logo:
    url: https://myshop.com/assets/api-logo.png
    backgroundColor: "#FFFFFF"
  x-api-id: myshop-api-v3
  x-lifecycle-stage: production
```

## 3. Servers

Servers 배열은 API가 제공되는 서버들을 정의합니다.

### 3.1 기본 서버 설정

```yaml
servers:
  # 프로덕션 서버
  - url: https://api.example.com/v3
    description: 프로덕션 환경

  # 스테이징 서버
  - url: https://staging-api.example.com/v3
    description: 스테이징 환경

  # 개발 서버
  - url: http://localhost:3000/api/v3
    description: 로컬 개발 환경
```

### 3.2 서버 변수 활용

```yaml
servers:
  # URL 변수 사용
  - url: https://{environment}.api.example.com/{version}
    description: 환경별 API 서버
    variables:
      environment:
        default: prod
        enum: [prod, staging, dev]
        description: 배포 환경
      version:
        default: v3
        enum: [v1, v2, v3]
        description: API 버전

  # 포트 변수
  - url: http://localhost:{port}/api
    description: 로컬 개발 서버
    variables:
      port:
        default: "3000"
        enum: ["3000", "8080", "8000"]
        description: 서버 포트
```

### 3.3 지역별 서버 설정

```yaml
servers:
  # 글로벌 서버
  - url: https://api.example.com
    description: 글로벌 API 서버

  # 지역별 서버
  - url: https://{region}.api.example.com
    description: 지역별 API 서버
    variables:
      region:
        default: us-east-1
        enum:
          - us-east-1 # 미국 동부
          - us-west-2 # 미국 서부
          - eu-west-1 # 유럽 서부
          - ap-northeast-2 # 아시아 태평양 (서울)
          - ap-southeast-1 # 아시아 태평양 (싱가포르)
        description: AWS 리전 코드
```

### 3.4 실무 서버 설정 예시

```yaml
servers:
  # 프로덕션 (다중 리전)
  - url: https://api.myshop.com/v3
    description: 프로덕션 - 글로벌 (CDN)

  - url: https://us-api.myshop.com/v3
    description: 프로덕션 - 미국

  - url: https://kr-api.myshop.com/v3
    description: 프로덕션 - 한국

  # 스테이징
  - url: https://staging-api.myshop.com/v3
    description: 스테이징 환경 (QA 테스트용)

  # 개발
  - url: https://dev-api.myshop.com/v3
    description: 개발 환경 (내부 테스트용)

  # 로컬
  - url: http://localhost:{port}/api/v3
    description: 로컬 개발 환경
    variables:
      port:
        default: "3000"
        enum: ["3000", "3001", "8080"]
        description: 로컬 서버 포트

  # 모의 서버 (Mock)
  - url: https://mock-api.myshop.com/v3
    description: 모의 서버 (프론트엔드 개발용)
```

### 3.5 서버별 특성 정의

```yaml
servers:
  - url: https://api.example.com
    description: 프로덕션 환경
    x-environment: production
    x-rate-limit: 1000
    x-features:
      - real-time-data
      - full-functionality
      - sla-guaranteed
    x-region: global

  - url: https://staging-api.example.com
    description: 스테이징 환경
    x-environment: staging
    x-rate-limit: 500
    x-features:
      - test-data
      - full-functionality
      - no-sla
    x-region: us-east-1
    x-notes: |
      스테이징 환경은 테스트 데이터를 사용합니다.
      실제 결제나 이메일 발송이 이루어지지 않습니다.

  - url: http://localhost:3000
    description: 로컬 개발 환경
    x-environment: development
    x-rate-limit: 0 # 무제한
    x-features:
      - mock-data
      - debug-mode
      - hot-reload
    x-requirements:
      - Node.js 18+
      - PostgreSQL 14+
      - Redis 6+
```

---

**다음 Part에서 계속...**

- Part 2: Paths와 Operations
- Part 3: Components (Schemas, Parameters, Responses)
- Part 4: Security와 고급 기능

# OpenAPI Specification (OAS) 3.0 구조 가이드 - Part 2: Paths와 Operations

## 📋 목차

- [1. Paths 기본 구조](#1-paths-기본-구조)
- [2. HTTP Methods](#2-http-methods)
- [3. Parameters](#3-parameters)
- [4. Request Body](#4-request-body)
- [5. Responses](#5-responses)

## 1. Paths 기본 구조

Paths 객체는 API의 모든 엔드포인트를 정의합니다.

### 1.1 기본 경로 정의

```yaml
paths:
  # 단순 경로
  /users:
    get:
      summary: 사용자 목록 조회
      responses:
        "200":
          description: 성공
    post:
      summary: 사용자 생성
      responses:
        "201":
          description: 생성됨

  # 경로 매개변수 포함
  /users/{userId}:
    get:
      summary: 사용자 상세 조회
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: 성공

  # 중첩된 리소스
  /users/{userId}/orders:
    get:
      summary: 사용자의 주문 목록
      responses:
        "200":
          description: 성공
```

### 1.2 경로 레벨 매개변수

```yaml
paths:
  /users/{userId}:
    # 경로 레벨에서 공통 매개변수 정의
    parameters:
      - name: userId
        in: path
        required: true
        description: 사용자 고유 ID
        schema:
          type: integer
          format: int64
          minimum: 1
          example: 123
      - name: Accept-Language
        in: header
        required: false
        description: 선호 언어
        schema:
          type: string
          default: ko-KR
          example: ko-KR,en-US;q=0.9

    get:
      summary: 사용자 조회
      responses:
        "200":
          description: 성공

    patch:
      summary: 사용자 수정
      responses:
        "200":
          description: 수정 성공

    delete:
      summary: 사용자 삭제
      responses:
        "204":
          description: 삭제 성공
```

## 2. HTTP Methods

각 HTTP 메서드별 상세 정의 방법입니다.

### 2.1 GET Operation

```yaml
paths:
  /users:
    get:
      tags: [Users] # API 그룹화
      summary: 사용자 목록 조회 # 짧은 요약
      description: | # 상세 설명
        사용자 목록을 페이지네이션과 함께 조회합니다.

        ## 권한
        - 일반 사용자: 자신의 정보만 조회 가능
        - 관리자: 모든 사용자 정보 조회 가능

        ## 필터링
        다양한 쿼리 매개변수로 결과를 필터링할 수 있습니다.

      operationId: getUsers # 유니크한 오퍼레이션 ID

      parameters:
        - name: page
          in: query
          required: false
          description: 페이지 번호 (1부터 시작)
          schema:
            type: integer
            minimum: 1
            default: 1
            example: 1
        - name: limit
          in: query
          required: false
          description: 페이지당 항목 수
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 10
            example: 10
        - name: search
          in: query
          required: false
          description: 이름 또는 이메일 검색 (부분 일치)
          schema:
            type: string
            minLength: 2
            example: 홍길동
        - name: status
          in: query
          required: false
          description: 계정 상태 필터
          schema:
            type: string
            enum: [active, inactive, pending, suspended]
            example: active
        - name: sortBy
          in: query
          required: false
          description: 정렬 기준 필드
          schema:
            type: string
            enum: [id, name, email, createdAt, updatedAt]
            default: createdAt
            example: createdAt
        - name: sortOrder
          in: query
          required: false
          description: 정렬 순서
          schema:
            type: string
            enum: [asc, desc]
            default: desc
            example: desc

      responses:
        "200":
          description: 사용자 목록 조회 성공
          headers:
            X-Total-Count:
              description: 전체 사용자 수
              schema:
                type: integer
                example: 150
            X-Rate-Limit-Remaining:
              description: 남은 요청 수
              schema:
                type: integer
                example: 99
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: integer
                          example: 1
                        email:
                          type: string
                          example: user@example.com
                        name:
                          type: string
                          example: 홍길동
                        status:
                          type: string
                          example: active
                  total:
                    type: integer
                    example: 150
              examples:
                success_response:
                  summary: 성공 응답 예시
                  value:
                    data:
                      - id: 1
                        email: john@example.com
                        name: 홍길동
                        status: active
                      - id: 2
                        email: jane@example.com
                        name: 김영희
                        status: pending
                    total: 150
                    page: 1
                    limit: 10
        "400":
          description: 잘못된 요청 매개변수
        "401":
          description: 인증 실패
        "403":
          description: 권한 부족

      security:
        - bearerAuth: []

      # 사용자 정의 확장
      x-rate-limit: 100
      x-cache-ttl: 300
```

### 2.2 POST Operation

```yaml
paths:
  /users:
    post:
      tags: [Users]
      summary: 새 사용자 생성
      description: |
        새로운 사용자 계정을 생성합니다.

        ## 제약사항
        - 이메일은 고유해야 합니다
        - 비밀번호는 8자 이상이어야 합니다
        - 한국 전화번호 형식만 지원합니다

      operationId: createUser

      requestBody:
        required: true
        description: 생성할 사용자 정보
        content:
          application/json:
            schema:
              type: object
              required: [email, name, password]
              properties:
                email:
                  type: string
                  format: email
                  description: 사용자 이메일 (로그인 ID)
                  example: user@example.com
                  maxLength: 255
                name:
                  type: string
                  description: 사용자 이름
                  example: 홍길동
                  minLength: 2
                  maxLength: 50
                password:
                  type: string
                  format: password
                  description: 비밀번호 (8자 이상, 영문+숫자+특수문자)
                  example: password123!
                  minLength: 8
                  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]'
                phoneNumber:
                  type: string
                  description: 전화번호 (선택사항)
                  example: 010-1234-5678
                  pattern: '^010-\d{4}-\d{4}$'
                agreeToTerms:
                  type: boolean
                  description: 약관 동의 (필수)
                  example: true
              additionalProperties: false
            examples:
              basic_user:
                summary: 기본 사용자
                description: 일반적인 사용자 생성 예시
                value:
                  email: user@example.com
                  name: 홍길동
                  password: password123!
                  phoneNumber: 010-1234-5678
                  agreeToTerms: true
              minimal_user:
                summary: 최소 정보 사용자
                description: 필수 정보만 포함한 사용자
                value:
                  email: minimal@example.com
                  name: 최소정보
                  password: simple123!
                  agreeToTerms: true

          # 다중 컨텐츠 타입 지원
          application/xml:
            schema:
              type: object
              xml:
                name: CreateUserRequest
              properties:
                email:
                  type: string
                  xml:
                    attribute: false
                name:
                  type: string

          # 폼 데이터 지원
          application/x-www-form-urlencoded:
            schema:
              type: object
              properties:
                email:
                  type: string
                name:
                  type: string
                password:
                  type: string

      responses:
        "201":
          description: 사용자 생성 성공
          headers:
            Location:
              description: 생성된 사용자 리소스 URL
              schema:
                type: string
                format: uri
                example: /users/123
            X-Request-ID:
              description: 요청 추적 ID
              schema:
                type: string
                example: req-123456
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    example: 123
                  email:
                    type: string
                    example: user@example.com
                  name:
                    type: string
                    example: 홍길동
                  status:
                    type: string
                    example: pending
                  createdAt:
                    type: string
                    format: date-time
                    example: "2024-01-01T00:00:00Z"

        "400":
          description: 입력 데이터 검증 실패
          content:
            application/json:
              schema:
                type: object
                properties:
                  statusCode:
                    type: integer
                    example: 400
                  message:
                    type: array
                    items:
                      type: string
                    example: [이메일은 필수입니다, 비밀번호는 8자 이상이어야 합니다]
                  error:
                    type: string
                    example: Unprocessable Entity

      security:
        - bearerAuth: []
```

### 2.4 DELETE Operation

```yaml
paths:
  /users/{userId}:
    delete:
      tags: [Users]
      summary: 사용자 삭제
      description: |
        사용자를 시스템에서 완전히 삭제합니다.

        ## 주의사항
        - 삭제된 데이터는 복구할 수 없습니다
        - 연관된 주문 데이터가 있으면 삭제할 수 없습니다
        - 관리자 권한이 필요합니다

      operationId: deleteUser

      parameters:
        - name: userId
          in: path
          required: true
          description: 삭제할 사용자 ID
          schema:
            type: integer
            minimum: 1
            example: 123
        - name: force
          in: query
          required: false
          description: 강제 삭제 여부 (연관 데이터도 함께 삭제)
          schema:
            type: boolean
            default: false
            example: false

      responses:
        "204":
          description: 삭제 성공 (응답 본문 없음)
          headers:
            X-Deleted-At:
              description: 삭제 수행 시각
              schema:
                type: string
                format: date-time
                example: "2024-01-15T10:30:00Z"

        "404":
          description: 사용자를 찾을 수 없음

        "409":
          description: 삭제할 수 없음 (연관 데이터 존재)
          content:
            application/json:
              schema:
                type: object
                properties:
                  statusCode:
                    type: integer
                    example: 409
                  message:
                    type: string
                    example: 사용자에게 연관된 주문이 존재하여 삭제할 수 없습니다
                  error:
                    type: string
                    example: Conflict
                  relatedResources:
                    type: array
                    description: 연관된 리소스 목록
                    items:
                      type: object
                      properties:
                        type:
                          type: string
                          example: orders
                        count:
                          type: integer
                          example: 5
                    example:
                      - type: orders
                        count: 5
                      - type: reviews
                        count: 12

      security:
        - bearerAuth: [admin]
```

## 3. Parameters

다양한 종류의 매개변수 정의 방법입니다.

### 3.1 경로 매개변수 (Path Parameters)

```yaml
parameters:
  - name: userId
    in: path
    required: true # 경로 매개변수는 항상 required: true
    description: 사용자 고유 ID
    schema:
      type: integer
      format: int64
      minimum: 1
      example: 123
    style: simple # 기본값
    explode: false # 기본값

  - name: version
    in: path
    required: true
    description: API 버전
    schema:
      type: string
      enum: [v1, v2, v3]
      example: v2
```

### 3.2 쿼리 매개변수 (Query Parameters)

```yaml
parameters:
  # 단순 쿼리 매개변수
  - name: search
    in: query
    required: false
    description: 검색어
    schema:
      type: string
      minLength: 2
      maxLength: 100
      example: 홍길동

  # 배열 매개변수
  - name: tags
    in: query
    required: false
    description: 태그 목록
    schema:
      type: array
      items:
        type: string
      example: [javascript, nodejs, api]
    style: form # ?tags=js,node,api
    explode: false

  # 배열 매개변수 (exploded)
  - name: categories
    in: query
    required: false
    description: 카테고리 목록
    schema:
      type: array
      items:
        type: string
      example: [electronics, books]
    style: form # ?categories=electronics&categories=books
    explode: true

  # 객체 매개변수
  - name: filter
    in: query
    required: false
    description: 필터 조건
    content:
      application/json:
        schema:
          type: object
          properties:
            status:
              type: string
              enum: [active, inactive]
            minAge:
              type: integer
              minimum: 1
            maxAge:
              type: integer
              maximum: 120
          example:
            status: active
            minAge: 18
            maxAge: 65
```

### 3.3 헤더 매개변수 (Header Parameters)

```yaml
parameters:
  # 인증 헤더
  - name: Authorization
    in: header
    required: true
    description: Bearer JWT 토큰
    schema:
      type: string
      pattern: '^Bearer [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*
                    example: Bad Request
              examples:
                validation_error:
                  summary: 유효성 검사 실패
                  value:
                    statusCode: 400
                    message: [이메일 형식이 올바르지 않습니다, 약관 동의는 필수입니다]
                    error: Validation Error

        '409':
          description: 이메일 중복
          content:
            application/json:
              schema:
                type: object
                properties:
                  statusCode:
                    type: integer
                    example: 409
                  message:
                    type: string
                    example: 이미 존재하는 이메일입니다
                  error:
                    type: string
                    example: Conflict

      security:
        - bearerAuth: [admin]  # 관리자만 사용자 생성 가능

      # 콜백 정의 (웹훅)
      callbacks:
        userCreated:
          '{$request.body#/webhookUrl}':
            post:
              summary: 사용자 생성 웹훅
              requestBody:
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        event:
                          type: string
                          example: user.created
                        data:
                          type: object
                          properties:
                            userId:
                              type: integer
                            email:
                              type: string
              responses:
                '200':
                  description: 웹훅 수신 확인
```

### 2.3 PATCH Operation

```yaml
paths:
  /users/{userId}:
    patch:
      tags: [Users]
      summary: 사용자 정보 수정
      description: |
        사용자 정보를 부분적으로 수정합니다.

        ## 수정 가능한 필드
        - name: 사용자 이름
        - phoneNumber: 전화번호
        - status: 계정 상태 (관리자만)

        ## 수정 불가능한 필드
        - email: 이메일 변경은 별도 API 사용
        - password: 비밀번호 변경은 별도 API 사용

      operationId: updateUser

      parameters:
        - name: userId
          in: path
          required: true
          description: 수정할 사용자 ID
          schema:
            type: integer
            minimum: 1
            example: 123

      requestBody:
        required: true
        description: 수정할 필드들 (부분 업데이트)
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  description: 사용자 이름
                  minLength: 2
                  maxLength: 50
                  example: 김철수
                phoneNumber:
                  type: string
                  description: 전화번호
                  pattern: '^010-\d{4}-\d{4}$'
                  example: 010-9876-5432
                  nullable: true
                status:
                  type: string
                  description: 계정 상태 (관리자만 수정 가능)
                  enum: [active, inactive, suspended]
                  example: active
              minProperties: 1              # 최소 1개 필드 필요
              additionalProperties: false
            examples:
              name_update:
                summary: 이름만 변경
                value:
                  name: 새로운이름
              phone_update:
                summary: 전화번호만 변경
                value:
                  phoneNumber: 010-1111-2222
              multiple_update:
                summary: 여러 필드 동시 변경
                value:
                  name: 김영수
                  phoneNumber: 010-3333-4444
              admin_status_update:
                summary: 관리자 - 상태 변경
                value:
                  status: suspended

          # JSON Patch 지원
          application/json-patch+json:
            schema:
              type: array
              items:
                type: object
                required: [op, path]
                properties:
                  op:
                    type: string
                    enum: [add, remove, replace, move, copy, test]
                    description: 수행할 작업
                  path:
                    type: string
                    description: 대상 경로
                    example: /name
                  value:
                    description: 설정할 값 (add, replace, test에서 사용)
                  from:
                    type: string
                    description: 소스 경로 (move, copy에서 사용)
            examples:
              name_replace:
                summary: 이름 교체
                value:
                  - op: replace
                    path: /name
                    value: 새로운이름
              phone_add:
                summary: 전화번호 추가
                value:
                  - op: add
                    path: /phoneNumber
                    value: 010-1234-5678

      responses:
        '200':
          description: 수정 성공
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    example: 123
                  email:
                    type: string
                    example: user@example.com
                  name:
                    type: string
                    example: 김철수
                  phoneNumber:
                    type: string
                    example: 010-9876-5432
                    nullable: true
                  status:
                    type: string
                    example: active
                  updatedAt:
                    type: string
                    format: date-time
                    example: "2024-01-15T10:30:00Z"

        '400':
          description: 잘못된 입력 데이터
        '403':
          description: 수정 권한 없음 (다른 사용자 정보 수정 시도)
        '404':
          description: 사용자를 찾을 수 없음
        '422':
          description: 수정할 수 없는 필드 포함
          content:
            application/json:
              schema:
                type: object
                properties:
                  statusCode:
                    type: integer
                    example: 422
                  message:
                    type: string
                    example: 이메일은 이 API로 수정할 수 없습니다
                  error:
                    type: string
      example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

  # 언어 설정
  - name: Accept-Language
    in: header
    required: false
    description: 선호 언어
    schema:
      type: string
      default: ko-KR
      example: ko-KR,en-US;q=0.9

  # API 버전
  - name: X-API-Version
    in: header
    required: false
    description: 사용할 API 버전
    schema:
      type: string
      enum: [v1, v2, v3]
      default: v3
      example: v2

  # 클라이언트 정보
  - name: User-Agent
    in: header
    required: false
    description: 클라이언트 정보
    schema:
      type: string
      example: MyApp/1.0.0 (iOS 15.0; iPhone13,2)
```

### 3.4 쿠키 매개변수 (Cookie Parameters)

```yaml
parameters:
  # 세션 쿠키
  - name: sessionId
    in: cookie
    required: false
    description: 세션 식별자
    schema:
      type: string
      example: abc123def456

  # 설정 쿠키
  - name: preferences
    in: cookie
    required: false
    description: 사용자 설정
    content:
      application/json:
        schema:
          type: object
          properties:
            theme:
              type: string
              enum: [light, dark]
            language:
              type: string
              enum: [ko, en, ja]
          example:
            theme: dark
            language: ko
```

## 4. Request Body

요청 본문의 다양한 정의 방법입니다.

### 4.1 JSON 요청 본문

```yaml
requestBody:
  required: true
  description: 생성할 사용자 정보
  content:
    application/json:
      schema:
        type: object
        required: [email, name, password]
        properties:
          email:
            type: string
            format: email
            description: 사용자 이메일
            example: user@example.com
          name:
            type: string
            description: 사용자 이름
            minLength: 2
            maxLength: 50
            example: 홍길동
          password:
            type: string
            format: password
            description: 비밀번호
            minLength: 8
            example: password123!
        additionalProperties: false
      examples:
        basic_user:
          summary: 기본 사용자
          value:
            email: user@example.com
            name: 홍길동
            password: password123!
        admin_user:
          summary: 관리자 사용자
          value:
            email: admin@example.com
            name: 관리자
            password: admin123!
```

### 4.2 파일 업로드

```yaml
requestBody:
  required: true
  description: 파일 업로드
  content:
    # 단일 파일 업로드
    multipart/form-data:
      schema:
        type: object
        properties:
          file:
            type: string
            format: binary
            description: 업로드할 파일
          description:
            type: string
            description: 파일 설명
            example: 프로필 이미지
          category:
            type: string
            enum: [profile, document, image]
            description: 파일 카테고리
            example: profile
        required: [file]
      encoding:
        file:
          contentType: image/png, image/jpeg, image/gif
          headers:
            X-File-Type:
              schema:
                type: string
                enum: [profile, thumbnail]

    # 다중 파일 업로드
    multipart/form-data:
      schema:
        type: object
        properties:
          files:
            type: array
            items:
              type: string
              format: binary
            description: 업로드할 파일들
            maxItems: 5
          metadata:
            type: object
            properties:
              albumName:
                type: string
                example: 여행 사진
              tags:
                type: array
                items:
                  type: string
                example: [여행, 제주도, 2024]
```

### 4.3 다중 콘텐츠 타입

```yaml
requestBody:
  required: true
  description: 사용자 데이터 (다양한 형식 지원)
  content:
    # JSON 형식
    application/json:
      schema:
        $ref: "#/components/schemas/CreateUserRequest"
      examples:
        example1:
          value:
            email: user@example.com
            name: 홍길동

    # XML 형식
    application/xml:
      schema:
        type: object
        xml:
          name: CreateUserRequest
        properties:
          email:
            type: string
            xml:
              attribute: false
          name:
            type: string
            xml:
              wrapped: false
      example: |
        <?xml version="1.0" encoding="UTF-8"?>
        <CreateUserRequest>
          <email>user@example.com</email>
          <name>홍길동</name>
        </CreateUserRequest>

    # 폼 데이터 형식
    application/x-www-form-urlencoded:
      schema:
        type: object
        properties:
          email:
            type: string
            format: email
          name:
            type: string
          password:
            type: string
            format: password
      example:
        email: user@example.com
        name: 홍길동
        password: password123!

    # 텍스트 형식
    text/plain:
      schema:
        type: string
        example: |
          이메일: user@example.com
          이름: 홍길동
          비밀번호: password123!
```

## 5. Responses

응답의 다양한 정의 방법입니다.

### 5.1 성공 응답

```yaml
responses:
  "200":
    description: 사용자 조회 성공
    headers:
      X-Total-Count:
        description: 전체 사용자 수
        schema:
          type: integer
          example: 150
      X-Rate-Limit-Remaining:
        description: 남은 요청 수
        schema:
          type: integer
          example: 99
      Cache-Control:
        description: 캐시 제어
        schema:
          type: string
          example: public, max-age=300
      ETag:
        description: 엔티티 태그
        schema:
          type: string
          example: '"33a64df551425fcc55e4d42a148795d9f25f89d4"'
    content:
      application/json:
        schema:
          type: object
          properties:
            id:
              type: integer
              example: 123
            email:
              type: string
              example: user@example.com
            name:
              type: string
              example: 홍길동
            status:
              type: string
              example: active
            createdAt:
              type: string
              format: date-time
              example: "2024-01-01T00:00:00Z"
        examples:
          active_user:
            summary: 활성 사용자
            value:
              id: 123
              email: user@example.com
              name: 홍길동
              status: active
              createdAt: "2024-01-01T00:00:00Z"
          pending_user:
            summary: 대기 중인 사용자
            value:
              id: 124
              email: pending@example.com
              name: 대기자
              status: pending
              createdAt: "2024-01-02T00:00:00Z"

      application/xml:
        schema:
          type: object
          xml:
            name: User
          properties:
            id:
              type: integer
              xml:
                attribute: true
            email:
              type: string
            name:
              type: string
        example: |
          <?xml version="1.0" encoding="UTF-8"?>
          <User id="123">
            <email>user@example.com</email>
            <name>홍길동</name>
          </User>
```

### 5.2 에러 응답

```yaml
responses:
  "400":
    description: 잘못된 요청
    content:
      application/json:
        schema:
          type: object
          properties:
            statusCode:
              type: integer
              example: 400
            message:
              oneOf:
                - type: string
                - type: array
                  items:
                    type: string
              example: 잘못된 요청입니다
            error:
              type: string
              example: Bad Request
            timestamp:
              type: string
              format: date-time
              example: "2024-01-01T00:00:00Z"
            path:
              type: string
              example: /users
            requestId:
              type: string
              example: req-123456
        examples:
          generic_error:
            summary: 일반적인 잘못된 요청
            value:
              statusCode: 400
              message: 잘못된 요청입니다
              error: Bad Request
              timestamp: "2024-01-01T00:00:00Z"
              path: /users
              requestId: req-123456
          validation_error:
            summary: 유효성 검사 실패
            value:
              statusCode: 400
              message: [이메일은 필수입니다, 비밀번호는 8자 이상이어야 합니다]
              error: Validation Error
              timestamp: "2024-01-01T00:00:00Z"
              path: /users
              requestId: req-123456

  "401":
    description: 인증 실패
    headers:
      WWW-Authenticate:
        description: 인증 방법 안내
        schema:
          type: string
          example: Bearer realm="api"
    content:
      application/json:
        schema:
          type: object
          properties:
            statusCode:
              type: integer
              example: 401
            message:
              type: string
              example: 유효하지 않은 토큰입니다
            error:
              type: string
              example: Unauthorized
        examples:
          invalid_token:
            summary: 유효하지 않은 토큰
            value:
              statusCode: 401
              message: 유효하지 않은 토큰입니다
              error: Unauthorized
          expired_token:
            summary: 만료된 토큰
            value:
              statusCode: 401
              message: 토큰이 만료되었습니다
              error: Token Expired
```

### 5.3 다양한 상태 코드

```yaml
responses:
  "200":
    description: 성공 (조회, 수정)
  "201":
    description: 생성 성공
    headers:
      Location:
        description: 생성된 리소스 URL
        schema:
          type: string
          format: uri
          example: /users/123
  "204":
    description: 성공 (삭제, 응답 본문 없음)
  "304":
    description: 수정되지 않음 (캐시 유효)
    headers:
      ETag:
        schema:
          type: string
      Last-Modified:
        schema:
          type: string
          format: date-time
  "400":
    description: 잘못된 요청
  "401":
    description: 인증 실패
  "403":
    description: 권한 부족
  "404":
    description: 리소스를 찾을 수 없음
  "405":
    description: 허용되지 않은 메서드
  "409":
    description: 리소스 충돌
  "422":
    description: 처리할 수 없는 엔티티
  "429":
    description: 요청 한도 초과
    headers:
      X-RateLimit-Limit:
        schema:
          type: integer
      X-RateLimit-Remaining:
        schema:
          type: integer
      X-RateLimit-Reset:
        schema:
          type: integer
      Retry-After:
        schema:
          type: integer
  "500":
    description: 서버 내부 오류
  "502":
    description: 잘못된 게이트웨이
  "503":
    description: 서비스 이용 불가
    headers:
      Retry-After:
        schema:
          type: integer
  "504":
    description: 게이트웨이 시간 초과
```

---

**다음 Part에서 계속...**

- Part 3: Components (Schemas, Parameters, Responses)
- Part 4: Security와 고급 기능
  example: Bad Request
  examples:
  validation_error:
  summary: 유효성 검사 실패
  value:
  statusCode: 400
  message: [이메일 형식이 올바르지 않습니다, 약관 동의는 필수입니다]
  error: Validation Error
  '409':
  description: 이메일 중복
  content:
  application/json:
  schema:
  type: object
  properties:
  statusCode:
  type: integer
  example: 409
  message:
  type: string
  example: 이미 존재하는 이메일입니다
  error:
  type: string
  example: Conflict

      security:
        - bearerAuth: [admin]  # 관리자만 사용자 생성 가능

      # 콜백 정의 (웹훅)
      callbacks:
        userCreated:
          '{$request.body#/webhookUrl}':
            post:
              summary: 사용자 생성 웹훅
              requestBody:
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        event:
                          type: string
                          example: user.created
                        data:
                          type: object
                          properties:
                            userId:
                              type: integer
                            email:
                              type: string
              responses:
                '200':
                  description: 웹훅 수신 확인

````

### 2.3 PATCH Operation

```yaml
paths:
  /users/{userId}:
    patch:
      tags: [Users]
      summary: 사용자 정보 수정
      description: |
        사용자 정보를 부분적으로 수정합니다.

        ## 수정 가능한 필드
        - name: 사용자 이름
        - phoneNumber: 전화번호
        - status: 계정 상태 (관리자만)

        ## 수정 불가능한 필드
        - email: 이메일 변경은 별도 API 사용
        - password: 비밀번호 변경은 별도 API 사용

      operationId: updateUser

      parameters:
        - name: userId
          in: path
          required: true
          description: 수정할 사용자 ID
          schema:
            type: integer
            minimum: 1
            example: 123

      requestBody:
        required: true
        description: 수정할 필드들 (부분 업데이트)
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  description: 사용자 이름
                  minLength: 2
                  maxLength: 50
                  example: 김철수
                phoneNumber:
                  type: string
                  description: 전화번호
                  pattern: '^010-\d{4}-\d{4}$'
                  example: 010-9876-5432
                  nullable: true
                status:
                  type: string
                  description: 계정 상태 (관리자만 수정 가능)
                  enum: [active, inactive, suspended]
                  example: active
              minProperties: 1              # 최소 1개 필드 필요
              additionalProperties: false
            examples:
              name_update:
                summary: 이름만 변경
                value:
                  name: 새로운이름
              phone_update:
                summary: 전화번호만 변경
                value:
                  phoneNumber: 010-1111-2222
              multiple_update:
                summary: 여러 필드 동시 변경
                value:
                  name: 김영수
                  phoneNumber: 010-3333-4444
              admin_status_update:
                summary: 관리자 - 상태 변경
                value:
                  status: suspended

          # JSON Patch 지원
          application/json-patch+json:
            schema:
              type: array
              items:
                type: object
                required: [op, path]
                properties:
                  op:
                    type: string
                    enum: [add, remove, replace, move, copy, test]
                    description: 수행할 작업
                  path:
                    type: string
                    description: 대상 경로
                    example: /name
                  value:
                    description: 설정할 값 (add, replace, test에서 사용)
                  from:
                    type: string
                    description: 소스 경로 (move, copy에서 사용)
            examples:
              name_replace:
                summary: 이름 교체
                value:
                  - op: replace
                    path: /name
                    value: 새로운이름
              phone_add:
                summary: 전화번호 추가
                value:
                  - op: add
                    path: /phoneNumber
                    value: 010-1234-5678

      responses:
        '200':
          description: 수정 성공
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    example: 123
                  email:
                    type: string
                    example: user@example.com
                  name:
                    type: string
                    example: 김철수
                  phoneNumber:
                    type: string
                    example: 010-9876-5432
                    nullable: true
                  status:
                    type: string
                    example: active
                  updatedAt:
                    type: string
                    format: date-time
                    example: "2024-01-15T10:30:00Z"

        '400':
          description: 잘못된 입력 데이터
        '403':
          description: 수정 권한 없음 (다른 사용자 정보 수정 시도)
        '404':
          description: 사용자를 찾을 수 없음
        '422':
          description: 수정할 수 없는 필드 포함
          content:
            application/json:
              schema:
                type: object
                properties:
                  statusCode:
                    type: integer
                    example: 422
                  message:
                    type: string
                    example: 이메일은 이 API로 수정할 수 없습니다
                  error:
                    type: string

                    # anyOf - 여러 조건 중 하나 이상 (유연한 조합)
    SearchFilter:
      anyOf:
        - type: object
          properties:
            keyword:
              type: string
              minLength: 1
              example: 검색어
        - type: object
          properties:
            category:
              type: string
              enum: [electronics, books, clothing]
              example: electronics
        - type: object
          properties:
            priceRange:
              type: object
              properties:
                min:
                  type: number
                  minimum: 0
                  example: 10.00
                max:
                  type: number
                  minimum: 0
                  example: 100.00
      description: 검색 필터 (키워드, 카테고리, 가격대 중 하나 이상 지정)
````

### 1.4 조건부 스키마 (Conditional Schema)

````yaml
components:
  schemas:
    # if-then-else 조건부 스키마
    Account:
      type: object
      properties:
        accountType:
          type: string
          enum: [personal, business]
          description: 계정 유형
        name:
          type: string
          description: 이름
        email:
          type: string
          format: email
          description: 이메일
      required: [accountType, name, email]

      # 비즈니스 계정인 경우 추가 필드 필요
      if:
        properties:
          accountType:
            const: business
      then:
        properties:
          companyName:
            type: string
            minLength: 1
            description: 회사명
          businessNumber:
            type: string
            pattern: '^\d{3}-\d{2}-\d{5}# OpenAPI Specification (OAS) 3.0 구조 가이드 - Part 3: Components

## 📋 목차
- [1. Schemas (데이터 모델)](#1-schemas-데이터-모델)
- [2. Parameters (재사용 매개변수)](#2-parameters-재사용-매개변수)
- [3. Responses (재사용 응답)](#3-responses-재사용-응답)
- [4. Request Bodies](#4-request-bodies)
- [5. Headers](#5-headers)

Components는 OpenAPI 문서에서 재사용 가능한 요소들을 정의하는 곳입니다.

## 1. Schemas (데이터 모델)

### 1.1 기본 스키마 타입

```yaml
components:
  schemas:
    # 문자열 타입
    UserName:
      type: string
      minLength: 2
      maxLength: 50
      pattern: '^[가-힣a-zA-Z\s]+$'
      example: 홍길동
      description: 사용자 이름 (한글, 영문, 공백만 허용)

    # 숫자 타입
    UserId:
      type: integer
      format: int64
      minimum: 1
      maximum: 9223372036854775807
      example: 123
      description: 사용자 고유 ID

    # 부울 타입
    IsActive:
      type: boolean
      example: true
      description: 활성화 상태

    # 배열 타입
    TagList:
      type: array
      items:
        type: string
        minLength: 1
        maxLength: 20
      minItems: 1
      maxItems: 10
      uniqueItems: true
      example: [javascript, nodejs, api]
      description: 태그 목록

    # 객체 타입
    Address:
      type: object
      required: [country, city]
      properties:
        country:
          type: string
          minLength: 2
          example: 대한민국
          description: 국가명
        city:
          type: string
          minLength: 1
          example: 서울특별시
          description: 도시명
        postalCode:
          type: string
          pattern: '^\d{5}$'
          example: 12345
          description: 우편번호 (5자리 숫자)
        street:
          type: string
          maxLength: 200
          example: 강남구 테헤란로 123
          description: 상세 주소
      additionalProperties: false
      description: 주소 정보
````

### 1.2 복합 스키마

```yaml
components:
  schemas:
    # 기본 사용자 스키마
    User:
      type: object
      title: 사용자 정보
      description: 시스템 사용자의 기본 정보
      required: [id, email, name, status, createdAt]
      properties:
        id:
          type: integer
          format: int64
          description: 사용자 고유 ID
          example: 123
          readOnly: true
          minimum: 1
        email:
          type: string
          format: email
          description: 사용자 이메일 주소 (로그인 ID)
          example: user@example.com
          maxLength: 255
          pattern: '^[^@]+@[^@]+\.[^@]+$'
        name:
          type: string
          description: 사용자 이름
          example: 홍길동
          minLength: 2
          maxLength: 50
        age:
          type: integer
          description: 사용자 나이
          example: 25
          minimum: 1
          maximum: 120
          nullable: true
        status:
          type: string
          description: 계정 상태
          enum: [active, inactive, pending, suspended]
          example: active
          default: pending
        roles:
          type: array
          description: 사용자 권한 목록
          items:
            type: string
            enum: [user, admin, moderator]
          example: [user]
          minItems: 1
          maxItems: 3
          uniqueItems: true
        profile:
          $ref: "#/components/schemas/UserProfile"
          description: 사용자 프로필 정보
        address:
          $ref: "#/components/schemas/Address"
          description: 주소 정보
          nullable: true
        metadata:
          type: object
          description: 추가 메타데이터
          additionalProperties: true
          example:
            lastLoginIp: "192.168.1.1"
            loginCount: 42
            preferences:
              theme: dark
              language: ko
        createdAt:
          type: string
          format: date-time
          description: 계정 생성일시
          example: "2024-01-01T00:00:00Z"
          readOnly: true
        updatedAt:
          type: string
          format: date-time
          description: 최종 수정일시
          example: "2024-01-15T10:30:00Z"
          readOnly: true
      additionalProperties: false
      example:
        id: 123
        email: user@example.com
        name: 홍길동
        age: 25
        status: active
        roles: [user]
        createdAt: "2024-01-01T00:00:00Z"
        updatedAt: "2024-01-15T10:30:00Z"

    # 중첩된 사용자 프로필
    UserProfile:
      type: object
      description: 사용자 프로필 정보
      properties:
        bio:
          type: string
          description: 자기소개
          maxLength: 500
          example: 안녕하세요, 개발자입니다.
          nullable: true
        avatar:
          type: string
          format: uri
          description: 프로필 이미지 URL
          example: https://example.com/avatars/user123.jpg
          nullable: true
        website:
          type: string
          format: uri
          description: 개인 웹사이트
          example: https://johndoe.com
          nullable: true
        socialLinks:
          type: object
          description: 소셜 미디어 링크
          properties:
            twitter:
              type: string
              format: uri
              example: https://twitter.com/johndoe
            github:
              type: string
              format: uri
              example: https://github.com/johndoe
            linkedin:
              type: string
              format: uri
              example: https://linkedin.com/in/johndoe
          additionalProperties:
            type: string
            format: uri
        preferences:
          type: object
          description: 사용자 설정
          properties:
            theme:
              type: string
              enum: [light, dark, auto]
              default: auto
              example: dark
            language:
              type: string
              enum: [ko, en, ja, zh]
              default: ko
              example: ko
            timezone:
              type: string
              example: Asia/Seoul
              default: Asia/Seoul
            notifications:
              type: object
              properties:
                email:
                  type: boolean
                  default: true
                  description: 이메일 알림 수신
                push:
                  type: boolean
                  default: true
                  description: 푸시 알림 수신
                sms:
                  type: boolean
                  default: false
                  description: SMS 알림 수신
          additionalProperties: false
      additionalProperties: false
```

### 1.3 상속과 조합 (allOf, oneOf, anyOf)

```yaml
components:
  schemas:
    # 기본 엔티티
    BaseEntity:
      type: object
      required: [id, createdAt, updatedAt]
      properties:
        id:
          type: integer
          format: int64
          description: 고유 ID
          example: 123
          readOnly: true
        createdAt:
          type: string
          format: date-time
          description: 생성일시
          example: "2024-01-01T00:00:00Z"
          readOnly: true
        updatedAt:
          type: string
          format: date-time
          description: 수정일시
          example: "2024-01-15T10:30:00Z"
          readOnly: true
        version:
          type: integer
          description: 버전 (낙관적 잠금용)
          example: 1
          readOnly: true

    # allOf - 상속 (모든 스키마 조합)
    User:
      allOf:
        - $ref: '#/components/schemas/BaseEntity'
        - type: object
          required: [email, name]
          properties:
            email:
              type: string
              format: email
              example: user@example.com
            name:
              type: string
              example: 홍길동
            status:
              type: string
              enum: [active, inactive, pending]
              example: active

    Product:
      allOf:
        - $ref: '#/components/schemas/BaseEntity'
        - type: object
          required: [name, price]
          properties:
            name:
              type: string
              example: 상품명
            price:
              type: number
              format: decimal
              example: 29.99
            category:
              type: string
              example: electronics

    # oneOf - 다형성 (하나만 선택)
    NotificationChannel:
      oneOf:
        - $ref: '#/components/schemas/EmailChannel'
        - $ref: '#/components/schemas/SmsChannel'
        - $ref: '#/components/schemas/PushChannel'
      discriminator:
        propertyName: type
        mapping:
          email: '#/components/schemas/EmailChannel'
          sms: '#/components/schemas/SmsChannel'
          push: '#/components/schemas/PushChannel'

    EmailChannel:
      type: object
      required: [type, address]
      properties:
        type:
          type: string
          enum: [email]
          example: email
        address:
          type: string
          format: email
          example: user@example.com
        verified:
          type: boolean
          example: true

    SmsChannel:
      type: object
      required: [type, phoneNumber]
      properties:
        type:
          type: string
          enum: [sms]
          example: sms
        phoneNumber:
          type: string
          pattern: '^010-\d{4}-\d{4}$'
          example: 010-1234-5678
        verified:
          type: boolean
          example: false

    PushChannel:
      type: object
      required: [type, deviceToken]
      properties:
        type:
          type: string
          enum: [push]
          example: push
        deviceToken:
          type: string
          example: abc123def456
        platform:
          type: string
          enum: [ios, android, web]
          example: ios

    # anyOf - 여러 조건 중 하나 이상 (유연한 조합)
    SearchFilter:
      anyOf:
        - type: object
          properties:
            keyword:
              type: string
              minLength: 1
              example: 검
            description: 사업자등록번호
            example: 123-45-67890
          taxId:
            type: string
            description: 세금 ID
        required: [companyName, businessNumber]

      # 개인 계정인 경우 다른 필드들
      else:
        properties:
          firstName:
            type: string
            minLength: 1
            description: 이름
          lastName:
            type: string
            minLength: 1
            description: 성
          birthDate:
            type: string
            format: date
            description: 생년월일
            example: "1990-01-01"
        required: [firstName, lastName]

      examples:
        - accountType: personal
          name: 홍길동
          email: hong@example.com
          firstName: 길동
          lastName: 홍
          birthDate: "1990-01-01"
        - accountType: business
          name: 테크 컴퍼니
          email: contact@techcompany.com
          companyName: 테크 컴퍼니 주식회사
          businessNumber: 123-45-67890
          taxId: T123456789
```

### 1.5 재귀 스키마 (Recursive Schema)

```yaml
components:
  schemas:
    # 트리 구조 (카테고리 등)
    Category:
      type: object
      required: [id, name]
      properties:
        id:
          type: integer
          example: 1
          description: 카테고리 ID
        name:
          type: string
          example: 전자제품
          description: 카테고리 이름
        description:
          type: string
          example: 전자제품 카테고리입니다
          description: 카테고리 설명
        parentId:
          type: integer
          nullable: true
          example: null
          description: 부모 카테고리 ID (최상위는 null)
        children:
          type: array
          items:
            $ref: "#/components/schemas/Category" # 자기 참조
          description: 하위 카테고리 목록
        level:
          type: integer
          minimum: 0
          example: 0
          description: 카테고리 깊이 (0이 최상위)
        path:
          type: string
          example: "/electronics"
          description: 카테고리 경로
        isActive:
          type: boolean
          example: true
          description: 활성화 상태
      example:
        id: 1
        name: 전자제품
        description: 전자제품 카테고리
        parentId: null
        level: 0
        path: "/electronics"
        isActive: true
        children:
          - id: 2
            name: 스마트폰
            description: 스마트폰 카테고리
            parentId: 1
            level: 1
            path: "/electronics/smartphones"
            isActive: true
            children:
              - id: 3
                name: 안드로이드
                description: 안드로이드 폰
                parentId: 2
                level: 2
                path: "/electronics/smartphones/android"
                isActive: true
                children: []

    # 댓글 시스템 (중첩 댓글)
    Comment:
      type: object
      required: [id, content, authorId, createdAt]
      properties:
        id:
          type: integer
          example: 1
          description: 댓글 ID
        content:
          type: string
          minLength: 1
          maxLength: 1000
          example: 좋은 글이네요!
          description: 댓글 내용
        authorId:
          type: integer
          example: 123
          description: 작성자 ID
        author:
          $ref: "#/components/schemas/User"
          description: 작성자 정보
        parentId:
          type: integer
          nullable: true
          example: null
          description: 부모 댓글 ID (답글인 경우)
        replies:
          type: array
          items:
            $ref: "#/components/schemas/Comment" # 자기 참조
          description: 답글 목록
        depth:
          type: integer
          minimum: 0
          example: 0
          description: 댓글 깊이 (0이 최상위)
        isDeleted:
          type: boolean
          default: false
          description: 삭제 여부
        createdAt:
          type: string
          format: date-time
          example: "2024-01-01T00:00:00Z"
        updatedAt:
          type: string
          format: date-time
          example: "2024-01-01T00:00:00Z"
          nullable: true
      example:
        id: 1
        content: 좋은 글이네요!
        authorId: 123
        parentId: null
        depth: 0
        isDeleted: false
        createdAt: "2024-01-01T00:00:00Z"
        replies:
          - id: 2
            content: 감사합니다!
            authorId: 456
            parentId: 1
            depth: 1
            isDeleted: false
            createdAt: "2024-01-01T01:00:00Z"
            replies: []
```

### 1.6 고급 스키마 패턴

```yaml
components:
  schemas:
    # 제네릭 응답 패턴
    ApiResponse:
      type: object
      required: [success, message, timestamp]
      properties:
        success:
          type: boolean
          description: 요청 성공 여부
          example: true
        message:
          type: string
          description: 응답 메시지
          example: 요청이 성공적으로 처리되었습니다
        data:
          description: 응답 데이터 (타입은 컨텍스트에 따라 결정)
        errors:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
                description: 에러 발생 필드
              code:
                type: string
                description: 에러 코드
              message:
                type: string
                description: 에러 메시지
          description: 에러 목록 (실패 시에만 포함)
        meta:
          type: object
          properties:
            timestamp:
              type: string
              format: date-time
              description: 응답 시간
            requestId:
              type: string
              description: 요청 추적 ID
              example: req-123456
            version:
              type: string
              description: API 버전
              example: v2.1.0
            took:
              type: integer
              description: 처리 시간 (밀리초)
              example: 45
          additionalProperties: true
      additionalProperties: false
      examples:
        - success: true
          message: 사용자 조회 완료
          data:
            id: 123
            name: 홍길동
          meta:
            timestamp: "2024-01-01T00:00:00Z"
            requestId: req-123456
            took: 45

    # 페이지네이션 응답 패턴
    PaginatedResponse:
      type: object
      required: [data, pagination]
      properties:
        data:
          type: array
          items: {} # 실제 사용 시 구체적 타입으로 대체
          description: 데이터 목록
        pagination:
          type: object
          required: [total, page, limit, totalPages, hasNext, hasPrev]
          properties:
            total:
              type: integer
              minimum: 0
              description: 전체 항목 수
              example: 150
            page:
              type: integer
              minimum: 1
              description: 현재 페이지
              example: 1
            limit:
              type: integer
              minimum: 1
              maximum: 100
              description: 페이지당 항목 수
              example: 10
            totalPages:
              type: integer
              minimum: 0
              description: 전체 페이지 수
              example: 15
            hasNext:
              type: boolean
              description: 다음 페이지 존재 여부
              example: true
            hasPrev:
              type: boolean
              description: 이전 페이지 존재 여부
              example: false
            nextPage:
              type: integer
              nullable: true
              description: 다음 페이지 번호
              example: 2
            prevPage:
              type: integer
              nullable: true
              description: 이전 페이지 번호
              example: null
        meta:
          type: object
          properties:
            sort:
              type: object
              properties:
                field:
                  type: string
                  example: createdAt
                order:
                  type: string
                  enum: [asc, desc]
                  example: desc
            filters:
              type: object
              description: 적용된 필터
              additionalProperties: true
              example:
                status: active
                category: electronics
            took:
              type: integer
              description: 쿼리 실행 시간 (밀리초)
              example: 23
          additionalProperties: true
      additionalProperties: false

    # 에러 응답 패턴
    ErrorResponse:
      type: object
      required: [statusCode, message, error, timestamp, path]
      properties:
        statusCode:
          type: integer
          description: HTTP 상태 코드
          example: 400
        message:
          oneOf:
            - type: string
            - type: array
              items:
                type: string
          description: 에러 메시지
          example: 잘못된 요청입니다
        error:
          type: string
          description: 에러 타입
          example: Bad Request
        code:
          type: string
          description: 애플리케이션 에러 코드
          example: VALIDATION_FAILED
        timestamp:
          type: string
          format: date-time
          description: 에러 발생 시각
          example: "2024-01-01T00:00:00Z"
        path:
          type: string
          description: 요청 경로
          example: /users
        method:
          type: string
          description: HTTP 메서드
          example: POST
        requestId:
          type: string
          description: 요청 추적 ID
          example: req-123456
        details:
          type: object
          description: 상세 에러 정보 (개발 환경에서만 포함)
          properties:
            validationErrors:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                    description: 에러 발생 필드
                    example: email
                  value:
                    description: 입력된 값
                    example: invalid-email
                  constraints:
                    type: object
                    description: 위반된 제약 조건
                    additionalProperties:
                      type: string
                    example:
                      isEmail: 올바른 이메일 형식을 입력해주세요
            stack:
              type: string
              description: 스택 트레이스 (개발 환경에서만)
          additionalProperties: true
        suggestions:
          type: array
          items:
            type: string
          description: 해결 방법 제안
          example: [올바른 이메일 형식으로 입력해주세요, API 문서를 참조해주세요]
      additionalProperties: false
      examples:
        - statusCode: 400
          message: 입력 데이터 검증에 실패했습니다
          error: Validation Error
          code: VALIDATION_FAILED
          timestamp: "2024-01-01T00:00:00Z"
          path: /users
          method: POST
          requestId: req-123456
          details:
            validationErrors:
              - field: email
                value: invalid-email
                constraints:
                  isEmail: 올바른 이메일 형식을 입력해주세요
```

## 2. Parameters (재사용 매개변수)

````yaml
components:
  parameters:
    # 공통 페이지네이션 매개변수
    PageParam:
      name: page
      in: query
      required: false
      description: |
        페이지 번호 (1부터 시작)

        - 최소값: 1
        - 기본값: 1
        - 존재하지 않는 페이지 요청 시 빈 결과 반환
      schema:
        type: integer
        minimum: 1
        default: 1
        example: 1
      style: form
      explode: false

    LimitParam:
      name: limit
      in: query
      required: false
      description: |
        페이지당 항목 수

        - 최소값: 1
        - 최대값: 100
        - 기본값: 10
        - 성능상 100개 초과 불가
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 10
        example: 10
      style: form
      explode: false

    # 정렬 매개변수
    SortByParam:
      name: sortBy
      in: query
      required: false
      description: |
        정렬 기준 필드

        지원되는 필드:
        - id: ID 순
        - name: 이름 순
        - email: 이메일 순
        - createdAt: 생성일 순 (기본값)
        - updatedAt: 수정일 순
      schema:
        type: string
        enum: [id, name, email, createdAt, updatedAt]
        default: createdAt
        example: createdAt

    SortOrderParam:
      name: sortOrder
      in: query
      required: false
      description: |
        정렬 순서

        - asc: 오름차순
        - desc: 내림차순 (기본값)
      schema:
        type: string
        enum: [asc, desc]
        default: desc
        example: desc

    # 경로 매개변수
    UserIdParam:
      name: userId
      in: path
      required: true
      description: |
        사용자 고유 ID

        - 양의 정수만 허용
        - 존재하지 않는 ID인 경우 404 반환
      schema:
        type: integer
        format: int64
        minimum: 1
        example: 123
      style: simple

    ResourceIdParam:
      name: id
      in: path
      required: true
      description: 리소스 고유 ID
      schema:
        type: integer
        format: int64
        minimum: 1
        example: 456
      style: simple

    # 헤더 매개변수
    AuthorizationHeader:
      name: Authorization
      in: header
      required: true
      description: |
        JWT Bearer 토큰

        형식: Bearer {access_token}

        토큰 획득 방법:
        1. POST /auth/login으로 로그인
        2. 응답에서 access_token 복사
        3. "Bearer " 접두사와 함께 이 헤더에 포함
      schema:
        type: string
        pattern: '^Bearer [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*# OpenAPI Specification (OAS) 3.0 구조 가이드 - Part 3: Components

## 📋 목차
- [1. Schemas (데이터 모델)](#1-schemas-데이터-모델)
- [2. Parameters (재사용 매개변수)](#2-parameters-재사용-매개변수)
- [3. Responses (재사용 응답)](#3-responses-재사용-응답)
- [4. Request Bodies](#4-request-bodies)
- [5. Headers](#5-headers)

Components는 OpenAPI 문서에서 재사용 가능한 요소들을 정의하는 곳입니다.

## 1. Schemas (데이터 모델)

### 1.1 기본 스키마 타입

```yaml
components:
  schemas:
    # 문자열 타입
    UserName:
      type: string
      minLength: 2
      maxLength: 50
      pattern: '^[가-힣a-zA-Z\s]+$'
      example: 홍길동
      description: 사용자 이름 (한글, 영문, 공백만 허용)

    # 숫자 타입
    UserId:
      type: integer
      format: int64
      minimum: 1
      maximum: 9223372036854775807
      example: 123
      description: 사용자 고유 ID

    # 부울 타입
    IsActive:
      type: boolean
      example: true
      description: 활성화 상태

    # 배열 타입
    TagList:
      type: array
      items:
        type: string
        minLength: 1
        maxLength: 20
      minItems: 1
      maxItems: 10
      uniqueItems: true
      example: [javascript, nodejs, api]
      description: 태그 목록

    # 객체 타입
    Address:
      type: object
      required: [country, city]
      properties:
        country:
          type: string
          minLength: 2
          example: 대한민국
          description: 국가명
        city:
          type: string
          minLength: 1
          example: 서울특별시
          description: 도시명
        postalCode:
          type: string
          pattern: '^\d{5}$'
          example: 12345
          description: 우편번호 (5자리 숫자)
        street:
          type: string
          maxLength: 200
          example: 강남구 테헤란로 123
          description: 상세 주소
      additionalProperties: false
      description: 주소 정보
````

### 1.2 복합 스키마

```yaml
components:
  schemas:
    # 기본 사용자 스키마
    User:
      type: object
      title: 사용자 정보
      description: 시스템 사용자의 기본 정보
      required: [id, email, name, status, createdAt]
      properties:
        id:
          type: integer
          format: int64
          description: 사용자 고유 ID
          example: 123
          readOnly: true
          minimum: 1
        email:
          type: string
          format: email
          description: 사용자 이메일 주소 (로그인 ID)
          example: user@example.com
          maxLength: 255
          pattern: '^[^@]+@[^@]+\.[^@]+$'
        name:
          type: string
          description: 사용자 이름
          example: 홍길동
          minLength: 2
          maxLength: 50
        age:
          type: integer
          description: 사용자 나이
          example: 25
          minimum: 1
          maximum: 120
          nullable: true
        status:
          type: string
          description: 계정 상태
          enum: [active, inactive, pending, suspended]
          example: active
          default: pending
        roles:
          type: array
          description: 사용자 권한 목록
          items:
            type: string
            enum: [user, admin, moderator]
          example: [user]
          minItems: 1
          maxItems: 3
          uniqueItems: true
        profile:
          $ref: "#/components/schemas/UserProfile"
          description: 사용자 프로필 정보
        address:
          $ref: "#/components/schemas/Address"
          description: 주소 정보
          nullable: true
        metadata:
          type: object
          description: 추가 메타데이터
          additionalProperties: true
          example:
            lastLoginIp: "192.168.1.1"
            loginCount: 42
            preferences:
              theme: dark
              language: ko
        createdAt:
          type: string
          format: date-time
          description: 계정 생성일시
          example: "2024-01-01T00:00:00Z"
          readOnly: true
        updatedAt:
          type: string
          format: date-time
          description: 최종 수정일시
          example: "2024-01-15T10:30:00Z"
          readOnly: true
      additionalProperties: false
      example:
        id: 123
        email: user@example.com
        name: 홍길동
        age: 25
        status: active
        roles: [user]
        createdAt: "2024-01-01T00:00:00Z"
        updatedAt: "2024-01-15T10:30:00Z"

    # 중첩된 사용자 프로필
    UserProfile:
      type: object
      description: 사용자 프로필 정보
      properties:
        bio:
          type: string
          description: 자기소개
          maxLength: 500
          example: 안녕하세요, 개발자입니다.
          nullable: true
        avatar:
          type: string
          format: uri
          description: 프로필 이미지 URL
          example: https://example.com/avatars/user123.jpg
          nullable: true
        website:
          type: string
          format: uri
          description: 개인 웹사이트
          example: https://johndoe.com
          nullable: true
        socialLinks:
          type: object
          description: 소셜 미디어 링크
          properties:
            twitter:
              type: string
              format: uri
              example: https://twitter.com/johndoe
            github:
              type: string
              format: uri
              example: https://github.com/johndoe
            linkedin:
              type: string
              format: uri
              example: https://linkedin.com/in/johndoe
          additionalProperties:
            type: string
            format: uri
        preferences:
          type: object
          description: 사용자 설정
          properties:
            theme:
              type: string
              enum: [light, dark, auto]
              default: auto
              example: dark
            language:
              type: string
              enum: [ko, en, ja, zh]
              default: ko
              example: ko
            timezone:
              type: string
              example: Asia/Seoul
              default: Asia/Seoul
            notifications:
              type: object
              properties:
                email:
                  type: boolean
                  default: true
                  description: 이메일 알림 수신
                push:
                  type: boolean
                  default: true
                  description: 푸시 알림 수신
                sms:
                  type: boolean
                  default: false
                  description: SMS 알림 수신
          additionalProperties: false
      additionalProperties: false
```

### 1.3 상속과 조합 (allOf, oneOf, anyOf)

```yaml
components:
  schemas:
    # 기본 엔티티
    BaseEntity:
      type: object
      required: [id, createdAt, updatedAt]
      properties:
        id:
          type: integer
          format: int64
          description: 고유 ID
          example: 123
          readOnly: true
        createdAt:
          type: string
          format: date-time
          description: 생성일시
          example: "2024-01-01T00:00:00Z"
          readOnly: true
        updatedAt:
          type: string
          format: date-time
          description: 수정일시
          example: "2024-01-15T10:30:00Z"
          readOnly: true
        version:
          type: integer
          description: 버전 (낙관적 잠금용)
          example: 1
          readOnly: true

    # allOf - 상속 (모든 스키마 조합)
    User:
      allOf:
        - $ref: '#/components/schemas/BaseEntity'
        - type: object
          required: [email, name]
          properties:
            email:
              type: string
              format: email
              example: user@example.com
            name:
              type: string
              example: 홍길동
            status:
              type: string
              enum: [active, inactive, pending]
              example: active

    Product:
      allOf:
        - $ref: '#/components/schemas/BaseEntity'
        - type: object
          required: [name, price]
          properties:
            name:
              type: string
              example: 상품명
            price:
              type: number
              format: decimal
              example: 29.99
            category:
              type: string
              example: electronics

    # oneOf - 다형성 (하나만 선택)
    NotificationChannel:
      oneOf:
        - $ref: '#/components/schemas/EmailChannel'
        - $ref: '#/components/schemas/SmsChannel'
        - $ref: '#/components/schemas/PushChannel'
      discriminator:
        propertyName: type
        mapping:
          email: '#/components/schemas/EmailChannel'
          sms: '#/components/schemas/SmsChannel'
          push: '#/components/schemas/PushChannel'

    EmailChannel:
      type: object
      required: [type, address]
      properties:
        type:
          type: string
          enum: [email]
          example: email
        address:
          type: string
          format: email
          example: user@example.com
        verified:
          type: boolean
          example: true

    SmsChannel:
      type: object
      required: [type, phoneNumber]
      properties:
        type:
          type: string
          enum: [sms]
          example: sms
        phoneNumber:
          type: string
          pattern: '^010-\d{4}-\d{4}$'
          example: 010-1234-5678
        verified:
          type: boolean
          example: false

    PushChannel:
      type: object
      required: [type, deviceToken]
      properties:
        type:
          type: string
          enum: [push]
          example: push
        deviceToken:
          type: string
          example: abc123def456
        platform:
          type: string
          enum: [ios, android, web]
          example: ios

    # anyOf - 여러 조건 중 하나 이상 (유연한 조합)
    SearchFilter:
      anyOf:
        - type: object
          properties:
            keyword:
              type: string
              minLength: 1
              example: 검
        example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    AcceptLanguageHeader:
      name: Accept-Language
      in: header
      required: false
      description: |
        선호 언어 설정

        지원 언어:
        - ko-KR: 한국어 (기본값)
        - en-US: 영어
        - ja-JP: 일본어
        - zh-CN: 중국어 간체
      schema:
        type: string
        default: ko-KR
        example: ko-KR,en-US;q=0.9

    ContentTypeHeader:
      name: Content-Type
      in: header
      required: false
      description: 요청 본문의 미디어 타입
      schema:
        type: string
        enum: [application/json, application/xml, multipart/form-data]
        default: application/json
        example: application/json

    # 쿼리 매개변수 (복합)
    SearchParam:
      name: search
      in: query
      required: false
      description: |
        검색어 (이름, 이메일에서 부분 일치)

        - 최소 2자 이상
        - 대소문자 구분 안함
        - 특수문자 이스케이프 처리됨
      schema:
        type: string
        minLength: 2
        maxLength: 100
        example: 홍길동

    StatusFilterParam:
      name: status
      in: query
      required: false
      description: |
        상태 필터

        - active: 활성 상태
        - inactive: 비활성 상태
        - pending: 대기 상태
        - suspended: 정지 상태
        - 여러 값 지정 시 쉼표로 구분
      schema:
        oneOf:
          - type: string
            enum: [active, inactive, pending, suspended]
          - type: array
            items:
              type: string
              enum: [active, inactive, pending, suspended]
            uniqueItems: true
      style: form
      explode: false
      examples:
        single:
          summary: 단일 상태
          value: active
        multiple:
          summary: 여러 상태
          value: [active, pending]

    DateRangeParam:
      name: dateRange
      in: query
      required: false
      description: |
        날짜 범위 필터

        형식: startDate,endDate
        날짜 형식: YYYY-MM-DD

        예시:
        - 2024-01-01,2024-01-31 (1월 전체)
        - 2024-01-01, (1월 1일 이후)
        - ,2024-01-31 (1월 31일 이전)
      content:
        application/json:
          schema:
            type: object
            properties:
              startDate:
                type: string
                format: date
                description: 시작 날짜
                example: "2024-01-01"
              endDate:
                type: string
                format: date
                description: 종료 날짜
                example: "2024-01-31"
          examples:
            month_range:
              summary: 월 범위
              value:
                startDate: "2024-01-01"
                endDate: "2024-01-31"
            from_date:
              summary: 특정 날짜 이후
              value:
                startDate: "2024-01-01"
            to_date:
              summary: 특정 날짜 이전
              value:
                endDate: "2024-01-31"
```

## 3. Responses (재사용 응답)

````yaml
components:
  responses:
    # 성공 응답들
    Success:
      description: 요청 성공
      headers:
        X-Request-ID:
          description: 요청 추적 ID
          schema:
            type: string
            example: req-123456
        X-Response-Time:
          description: 서버 응답 시간 (밀리초)
          schema:
            type: integer
            example: 45
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
                example: true
              message:
                type: string
                example: 요청이 성공적으로 처리되었습니다

    Created:
      description: 리소스 생성 성공
      headers:
        Location:
          description: 생성된 리소스의 URL
          schema:
            type: string
            format: uri
            example: /users/123
        X-Request-ID:
          description: 요청 추적 ID
          schema:
            type: string
            example: req-123456
      content:
        application/json:
          schema:
            allOf:
              - $ref: '#/components/schemas/ApiResponse'
              - type: object
                properties:
                  data:
                    description: 생성된 리소스 데이터

    NoContent:
      description: 성공 (응답 본문 없음)
      headers:
        X-Request-ID:
          description: 요청 추적 ID
          schema:
            type: string
            example: req-123456

    # 클라이언트 에러 응답들
    BadRequest:
      description: 잘못된 요청
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            validation_error:
              summary: 유효성 검사 실패
              value:
                statusCode: 400
                message: 입력 데이터 검증에 실패했습니다
                error: Validation Error
                code: VALIDATION_FAILED
                timestamp: "2024-01-01T00:00:00Z"
                path: /users
                requestId: req-123456
                details:
                  validationErrors:
                    - field: email
                      value: invalid-email
                      constraints:
                        isEmail: 올바른 이메일 형식을 입력해주세요
            invalid_format:
              summary: 잘못된 형식
              value:
                statusCode: 400
                message: 요청 형식이 올바르지 않습니다
                error: Bad Request
                code: INVALID_FORMAT
                timestamp: "2024-01-01T00:00:00Z"
                path: /users
                requestId: req-123456
                suggestions: [JSON 형식으로 요청해주세요, Content-Type 헤더를 확인해주세요]

    Unauthorized:
      description: 인증 실패
      headers:
        WWW-Authenticate:
          description: 인증 방법 안내
          schema:
            type: string
            example: Bearer realm="api", error="invalid_token", error_description="The access token expired"
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            invalid_token:
              summary: 유효하지 않은 토큰
              value:
                statusCode: 401
                message: 유효하지 않은 토큰입니다
                error: Unauthorized
                code: INVALID_TOKEN
                timestamp: "2024-01-01T00:00:00Z"
                path: /users
                requestId: req-123456
                suggestions: [토큰을 다시 발급받아 주세요, 로그인을 다시 시도해주세요]
            expired_token:
              summary: 만료된 토큰
              value:
                statusCode: 401
                message: 토큰이 만료되었습니다
                error: Token Expired
                code: TOKEN_EXPIRED
                timestamp: "2024-01-01T00:00:00Z"
                path: /users
                requestId: req-123456
                suggestions: [리프레시 토큰으로 갱신해주세요]
            missing_token:
              summary: 토큰 누락
              value:
                statusCode: 401
                message: 인증 토큰이 필요합니다
                error: Missing Token
                code: MISSING_TOKEN
                timestamp: "2024-01-01T00:00:00Z"
                path: /users
                requestId: req-123456
                suggestions: [Authorization 헤더를 포함해주세요]

    Forbidden:
      description: 권한 부족
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            insufficient_permissions:
              summary: 권한 부족
              value:
                statusCode: 403
                message: 이 리소스에 접근할 권한이 없습니다
                error: Forbidden
                code: INSUFFICIENT_PERMISSIONS
                timestamp: "2024-01-01T00:00:00Z"
                path: /admin/users
                requestId: req-123456
                suggestions: [관리자 권한이 필요합니다, 계정 권한을 확인해주세요]
            resource_ownership:
              summary: 리소스 소유권 없음
              value:
                statusCode: 403
                message: 다른 사용자의 리소스에 접근할 수 없습니다
                error: Forbidden
                code: RESOURCE_OWNERSHIP_REQUIRED
                timestamp: "2024-01-01T00:00:00Z"
                path: /users/456
                requestId: req-123456

    NotFound:
      description: 리소스를 찾을 수 없음
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            resource_not_found:
              summary: 리소스 없음
              value:
                statusCode: 404
                message: 요청한 리소스를 찾을 수 없습니다
                error: Not Found
                code: RESOURCE_NOT_FOUND
                timestamp: "2024-01-01T00:00:00Z"
                path: /users/999
                requestId: req-123456
                suggestions: [리소스 ID를 확인해주세요, 삭제된 리소스일 수 있습니다]
            endpoint_not_found:
              summary: 엔드포인트 없음
              value:
                statusCode: 404
                message: 요청한 엔드포인트를 찾을 수 없습니다
                error: Endpoint Not Found
                code: ENDPOINT_NOT_FOUND
                timestamp: "2024-01-01T00:00:00Z"
                path: /invalid-endpoint
                requestId: req-123456
                suggestions: [API 문서를 참조해주세요, URL을 확인해주세요]

    Conflict:
      description: 리소스 충돌
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            duplicate_resource:
              summary: 중복 리소스
              value:
                statusCode: 409
                message: 이미 존재하는 리소스입니다
                error: Conflict
                code: DUPLICATE_RESOURCE
                timestamp: "2024-01-01T00:00:00Z"
                path: /users
                requestId: req-123456
                details:
                  conflictField: email
                  conflictValue: user@example.com
                suggestions: [다른 이메일을 사용해주세요, 기존 계정으로 로그인해주세요]
            resource_in_use:
              summary: 리소스 사용 중
              value:
                statusCode: 409
                message: 리소스가 사용 중이어서 삭제할 수 없습니다
                error: Resource In Use
                code: RESOURCE_IN_USE
                timestamp: "2024-01-01T00:00:00Z"
                path: /users/123
                requestId: req-123456
                details:
                  relatedResources:
                    - type: orders
                      count: 5
                    - type: reviews
                      count: 12
                suggestions: [연관된 데이터를 먼저 삭제해주세요, 비활성화를 고려해주세요]

    # 서버 에러 응답들
    TooManyRequests:
      description: 요청 한도 초과
      headers:
        X-RateLimit-Limit:
          description: 시간당 요청 제한
          schema:
            type: integer
            example: 1000
        X-RateLimit-Remaining:
          description: 남은 요청 수
          schema:
            type: integer
            example: 0
        X-RateLimit-Reset:
          description: 제한 재설정 시간# OpenAPI Specification (OAS) 3.0 구조 가이드 - Part 3: Components

## 📋 목차
- [1. Schemas (데이터 모델)](#1-schemas-데이터-모델)
- [2. Parameters (재사용 매개변수)](#2-parameters-재사용-매개변수)
- [3. Responses (재사용 응답)](#3-responses-재사용-응답)
- [4. Request Bodies](#4-request-bodies)
- [5. Headers](#5-headers)

Components는 OpenAPI 문서에서 재사용 가능한 요소들을 정의하는 곳입니다.

## 1. Schemas (데이터 모델)

### 1.1 기본 스키마 타입

```yaml
components:
  schemas:
    # 문자열 타입
    UserName:
      type: string
      minLength: 2
      maxLength: 50
      pattern: '^[가-힣a-zA-Z\s]+$'
      example: 홍길동
      description: 사용자 이름 (한글, 영문, 공백만 허용)

    # 숫자 타입
    UserId:
      type: integer
      format: int64
      minimum: 1
      maximum: 9223372036854775807
      example: 123
      description: 사용자 고유 ID

    # 부울 타입
    IsActive:
      type: boolean
      example: true
      description: 활성화 상태

    # 배열 타입
    TagList:
      type: array
      items:
        type: string
        minLength: 1
        maxLength: 20
      minItems: 1
      maxItems: 10
      uniqueItems: true
      example: [javascript, nodejs, api]
      description: 태그 목록

    # 객체 타입
    Address:
      type: object
      required: [country, city]
      properties:
        country:
          type: string
          minLength: 2
          example: 대한민국
          description: 국가명
        city:
          type: string
          minLength: 1
          example: 서울특별시
          description: 도시명
        postalCode:
          type: string
          pattern: '^\d{5}$'
          example: 12345
          description: 우편번호 (5자리 숫자)
        street:
          type: string
          maxLength: 200
          example: 강남구 테헤란로 123
          description: 상세 주소
      additionalProperties: false
      description: 주소 정보
````

### 1.2 복합 스키마

```yaml
components:
  schemas:
    # 기본 사용자 스키마
    User:
      type: object
      title: 사용자 정보
      description: 시스템 사용자의 기본 정보
      required: [id, email, name, status, createdAt]
      properties:
        id:
          type: integer
          format: int64
          description: 사용자 고유 ID
          example: 123
          readOnly: true
          minimum: 1
        email:
          type: string
          format: email
          description: 사용자 이메일 주소 (로그인 ID)
          example: user@example.com
          maxLength: 255
          pattern: '^[^@]+@[^@]+\.[^@]+$'
        name:
          type: string
          description: 사용자 이름
          example: 홍길동
          minLength: 2
          maxLength: 50
        age:
          type: integer
          description: 사용자 나이
          example: 25
          minimum: 1
          maximum: 120
          nullable: true
        status:
          type: string
          description: 계정 상태
          enum: [active, inactive, pending, suspended]
          example: active
          default: pending
        roles:
          type: array
          description: 사용자 권한 목록
          items:
            type: string
            enum: [user, admin, moderator]
          example: [user]
          minItems: 1
          maxItems: 3
          uniqueItems: true
        profile:
          $ref: "#/components/schemas/UserProfile"
          description: 사용자 프로필 정보
        address:
          $ref: "#/components/schemas/Address"
          description: 주소 정보
          nullable: true
        metadata:
          type: object
          description: 추가 메타데이터
          additionalProperties: true
          example:
            lastLoginIp: "192.168.1.1"
            loginCount: 42
            preferences:
              theme: dark
              language: ko
        createdAt:
          type: string
          format: date-time
          description: 계정 생성일시
          example: "2024-01-01T00:00:00Z"
          readOnly: true
        updatedAt:
          type: string
          format: date-time
          description: 최종 수정일시
          example: "2024-01-15T10:30:00Z"
          readOnly: true
      additionalProperties: false
      example:
        id: 123
        email: user@example.com
        name: 홍길동
        age: 25
        status: active
        roles: [user]
        createdAt: "2024-01-01T00:00:00Z"
        updatedAt: "2024-01-15T10:30:00Z"

    # 중첩된 사용자 프로필
    UserProfile:
      type: object
      description: 사용자 프로필 정보
      properties:
        bio:
          type: string
          description: 자기소개
          maxLength: 500
          example: 안녕하세요, 개발자입니다.
          nullable: true
        avatar:
          type: string
          format: uri
          description: 프로필 이미지 URL
          example: https://example.com/avatars/user123.jpg
          nullable: true
        website:
          type: string
          format: uri
          description: 개인 웹사이트
          example: https://johndoe.com
          nullable: true
        socialLinks:
          type: object
          description: 소셜 미디어 링크
          properties:
            twitter:
              type: string
              format: uri
              example: https://twitter.com/johndoe
            github:
              type: string
              format: uri
              example: https://github.com/johndoe
            linkedin:
              type: string
              format: uri
              example: https://linkedin.com/in/johndoe
          additionalProperties:
            type: string
            format: uri
        preferences:
          type: object
          description: 사용자 설정
          properties:
            theme:
              type: string
              enum: [light, dark, auto]
              default: auto
              example: dark
            language:
              type: string
              enum: [ko, en, ja, zh]
              default: ko
              example: ko
            timezone:
              type: string
              example: Asia/Seoul
              default: Asia/Seoul
            notifications:
              type: object
              properties:
                email:
                  type: boolean
                  default: true
                  description: 이메일 알림 수신
                push:
                  type: boolean
                  default: true
                  description: 푸시 알림 수신
                sms:
                  type: boolean
                  default: false
                  description: SMS 알림 수신
          additionalProperties: false
      additionalProperties: false
```

### 1.3 상속과 조합 (allOf, oneOf, anyOf)

````yaml
components:
  schemas:
    # 기본 엔티티
    BaseEntity:
      type: object
      required: [id, createdAt, updatedAt]
      properties:
        id:
          type: integer
          format: int64
          description: 고유 ID
          example: 123
          readOnly: true
        createdAt:
          type: string
          format: date-time
          description: 생성일시
          example: "2024-01-01T00:00:00Z"
          readOnly: true
        updatedAt:
          type: string
          format: date-time
          description: 수정일시
          example: "2024-01-15T10:30:00Z"
          readOnly: true
        version:
          type: integer
          description: 버전 (낙관적 잠금용)
          example: 1
          readOnly: true

    # allOf - 상속 (모든 스키마 조합)
    User:
      allOf:
        - $ref: '#/components/schemas/BaseEntity'
        - type: object
          required: [email, name]
          properties:
            email:
              type: string
              format: email
              example: user@example.com
            name:
              type: string
              example: 홍길동
            status:
              type: string
              enum: [active, inactive, pending]
              example: active

    Product:
      allOf:
        - $ref: '#/components/schemas/BaseEntity'
        - type: object
          required: [name, price]
          properties:
            name:
              type: string
              example: 상품명
            price:
              type: number
              format: decimal
              example: 29.99
            category:
              type: string
              example: electronics

    # oneOf - 다형성 (하나만 선택)
    NotificationChannel:
      oneOf:
        - $ref: '#/components/schemas/EmailChannel'
        - $ref: '#/components/schemas/SmsChannel'
        - $ref: '#/components/schemas/PushChannel'
      discriminator:
        propertyName: type
        mapping:
          email: '#/components/schemas/EmailChannel'
          sms: '#/components/schemas/SmsChannel'
          push: '#/components/schemas/PushChannel'

    EmailChannel:
      type: object
      required: [type, address]
      properties:
        type:
          type: string
          enum: [email]
          example: email
        address:
          type: string
          format: email
          example: user@example.com
        verified:
          type: boolean
          example: true

    SmsChannel:
      type: object
      required: [type, phoneNumber]
      properties:
        type:
          type: string
          enum: [sms]
          example: sms
        phoneNumber:
          type: string
          pattern: '^010-\d{4}-\d{4}$'
          example: 010-1234-5678
        verified:
          type: boolean
          example: false

    PushChannel:
      type: object
      required: [type, deviceToken]
      properties:
        type:
          type: string
          enum: [push]
          example: push
        deviceToken:
          type: string
          example: abc123def456
        platform:
          type: string
          enum: [ios, android, web]
          example: ios

    # anyOf - 여러 조건 중 하나 이상 (유연한 조합)
    SearchFilter:
      anyOf:
        - type: object
          properties:
            keyword:
              type: string
              minLength: 1
              example: 검



              openapi-generator-cli에서 TypeScript Axios 코드 생성 시 파일 이름을 지정하는 방법을 알려드리겠습니다.
1. 기본 파일 이름 지정 옵션
1.1 주요 옵션들
bash# 기본 생성 명령어
openapi-generator-cli generate \
  -i swagger.yaml \
  -g typescript-axios \
  -o ./generated-api \
  --additional-properties=\
modelPackage=models,\
apiPackage=apis,\
withInterfaces=true,\
useSingleRequestParameter=true
1.2 파일명 관련 주요 옵션
bashopenapi-generator-cli generate \
  -i swagger.yaml \
  -g typescript-axios \
  -o ./generated-api \
  --additional-properties=\
modelPackage=models,\
apiPackage=apis,\
modelFileSuffix=Model,\
apiFileSuffix=Api,\
fileNaming=kebab-case
2. 상세 파일명 설정 옵션
2.1 모든 파일명 관련 옵션
bashopenapi-generator-cli generate \
  -i swagger.yaml \
  -g typescript-axios \
  -o ./src/api \
  --additional-properties=\
# === 패키지/폴더 구조 ===
modelPackage=types,\
apiPackage=services,\
# === 파일명 접미사 ===
modelFileSuffix=Type,\
apiFileSuffix=Service,\
# === 파일명 케이스 ===
fileNaming=kebab-case,\
# === 인덱스 파일명 ===
indexFileName=index,\
# === 기타 파일명 ===
configurationFileName=configuration,\
baseFileName=base,\
commonFileName=common
2.2 fileNaming 옵션 값들
bash# 케밥 케이스 (기본값)
fileNaming=kebab-case
# 결과: user-api.ts, user-model.ts

# 스네이크 케이스
fileNaming=snake_case
# 결과: user_api.ts, user_model.ts

# 카멜 케이스
fileNaming=camelCase
# 결과: userApi.ts, userModel.ts

# 파스칼 케이스
fileNaming=PascalCase
# 결과: UserApi.ts, UserModel.ts
3. 실제 사용 예시
3.1 한국어 프로젝트용 설정
bashopenapi-generator-cli generate \
  -i swagger.yaml \
  -g typescript-axios \
  -o ./src/api \
  --additional-properties=\
modelPackage=types,\
apiPackage=services,\
modelFileSuffix=Type,\
apiFileSuffix=Service,\
fileNaming=kebab-case,\
withInterfaces=true,\
useSingleRequestParameter=true,\
supportsES6=true,\
npmName=my-api-client,\
npmVersion=1.0.0
생성되는 파일 구조:
src/api/
├── index.ts
├── configuration.ts
├── base.ts
├── common.ts
├── types/
│   ├── index.ts
│   ├── user-type.ts
│   ├── order-type.ts
│   └── product-type.ts
└── services/
    ├── index.ts
    ├── user-service.ts
    ├── order-service.ts
    └── product-service.ts
3.2 기업용 표준 설정
bashopenapi-generator-cli generate \
  -i api-spec.yaml \
  -g typescript-axios \
  -o ./libs/api-client \
  --additional-properties=\
modelPackage=models,\
apiPackage=apis,\
modelFileSuffix=Model,\
apiFileSuffix=Api,\
fileNaming=PascalCase,\
withInterfaces=true,\
useSingleRequestParameter=true,\
supportsES6=true,\
enumPropertyNaming=UPPERCASE,\
npmName=@company/api-client,\
npmVersion=2.1.0
생성되는 파일 구조:
libs/api-client/
├── index.ts
├── Configuration.ts
├── Base.ts
├── Common.ts
├── models/
│   ├── index.ts
│   ├── UserModel.ts
│   ├── OrderModel.ts
│   └── ProductModel.ts
└── apis/
    ├── index.ts
    ├── UserApi.ts
    ├── OrderApi.ts
    └── ProductApi.ts
4. 고급 설정 파일 사용
4.1 설정 파일 생성 (config.json)
json{
  "modelPackage": "interfaces",
  "apiPackage": "clients",
  "modelFileSuffix": "Interface",
  "apiFileSuffix": "Client",
  "fileNaming": "kebab-case",
  "withInterfaces": true,
  "useSingleRequestParameter": true,
  "supportsES6": true,
  "enumPropertyNaming": "camelCase",
  "stringEnums": true,
  "npmName": "my-awesome-api",
  "npmVersion": "1.0.0",
  "indexFileName": "index",
  "configurationFileName": "config",
  "baseFileName": "api-base",
  "commonFileName": "api-common"
}
4.2 설정 파일 사용
bashopenapi-generator-cli generate \
  -i swagger.yaml \
  -g typescript-axios \
  -o ./src/generated \
  -c config.json
생성 결과:
src/generated/
├── index.ts
├── config.ts
├── api-base.ts
├── api-common.ts
├── interfaces/
│   ├── index.ts
│   ├── user-interface.ts
│   ├── order-interface.ts
│   └── product-interface.ts
└── clients/
    ├── index.ts
    ├── user-client.ts
    ├── order-client.ts
    └── product-client.ts
5. Package.json 스크립트 설정
5.1 다양한 환경별 스크립트
json{
  "scripts": {
    "generate:api": "openapi-generator-cli generate -i swagger.yaml -g typescript-axios -o ./src/api --additional-properties=modelPackage=types,apiPackage=services,fileNaming=kebab-case",

    "generate:api:dev": "openapi-generator-cli generate -i http://localhost:3000/api-json -g typescript-axios -o ./src/api --additional-properties=modelPackage=types,apiPackage=services,fileNaming=kebab-case",

    "generate:api:prod": "openapi-generator-cli generate -i https://api.company.com/swagger.json -g typescript-axios -o ./src/api -c production-config.json",

    "generate:clean": "rm -rf ./src/api && npm run generate:api"
  }
}
5.2 환경별 설정 파일
development-config.json:
json{
  "modelPackage": "dev-types",
  "apiPackage": "dev-services",
  "modelFileSuffix": "DevType",
  "apiFileSuffix": "DevService",
  "fileNaming": "kebab-case"
}
production-config.json:
json{
  "modelPackage": "models",
  "apiPackage": "apis",
  "modelFileSuffix": "",
  "apiFileSuffix": "",
  "fileNaming": "PascalCase"
}
6. 실무 팁
6.1 권장 설정 조합
bash# 권장 설정 (React/Vue 프로젝트)
openapi-generator-cli generate \
  -i swagger.yaml \
  -g typescript-axios \
  -o ./src/api \
  --additional-properties=\
modelPackage=types,\
apiPackage=services,\
modelFileSuffix=Type,\
apiFileSuffix=Service,\
fileNaming=kebab-case,\
withInterfaces=true,\
useSingleRequestParameter=true,\
supportsES6=true,\
stringEnums=true,\
enumPropertyNaming=camelCase
6.2 Git에서 생성된 파일 관리
.gitignore:
# API 생성 파일 (선택사항)
src/api/
!src/api/.gitkeep

# 또는 일부만 무시
src/api/**
!src/api/index.ts
!src/api/configuration.ts
6.3 TypeScript 설정
tsconfig.json:
json{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@api/*": ["src/api/*"],
      "@api/types": ["src/api/types"],
      "@api/services": ["src/api/services"]
    }
  }
}
7. 명명 규칙 커스터마이징
7.1 Mustache 템플릿 커스터마이징
생성된 파일명을 더 세밀하게 제어하려면 커스텀 템플릿을 사용할 수 있습니다:
bash# 커스텀 템플릿 사용
openapi-generator-cli generate \
  -i swagger.yaml \
  -g typescript-axios \
  -o ./src/api \
  -t ./custom-templates \
  --additional-properties=fileNaming=kebab-case
이러한 설정을 통해 프로젝트의 네이밍 컨벤션에 맞는 API 클라이언트 코드를 생성할 수 있습니다.


# User API 예시 - OpenAPI 스펙과 생성된 TypeScript 코드

## 1. OpenAPI 스펙 (swagger.yaml)

```yaml
openapi: 3.0.3
info:
  title: Simple User API
  version: 1.0.0
  description: 간단한 사용자 관리 API
servers:
  - url: http://localhost:3000/api
    description: 로컬 개발 서버

paths:
  /users:
    get:
      tags:
        - Users
      summary: 사용자 목록 조회
      description: 모든 사용자의 목록을 조회합니다
      operationId: getUsers
      parameters:
        - name: page
          in: query
          required: false
          schema:
            type: integer
            minimum: 1
            default: 1
          example: 1
        - name: limit
          in: query
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 10
          example: 10
      responses:
        '200':
          description: 사용자 목록 조회 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserListResponse'
        '400':
          description: 잘못된 요청
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    post:
      tags:
        - Users
      summary: 새 사용자 생성
      description: 새로운 사용자를 생성합니다
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: 사용자 생성 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: 잘못된 요청
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /users/{userId}:
    get:
      tags:
        - Users
      summary: 사용자 상세 조회
      description: 특정 사용자의 상세 정보를 조회합니다
      operationId: getUserById
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: integer
          example: 1
      responses:
        '200':
          description: 사용자 조회 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: 사용자를 찾을 수 없음
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    put:
      tags:
        - Users
      summary: 사용자 정보 수정
      description: 사용자 정보를 수정합니다
      operationId: updateUser
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: integer
          example: 1
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateUserRequest'
      responses:
        '200':
          description: 사용자 수정 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: 사용자를 찾을 수 없음
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    delete:
      tags:
        - Users
      summary: 사용자 삭제
      description: 사용자를 삭제합니다
      operationId: deleteUser
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: integer
          example: 1
      responses:
        '204':
          description: 사용자 삭제 성공
        '404':
          description: 사용자를 찾을 수 없음
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  schemas:
    User:
      type: object
      required:
        - id
        - email
        - name
        - status
        - createdAt
      properties:
        id:
          type: integer
          format: int64
          description: 사용자 ID
          example: 1
        email:
          type: string
          format: email
          description: 이메일 주소
          example: user@example.com
        name:
          type: string
          description: 사용자 이름
          example: 홍길동
        age:
          type: integer
          description: 나이
          minimum: 1
          maximum: 120
          example: 25
          nullable: true
        status:
          type: string
          enum: [active, inactive, pending]
          description: 계정 상태
          example: active
        createdAt:
          type: string
          format: date-time
          description: 생성일시
          example: "2024-01-01T00:00:00Z"
        updatedAt:
          type: string
          format: date-time
          description: 수정일시
          example: "2024-01-01T00:00:00Z"
          nullable: true

    CreateUserRequest:
      type: object
      required:
        - email
        - name
      properties:
        email:
          type: string
          format: email
          description: 이메일 주소
          example: newuser@example.com
        name:
          type: string
          description: 사용자 이름
          minLength: 2
          maxLength: 50
          example: 새사용자
        age:
          type: integer
          description: 나이
          minimum: 1
          maximum: 120
          example: 30

    UpdateUserRequest:
      type: object
      properties:
        name:
          type: string
          description: 사용자 이름
          minLength: 2
          maxLength: 50
          example: 수정된이름
        age:
          type: integer
          description: 나이
          minimum: 1
          maximum: 120
          example: 35
          nullable: true
        status:
          type: string
          enum: [active, inactive, pending]
          description: 계정 상태
          example: inactive

    UserListResponse:
      type: object
      required:
        - users
        - total
        - page
        - limit
      properties:
        users:
          type: array
          items:
            $ref: '#/components/schemas/User'
        total:
          type: integer
          description: 전체 사용자 수
          example: 100
        page:
          type: integer
          description: 현재 페이지
          example: 1
        limit:
          type: integer
          description: 페이지당 항목 수
          example: 10

    ErrorResponse:
      type: object
      required:
        - statusCode
        - message
        - error
      properties:
        statusCode:
          type: integer
          description: HTTP 상태 코드
          example: 400
        message:
          type: string
          description: 에러 메시지
          example: 잘못된 요청입니다
        error:
          type: string
          description: 에러 타입
          example: Bad Request
````

## 2. 코드 생성 명령어

```bash
# 생성 명령어
openapi-generator-cli generate \
  -i swagger.yaml \
  -g typescript-axios \
  -o ./src/api \
  --additional-properties=\
modelPackage=types,\
apiPackage=services,\
modelFileSuffix=Type,\
apiFileSuffix=Service,\
fileNaming=kebab-case,\
withInterfaces=true,\
useSingleRequestParameter=true,\
supportsES6=true
```

## 3. 생성된 파일 구조

```
src/api/
├── index.ts
├── configuration.ts
├── base.ts
├── common.ts
├── types/
│   ├── index.ts
│   ├── user-type.ts
│   ├── create-user-request-type.ts
│   ├── update-user-request-type.ts
│   ├── user-list-response-type.ts
│   └── error-response-type.ts
└── services/
    ├── index.ts
    └── users-service.ts
```

## 4. 생성된 TypeScript 코드

### 4.1 Types (types/user-type.ts)

```typescript
/**
 *
 * @export
 * @interface UserType
 */
export interface UserType {
  /**
   * 사용자 ID
   * @type {number}
   * @memberof UserType
   */
  id: number
  /**
   * 이메일 주소
   * @type {string}
   * @memberof UserType
   */
  email: string
  /**
   * 사용자 이름
   * @type {string}
   * @memberof UserType
   */
  name: string
  /**
   * 나이
   * @type {number}
   * @memberof UserType
   */
  age?: number | null
  /**
   * 계정 상태
   * @type {string}
   * @memberof UserType
   */
  status: UserTypeStatusEnum
  /**
   * 생성일시
   * @type {string}
   * @memberof UserType
   */
  createdAt: string
  /**
   * 수정일시
   * @type {string}
   * @memberof UserType
   */
  updatedAt?: string | null
}

/**
 * @export
 * @enum {string}
 */
export const UserTypeStatusEnum = {
  Active: "active",
  Inactive: "inactive",
  Pending: "pending",
} as const

export type UserTypeStatusEnum = (typeof UserTypeStatusEnum)[keyof typeof UserTypeStatusEnum]
```

### 4.2 Request Types (types/create-user-request-type.ts)

```typescript
/**
 *
 * @export
 * @interface CreateUserRequestType
 */
export interface CreateUserRequestType {
  /**
   * 이메일 주소
   * @type {string}
   * @memberof CreateUserRequestType
   */
  email: string
  /**
   * 사용자 이름
   * @type {string}
   * @memberof CreateUserRequestType
   */
  name: string
  /**
   * 나이
   * @type {number}
   * @memberof CreateUserRequestType
   */
  age?: number
}
```

### 4.3 API Service (services/users-service.ts)

```typescript
import type { Configuration } from "../configuration"
import type { AxiosPromise, AxiosInstance, AxiosRequestConfig } from "axios"
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from "../base"
import type {
  UserType,
  CreateUserRequestType,
  UpdateUserRequestType,
  UserListResponseType,
  ErrorResponseType,
} from "../types"

/**
 * UsersService - axios parameter creator
 * @export
 */
export const UsersServiceAxiosParamCreator = function (configuration?: Configuration) {
  return {
    /**
     * 새로운 사용자를 생성합니다
     * @param {CreateUserRequestType} createUserRequestType
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createUser: async (
      createUserRequestType: CreateUserRequestType,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'createUserRequestType' is not null or undefined
      assertParamExists("createUser", "createUserRequestType", createUserRequestType)
      const localVarPath = `/users`
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL)
      let baseOptions
      if (configuration) {
        baseOptions = configuration.baseOptions
      }

      const localVarRequestOptions = { method: "POST", ...baseOptions, ...options }
      const localVarHeaderParameter = {} as any
      const localVarQueryParameter = {} as any

      localVarHeaderParameter["Content-Type"] = "application/json"

      setSearchParams(localVarUrlObj, localVarQueryParameter)
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {}
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers }
      localVarRequestOptions.data = serializeDataIfNeeded(createUserRequestType, localVarRequestOptions, configuration)

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      }
    },

    /**
     * 사용자를 삭제합니다
     * @param {number} userId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteUser: async (userId: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists("deleteUser", "userId", userId)
      const localVarPath = `/users/{userId}`.replace(`{${"userId"}}`, encodeURIComponent(String(userId)))
      // ... 생략
    },

    /**
     * 특정 사용자의 상세 정보를 조회합니다
     * @param {number} userId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUserById: async (userId: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists("getUserById", "userId", userId)
      const localVarPath = `/users/{userId}`.replace(`{${"userId"}}`, encodeURIComponent(String(userId)))
      // ... 생략
    },

    /**
     * 모든 사용자의 목록을 조회합니다
     * @param {number} [page]
     * @param {number} [limit]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUsers: async (page?: number, limit?: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      const localVarPath = `/users`
      // ... 생략
    },

    /**
     * 사용자 정보를 수정합니다
     * @param {number} userId
     * @param {UpdateUserRequestType} updateUserRequestType
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUser: async (
      userId: number,
      updateUserRequestType: UpdateUserRequestType,
      options: AxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists("updateUser", "userId", userId)
      // verify required parameter 'updateUserRequestType' is not null or undefined
      assertParamExists("updateUser", "updateUserRequestType", updateUserRequestType)
      const localVarPath = `/users/{userId}`.replace(`{${"userId"}}`, encodeURIComponent(String(userId)))
      // ... 생략
    },
  }
}

/**
 * UsersService - functional programming interface
 * @export
 */
export const UsersServiceFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = UsersServiceAxiosParamCreator(configuration)
  return {
    /**
     * 새로운 사용자를 생성합니다
     * @param {CreateUserRequestType} createUserRequestType
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createUser(
      createUserRequestType: CreateUserRequestType,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<UserType>> {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createUser(createUserRequestType, options)
      return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)
    },

    /**
     * 사용자를 삭제합니다
     * @param {number} userId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteUser(
      userId: number,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteUser(userId, options)
      return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)
    },

    /**
     * 특정 사용자의 상세 정보를 조회합니다
     * @param {number} userId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getUserById(
      userId: number,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<UserType>> {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getUserById(userId, options)
      return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)
    },

    /**
     * 모든 사용자의 목록을 조회합니다
     * @param {number} [page]
     * @param {number} [limit]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getUsers(
      page?: number,
      limit?: number,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<UserListResponseType>> {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getUsers(page, limit, options)
      return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)
    },

    /**
     * 사용자 정보를 수정합니다
     * @param {number} userId
     * @param {UpdateUserRequestType} updateUserRequestType
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateUser(
      userId: number,
      updateUserRequestType: UpdateUserRequestType,
      options?: AxiosRequestConfig,
    ): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<UserType>> {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateUser(userId, updateUserRequestType, options)
      return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)
    },
  }
}

/**
 * UsersService - object-oriented interface
 * @export
 * @class UsersService
 * @extends {BaseAPI}
 */
export class UsersService extends BaseAPI {
  /**
   * 새로운 사용자를 생성합니다
   * @param {CreateUserRequestType} createUserRequestType
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersService
   */
  public createUser(createUserRequestType: CreateUserRequestType, options?: AxiosRequestConfig) {
    return UsersServiceFp(this.configuration)
      .createUser(createUserRequestType, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * 사용자를 삭제합니다
   * @param {number} userId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersService
   */
  public deleteUser(userId: number, options?: AxiosRequestConfig) {
    return UsersServiceFp(this.configuration)
      .deleteUser(userId, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * 특정 사용자의 상세 정보를 조회합니다
   * @param {number} userId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersService
   */
  public getUserById(userId: number, options?: AxiosRequestConfig) {
    return UsersServiceFp(this.configuration)
      .getUserById(userId, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * 모든 사용자의 목록을 조회합니다
   * @param {number} [page]
   * @param {number} [limit]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersService
   */
  public getUsers(page?: number, limit?: number, options?: AxiosRequestConfig) {
    return UsersServiceFp(this.configuration)
      .getUsers(page, limit, options)
      .then((request) => request(this.axios, this.basePath))
  }

  /**
   * 사용자 정보를 수정합니다
   * @param {number} userId
   * @param {UpdateUserRequestType} updateUserRequestType
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersService
   */
  public updateUser(userId: number, updateUserRequestType: UpdateUserRequestType, options?: AxiosRequestConfig) {
    return UsersServiceFp(this.configuration)
      .updateUser(userId, updateUserRequestType, options)
      .then((request) => request(this.axios, this.basePath))
  }
}
```

## 5. 사용 예시

### 5.1 React 컴포넌트에서 사용

```typescript
// UserList.tsx
import React, { useEffect, useState } from 'react';
import { UsersService, UserType, CreateUserRequestType } from '../api';

const userService = new UsersService({
  basePath: 'http://localhost:3000/api'
});

const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers(1, 10);
      setUsers(response.data.users);
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    const newUser: CreateUserRequestType = {
      email: 'newuser@example.com',
      name: '새 사용자',
      age: 25
    };

    try {
      const response = await userService.createUser(newUser);
      console.log('사용자 생성 성공:', response.data);
      loadUsers(); // 목록 새로고침
    } catch (error) {
      console.error('사용자 생성 실패:', error);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      await userService.deleteUser(userId);
      console.log('사용자 삭제 성공');
      loadUsers(); // 목록 새로고침
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      <h2>사용자 목록</h2>
      <button onClick={createUser}>새 사용자 추가</button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email}) - {user.status}
            <button onClick={() => deleteUser(user.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
```

### 5.2 Vue 컴포넌트에서 사용

```typescript
// UserList.vue
<template>
  <div>
    <h2>사용자 목록</h2>
    <button @click="createUser">새 사용자 추가</button>
    <ul v-if="!loading">
      <li v-for="user in users" :key="user.id">
        {{ user.name }} ({{ user.email }}) - {{ user.status }}
        <button @click="deleteUser(user.id)">삭제</button>
      </li>
    </ul>
    <div v-else>로딩 중...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { UsersService, UserType, CreateUserRequestType } from '../api';

const userService = new UsersService({
  basePath: 'http://localhost:3000/api'
});

const users = ref<UserType[]>([]);
const loading = ref(true);

const loadUsers = async () => {
  try {
    const response = await userService.getUsers(1, 10);
    users.value = response.data.users;
  } catch (error) {
    console.error('사용자 목록 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};

const createUser = async () => {
  const newUser: CreateUserRequestType = {
    email: 'newuser@example.com',
    name: '새 사용자',
    age: 25
  };

  try {
    await userService.createUser(newUser);
    await loadUsers();
  } catch (error) {
    console.error('사용자 생성 실패:', error);
  }
};

const deleteUser = async (userId: number) => {
  try {
    await userService.deleteUser(userId);
    await loadUsers();
  } catch (error) {
    console.error('사용자 삭제 실패:', error);
  }
};

onMounted(() => {
  loadUsers();
});
</script>
```

이렇게 OpenAPI 스펙을 작성하고 openapi-generator-cli로 TypeScript Axios 코드를 생성하면, 타입 안전성이 보장되는 API 클라이언트를 자동으로 만들 수 있습니다.
