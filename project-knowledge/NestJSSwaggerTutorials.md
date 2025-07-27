# NestJS Swagger 완전 가이드 - 1장: 기본 설정 및 CLI 플러그인

## 목차

- [1. 기본 설정](#1-기본-설정)
- [2. CLI 플러그인 활용](#2-cli-플러그인-활용)
- [3. 실무 팁](#3-실무-팁)

## 1. 기본 설정

### 1.1 설치

```bash
npm install @nestjs/swagger swagger-ui-express
npm install --save-dev @types/swagger-ui-express
```

### 1.2 main.ts 설정

```typescript
// main.ts
import { NestFactory } from "@nestjs/core"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { ValidationPipe } from "@nestjs/common"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 전역 validation pipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성 제거
      forbidNonWhitelisted: true, // 허용되지 않은 속성이 있으면 에러
      transform: true, // 자동 타입 변환
    }),
  )

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle("실무 프로젝트 API")
    .setDescription("실제 서비스에서 사용하는 API 문서입니다.")
    .setVersion("1.0.0")
    .addServer("http://localhost:3000", "Local Development")
    .addServer("https://api-dev.company.com", "Development")
    .addServer("https://api.company.com", "Production")
    // 인증 방식 추가
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth", // 이 이름을 컨트롤러에서 참조
    )
    .addApiKey(
      {
        type: "apiKey",
        name: "X-API-KEY",
        in: "header",
        description: "API Key for authentication",
      },
      "api-key",
    )
    // 태그 추가 (API 그룹화)
    .addTag("Auth", "인증 관련 API")
    .addTag("Users", "사용자 관리 API")
    .addTag("Products", "상품 관리 API")
    .addTag("Orders", "주문 관리 API")
    .addTag("Admin", "관리자 전용 API")
    .build()

  const document = SwaggerModule.createDocument(app, config, {
    // 특정 모듈만 포함하고 싶을 때
    // include: [UsersModule, AuthModule],

    // 전역 prefix 무시 (app.setGlobalPrefix 사용 시)
    ignoreGlobalPrefix: false,

    // 깊은 스캔 활성화 (중첩된 모듈도 스캔)
    deepScanRoutes: true,
  })

  // Swagger UI 설정
  SwaggerModule.setup("api-docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 새로고침해도 인증 유지
      tagsSorter: "alpha", // 태그 알파벳 정렬
      operationsSorter: "alpha", // 오퍼레이션 알파벳 정렬
      docExpansion: "none", // 기본적으로 모든 API 접어두기
      filter: true, // 검색 기능 활성화
      showRequestDuration: true, // 요청 시간 표시
    },
    customSiteTitle: "실무 프로젝트 API 문서",
    customCss: ".swagger-ui .topbar { display: none }", // 상단 바 숨기기
  })

  // JSON 형태로 스키마 다운로드 가능하게 설정
  SwaggerModule.setup("api-json", app, document)

  await app.listen(3000)
  console.log(`🚀 Application is running on: http://localhost:3000`)
  console.log(`📚 Swagger docs: http://localhost:3000/api-docs`)
}
bootstrap()
```

**생성되는 YAML 예시:**

```yaml
openapi: 3.0.0
info:
  title: 실무 프로젝트 API
  description: 실제 서비스에서 사용하는 API 문서입니다.
  version: 1.0.0
servers:
  - url: http://localhost:3000
    description: Local Development
  - url: https://api-dev.company.com
    description: Development
  - url: https://api.company.com
    description: Production
components:
  securitySchemes:
    JWT-auth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Enter JWT token
    api-key:
      type: apiKey
      name: X-API-KEY
      in: header
      description: API Key for authentication
tags:
  - name: Auth
    description: 인증 관련 API
  - name: Users
    description: 사용자 관리 API
```

## 2. CLI 플러그인 활용

### 2.1 CLI 플러그인 설정

CLI 플러그인을 사용하면 `@ApiProperty` 데코레이터 없이도 `class-validator` 데코레이터만으로 Swagger 문서를 자동 생성할 수 있습니다.

```json
// nest-cli.json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": true, // class-validator 데코레이터 활용
          "introspectComments": true, // 주석에서 description 추출
          "dtoFileNameSuffix": [".dto.ts", ".entity.ts", ".model.ts"],
          "controllerFileNameSuffix": [".controller.ts"],
          "dtoKeyOfComment": "description",
          "controllerKeyOfComment": "summary"
        }
      }
    ]
  }
}
```

### 2.2 플러그인 사용 전후 비교

**플러그인 사용 전 (수동으로 @ApiProperty 추가):**

```typescript
// 플러그인 없이 수동으로 작성
export class CreateUserDto {
  @ApiProperty({
    example: "john@example.com",
    description: "사용자 이메일 주소",
    format: "email",
  })
  @IsEmail({}, { message: "올바른 이메일 형식이 아닙니다" })
  @IsNotEmpty({ message: "이메일은 필수입니다" })
  email: string

  @ApiProperty({
    example: "홍길동",
    description: "사용자 이름",
    minLength: 2,
    maxLength: 20,
  })
  @IsString({ message: "이름은 문자열이어야 합니다" })
  @Length(2, 20, { message: "이름은 2-20자 사이여야 합니다" })
  name: string

  @ApiProperty({
    example: 25,
    description: "사용자 나이",
    minimum: 1,
    maximum: 120,
  })
  @IsNumber({}, { message: "나이는 숫자여야 합니다" })
  @Min(1, { message: "나이는 1 이상이어야 합니다" })
  @Max(120, { message: "나이는 120 이하여야 합니다" })
  age: number

  @ApiProperty({
    example: "password123!",
    description: "비밀번호",
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/, {
    message: "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다",
  })
  password: string

  @ApiPropertyOptional({
    example: "010-1234-5678",
    description: "전화번호 (선택사항)",
  })
  @IsOptional()
  @IsPhoneNumber("KR", { message: "올바른 한국 전화번호 형식이 아닙니다" })
  phoneNumber?: string
}
```

**플러그인 사용 후 (자동 생성):**

```typescript
// CLI 플러그인 사용 - @ApiProperty 없이도 자동 생성!
export class CreateUserDto {
  /**
   * 사용자 이메일 주소
   * @example john@example.com
   */
  @IsEmail({}, { message: "올바른 이메일 형식이 아닙니다" })
  @IsNotEmpty({ message: "이메일은 필수입니다" })
  email: string

  /**
   * 사용자 이름
   * @example 홍길동
   */
  @IsString({ message: "이름은 문자열이어야 합니다" })
  @Length(2, 20, { message: "이름은 2-20자 사이여야 합니다" })
  name: string

  /**
   * 사용자 나이
   * @example 25
   */
  @IsNumber({}, { message: "나이는 숫자여야 합니다" })
  @Min(1, { message: "나이는 1 이상이어야 합니다" })
  @Max(120, { message: "나이는 120 이하여야 합니다" })
  age: number

  /**
   * 비밀번호 (영문, 숫자, 특수문자 포함 8자 이상)
   * @example password123!
   */
  @IsString()
  @MinLength(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/, {
    message: "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다",
  })
  password: string

  /**
   * 전화번호 (선택사항)
   * @example 010-1234-5678
   */
  @IsOptional()
  @IsPhoneNumber("KR", { message: "올바른 한국 전화번호 형식이 아닙니다" })
  phoneNumber?: string
}
```

**생성되는 YAML (플러그인 자동 생성):**

```yaml
components:
  schemas:
    CreateUserDto:
      type: object
      properties:
        email:
          type: string
          format: email
          description: 사용자 이메일 주소
          example: john@example.com
        name:
          type: string
          description: 사용자 이름
          minLength: 2
          maxLength: 20
          example: 홍길동
        age:
          type: number
          description: 사용자 나이
          minimum: 1
          maximum: 120
          example: 25
        password:
          type: string
          description: 비밀번호 (영문, 숫자, 특수문자 포함 8자 이상)
          minLength: 8
          example: password123!
        phoneNumber:
          type: string
          description: 전화번호 (선택사항)
          example: 010-1234-5678
      required:
        - email
        - name
        - age
        - password
```

### 2.3 스키마 이름 커스터마이징

생성되는 스키마(타입/인터페이스) 이름을 원하는 대로 설정할 수 있습니다:

```typescript
// @ApiExtraModels와 함께 사용하여 스키마 이름 지정
@ApiExtraModels()
export class User {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john@example.com' })
  email: string;
}

// 스키마 이름을 직접 지정
@ApiResponse({
  status: 200,
  description: '사용자 목록 조회 성공',
  schema: {
    type: 'object',
    title: 'UserListResponse', // 스키마 이름 직접 지정
    properties: {
      users: {
        type: 'array',
        items: { $ref: getSchemaPath(User) }
      },
      total: {
        type: 'number',
        example: 100
      }
    }
  }
})
```

### 2.4 Generic 타입 이름 지정

제네릭 타입의 스키마 이름을 동적으로 생성:

```typescript
// 페이지네이션 응답 데코레이터
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
  description?: string,
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedDto, model),
    ApiOkResponse({
      description: description || `Paginated ${model.name} response`,
      schema: {
        title: `PaginatedResponseOf${model.name}`, // 동적 스키마 이름
        allOf: [
          { $ref: getSchemaPath(PaginatedDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};

// 사용 예시
@Get()
@ApiPaginatedResponse(User, '사용자 목록 조회')
async findUsers() {
  // 이때 스키마 이름은 'PaginatedResponseOfUser'가 됩니다
}
```

## 3. OpenAPI Specification YAML 구조

### 3.1 완전한 OpenAPI 3.0 구조

```yaml
openapi: 3.0.0
info:
  title: 실무 프로젝트 API
  description: |
    실제 서비스에서 사용하는 API 문서입니다.

    ## 인증 방식
    - JWT Bearer Token
    - API Key (X-API-KEY 헤더)

    ## 에러 코드
    - 400: 잘못된 요청
    - 401: 인증 실패
    - 403: 권한 없음
    - 404: 리소스 없음
    - 500: 서버 에러
  version: 1.0.0
  contact:
    name: API Support
    email: api-support@company.com
    url: https://company.com/support
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: http://localhost:3000
    description: Local Development
    variables:
      port:
        default: "3000"
        enum: ["3000", "3001"]
  - url: https://api-dev.company.com
    description: Development Environment
  - url: https://api.company.com
    description: Production Environment

# API 경로들
paths:
  /auth/login:
    post:
      tags:
        - Auth
      summary: 사용자 로그인
      description: 이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다
      operationId: loginUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/LoginDto"
            examples:
              normal_user:
                summary: 일반 사용자
                value:
                  email: user@example.com
                  password: password123!
              admin_user:
                summary: 관리자
                value:
                  email: admin@example.com
                  password: admin123!
      responses:
        "200":
          description: 로그인 성공
          headers:
            X-RateLimit-Limit:
              description: 시간당 요청 제한
              schema:
                type: integer
                example: 100
            X-RateLimit-Remaining:
              description: 남은 요청 수
              schema:
                type: integer
                example: 99
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AuthResponse"
              examples:
                success_response:
                  summary: 성공 응답
                  value:
                    access_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                    refresh_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                    expires_in: 3600
                    user:
                      id: 1
                      email: user@example.com
                      name: 홍길동
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "429":
          $ref: "#/components/responses/TooManyRequests"
        "500":
          $ref: "#/components/responses/InternalServerError"

  /users:
    get:
      tags:
        - Users
      summary: 사용자 목록 조회
      description: 사용자 목록을 페이지네이션과 함께 조회합니다
      operationId: getUsers
      security:
        - JWT-auth: []
        - api-key: []
      parameters:
        - $ref: "#/components/parameters/PageParam"
        - $ref: "#/components/parameters/LimitParam"
        - name: status
          in: query
          description: 사용자 상태 필터
          required: false
          schema:
            type: string
            enum: [active, inactive, pending]
            example: active
        - name: search
          in: query
          description: 이름 또는 이메일 검색
          required: false
          schema:
            type: string
            minLength: 2
            example: 홍길동
      responses:
        "200":
          description: 사용자 목록 조회 성공
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaginatedUsersResponse"

# 재사용 가능한 컴포넌트들
components:
  # 보안 스키마
  securitySchemes:
    JWT-auth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT 토큰을 입력하세요. 
        로그인 API를 통해 토큰을 발급받을 수 있습니다.
    api-key:
      type: apiKey
      name: X-API-KEY
      in: header
      description: |
        API 키를 입력하세요.
        관리자에게 문의하여 API 키를 발급받을 수 있습니다.

  # 데이터 스키마
  schemas:
    # 기본 사용자 스키마
    User:
      type: object
      title: 사용자 정보
      description: 시스템 사용자의 기본 정보
      properties:
        id:
          type: integer
          format: int64
          description: 사용자 고유 ID
          example: 1
          readOnly: true
        email:
          type: string
          format: email
          description: 사용자 이메일 주소
          example: user@example.com
          maxLength: 100
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
        status:
          type: string
          description: 사용자 계정 상태
          enum: [active, inactive, pending, suspended]
          example: active
        createdAt:
          type: string
          format: date-time
          description: 계정 생성일시
          example: "2024-01-01T00:00:00.000Z"
          readOnly: true
        updatedAt:
          type: string
          format: date-time
          description: 마지막 수정일시
          example: "2024-01-01T00:00:00.000Z"
          readOnly: true
      required:
        - email
        - name
        - age
      additionalProperties: false

    # 로그인 요청 스키마
    LoginDto:
      type: object
      title: 로그인 요청
      properties:
        email:
          type: string
          format: email
          description: 사용자 이메일 주소
          example: user@example.com
        password:
          type: string
          format: password
          description: 사용자 비밀번호
          example: password123!
          minLength: 8
      required:
        - email
        - password
      additionalProperties: false

    # 인증 응답 스키마
    AuthResponse:
      type: object
      title: 인증 응답
      properties:
        access_token:
          type: string
          description: JWT 액세스 토큰
          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        refresh_token:
          type: string
          description: JWT 리프레시 토큰
          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        expires_in:
          type: integer
          description: 토큰 만료 시간 (초)
          example: 3600
        token_type:
          type: string
          description: 토큰 타입
          example: Bearer
          default: Bearer
        user:
          $ref: "#/components/schemas/User"
      required:
        - access_token
        - refresh_token
        - expires_in
        - user

    # 페이지네이션 응답 스키마
    PaginatedUsersResponse:
      type: object
      title: 사용자 목록 응답
      properties:
        data:
          type: array
          items:
            $ref: "#/components/schemas/User"
          description: 사용자 목록
        total:
          type: integer
          description: 전체 사용자 수
          example: 100
          minimum: 0
        page:
          type: integer
          description: 현재 페이지 번호
          example: 1
          minimum: 1
        limit:
          type: integer
          description: 페이지당 항목 수
          example: 10
          minimum: 1
          maximum: 100
        totalPages:
          type: integer
          description: 전체 페이지 수
          example: 10
          minimum: 0
        hasNext:
          type: boolean
          description: 다음 페이지 존재 여부
          example: true
        hasPrev:
          type: boolean
          description: 이전 페이지 존재 여부
          example: false
      required:
        - data
        - total
        - page
        - limit
        - totalPages
        - hasNext
        - hasPrev

    # 에러 응답 스키마
    ErrorResponse:
      type: object
      title: 에러 응답
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
        timestamp:
          type: string
          format: date-time
          description: 에러 발생 시각
          example: "2024-01-01T00:00:00.000Z"
        path:
          type: string
          description: 요청 경로
          example: /api/users
      required:
        - statusCode
        - message
        - timestamp
        - path

  # 재사용 가능한 파라미터
  parameters:
    PageParam:
      name: page
      in: query
      description: 페이지 번호 (1부터 시작)
      required: false
      schema:
        type: integer
        minimum: 1
        default: 1
        example: 1

    LimitParam:
      name: limit
      in: query
      description: 페이지당 항목 수
      required: false
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 10
        example: 10

    UserIdParam:
      name: id
      in: path
      description: 사용자 ID
      required: true
      schema:
        type: integer
        format: int64
        minimum: 1
        example: 1

  # 재사용 가능한 응답
  responses:
    BadRequest:
      description: 잘못된 요청
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
          example:
            statusCode: 400
            message: 잘못된 요청입니다
            error: Bad Request
            timestamp: "2024-01-01T00:00:00.000Z"
            path: /api/users

    Unauthorized:
      description: 인증 실패
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
          example:
            statusCode: 401
            message: 인증이 필요합니다
            error: Unauthorized
            timestamp: "2024-01-01T00:00:00.000Z"
            path: /api/users

    Forbidden:
      description: 권한 없음
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
          example:
            statusCode: 403
            message: 접근 권한이 없습니다
            error: Forbidden
            timestamp: "2024-01-01T00:00:00.000Z"
            path: /api/admin/users

    NotFound:
      description: 리소스를 찾을 수 없음
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
          example:
            statusCode: 404
            message: 요청한 리소스를 찾을 수 없습니다
            error: Not Found
            timestamp: "2024-01-01T00:00:00.000Z"
            path: /api/users/999

    TooManyRequests:
      description: 요청 한도 초과
      headers:
        X-RateLimit-Limit:
          description: 시간당 요청 제한
          schema:
            type: integer
        X-RateLimit-Remaining:
          description: 남은 요청 수
          schema:
            type: integer
        X-RateLimit-Reset:
          description: 제한 재설정 시간
          schema:
            type: integer
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
          example:
            statusCode: 429
            message: 요청 한도를 초과했습니다
            error: Too Many Requests
            timestamp: "2024-01-01T00:00:00.000Z"
            path: /api/auth/login

    InternalServerError:
      description: 서버 내부 오류
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
          example:
            statusCode: 500
            message: 서버 내부 오류가 발생했습니다
            error: Internal Server Error
            timestamp: "2024-01-01T00:00:00.000Z"
            path: /api/users

  # 재사용 가능한 요청 본문
  requestBodies:
    UserCreation:
      description: 사용자 생성 요청
      required: true
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/CreateUserDto"
        application/xml:
          schema:
            $ref: "#/components/schemas/CreateUserDto"

  # 재사용 가능한 헤더
  headers:
    X-RateLimit-Limit:
      description: 시간당 요청 제한
      schema:
        type: integer
        example: 100

    X-RateLimit-Remaining:
      description: 남은 요청 수
      schema:
        type: integer
        example: 99

    X-Total-Count:
      description: 전체 항목 수
      schema:
        type: integer
        example: 100

# 태그 정의 (API 그룹화용)
tags:
  - name: Auth
    description: |
      인증 관련 API

      사용자 로그인, 로그아웃, 토큰 갱신 등의 기능을 제공합니다.
    externalDocs:
      description: 인증 가이드
      url: https://docs.company.com/auth

  - name: Users
    description: |
      사용자 관리 API

      사용자 정보 조회, 생성, 수정, 삭제 기능을 제공합니다.
    externalDocs:
      description: 사용자 관리 가이드
      url: https://docs.company.com/users

  - name: Admin
    description: |
      관리자 전용 API

      관리자만 접근할 수 있는 시스템 관리 기능을 제공합니다.

# 외부 문서 링크
externalDocs:
  description: 전체 API 가이드 문서
  url: https://docs.company.com/api-guide
```

## 4. 실무 팁

### 4.1 환경별 문서 분리

```typescript
// config/swagger.config.ts
export const getSwaggerConfig = () => {
  const baseConfig = new DocumentBuilder().setTitle("실무 프로젝트 API").setVersion("1.0.0")

  if (process.env.NODE_ENV === "development") {
    return baseConfig
      .setDescription("개발 환경 API 문서 - 모든 API 포함")
      .addServer("http://localhost:3000", "Local Development")
      .addBearerAuth()
      .build()
  } else if (process.env.NODE_ENV === "production") {
    return baseConfig
      .setDescription("프로덕션 API 문서 - 공개 API만 포함")
      .addServer("https://api.company.com", "Production")
      .addBearerAuth()
      .build()
  }
}
```

### 4.2 자동 YAML 파일 생성

```typescript
// scripts/generate-swagger.ts
import { NestFactory } from "@nestjs/core"
import { SwaggerModule } from "@nestjs/swagger"
import { AppModule } from "../src/app.module"
import { getSwaggerConfig } from "../src/config/swagger.config"
import * as fs from "fs"
import * as yaml from "yaml"

async function generateSwaggerFiles() {
  const app = await NestFactory.create(AppModule)
  const config = getSwaggerConfig()
  const document = SwaggerModule.createDocument(app, config)

  // JSON 파일 생성
  fs.writeFileSync("./swagger.json", JSON.stringify(document, null, 2))

  // YAML 파일 생성
  const yamlString = yaml.stringify(document)
  fs.writeFileSync("./swagger.yaml", yamlString)

  console.log("Swagger 파일이 생성되었습니다:")
  console.log("- swagger.json")
  console.log("- swagger.yaml")

  await app.close()
}

generateSwaggerFiles()
```

### 4.3 Package.json 스크립트 추가

```json
{
  "scripts": {
    "swagger:generate": "ts-node scripts/generate-swagger.ts",
    "swagger:serve": "swagger-ui-serve swagger.yaml",
    "build": "nest build && npm run swagger:generate"
  }
}
```

# NestJS Swagger 완전 가이드 - 2장: CRUD 예시

## 목차

- [1. Entity 및 DTO 설계](#1-entity-및-dto-설계)
- [2. CRUD Controller 구현](#2-crud-controller-구현)
- [3. 고급 쿼리 처리](#3-고급-쿼리-처리)
- [4. 실무 팁](#4-실무-팁)

## 1. Entity 및 DTO 설계

### 1.1 User Entity (CLI 플러그인 활용)

```typescript
// entities/user.entity.ts
import { ApiProperty } from "@nestjs/swagger"

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  SUSPENDED = "suspended",
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  MODERATOR = "moderator",
}

export class User {
  @ApiProperty({
    example: 1,
    description: "사용자 고유 ID",
    readOnly: true,
  })
  id: number

  @ApiProperty({
    example: "john@example.com",
    description: "사용자 이메일 주소",
    format: "email",
  })
  email: string

  @ApiProperty({
    example: "홍길동",
    description: "사용자 이름",
  })
  name: string

  @ApiProperty({
    example: 25,
    description: "사용자 나이",
    minimum: 1,
    maximum: 120,
  })
  age: number

  @ApiProperty({
    example: UserStatus.ACTIVE,
    description: "사용자 계정 상태",
    enum: UserStatus,
  })
  status: UserStatus

  @ApiProperty({
    example: [UserRole.USER],
    description: "사용자 권한",
    enum: UserRole,
    isArray: true,
  })
  roles: UserRole[]

  @ApiProperty({
    example: "010-1234-5678",
    description: "전화번호",
    required: false,
  })
  phoneNumber?: string

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "계정 생성일시",
    readOnly: true,
  })
  createdAt: Date

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "마지막 수정일시",
    readOnly: true,
  })
  updatedAt: Date
}
```

### 1.2 DTO 설계 (CLI 플러그인으로 간소화)

```typescript
// dto/create-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  Length,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  IsArray,
  ArrayMinSize,
  Matches,
} from "class-validator"
import { Transform } from "class-transformer"
import { UserStatus, UserRole } from "../entities/user.entity"

export class CreateUserDto {
  /**
   * 사용자 이메일 주소 (필수)
   * @example john@example.com
   */
  @IsEmail({}, { message: "올바른 이메일 형식을 입력해주세요" })
  @IsNotEmpty({ message: "이메일은 필수 항목입니다" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string

  /**
   * 사용자 이름 (2-50자)
   * @example 홍길동
   */
  @IsString({ message: "이름은 문자열이어야 합니다" })
  @Length(2, 50, { message: "이름은 2-50자 사이여야 합니다" })
  @Transform(({ value }) => value?.trim())
  name: string

  /**
   * 사용자 나이 (1-120세)
   * @example 25
   */
  @IsNumber({}, { message: "나이는 숫자여야 합니다" })
  @Min(1, { message: "나이는 1세 이상이어야 합니다" })
  @Max(120, { message: "나이는 120세 이하여야 합니다" })
  @Transform(({ value }) => parseInt(value))
  age: number

  /**
   * 비밀번호 (8자 이상, 영문+숫자+특수문자)
   * @example MyPassword123!
   */
  @IsString()
  @Length(8, 100, { message: "비밀번호는 8-100자 사이여야 합니다" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: "비밀번호는 대소문자, 숫자, 특수문자를 모두 포함해야 합니다",
  })
  password: string

  /**
   * 사용자 계정 상태
   * @example active
   */
  @IsOptional()
  @IsEnum(UserStatus, { message: "올바른 상태 값을 선택해주세요" })
  status?: UserStatus = UserStatus.PENDING

  /**
   * 사용자 권한 목록
   * @example ["user"]
   */
  @IsOptional()
  @IsArray({ message: "권한은 배열 형태여야 합니다" })
  @ArrayMinSize(1, { message: "최소 하나의 권한이 필요합니다" })
  @IsEnum(UserRole, { each: true, message: "올바른 권한 값을 선택해주세요" })
  roles?: UserRole[] = [UserRole.USER]

  /**
   * 전화번호 (선택사항, 한국 번호 형식)
   * @example 010-1234-5678
   */
  @IsOptional()
  @IsPhoneNumber("KR", { message: "올바른 한국 전화번호 형식을 입력해주세요" })
  phoneNumber?: string
}
```

```typescript
// dto/update-user.dto.ts
import { PartialType, OmitType } from "@nestjs/swagger"
import { CreateUserDto } from "./create-user.dto"
import { IsOptional } from "class-validator"

// 비밀번호는 수정에서 제외 (별도 API로 처리)
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ["password"] as const)) {
  /**
   * 사용자 이메일 주소 (수정 시 선택사항)
   * @example jane@example.com
   */
  @IsOptional()
  email?: string

  /**
   * 사용자 이름 (수정 시 선택사항)
   * @example 김철수
   */
  @IsOptional()
  name?: string

  /**
   * 사용자 나이 (수정 시 선택사항)
   * @example 30
   */
  @IsOptional()
  age?: number
}
```

```typescript
// dto/query-user.dto.ts
import { IsOptional, IsEnum, IsString, IsNumberString, Min, Max } from "class-validator"
import { Transform, Type } from "class-transformer"
import { UserStatus, UserRole } from "../entities/user.entity"

export class QueryUserDto {
  /**
   * 페이지 번호 (1부터 시작)
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: "페이지는 1 이상이어야 합니다" })
  page?: number = 1

  /**
   * 페이지당 항목 수 (최대 100)
   * @example 10
   */
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: "항목 수는 1 이상이어야 합니다" })
  @Max(100, { message: "항목 수는 100 이하여야 합니다" })
  limit?: number = 10

  /**
   * 사용자 상태 필터
   * @example active
   */
  @IsOptional()
  @IsEnum(UserStatus, { message: "올바른 상태 값을 선택해주세요" })
  status?: UserStatus

  /**
   * 사용자 권한 필터
   * @example user
   */
  @IsOptional()
  @IsEnum(UserRole, { message: "올바른 권한 값을 선택해주세요" })
  role?: UserRole

  /**
   * 이름 또는 이메일 검색 (부분 일치)
   * @example 홍길동
   */
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string

  /**
   * 정렬 기준 필드
   * @example createdAt
   */
  @IsOptional()
  @IsEnum(["id", "name", "email", "createdAt", "updatedAt"], {
    message: "올바른 정렬 필드를 선택해주세요",
  })
  sortBy?: string = "createdAt"

  /**
   * 정렬 순서
   * @example desc
   */
  @IsOptional()
  @IsEnum(["asc", "desc"], { message: "정렬 순서는 asc 또는 desc여야 합니다" })
  sortOrder?: "asc" | "desc" = "desc"

  /**
   * 최소 나이 필터
   * @example 18
   */
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  minAge?: number

  /**
   * 최대 나이 필터
   * @example 65
   */
  @IsOptional()
  @Type(() => Number)
  @Max(120)
  maxAge?: number

  /**
   * 가입일 범위 시작 (ISO 8601 형식)
   * @example 2024-01-01
   */
  @IsOptional()
  @IsString()
  createdAfter?: string

  /**
   * 가입일 범위 끝 (ISO 8601 형식)
   * @example 2024-12-31
   */
  @IsOptional()
  @IsString()
  createdBefore?: string
}
```

```typescript
// dto/response.dto.ts
import { ApiProperty } from "@nestjs/swagger"
import { User } from "../entities/user.entity"

export class PaginatedUsersResponse {
  @ApiProperty({
    type: [User],
    description: "사용자 목록",
  })
  data: User[]

  @ApiProperty({
    example: 150,
    description: "전체 사용자 수",
  })
  total: number

  @ApiProperty({
    example: 1,
    description: "현재 페이지 번호",
  })
  page: number

  @ApiProperty({
    example: 10,
    description: "페이지당 항목 수",
  })
  limit: number

  @ApiProperty({
    example: 15,
    description: "전체 페이지 수",
  })
  totalPages: number

  @ApiProperty({
    example: true,
    description: "다음 페이지 존재 여부",
  })
  hasNext: boolean

  @ApiProperty({
    example: false,
    description: "이전 페이지 존재 여부",
  })
  hasPrev: boolean
}

export class UserStatsResponse {
  @ApiProperty({
    example: 150,
    description: "전체 사용자 수",
  })
  totalUsers: number

  @ApiProperty({
    example: 120,
    description: "활성 사용자 수",
  })
  activeUsers: number

  @ApiProperty({
    example: 15,
    description: "대기 중인 사용자 수",
  })
  pendingUsers: number

  @ApiProperty({
    example: 10,
    description: "비활성 사용자 수",
  })
  inactiveUsers: number

  @ApiProperty({
    example: 5,
    description: "정지된 사용자 수",
  })
  suspendedUsers: number
}
```

## 2. CRUD Controller 구현

### 2.1 Users Controller

```typescript
// users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
  ConflictException,
} from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiExtraModels,
  getSchemaPath,
} from "@nestjs/swagger"
import { UsersService } from "./users.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { QueryUserDto } from "./dto/query-user.dto"
import { PaginatedUsersResponse, UserStatsResponse } from "./dto/response.dto"
import { User } from "./entities/user.entity"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "./entities/user.entity"

@ApiTags("Users")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiExtraModels(User, PaginatedUsersResponse, UserStatsResponse)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "새 사용자 생성",
    description: "새로운 사용자를 생성합니다. 관리자 권한이 필요합니다.",
  })
  @ApiCreatedResponse({
    description: "사용자가 성공적으로 생성되었습니다",
    type: User,
    headers: {
      Location: {
        description: "생성된 사용자의 URL",
        schema: { type: "string", example: "/users/123" },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "잘못된 입력 데이터",
    schema: {
      example: {
        statusCode: 400,
        message: ["올바른 이메일 형식을 입력해주세요", "이름은 2-50자 사이여야 합니다"],
        error: "Bad Request",
      },
    },
  })
  @ApiConflictResponse({
    description: "이미 존재하는 이메일",
    schema: {
      example: {
        statusCode: 409,
        message: "이미 존재하는 이메일입니다",
        error: "Conflict",
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "인증이 필요합니다" })
  @ApiForbiddenResponse({ description: "관리자 권한이 필요합니다" })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto)
  }

  @Get()
  @ApiOperation({
    summary: "사용자 목록 조회",
    description: "페이지네이션과 다양한 필터를 적용하여 사용자 목록을 조회합니다",
  })
  @ApiOkResponse({
    description: "사용자 목록이 성공적으로 조회되었습니다",
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedUsersResponse) },
        {
          example: {
            data: [
              {
                id: 1,
                email: "john@example.com",
                name: "홍길동",
                age: 25,
                status: "active",
                roles: ["user"],
                phoneNumber: "010-1234-5678",
                createdAt: "2024-01-01T00:00:00.000Z",
                updatedAt: "2024-01-01T00:00:00.000Z",
              },
            ],
            total: 150,
            page: 1,
            limit: 10,
            totalPages: 15,
            hasNext: true,
            hasPrev: false,
          },
        },
      ],
    },
  })
  async findAll(@Query() query: QueryUserDto): Promise<PaginatedUsersResponse> {
    return this.usersService.findAll(query)
  }

  @Get("stats")
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({
    summary: "사용자 통계 조회",
    description: "사용자 상태별 통계를 조회합니다. 관리자/모더레이터 권한이 필요합니다.",
  })
  @ApiOkResponse({
    description: "사용자 통계가 성공적으로 조회되었습니다",
    type: UserStatsResponse,
  })
  @ApiForbiddenResponse({ description: "관리자 또는 모더레이터 권한이 필요합니다" })
  async getUserStats(): Promise<UserStatsResponse> {
    return this.usersService.getUserStats()
  }

  @Get(":id")
  @ApiOperation({
    summary: "특정 사용자 조회",
    description: "ID로 특정 사용자의 상세 정보를 조회합니다",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "사용자 ID",
    example: 1,
  })
  @ApiOkResponse({
    description: "사용자 정보가 성공적으로 조회되었습니다",
    type: User,
  })
  @ApiNotFoundResponse({
    description: "사용자를 찾을 수 없습니다",
    schema: {
      example: {
        statusCode: 404,
        message: "ID가 123인 사용자를 찾을 수 없습니다",
        error: "Not Found",
      },
    },
  })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<User> {
    const user = await this.usersService.findOne(id)
    if (!user) {
      throw new NotFoundException(`ID가 ${id}인 사용자를 찾을 수 없습니다`)
    }
    return user
  }

  @Patch(":id")
  @ApiOperation({
    summary: "사용자 정보 수정",
    description: "특정 사용자의 정보를 부분적으로 수정합니다",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "수정할 사용자 ID",
    example: 1,
  })
  @ApiOkResponse({
    description: "사용자 정보가 성공적으로 수정되었습니다",
    type: User,
  })
  @ApiNotFoundResponse({ description: "사용자를 찾을 수 없습니다" })
  @ApiBadRequestResponse({ description: "잘못된 입력 데이터" })
  @ApiConflictResponse({ description: "이미 존재하는 이메일 (이메일 수정 시)" })
  async update(@Param("id", ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "사용자 삭제",
    description: "특정 사용자를 시스템에서 완전히 삭제합니다. 관리자 권한이 필요합니다.",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "삭제할 사용자 ID",
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: "사용자가 성공적으로 삭제되었습니다",
  })
  @ApiNotFoundResponse({ description: "사용자를 찾을 수 없습니다" })
  @ApiForbiddenResponse({ description: "관리자 권한이 필요합니다" })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.usersService.remove(id)
  }

  @Patch(":id/status")
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({
    summary: "사용자 상태 변경",
    description: "사용자의 계정 상태를 변경합니다 (활성화/비활성화/정지 등)",
  })
  @ApiParam({ name: "id", type: "number", description: "사용자 ID" })
  @ApiOkResponse({
    description: "사용자 상태가 성공적으로 변경되었습니다",
    type: User,
  })
  async updateStatus(@Param("id", ParseIntPipe) id: number, @Body("status") status: string): Promise<User> {
    return this.usersService.updateStatus(id, status)
  }

  @Post(":id/roles")
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: "사용자 권한 추가",
    description: "사용자에게 새로운 권한을 추가합니다",
  })
  @ApiParam({ name: "id", type: "number", description: "사용자 ID" })
  @ApiOkResponse({
    description: "사용자 권한이 성공적으로 추가되었습니다",
    type: User,
  })
  async addRole(@Param("id", ParseIntPipe) id: number, @Body("role") role: UserRole): Promise<User> {
    return this.usersService.addRole(id, role)
  }

  @Delete(":id/roles/:role")
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "사용자 권한 제거",
    description: "사용자로부터 특정 권한을 제거합니다",
  })
  @ApiParam({ name: "id", type: "number", description: "사용자 ID" })
  @ApiParam({ name: "role", enum: UserRole, description: "제거할 권한" })
  @ApiResponse({
    status: 204,
    description: "사용자 권한이 성공적으로 제거되었습니다",
  })
  async removeRole(@Param("id", ParseIntPipe) id: number, @Param("role") role: UserRole): Promise<void> {
    await this.usersService.removeRole(id, role)
  }
}
```

**생성되는 YAML 예시:**

```yaml
paths:
  /users:
    post:
      tags:
        - Users
      summary: 새 사용자 생성
      description: 새로운 사용자를 생성합니다. 관리자 권한이 필요합니다.
      security:
        - JWT-auth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateUserDto"
            examples:
              basic_user:
                summary: 기본 사용자
                value:
                  email: john@example.com
                  name: 홍길동
                  age: 25
                  password: MyPassword123!
                  status: pending
                  roles: [user]
              admin_user:
                summary: 관리자 사용자
                value:
                  email: admin@example.com
                  name: 관리자
                  age: 35
                  password: AdminPass123!
                  status: active
                  roles: [admin]
                  phoneNumber: 010-1234-5678
      responses:
        "201":
          description: 사용자가 성공적으로 생성되었습니다
          headers:
            Location:
              description: 생성된 사용자의 URL
              schema:
                type: string
                example: /users/123
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "400":
          description: 잘못된 입력 데이터
          content:
            application/json:
              schema:
                example:
                  statusCode: 400
                  message:
                    - 올바른 이메일 형식을 입력해주세요
                    - 이름은 2-50자 사이여야 합니다
                  error: Bad Request
        "409":
          description: 이미 존재하는 이메일
          content:
            application/json:
              schema:
                example:
                  statusCode: 409
                  message: 이미 존재하는 이메일입니다
                  error: Conflict
    get:
      tags:
        - Users
      summary: 사용자 목록 조회
      description: 페이지네이션과 다양한 필터를 적용하여 사용자 목록을 조회합니다
      security:
        - JWT-auth: []
      parameters:
        - name: page
          in: query
          required: false
          schema:
            type: number
            minimum: 1
            default: 1
            example: 1
          description: 페이지 번호 (1부터 시작)
        - name: limit
          in: query
          required: false
          schema:
            type: number
            minimum: 1
            maximum: 100
            default: 10
            example: 10
          description: 페이지당 항목 수 (최대 100)
        - name: status
          in: query
          required: false
          schema:
            type: string
            enum: [active, inactive, pending, suspended]
            example: active
          description: 사용자 상태 필터
        - name: role
          in: query
          required: false
          schema:
            type: string
            enum: [user, admin, moderator]
            example: user
          description: 사용자 권한 필터
        - name: search
          in: query
          required: false
          schema:
            type: string
            example: 홍길동
          description: 이름 또는 이메일 검색 (부분 일치)
        - name: sortBy
          in: query
          required: false
          schema:
            type: string
            enum: [id, name, email, createdAt, updatedAt]
            default: createdAt
            example: createdAt
          description: 정렬 기준 필드
        - name: sortOrder
          in: query
          required: false
          schema:
            type: string
            enum: [asc, desc]
            default: desc
            example: desc
          description: 정렬 순서
        - name: minAge
          in: query
          required: false
          schema:
            type: number
            minimum: 1
            example: 18
          description: 최소 나이 필터
        - name: maxAge
          in: query
          required: false
          schema:
            type: number
            maximum: 120
            example: 65
          description: 최대 나이 필터
        - name: createdAfter
          in: query
          required: false
          schema:
            type: string
            example: 2024-01-01
          description: 가입일 범위 시작 (ISO 8601 형식)
        - name: createdBefore
          in: query
          required: false
          schema:
            type: string
            example: 2024-12-31
          description: 가입일 범위 끝 (ISO 8601 형식)
      responses:
        "200":
          description: 사용자 목록이 성공적으로 조회되었습니다
          content:
            application/json:
              schema:
                allOf:
                  - $ref: "#/components/schemas/PaginatedUsersResponse"
                  - example:
                      data:
                        - id: 1
                          email: john@example.com
                          name: 홍길동
                          age: 25
                          status: active
                          roles: [user]
                          phoneNumber: 010-1234-5678
                          createdAt: "2024-01-01T00:00:00.000Z"
                          updatedAt: "2024-01-01T00:00:00.000Z"
                      total: 150
                      page: 1
                      limit: 10
                      totalPages: 15
                      hasNext: true
                      hasPrev: false

components:
  schemas:
    CreateUserDto:
      type: object
      required:
        - email
        - name
        - age
        - password
      properties:
        email:
          type: string
          format: email
          description: 사용자 이메일 주소 (필수)
          example: john@example.com
        name:
          type: string
          minLength: 2
          maxLength: 50
          description: 사용자 이름 (2-50자)
          example: 홍길동
        age:
          type: number
          minimum: 1
          maximum: 120
          description: 사용자 나이 (1-120세)
          example: 25
        password:
          type: string
          minLength: 8
          maxLength: 100
          description: 비밀번호 (8자 이상, 영문+숫자+특수문자)
          example: MyPassword123!
        status:
          type: string
          enum: [active, inactive, pending, suspended]
          default: pending
          description: 사용자 계정 상태
          example: active
        roles:
          type: array
          items:
            type: string
            enum: [user, admin, moderator]
          default: [user]
          description: 사용자 권한 목록
          example: [user]
        phoneNumber:
          type: string
          description: 전화번호 (선택사항, 한국 번호 형식)
          example: 010-1234-5678

    User:
      type: object
      properties:
        id:
          type: number
          description: 사용자 고유 ID
          example: 1
          readOnly: true
        email:
          type: string
          format: email
          description: 사용자 이메일 주소
          example: john@example.com
        name:
          type: string
          description: 사용자 이름
          example: 홍길동
        age:
          type: number
          minimum: 1
          maximum: 120
          description: 사용자 나이
          example: 25
        status:
          type: string
          enum: [active, inactive, pending, suspended]
          description: 사용자 계정 상태
          example: active
        roles:
          type: array
          items:
            type: string
            enum: [user, admin, moderator]
          description: 사용자 권한
          example: [user]
        phoneNumber:
          type: string
          description: 전화번호
          example: 010-1234-5678
        createdAt:
          type: string
          format: date-time
          description: 계정 생성일시
          example: "2024-01-01T00:00:00.000Z"
          readOnly: true
        updatedAt:
          type: string
          format: date-time
          description: 마지막 수정일시
          example: "2024-01-01T00:00:00.000Z"
          readOnly: true

    PaginatedUsersResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: "#/components/schemas/User"
          description: 사용자 목록
        total:
          type: number
          description: 전체 사용자 수
          example: 150
        page:
          type: number
          description: 현재 페이지 번호
          example: 1
        limit:
          type: number
          description: 페이지당 항목 수
          example: 10
        totalPages:
          type: number
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
```

## 3. 고급 쿼리 처리

### 3.1 복잡한 필터링 및 검색

```typescript
// dto/advanced-query.dto.ts
export class AdvancedUserQueryDto extends QueryUserDto {
  /**
   * 여러 상태를 OR 조건으로 검색
   * @example active,pending
   */
  @IsOptional()
  @Transform(({ value }) => value.split(",").map((s: string) => s.trim()))
  @IsEnum(UserStatus, { each: true })
  statuses?: UserStatus[]

  /**
   * 이메일 도메인 필터
   * @example gmail.com
   */
  @IsOptional()
  @IsString()
  emailDomain?: string

  /**
   * 특정 기간 내 활성 사용자 (일 단위)
   * @example 30
   */
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  activeDays?: number

  /**
   * 권한 보유 여부 (AND 조건)
   * @example user,moderator
   */
  @IsOptional()
  @Transform(({ value }) => value.split(",").map((r: string) => r.trim()))
  @IsEnum(UserRole, { each: true })
  hasAllRoles?: UserRole[]

  /**
   * 권한 중 하나라도 보유 (OR 조건)
   * @example admin,moderator
   */
  @IsOptional()
  @Transform(({ value }) => value.split(",").map((r: string) => r.trim()))
  @IsEnum(UserRole, { each: true })
  hasAnyRole?: UserRole[]
}
```

### 3.2 Service Layer 예시

```typescript
// users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(query: AdvancedUserQueryDto): Promise<PaginatedUsersResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      statuses,
      role,
      hasAllRoles,
      hasAnyRole,
      minAge,
      maxAge,
      emailDomain,
      activeDays,
      sortBy = "createdAt",
      sortOrder = "desc",
      createdAfter,
      createdBefore,
    } = query

    const queryBuilder = this.usersRepository.createQueryBuilder("user")

    // 검색 조건 (이름 또는 이메일)
    if (search) {
      queryBuilder.where("(user.name ILIKE :search OR user.email ILIKE :search)", { search: `%${search}%` })
    }

    // 단일 상태 필터
    if (status) {
      queryBuilder.andWhere("user.status = :status", { status })
    }

    // 여러 상태 필터 (OR 조건)
    if (statuses && statuses.length > 0) {
      queryBuilder.andWhere("user.status IN (:...statuses)", { statuses })
    }

    // 나이 범위 필터
    if (minAge) {
      queryBuilder.andWhere("user.age >= :minAge", { minAge })
    }
    if (maxAge) {
      queryBuilder.andWhere("user.age <= :maxAge", { maxAge })
    }

    // 이메일 도메인 필터
    if (emailDomain) {
      queryBuilder.andWhere("user.email ILIKE :emailDomain", {
        emailDomain: `%@${emailDomain}%`,
      })
    }

    // 권한 필터 (JSON 배열 검색)
    if (role) {
      queryBuilder.andWhere("user.roles @> :role", { role: `["${role}"]` })
    }

    // 모든 권한 보유 (AND 조건)
    if (hasAllRoles && hasAllRoles.length > 0) {
      hasAllRoles.forEach((roleItem, index) => {
        queryBuilder.andWhere(`user.roles @> :role${index}`, {
          [`role${index}`]: `["${roleItem}"]`,
        })
      })
    }

    // 권한 중 하나라도 보유 (OR 조건)
    if (hasAnyRole && hasAnyRole.length > 0) {
      const roleConditions = hasAnyRole.map((_, index) => `user.roles @> :anyRole${index}`).join(" OR ")

      const roleParams = hasAnyRole.reduce((params, roleItem, index) => {
        params[`anyRole${index}`] = `["${roleItem}"]`
        return params
      }, {})

      queryBuilder.andWhere(`(${roleConditions})`, roleParams)
    }

    // 가입일 범위 필터
    if (createdAfter) {
      queryBuilder.andWhere("user.createdAt >= :createdAfter", {
        createdAfter: new Date(createdAfter),
      })
    }
    if (createdBefore) {
      queryBuilder.andWhere("user.createdAt <= :createdBefore", {
        createdBefore: new Date(createdBefore),
      })
    }

    // 활성 사용자 필터 (특정 기간 내 로그인)
    if (activeDays) {
      const activeDate = new Date()
      activeDate.setDate(activeDate.getDate() - activeDays)
      queryBuilder.andWhere("user.lastLoginAt >= :activeDate", { activeDate })
    }

    // 정렬
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder.toUpperCase() as "ASC" | "DESC")

    // 페이지네이션 적용
    const offset = (page - 1) * limit
    queryBuilder.skip(offset).take(limit)

    // 결과 조회
    const [users, total] = await queryBuilder.getManyAndCount()

    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return {
      data: users,
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 이메일 중복 체크
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    })

    if (existingUser) {
      throw new ConflictException("이미 존재하는 이메일입니다")
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    })

    return this.usersRepository.save(user)
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["profile", "orders"], // 관련 엔티티 로드
    })

    if (!user) {
      throw new NotFoundException(`ID가 ${id}인 사용자를 찾을 수 없습니다`)
    }

    return user
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id)

    // 이메일 변경 시 중복 체크
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      })

      if (existingUser) {
        throw new ConflictException("이미 존재하는 이메일입니다")
      }
    }

    Object.assign(user, updateUserDto)
    user.updatedAt = new Date()

    return this.usersRepository.save(user)
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id)
    await this.usersRepository.remove(user)
  }

  async getUserStats(): Promise<UserStatsResponse> {
    const stats = await this.usersRepository
      .createQueryBuilder("user")
      .select([
        'COUNT(*) as "totalUsers"',
        "COUNT(CASE WHEN status = 'active' THEN 1 END) as \"activeUsers\"",
        "COUNT(CASE WHEN status = 'pending' THEN 1 END) as \"pendingUsers\"",
        "COUNT(CASE WHEN status = 'inactive' THEN 1 END) as \"inactiveUsers\"",
        "COUNT(CASE WHEN status = 'suspended' THEN 1 END) as \"suspendedUsers\"",
      ])
      .getRawOne()

    return {
      totalUsers: parseInt(stats.totalUsers),
      activeUsers: parseInt(stats.activeUsers),
      pendingUsers: parseInt(stats.pendingUsers),
      inactiveUsers: parseInt(stats.inactiveUsers),
      suspendedUsers: parseInt(stats.suspendedUsers),
    }
  }

  async updateStatus(id: number, status: string): Promise<User> {
    const user = await this.findOne(id)
    user.status = status as UserStatus
    user.updatedAt = new Date()
    return this.usersRepository.save(user)
  }

  async addRole(id: number, role: UserRole): Promise<User> {
    const user = await this.findOne(id)

    if (!user.roles.includes(role)) {
      user.roles.push(role)
      user.updatedAt = new Date()
      await this.usersRepository.save(user)
    }

    return user
  }

  async removeRole(id: number, role: UserRole): Promise<void> {
    const user = await this.findOne(id)

    if (user.roles.includes(role)) {
      user.roles = user.roles.filter((r) => r !== role)
      user.updatedAt = new Date()
      await this.usersRepository.save(user)
    }
  }
}
```

## 4. 실무 팁

### 4.1 커스텀 데코레이터로 반복 줄이기

```typescript
// decorators/api-paginated-response.decorator.ts
import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
  description?: string,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: description || `${model.name} 목록 조회 성공`,
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              total: {
                type: 'number',
                description: '전체 항목 수',
                example: 100,
              },
              page: {
                type: 'number',
                description: '현재 페이지',
                example: 1,
              },
              limit: {
                type: 'number',
                description: '페이지당 항목 수',
                example: 10,
              },
              totalPages: {
                type: 'number',
                description: '전체 페이지 수',
                example: 10,
              },
              hasNext: {
                type: 'boolean',
                description: '다음 페이지 존재 여부',
                example: true,
              },
              hasPrev: {
                type: 'boolean',
                description: '이전 페이지 존재 여부',
                example: false,
              },
            },
          },
        ],
      },
    }),
  );
};

// 사용 예시
@Get()
@ApiPaginatedResponse(User, '사용자 목록을 페이지네이션과 함께 조회합니다')
async findAll(@Query() query: QueryUserDto) {
  return this.usersService.findAll(query);
}
```

### 4.2 에러 응답 표준화

```typescript
// decorators/api-error-responses.decorator.ts
import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

export const ApiStandardErrorResponses = () => {
  return applyDecorators(
    ApiBadRequestResponse({
      description: '잘못된 요청',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            oneOf: [
              { type: 'string' },
              { type: 'array', items: { type: 'string' } }
            ],
            example: '잘못된 입력 데이터입니다'
          },
          error: { type: 'string', example: 'Bad Request' },
          timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          path: { type: 'string', example: '/users' },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: '인증 실패',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: '인증이 필요합니다' },
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
    ApiForbiddenResponse({
      description: '권한 없음',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: '접근 권한이 없습니다' },
          error: { type: 'string', example: 'Forbidden' },
        },
      },
    }),
    ApiNotFoundResponse({
      description: '리소스를 찾을 수 없음',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: '요청한 리소스를 찾을 수 없습니다' },
          error: { type: 'string', example: 'Not Found' },
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: '서버 내부 오류',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 500 },
          message: { type: 'string', example: '서버 내부 오류가 발생했습니다' },
          error: { type: 'string', example: 'Internal Server Error' },
        },
      },
    }),
  );
};

// 사용 예시
@Post()
@ApiStandardErrorResponses()
@ApiCreatedResponse({ type: User })
async create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

### 4.3 API 버전 관리

```typescript
// v1/users.controller.ts
@ApiTags("Users v1")
@Controller({ path: "users", version: "1" })
export class UsersV1Controller {
  // v1 구현
}

// v2/users.controller.ts
@ApiTags("Users v2")
@Controller({ path: "users", version: "2" })
export class UsersV2Controller {
  // v2 구현 (새로운 필드나 동작 추가)
}

// main.ts에서 버전 설정
app.enableVersioning({
  type: VersioningType.URI,
  prefix: "v",
})
```

### 4.4 동적 스키마 생성

```typescript
// utils/dynamic-schema.util.ts
export function createDynamicResponseSchema(
  baseSchema: any,
  additionalProperties: Record<string, any>
) {
  return {
    allOf: [
      { $ref: getSchemaPath(baseSchema) },
      {
        properties: additionalProperties,
      },
    ],
  };
}

// 사용 예시
@Get('with-stats')
@ApiOkResponse({
  description: '통계 정보가 포함된 사용자 목록',
  schema: createDynamicResponseSchema(PaginatedUsersResponse, {
    stats: {
      type: 'object',
      properties: {
        averageAge: { type: 'number', example: 28.5 },
        mostCommonRole: { type: 'string', example: 'user' },
      },
    },
  }),
})
async findAllWithStats() {
  // 구현
}
```

### 4.5 환경별 API 문서 분리

```typescript
// config/swagger-tags.ts
export const getSwaggerTags = () => {
  const baseTags = [
    { name: "Auth", description: "인증 관련 API" },
    { name: "Users", description: "사용자 관리 API" },
  ]

  if (process.env.NODE_ENV === "development") {
    baseTags.push(
      { name: "Debug", description: "디버그용 API (개발 환경만)" },
      { name: "Testing", description: "테스트용 API (개발 환경만)" },
    )
  }

  return baseTags
}

// 개발 환경에서만 보이는 컨트롤러
@ApiTags("Debug")
@Controller("debug")
export class DebugController {
  @Get("clear-cache")
  @ApiOperation({ summary: "캐시 초기화 (개발용)" })
  clearCache() {
    // 캐시 초기화 로직
  }
}
```

# NestJS Swagger 완전 가이드 - 3장: 인증 시스템

## 목차

- [1. 인증 DTO 설계](#1-인증-dto-설계)
- [2. Auth Controller 구현](#2-auth-controller-구현)
- [3. Guard 및 Decorator](#3-guard-및-decorator)
- [4. 보안 스키마 설정](#4-보안-스키마-설정)

## 1. 인증 DTO 설계

### 1.1 로그인 및 회원가입 DTO (CLI 플러그인 활용)

```typescript
// dto/login.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from "class-validator"
import { Transform } from "class-transformer"

export class LoginDto {
  /**
   * 사용자 이메일 주소
   * @example john@example.com
   */
  @IsEmail({}, { message: "올바른 이메일 형식을 입력해주세요" })
  @IsNotEmpty({ message: "이메일을 입력해주세요" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string

  /**
   * 사용자 비밀번호
   * @example MyPassword123!
   */
  @IsNotEmpty({ message: "비밀번호를 입력해주세요" })
  @MinLength(6, { message: "비밀번호는 최소 6자 이상이어야 합니다" })
  password: string

  /**
   * 로그인 상태 유지 여부
   * @example true
   */
  rememberMe?: boolean = false
}
```

```typescript
// dto/register.dto.ts
import { IsEmail, IsNotEmpty, MinLength, IsString, Matches, IsOptional, IsPhoneNumber, Length } from "class-validator"
import { Transform } from "class-transformer"

export class RegisterDto {
  /**
   * 사용자 이메일 주소 (로그인 ID로 사용)
   * @example john@example.com
   */
  @IsEmail({}, { message: "올바른 이메일 형식을 입력해주세요" })
  @IsNotEmpty({ message: "이메일을 입력해주세요" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string

  /**
   * 비밀번호 (8-100자, 대소문자, 숫자, 특수문자 포함)
   * @example MyPassword123!
   */
  @IsString()
  @Length(8, 100, { message: "비밀번호는 8-100자 사이여야 합니다" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: "비밀번호는 대소문자, 숫자, 특수문자를 모두 포함해야 합니다",
  })
  password: string

  /**
   * 비밀번호 확인 (password와 동일해야 함)
   * @example MyPassword123!
   */
  @IsString()
  @IsNotEmpty({ message: "비밀번호 확인을 입력해주세요" })
  passwordConfirm: string

  /**
   * 사용자 이름 (실명)
   * @example 홍길동
   */
  @IsString({ message: "이름은 문자열이어야 합니다" })
  @Length(2, 50, { message: "이름은 2-50자 사이여야 합니다" })
  @Transform(({ value }) => value?.trim())
  name: string

  /**
   * 전화번호 (선택사항, 한국 번호 형식)
   * @example 010-1234-5678
   */
  @IsOptional()
  @IsPhoneNumber("KR", { message: "올바른 전화번호 형식을 입력해주세요" })
  phoneNumber?: string

  /**
   * 약관 동의 여부 (필수)
   * @example true
   */
  @IsNotEmpty({ message: "약관 동의는 필수입니다" })
  agreeToTerms: boolean

  /**
   * 마케팅 수신 동의 여부 (선택)
   * @example false
   */
  @IsOptional()
  agreeToMarketing?: boolean = false
}
```

### 1.2 응답 DTO

```typescript
// dto/auth-response.dto.ts
import { ApiProperty } from "@nestjs/swagger"
import { User } from "../../users/entities/user.entity"

export class TokenResponse {
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT 액세스 토큰 (Bearer 타입)",
  })
  access_token: string

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT 리프레시 토큰",
  })
  refresh_token: string

  @ApiProperty({
    example: 3600,
    description: "액세스 토큰 만료 시간 (초)",
  })
  expires_in: number

  @ApiProperty({
    example: "Bearer",
    description: "토큰 타입",
    default: "Bearer",
  })
  token_type: string

  @ApiProperty({
    example: 604800,
    description: "리프레시 토큰 만료 시간 (초)",
  })
  refresh_expires_in: number
}

export class AuthResponse extends TokenResponse {
  @ApiProperty({
    type: User,
    description: "인증된 사용자 정보",
  })
  user: User
}

export class RefreshTokenResponse {
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "새로운 액세스 토큰",
  })
  access_token: string

  @ApiProperty({
    example: 3600,
    description: "새 토큰 만료 시간 (초)",
  })
  expires_in: number
}
```

### 1.3 비밀번호 관련 DTO

```typescript
// dto/change-password.dto.ts
import { IsNotEmpty, MinLength, Matches } from "class-validator"

export class ChangePasswordDto {
  /**
   * 현재 비밀번호
   * @example CurrentPass123!
   */
  @IsNotEmpty({ message: "현재 비밀번호를 입력해주세요" })
  currentPassword: string

  /**
   * 새 비밀번호 (8-100자, 대소문자, 숫자, 특수문자 포함)
   * @example NewPassword123!
   */
  @IsNotEmpty({ message: "새 비밀번호를 입력해주세요" })
  @MinLength(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: "비밀번호는 대소문자, 숫자, 특수문자를 모두 포함해야 합니다",
  })
  newPassword: string

  /**
   * 새 비밀번호 확인
   * @example NewPassword123!
   */
  @IsNotEmpty({ message: "새 비밀번호 확인을 입력해주세요" })
  newPasswordConfirm: string
}
```

```typescript
// dto/forgot-password.dto.ts
import { IsEmail, IsNotEmpty } from "class-validator"
import { Transform } from "class-transformer"

export class ForgotPasswordDto {
  /**
   * 비밀번호를 재설정할 계정의 이메일
   * @example john@example.com
   */
  @IsEmail({}, { message: "올바른 이메일 형식을 입력해주세요" })
  @IsNotEmpty({ message: "이메일을 입력해주세요" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string
}

export class ResetPasswordDto {
  /**
   * 이메일로 받은 재설정 토큰
   * @example abc123def456ghi789
   */
  @IsNotEmpty({ message: "재설정 토큰을 입력해주세요" })
  token: string

  /**
   * 새 비밀번호
   * @example NewPassword123!
   */
  @IsNotEmpty({ message: "새 비밀번호를 입력해주세요" })
  @MinLength(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: "비밀번호는 대소문자, 숫자, 특수문자를 모두 포함해야 합니다",
  })
  newPassword: string

  /**
   * 새 비밀번호 확인
   * @example NewPassword123!
   */
  @IsNotEmpty({ message: "새 비밀번호 확인을 입력해주세요" })
  newPasswordConfirm: string
}
```

## 2. Auth Controller 구현

### 2.1 Auth Controller

```typescript
// auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  Patch,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Headers,
  Ip,
} from "@nestjs/common"
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiHeader,
  ApiExtraModels,
} from "@nestjs/swagger"
import { AuthService } from "./auth.service"
import { UsersService } from "../users/users.service"
import { LoginDto } from "./dto/login.dto"
import { RegisterDto } from "./dto/register.dto"
import { ChangePasswordDto } from "./dto/change-password.dto"
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/forgot-password.dto"
import { AuthResponse, RefreshTokenResponse } from "./dto/auth-response.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { LocalAuthGuard } from "./guards/local-auth.guard"
import { User } from "../users/entities/user.entity"
import { Throttle } from "@nestjs/throttler"

@ApiTags("Auth")
@ApiExtraModels(AuthResponse, RefreshTokenResponse, User)
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post("register")
  @Throttle(5, 60) // 1분에 5번까지만 허용
  @ApiOperation({
    summary: "회원가입",
    description: "새로운 계정을 생성합니다. 이메일 중복 검사 및 비밀번호 강도 검사를 진행합니다.",
  })
  @ApiCreatedResponse({
    description: "회원가입 성공",
    type: AuthResponse,
    headers: {
      "Set-Cookie": {
        description: "refresh_token 쿠키 설정",
        schema: { type: "string", example: "refresh_token=abc123; HttpOnly; Secure; SameSite=Strict" },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "입력 데이터 검증 실패",
    schema: {
      example: {
        statusCode: 400,
        message: [
          "올바른 이메일 형식을 입력해주세요",
          "비밀번호는 대소문자, 숫자, 특수문자를 모두 포함해야 합니다",
          "비밀번호 확인이 일치하지 않습니다",
        ],
        error: "Bad Request",
      },
    },
  })
  @ApiConflictResponse({
    description: "이미 존재하는 이메일",
    schema: {
      example: {
        statusCode: 409,
        message: "이미 가입된 이메일입니다",
        error: "Conflict",
      },
    },
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Ip() ip: string,
    @Headers("user-agent") userAgent: string,
  ): Promise<AuthResponse> {
    // 비밀번호 확인 검증
    if (registerDto.password !== registerDto.passwordConfirm) {
      throw new BadRequestException("비밀번호 확인이 일치하지 않습니다")
    }

    return this.authService.register(registerDto, { ip, userAgent })
  }

  @Post("login")
  @UseGuards(LocalAuthGuard)
  @Throttle(10, 60) // 1분에 10번까지만 허용
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "로그인",
    description: "이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.",
  })
  @ApiOkResponse({
    description: "로그인 성공",
    type: AuthResponse,
    examples: {
      successful_login: {
        summary: "성공적인 로그인",
        value: {
          access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          expires_in: 3600,
          token_type: "Bearer",
          refresh_expires_in: 604800,
          user: {
            id: 1,
            email: "john@example.com",
            name: "홍길동",
            status: "active",
            roles: ["user"],
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "로그인 실패",
    schema: {
      oneOf: [
        {
          example: {
            statusCode: 401,
            message: "이메일 또는 비밀번호가 올바르지 않습니다",
            error: "Unauthorized",
          },
        },
        {
          example: {
            statusCode: 401,
            message: "계정이 비활성화되어 있습니다",
            error: "Unauthorized",
          },
        },
        {
          example: {
            statusCode: 401,
            message: "계정이 정지되었습니다",
            error: "Unauthorized",
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 429,
    description: "로그인 시도 제한 초과",
    schema: {
      example: {
        statusCode: 429,
        message: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요",
        error: "Too Many Requests",
      },
    },
  })
  async login(
    @Request() req,
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers("user-agent") userAgent: string,
  ): Promise<AuthResponse> {
    return this.authService.login(req.user, loginDto.rememberMe, { ip, userAgent })
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "토큰 갱신",
    description: "Refresh Token을 사용하여 새로운 Access Token을 발급받습니다.",
  })
  @ApiHeader({
    name: "Authorization",
    description: "Bearer {refresh_token}",
    required: true,
    example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @ApiOkResponse({
    description: "토큰 갱신 성공",
    type: RefreshTokenResponse,
  })
  @ApiUnauthorizedResponse({
    description: "유효하지 않은 리프레시 토큰",
    schema: {
      example: {
        statusCode: 401,
        message: "유효하지 않거나 만료된 리프레시 토큰입니다",
        error: "Unauthorized",
      },
    },
  })
  async refreshToken(@Headers("authorization") authorization: string): Promise<RefreshTokenResponse> {
    const refreshToken = authorization?.replace("Bearer ", "")
    if (!refreshToken) {
      throw new UnauthorizedException("리프레시 토큰이 제공되지 않았습니다")
    }

    return this.authService.refreshToken(refreshToken)
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "내 프로필 조회",
    description: "현재 로그인한 사용자의 프로필 정보를 조회합니다.",
  })
  @ApiOkResponse({
    description: "프로필 조회 성공",
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: "인증 토큰이 유효하지 않음",
    schema: {
      example: {
        statusCode: 401,
        message: "유효하지 않은 토큰입니다",
        error: "Unauthorized",
      },
    },
  })
  async getProfile(@Request() req): Promise<User> {
    return this.usersService.findOne(req.user.id)
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "로그아웃",
    description: "현재 세션을 종료하고 토큰을 무효화합니다.",
  })
  @ApiOkResponse({
    description: "로그아웃 성공",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "로그아웃되었습니다" },
        loggedOutAt: { type: "string", example: "2024-01-01T00:00:00.000Z" },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "인증 토큰이 유효하지 않음" })
  async logout(@Request() req): Promise<{ message: string; loggedOutAt: string }> {
    await this.authService.logout(req.user.id)
    return {
      message: "로그아웃되었습니다",
      loggedOutAt: new Date().toISOString(),
    }
  }

  @Patch("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "비밀번호 변경",
    description: "현재 비밀번호를 확인하고 새로운 비밀번호로 변경합니다.",
  })
  @ApiOkResponse({
    description: "비밀번호 변경 성공",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "비밀번호가 성공적으로 변경되었습니다" },
        changedAt: { type: "string", example: "2024-01-01T00:00:00.000Z" },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "비밀번호 변경 실패",
    schema: {
      oneOf: [
        {
          example: {
            statusCode: 400,
            message: "현재 비밀번호가 올바르지 않습니다",
            error: "Bad Request",
          },
        },
        {
          example: {
            statusCode: 400,
            message: "새 비밀번호 확인이 일치하지 않습니다",
            error: "Bad Request",
          },
        },
      ],
    },
  })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string; changedAt: string }> {
    // 새 비밀번호 확인 검증
    if (changePasswordDto.newPassword !== changePasswordDto.newPasswordConfirm) {
      throw new BadRequestException("새 비밀번호 확인이 일치하지 않습니다")
    }

    await this.authService.changePassword(req.user.id, changePasswordDto)
    return {
      message: "비밀번호가 성공적으로 변경되었습니다",
      changedAt: new Date().toISOString(),
    }
  }

  @Post("forgot-password")
  @Throttle(3, 300) // 5분에 3번까지만 허용
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "비밀번호 찾기",
    description: "등록된 이메일로 비밀번호 재설정 링크를 발송합니다.",
  })
  @ApiOkResponse({
    description: "비밀번호 재설정 이메일 발송 성공",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "비밀번호 재설정 링크를 이메일로 발송했습니다",
        },
        email: { type: "string", example: "john@example.com" },
        expiresIn: { type: "number", example: 3600, description: "토큰 만료 시간(초)" },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "존재하지 않는 이메일",
    schema: {
      example: {
        statusCode: 400,
        message: "등록되지 않은 이메일입니다",
        error: "Bad Request",
      },
    },
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string; email: string; expiresIn: number }> {
    const result = await this.authService.forgotPassword(forgotPasswordDto.email)
    return {
      message: "비밀번호 재설정 링크를 이메일로 발송했습니다",
      email: forgotPasswordDto.email,
      expiresIn: result.expiresIn,
    }
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "비밀번호 재설정",
    description: "이메일로 받은 토큰을 사용하여 새로운 비밀번호로 재설정합니다.",
  })
  @ApiOkResponse({
    description: "비밀번호 재설정 성공",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "비밀번호가 성공적으로 재설정되었습니다" },
        resetAt: { type: "string", example: "2024-01-01T00:00:00.000Z" },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "비밀번호 재설정 실패",
    schema: {
      oneOf: [
        {
          example: {
            statusCode: 400,
            message: "유효하지 않거나 만료된 토큰입니다",
            error: "Bad Request",
          },
        },
        {
          example: {
            statusCode: 400,
            message: "새 비밀번호 확인이 일치하지 않습니다",
            error: "Bad Request",
          },
        },
      ],
    },
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string; resetAt: string }> {
    // 새 비밀번호 확인 검증
    if (resetPasswordDto.newPassword !== resetPasswordDto.newPasswordConfirm) {
      throw new BadRequestException("새 비밀번호 확인이 일치하지 않습니다")
    }

    await this.authService.resetPassword(resetPasswordDto)
    return {
      message: "비밀번호가 성공적으로 재설정되었습니다",
      resetAt: new Date().toISOString(),
    }
  }

  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "활성 세션 목록",
    description: "현재 사용자의 모든 활성 세션 목록을 조회합니다.",
  })
  @ApiOkResponse({
    description: "세션 목록 조회 성공",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sessionId: { type: "string", example: "sess_abc123def456" },
          deviceInfo: { type: "string", example: "Chrome 91.0 on Windows 10" },
          ipAddress: { type: "string", example: "192.168.1.100" },
          location: { type: "string", example: "Seoul, South Korea" },
          lastActivity: { type: "string", example: "2024-01-01T00:00:00.000Z" },
          isCurrentSession: { type: "boolean", example: true },
        },
      },
    },
  })
  async getSessions(@Request() req) {
    return this.authService.getUserSessions(req.user.id)
  }

  @Delete("sessions/:sessionId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "특정 세션 종료",
    description: "지정된 세션을 종료합니다.",
  })
  @ApiResponse({
    status: 204,
    description: "세션이 성공적으로 종료되었습니다",
  })
  async terminateSession(@Request() req, @Param("sessionId") sessionId: string): Promise<void> {
    await this.authService.terminateSession(req.user.id, sessionId)
  }
}
```

## 3. Guard 및 Decorator

### 3.1 JWT Auth Guard

```typescript
// guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { Reflector } from "@nestjs/core"
import { IS_PUBLIC_KEY } from "../decorators/public.decorator"

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    return super.canActivate(context)
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException("유효하지 않은 토큰입니다")
    }
    return user
  }
}
```

### 3.2 Role-based Guard

```typescript
// guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { UserRole } from "../../users/entities/user.entity"
import { ROLES_KEY } from "../decorators/roles.decorator"

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.some((role) => user.roles?.includes(role))
  }
}
```

### 3.3 Custom Decorators

```typescript
// decorators/roles.decorator.ts
import { SetMetadata } from "@nestjs/common"
import { UserRole } from "../../users/entities/user.entity"

export const ROLES_KEY = "roles"
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
```

```typescript
// decorators/public.decorator.ts
import { SetMetadata } from "@nestjs/common"

export const IS_PUBLIC_KEY = "isPublic"
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
```

```typescript
// decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common"

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})
```

## 4. 보안 스키마 설정

### 4.1 제네릭 응답 래퍼

```typescript
// dto/generic-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseWrapper<T> {
  @ApiProperty({ example: true, description: '요청 성공 여부' })
  success: boolean;

  @ApiProperty({ example: 200, description: 'HTTP 상태 코드' })
  statusCode: number;

  @ApiProperty({ example: '요청이 성공적으로 처리되었습니다', description: '응답 메시지' })
  message: string;

  @ApiProperty({ description: '응답 데이터' })
  data: T;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: '응답 시간' })
  timestamp: string;

  @ApiProperty({ example: '/auth/login', description: '요청 경로' })
  path: string;
}

// 제네릭 응답 데코레이터
export function ApiSuccessResponse<T>(
  type: new () => T,
  description?: string,
  statusCode: number = 200,
) {
  return ApiResponse({
    status: statusCode,
    description: description || '성공',
    schema: {
      allOf: [
        {
          properties: {
            success: { type: 'boolean', example: true },
            statusCode: { type: 'number', example: statusCode },
            message: { type: 'string', example: '요청이 성공적으로 처리되었습니다' },
            data: { $ref: getSchemaPath(type) },
            timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            path: { type: 'string', example: '/auth/login' },
          },
        },
      ],
    },
  });
}

// 사용 예시
@Post('login')
@ApiSuccessResponse(AuthResponse, '로그인 성공')
async login(@Body() loginDto: LoginDto) {
  const result = await this.authService.login(loginDto);

  return {
    success: true,
    statusCode: 200,
    message: '로그인이 성공적으로 완료되었습니다',
    data: result,
    timestamp: new Date().toISOString(),
    path: '/auth/login',
  };
}
```

### 4.2 Swagger 보안 설정

```typescript
// config/swagger-security.config.ts
export const getSecuritySchemes = () => ({
  "JWT-auth": {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: `
      JWT 인증 토큰을 입력하세요.
      
      토큰 획득 방법:
      1. /auth/login API로 로그인
      2. 응답에서 access_token 값 복사
      3. 'Bearer ' 접두사 없이 토큰만 입력
      
      예시: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    `,
    in: "header",
  },
  "API-Key": {
    type: "apiKey",
    name: "X-API-KEY",
    in: "header",
    description: `
      서버에서 발급받은 API 키를 입력하세요.
      
      API 키 발급 방법:
      1. 관리자에게 API 키 발급 요청
      2. 발급받은 키를 X-API-KEY 헤더에 포함
    `,
  },
  "Refresh-Token": {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: `
      리프레시 토큰을 입력하세요.
      토큰 갱신 시에만 사용됩니다.
    `,
  },
})
```

**생성되는 YAML 예시:**

```yaml
paths:
  /auth/login:
    post:
      tags:
        - Auth
      summary: 로그인
      description: 이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/LoginDto"
            examples:
              normal_login:
                summary: 일반 사용자 로그인
                value:
                  email: user@example.com
                  password: MyPassword123!
                  rememberMe: false
              admin_login:
                summary: 관리자 로그인
                value:
                  email: admin@example.com
                  password: AdminPass123!
                  rememberMe: true
      responses:
        "200":
          description: 로그인 성공
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AuthResponse"
              examples:
                successful_login:
                  summary: 성공적인 로그인
                  value:
                    access_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                    refresh_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                    expires_in: 3600
                    token_type: Bearer
                    refresh_expires_in: 604800
                    user:
                      id: 1
                      email: john@example.com
                      name: 홍길동
                      status: active
                      roles: [user]
        "401":
          description: 로그인 실패
          content:
            application/json:
              schema:
                oneOf:
                  - example:
                      statusCode: 401
                      message: 이메일 또는 비밀번호가 올바르지 않습니다
                      error: Unauthorized
                  - example:
                      statusCode: 401
                      message: 계정이 비활성화되어 있습니다
                      error: Unauthorized

components:
  securitySchemes:
    JWT-auth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT 인증 토큰을 입력하세요.

        토큰 획득 방법:
        1. /auth/login API로 로그인
        2. 응답에서 access_token 값 복사
        3. 'Bearer ' 접두사 없이 토큰만 입력
    API-Key:
      type: apiKey
      name: X-API-KEY
      in: header
      description: |
        서버에서 발급받은 API 키를 입력하세요.

  schemas:
    LoginDto:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
          description: 사용자 이메일 주소
          example: john@example.com
        password:
          type: string
          description: 사용자 비밀번호
          example: MyPassword123!
        rememberMe:
          type: boolean
          description: 로그인 상태 유지 여부
          example: false
          default: false

    AuthResponse:
      type: object
      required:
        - access_token
        - refresh_token
        - expires_in
        - token_type
        - user
      properties:
        access_token:
          type: string
          description: JWT 액세스 토큰 (Bearer 타입)
          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        refresh_token:
          type: string
          description: JWT 리프레시 토큰
          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        expires_in:
          type: number
          description: 액세스 토큰 만료 시간 (초)
          example: 3600
        token_type:
          type: string
          description: 토큰 타입
          example: Bearer
          default: Bearer
        refresh_expires_in:
          type: number
          description: 리프레시 토큰 만료 시간 (초)
          example: 604800
        user:
          $ref: "#/components/schemas/User"

    ApiResponseWrapper:
      type: object
      properties:
        success:
          type: boolean
          description: 요청 성공 여부
          example: true
        statusCode:
          type: number
          description: HTTP 상태 코드
          example: 200
        message:
          type: string
          description: 응답 메시지
          example: 요청이 성공적으로 처리되었습니다
        data:
          description: 응답 데이터
        timestamp:
          type: string
          format: date-time
          description: 응답 시간
          example: "2024-01-01T00:00:00.000Z"
        path:
          type: string
          description: 요청 경로
          example: /auth/login
```

# NestJS Swagger 완전 가이드 - 5장: 필터와 인터셉터

## 목차

- [1. Exception Filter](#1-exception-filter)
- [2. Response Transform Interceptor](#2-response-transform-interceptor)
- [3. Logging Interceptor](#3-logging-interceptor)
- [4. 실무 활용 예시](#4-실무-활용-예시)

## 1. Exception Filter

### 1.1 HTTP Exception Filter

```typescript
// filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common"
import { Request, Response } from "express"
import { ApiProperty } from "@nestjs/swagger"

export class ErrorResponse {
  @ApiProperty({
    example: 400,
    description: "HTTP 상태 코드",
  })
  statusCode: number

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "에러 발생 시각",
  })
  timestamp: string

  @ApiProperty({
    example: "/users",
    description: "요청 경로",
  })
  path: string

  @ApiProperty({
    example: "POST",
    description: "HTTP 메서드",
  })
  method: string

  @ApiProperty({
    oneOf: [
      { type: "string", example: "잘못된 요청입니다" },
      {
        type: "array",
        items: { type: "string" },
        example: ["이메일은 필수입니다", "비밀번호는 8자 이상이어야 합니다"],
      },
    ],
    description: "에러 메시지",
  })
  message: string | string[]

  @ApiProperty({
    example: "Bad Request",
    description: "에러 타입",
  })
  error: string

  @ApiProperty({
    example: "ValidationError",
    description: "상세 에러 코드 (선택사항)",
    required: false,
  })
  errorCode?: string

  @ApiProperty({
    example: {
      field: "email",
      value: "invalid-email",
      constraint: "isEmail",
    },
    description: "추가 에러 정보 (개발 환경)",
    required: false,
  })
  details?: any

  @ApiProperty({
    example: "req-123456",
    description: "요청 ID (추적용)",
    required: false,
  })
  requestId?: string
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    // 요청 ID 생성 (추적용)
    const requestId = this.generateRequestId()

    let message: string | string[]
    let errorCode: string | undefined
    let details: any

    if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any
      message = responseObj.message || exception.message
      errorCode = responseObj.errorCode
      details = responseObj.details
    } else {
      message = exceptionResponse as string
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: exception.name,
      ...(errorCode && { errorCode }),
      ...(details && process.env.NODE_ENV === "development" && { details }),
      requestId,
    }

    // 에러 로깅
    this.logger.error(
      `HTTP ${status} Error: ${JSON.stringify({
        requestId,
        method: request.method,
        path: request.url,
        message: message,
        userAgent: request.get("User-Agent"),
        ip: request.ip,
        userId: (request as any).user?.id,
      })}`,
      exception.stack,
    )

    response.status(status).json(errorResponse)
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
```

### 1.2 Validation Exception Filter

```typescript
// filters/validation-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from "@nestjs/common"
import { Response } from "express"

export interface ValidationErrorDetail {
  field: string
  value: any
  constraints: Record<string, string>
}

export class ValidationErrorResponse extends ErrorResponse {
  @ApiProperty({
    type: [Object],
    example: [
      {
        field: "email",
        value: "invalid-email",
        constraints: {
          isEmail: "올바른 이메일 형식을 입력해주세요",
          isNotEmpty: "이메일은 필수입니다",
        },
      },
    ],
    description: "유효성 검사 실패 상세 정보",
  })
  validationErrors: ValidationErrorDetail[]
}

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest()

    const exceptionResponse = exception.getResponse() as any

    // class-validator 에러인 경우 처리
    if (Array.isArray(exceptionResponse.message)) {
      const validationErrors: ValidationErrorDetail[] = []

      exceptionResponse.message.forEach((error: any) => {
        if (typeof error === "object" && error.constraints) {
          validationErrors.push({
            field: error.property,
            value: error.value,
            constraints: error.constraints,
          })
        }
      })

      const errorResponse: ValidationErrorResponse = {
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: "입력 데이터 검증에 실패했습니다",
        error: "Validation Error",
        errorCode: "VALIDATION_FAILED",
        validationErrors,
        requestId: `req-${Date.now()}`,
      }

      response.status(400).json(errorResponse)
    } else {
      // 일반적인 BadRequestException 처리
      const errorResponse: ErrorResponse = {
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: exceptionResponse.message || "잘못된 요청입니다",
        error: "Bad Request",
        requestId: `req-${Date.now()}`,
      }

      response.status(400).json(errorResponse)
    }
  }
}
```

### 1.3 Global Exception Filter

```typescript
// filters/global-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common"

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    let status: number
    let message: string
    let errorType: string

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      message = exception.message
      errorType = exception.constructor.name
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      message = process.env.NODE_ENV === "production" ? "서버 내부 오류가 발생했습니다" : exception.message
      errorType = exception.constructor.name
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      message = "알 수 없는 오류가 발생했습니다"
      errorType = "UnknownError"
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: errorType,
      requestId: `req-${Date.now()}`,
    }

    // 심각한 에러 로깅
    if (status >= 500) {
      this.logger.error(
        `Critical Error: ${JSON.stringify({
          ...errorResponse,
          stack: exception instanceof Error ? exception.stack : undefined,
          userAgent: request.get("User-Agent"),
          ip: request.ip,
          userId: request.user?.id,
        })}`,
      )
    }

    response.status(status).json(errorResponse)
  }
}
```

## 2. Response Transform Interceptor

### 2.1 기본 응답 변환 인터셉터

```typescript
// interceptors/transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import { ApiProperty } from "@nestjs/swagger"

export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
  timestamp: string
  path: string
  requestId: string
}

export class StandardApiResponse<T> {
  @ApiProperty({
    example: true,
    description: "요청 성공 여부",
  })
  success: boolean

  @ApiProperty({
    example: 200,
    description: "HTTP 상태 코드",
  })
  statusCode: number

  @ApiProperty({
    example: "요청이 성공적으로 처리되었습니다",
    description: "응답 메시지",
  })
  message: string

  @ApiProperty({
    description: "응답 데이터",
  })
  data: T

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "응답 시간",
  })
  timestamp: string

  @ApiProperty({
    example: "/users",
    description: "요청 경로",
  })
  path: string

  @ApiProperty({
    example: "req-123456",
    description: "요청 ID (추적용)",
  })
  requestId: string
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()
    const requestId = request.requestId || `req-${Date.now()}`

    return next.handle().pipe(
      map((data) => {
        // 이미 변환된 응답인지 확인
        if (data && typeof data === "object" && "success" in data) {
          return data as ApiResponse<T>
        }

        // 기본 성공 메시지 설정
        let message = "요청이 성공적으로 처리되었습니다"

        // HTTP 메서드에 따른 메시지 커스터마이징
        switch (request.method) {
          case "POST":
            message = "리소스가 성공적으로 생성되었습니다"
            break
          case "PUT":
          case "PATCH":
            message = "리소스가 성공적으로 수정되었습니다"
            break
          case "DELETE":
            message = "리소스가 성공적으로 삭제되었습니다"
            break
        }

        return {
          success: true,
          statusCode: response.statusCode,
          message,
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId,
        }
      }),
    )
  }
}
```

### 2.2 페이지네이션 응답 인터셉터

```typescript
// interceptors/pagination-transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  meta?: {
    took: number // 처리 시간 (ms)
    filters?: Record<string, any>
    sort?: {
      field: string
      order: "asc" | "desc"
    }
  }
}

@Injectable()
export class PaginationTransformInterceptor<T>
  implements NestInterceptor<PaginatedResponse<T>, ApiResponse<PaginatedResponse<T>>>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<PaginatedResponse<T>>> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()
    const startTime = Date.now()

    return next.handle().pipe(
      map((result) => {
        const took = Date.now() - startTime

        // 페이지네이션 응답인지 확인
        if (result && typeof result === "object" && "data" in result && "total" in result) {
          const paginatedResult: PaginatedResponse<T> = {
            ...result,
            meta: {
              took,
              filters: this.extractFilters(request.query),
              sort: this.extractSort(request.query),
            },
          }

          return {
            success: true,
            statusCode: response.statusCode,
            message: `${result.data.length}개의 항목을 조회했습니다`,
            data: paginatedResult,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId: request.requestId || `req-${Date.now()}`,
          }
        }

        // 일반 응답 처리
        return {
          success: true,
          statusCode: response.statusCode,
          message: "요청이 성공적으로 처리되었습니다",
          data: result,
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.requestId || `req-${Date.now()}`,
        }
      }),
    )
  }

  private extractFilters(query: any): Record<string, any> {
    const filters: Record<string, any> = {}
    const excludeKeys = ["page", "limit", "sortBy", "sortOrder"]

    Object.keys(query).forEach((key) => {
      if (!excludeKeys.includes(key) && query[key] !== undefined) {
        filters[key] = query[key]
      }
    })

    return filters
  }

  private extractSort(query: any): { field: string; order: "asc" | "desc" } | undefined {
    if (query.sortBy) {
      return {
        field: query.sortBy,
        order: query.sortOrder || "desc",
      }
    }
    return undefined
  }
}
```

## 3. Logging Interceptor

### 3.1 요청/응답 로깅 인터셉터

```typescript
// interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common"
import { Observable } from "rxjs"
import { tap, catchError } from "rxjs/operators"
import { throwError } from "rxjs"

export interface RequestLog {
  requestId: string
  method: string
  url: string
  userAgent?: string
  ip: string
  userId?: number
  body?: any
  query?: any
  headers?: Record<string, string>
  timestamp: string
}

export interface ResponseLog extends RequestLog {
  statusCode: number
  responseTime: number
  responseSize?: number
  error?: {
    message: string
    stack?: string
  }
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // 요청 ID를 request 객체에 추가
    request.requestId = requestId

    const requestLog: RequestLog = {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.get("User-Agent"),
      ip: request.ip || request.connection.remoteAddress,
      userId: request.user?.id,
      body: this.sanitizeBody(request.body),
      query: request.query,
      headers: this.sanitizeHeaders(request.headers),
      timestamp: new Date().toISOString(),
    }

    this.logger.log(`📨 [${requestId}] ${request.method} ${request.url} - START`)

    // 상세 로그 (개발 환경에서만)
    if (process.env.NODE_ENV === "development") {
      this.logger.debug(`Request Details: ${JSON.stringify(requestLog, null, 2)}`)
    }

    const startTime = Date.now()

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - startTime
        const responseSize = JSON.stringify(data).length

        const responseLog: ResponseLog = {
          ...requestLog,
          statusCode: response.statusCode,
          responseTime,
          responseSize,
        }

        this.logger.log(
          `📤 [${requestId}] ${request.method} ${request.url} - ${response.statusCode} - ${responseTime}ms`,
        )

        // 느린 요청 경고 (3초 이상)
        if (responseTime > 3000) {
          this.logger.warn(`🐌 [${requestId}] Slow Request: ${responseTime}ms - ${request.method} ${request.url}`)
        }

        // 상세 응답 로그 (개발 환경에서만)
        if (process.env.NODE_ENV === "development") {
          this.logger.debug(`Response Details: ${JSON.stringify(responseLog, null, 2)}`)
        }
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime

        const errorLog: ResponseLog = {
          ...requestLog,
          statusCode: error.status || 500,
          responseTime,
          error: {
            message: error.message,
            stack: error.stack,
          },
        }

        this.logger.error(
          `❌ [${requestId}] ${request.method} ${request.url} - ${error.status || 500} - ${responseTime}ms`,
        )

        this.logger.error(`Error Details: ${JSON.stringify(errorLog, null, 2)}`)

        return throwError(() => error)
      }),
    )
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== "object") {
      return body
    }

    const sensitiveFields = ["password", "passwordConfirm", "token", "accessToken", "refreshToken"]
    const sanitized = { ...body }

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "***HIDDEN***"
      }
    })

    return sanitized
  }

  private sanitizeHeaders(headers: any): Record<string, string> {
    const sensitiveHeaders = ["authorization", "cookie", "x-api-key"]
    const sanitized: Record<string, string> = {}

    Object.keys(headers).forEach((key) => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = "***HIDDEN***"
      } else {
        sanitized[key] = headers[key]
      }
    })

    return sanitized
  }
}
```

### 3.2 성능 모니터링 인터셉터

```typescript
// interceptors/performance.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from "@nestjs/common"
import { Observable } from "rxjs"
import { tap } from "rxjs/operators"

export interface PerformanceMetrics {
  endpoint: string
  method: string
  responseTime: number
  memoryUsage: {
    before: NodeJS.MemoryUsage
    after: NodeJS.MemoryUsage
    delta: {
      rss: number
      heapUsed: number
      heapTotal: number
      external: number
    }
  }
  cpuUsage?: {
    before: NodeJS.CpuUsage
    after: NodeJS.CpuUsage
    delta: NodeJS.CpuUsage
  }
  timestamp: string
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name)
  private readonly slowRequestThreshold = 1000 // 1초
  private readonly memoryLeakThreshold = 50 * 1024 * 1024 // 50MB

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const startTime = Date.now()
    const startMemory = process.memoryUsage()
    const startCpuUsage = process.cpuUsage()

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now()
        const responseTime = endTime - startTime
        const endMemory = process.memoryUsage()
        const endCpuUsage = process.cpuUsage(startCpuUsage)

        const metrics: PerformanceMetrics = {
          endpoint: `${request.method} ${request.route?.path || request.url}`,
          method: request.method,
          responseTime,
          memoryUsage: {
            before: startMemory,
            after: endMemory,
            delta: {
              rss: endMemory.rss - startMemory.rss,
              heapUsed: endMemory.heapUsed - startMemory.heapUsed,
              heapTotal: endMemory.heapTotal - startMemory.heapTotal,
              external: endMemory.external - startMemory.external,
            },
          },
          cpuUsage: {
            before: startCpuUsage,
            after: endCpuUsage,
            delta: endCpuUsage,
          },
          timestamp: new Date().toISOString(),
        }

        // 느린 요청 로깅
        if (responseTime > this.slowRequestThreshold) {
          this.logger.warn(`🐌 Slow Request: ${metrics.endpoint} - ${responseTime}ms`)
        }

        // 메모리 사용량 증가 경고
        if (metrics.memoryUsage.delta.heapUsed > this.memoryLeakThreshold) {
          this.logger.warn(
            `🧠 High Memory Usage: ${metrics.endpoint} - +${(metrics.memoryUsage.delta.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          )
        }

        // 성능 메트릭 로깅 (개발 환경에서만)
        if (process.env.NODE_ENV === "development") {
          this.logger.debug(`📊 Performance Metrics: ${JSON.stringify(metrics, null, 2)}`)
        }

        // 메트릭을 모니터링 시스템으로 전송 (프로덕션에서)
        if (process.env.NODE_ENV === "production") {
          this.sendMetricsToMonitoring(metrics)
        }
      }),
    )
  }

  private sendMetricsToMonitoring(metrics: PerformanceMetrics): void {
    // 여기서 실제 모니터링 시스템 (예: Prometheus, DataDog)으로 메트릭 전송
    // 예시: prometheus client, statsd client 등 사용
    console.log("Sending metrics to monitoring system:", metrics)
  }
}
```

## 4. 실무 활용 예시

### 4.1 통합 데모 컨트롤러

```typescript
// demo/filters-interceptors-demo.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseInterceptors,
  UseFilters,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiQuery,
  ApiParam,
} from "@nestjs/swagger"
import { TransformInterceptor } from "../interceptors/transform.interceptor"
import { LoggingInterceptor } from "../interceptors/logging.interceptor"
import { PerformanceInterceptor } from "../interceptors/performance.interceptor"
import { HttpExceptionFilter } from "../filters/http-exception.filter"
import { ValidationExceptionFilter } from "../filters/validation-exception.filter"
import { StandardApiResponse } from "../interceptors/transform.interceptor"
import { IsString, IsNumber, Min, Max, IsOptional } from "class-validator"

export class DemoRequestDto {
  /**
   * 테스트할 시나리오
   * @example success
   */
  @IsString({ message: "시나리오는 문자열이어야 합니다" })
  scenario: "success" | "validation-error" | "not-found" | "server-error"

  /**
   * 응답 지연 시간 (밀리초)
   * @example 100
   */
  @IsOptional()
  @IsNumber({}, { message: "지연 시간은 숫자여야 합니다" })
  @Min(0, { message: "지연 시간은 0 이상이어야 합니다" })
  @Max(10000, { message: "지연 시간은 10초 이하여야 합니다" })
  delay?: number

  /**
   * 테스트 데이터
   * @example Test data for demo
   */
  @IsOptional()
  @IsString()
  data?: string
}

export class DemoResponse {
  @ApiProperty({ example: 1, description: "Demo ID" })
  id: number

  @ApiProperty({ example: "success", description: "실행된 시나리오" })
  scenario: "success" | "validation-error" | "not-found" | "server-error"

  @ApiProperty({ example: "Demo executed successfully", description: "실행 결과" })
  result: string

  @ApiProperty({ example: 150, description: "처리 시간 (밀리초)" })
  processingTime: number

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z", description: "실행 시간" })
  executedAt: string
}

@ApiTags("필터 & 인터셉터 데모")
@UseInterceptors(LoggingInterceptor, PerformanceInterceptor, TransformInterceptor)
@UseFilters(ValidationExceptionFilter, HttpExceptionFilter)
@Controller("demo/filters-interceptors")
export class FiltersInterceptorsDemoController {
  @Get("success")
  @ApiOperation({
    summary: "성공 응답 데모",
    description: "정상적인 성공 응답을 반환하여 Transform Interceptor의 동작을 확인합니다.",
  })
  @ApiOkResponse({
    description: "성공 응답 (Transform Interceptor 적용됨)",
    type: StandardApiResponse,
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: "요청이 성공적으로 처리되었습니다",
        data: {
          id: 1,
          scenario: "success",
          result: "Demo executed successfully",
          processingTime: 50,
          executedAt: "2024-01-01T00:00:00.000Z",
        },
        timestamp: "2024-01-01T00:00:00.000Z",
        path: "/demo/filters-interceptors/success",
        requestId: "req-123456",
      },
    },
  })
  @ApiQuery({
    name: "delay",
    required: false,
    type: "number",
    description: "응답 지연 시간 (밀리초)",
    example: 100,
  })
  async getSuccess(@Query("delay") delay?: number): Promise<DemoResponse> {
    const startTime = Date.now()

    // 지연 시간 적용
    if (delay && delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    const processingTime = Date.now() - startTime

    return {
      id: 1,
      scenario: "success",
      result: "Demo executed successfully",
      processingTime,
      executedAt: new Date().toISOString(),
    }
  }

  @Post("validation-error")
  @ApiOperation({
    summary: "유효성 검사 에러 데모",
    description: "잘못된 데이터를 전송하여 Validation Exception Filter의 동작을 확인합니다.",
  })
  @ApiBadRequestResponse({
    description: "유효성 검사 실패 (Validation Exception Filter 적용됨)",
    schema: {
      example: {
        statusCode: 400,
        timestamp: "2024-01-01T00:00:00.000Z",
        path: "/demo/filters-interceptors/validation-error",
        method: "POST",
        message: "입력 데이터 검증에 실패했습니다",
        error: "Validation Error",
        errorCode: "VALIDATION_FAILED",
        validationErrors: [
          {
            field: "scenario",
            value: "invalid-scenario",
            constraints: {
              isIn: "scenario must be one of the following values: success, validation-error, not-found, server-error",
            },
          },
        ],
        requestId: "req-123456",
      },
    },
  })
  async postValidationError(@Body() dto: DemoRequestDto): Promise<DemoResponse> {
    const startTime = Date.now()
    const processingTime = Date.now() - startTime

    return {
      id: 2,
      scenario: dto.scenario,
      result: "This should not be reached due to validation error",
      processingTime,
      executedAt: new Date().toISOString(),
    }
  }

  @Get("not-found/:id")
  @ApiOperation({
    summary: "404 에러 데모",
    description: "존재하지 않는 리소스 요청으로 HTTP Exception Filter의 동작을 확인합니다.",
  })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Demo ID (999를 입력하면 404 에러 발생)",
    example: 999,
  })
  @ApiOkResponse({
    description: "리소스 조회 성공",
    type: StandardApiResponse,
  })
  @ApiNotFoundResponse({
    description: "리소스를 찾을 수 없음 (HTTP Exception Filter 적용됨)",
    schema: {
      example: {
        statusCode: 404,
        timestamp: "2024-01-01T00:00:00.000Z",
        path: "/demo/filters-interceptors/not-found/999",
        method: "GET",
        message: "ID가 999인 리소스를 찾을 수 없습니다",
        error: "NotFoundException",
        errorCode: "RESOURCE_NOT_FOUND",
        requestId: "req-123456",
      },
    },
  })
  async getNotFound(@Param("id", ParseIntPipe) id: number): Promise<DemoResponse> {
    if (id === 999) {
      throw new NotFoundException(`ID가 ${id}인 리소스를 찾을 수 없습니다`, "RESOURCE_NOT_FOUND")
    }

    const startTime = Date.now()
    const processingTime = Date.now() - startTime

    return {
      id,
      scenario: "success",
      result: `Found resource with ID ${id}`,
      processingTime,
      executedAt: new Date().toISOString(),
    }
  }

  @Get("server-error")
  @ApiOperation({
    summary: "500 에러 데모",
    description: "서버 내부 오류를 발생시켜 Global Exception Filter의 동작을 확인합니다.",
  })
  @ApiOkResponse({
    description: "성공 응답",
    type: StandardApiResponse,
  })
  @ApiInternalServerErrorResponse({
    description: "서버 내부 오류 (Global Exception Filter 적용됨)",
    schema: {
      example: {
        statusCode: 500,
        timestamp: "2024-01-01T00:00:00.000Z",
        path: "/demo/filters-interceptors/server-error",
        method: "GET",
        message: "데이터베이스 연결에 실패했습니다",
        error: "InternalServerErrorException",
        requestId: "req-123456",
      },
    },
  })
  async getServerError(): Promise<DemoResponse> {
    // 의도적으로 서버 에러 발생
    throw new InternalServerErrorException("데이터베이스 연결에 실패했습니다")
  }

  @Get("slow-request")
  @ApiOperation({
    summary: "느린 요청 데모",
    description: "처리 시간이 긴 요청으로 Performance Interceptor의 경고 로그를 확인합니다.",
  })
  @ApiQuery({
    name: "duration",
    required: false,
    type: "number",
    description: "처리 시간 (밀리초, 기본값: 2000)",
    example: 2000,
  })
  @ApiOkResponse({
    description: "느린 요청 처리 완료",
    type: StandardApiResponse,
  })
  async getSlowRequest(@Query("duration") duration: number = 2000): Promise<DemoResponse> {
    const startTime = Date.now()

    // CPU 집약적 작업 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, duration))

    // 메모리 사용량 증가 시뮬레이션
    const largeArray = new Array(1000000).fill("memory-test-data")

    const processingTime = Date.now() - startTime

    return {
      id: Date.now(),
      scenario: "success",
      result: `Slow request completed in ${processingTime}ms`,
      processingTime,
      executedAt: new Date().toISOString(),
    }
  }

  @Post("complex-scenario")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "복합 시나리오 데모",
    description: "요청 본문에 따라 다양한 상황을 시뮬레이션하여 모든 필터와 인터셉터의 동작을 확인합니다.",
  })
  @ApiResponse({
    status: 201,
    description: "시나리오 실행 성공",
    type: StandardApiResponse,
  })
  @ApiBadRequestResponse({
    description: "잘못된 시나리오 또는 유효성 검사 실패",
  })
  @ApiNotFoundResponse({
    description: "not-found 시나리오 실행 시",
  })
  @ApiInternalServerErrorResponse({
    description: "server-error 시나리오 실행 시",
  })
  async postComplexScenario(@Body() dto: DemoRequestDto): Promise<DemoResponse> {
    const startTime = Date.now()

    // 지연 시간 적용
    if (dto.delay && dto.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, dto.delay))
    }

    // 시나리오별 처리
    switch (dto.scenario) {
      case "success":
        break // 정상 처리

      case "not-found":
        throw new NotFoundException("요청한 리소스를 찾을 수 없습니다", "RESOURCE_NOT_FOUND")

      case "server-error":
        throw new InternalServerErrorException("시뮬레이션된 서버 오류입니다")

      case "validation-error":
        throw new BadRequestException("시뮬레이션된 유효성 검사 오류입니다")

      default:
        throw new BadRequestException("지원하지 않는 시나리오입니다")
    }

    const processingTime = Date.now() - startTime

    return {
      id: Date.now(),
      scenario: dto.scenario,
      result: `Scenario '${dto.scenario}' executed successfully with data: ${dto.data || "none"}`,
      processingTime,
      executedAt: new Date().toISOString(),
    }
  }

  @Get("pagination-demo")
  @UseInterceptors(PaginationTransformInterceptor)
  @ApiOperation({
    summary: "페이지네이션 인터셉터 데모",
    description: "Pagination Transform Interceptor의 동작을 확인합니다.",
  })
  @ApiQuery({ name: "page", required: false, type: "number", example: 1 })
  @ApiQuery({ name: "limit", required: false, type: "number", example: 10 })
  @ApiQuery({ name: "category", required: false, type: "string", example: "demo" })
  @ApiOkResponse({
    description: "페이지네이션 응답 (Pagination Transform Interceptor 적용됨)",
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: "10개의 항목을 조회했습니다",
        data: {
          data: [
            { id: 1, name: "Demo Item 1", category: "demo" },
            { id: 2, name: "Demo Item 2", category: "demo" },
          ],
          pagination: {
            total: 100,
            page: 1,
            limit: 10,
            totalPages: 10,
            hasNext: true,
            hasPrev: false,
          },
          meta: {
            took: 45,
            filters: { category: "demo" },
            sort: { field: "id", order: "asc" },
          },
        },
        timestamp: "2024-01-01T00:00:00.000Z",
        path: "/demo/filters-interceptors/pagination-demo",
        requestId: "req-123456",
      },
    },
  })
  async getPaginationDemo(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("category") category?: string,
  ) {
    // 가상의 데이터 생성
    const total = 100
    const data = Array.from({ length: limit }, (_, index) => ({
      id: (page - 1) * limit + index + 1,
      name: `Demo Item ${(page - 1) * limit + index + 1}`,
      category: category || "demo",
      createdAt: new Date().toISOString(),
    }))

    const totalPages = Math.ceil(total / limit)

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }
}
```

### 4.2 main.ts에서 글로벌 설정

```typescript
// main.ts에 추가할 글로벌 설정
import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"
import { GlobalExceptionFilter } from "./filters/global-exception.filter"
import { HttpExceptionFilter } from "./filters/http-exception.filter"
import { ValidationExceptionFilter } from "./filters/validation-exception.filter"
import { TransformInterceptor } from "./interceptors/transform.interceptor"
import { LoggingInterceptor } from "./interceptors/logging.interceptor"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 글로벌 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          property: error.property,
          value: error.value,
          constraints: error.constraints,
        }))
        return new BadRequestException({
          message: "Validation failed",
          errors: formattedErrors,
        })
      },
    }),
  )

  // 글로벌 필터 설정 (순서 중요!)
  app.useGlobalFilters(
    new GlobalExceptionFilter(), // 가장 마지막에 처리
    new ValidationExceptionFilter(), // Validation 에러 전용
    new HttpExceptionFilter(), // HTTP 에러 전용
  )

  // 글로벌 인터셉터 설정
  app.useGlobalInterceptors(
    new LoggingInterceptor(), // 로깅이 가장 먼저
    new TransformInterceptor(), // 응답 변환은 마지막
  )

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle("필터 & 인터셉터 데모 API")
    .setDescription(
      `
      NestJS의 필터와 인터셉터 동작을 확인할 수 있는 데모 API입니다.
      
      ## 적용된 글로벌 설정
      
      ### 필터 (Filters)
      - **GlobalExceptionFilter**: 모든 예외를 처리하는 최종 필터
      - **ValidationExceptionFilter**: 유효성 검사 실패 시 상세한 에러 정보 제공
      - **HttpExceptionFilter**: HTTP 예외를 표준화된 형태로 변환
      
      ### 인터셉터 (Interceptors)
      - **LoggingInterceptor**: 모든 요청/응답을 로깅
      - **TransformInterceptor**: 응답을 표준화된 형태로 변환
      - **PerformanceInterceptor**: 성능 메트릭 수집 (데모 컨트롤러에만 적용)
      
      ## 테스트 방법
      
      1. **성공 응답**: GET /demo/filters-interceptors/success
      2. **유효성 검사 에러**: POST /demo/filters-interceptors/validation-error (잘못된 데이터 전송)
      3. **404 에러**: GET /demo/filters-interceptors/not-found/999
      4. **500 에러**: GET /demo/filters-interceptors/server-error
      5. **느린 요청**: GET /demo/filters-interceptors/slow-request
      6. **복합 시나리오**: POST /demo/filters-interceptors/complex-scenario
      7. **페이지네이션**: GET /demo/filters-interceptors/pagination-demo
    `,
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("필터 & 인터셉터 데모", "필터와 인터셉터의 동작을 확인할 수 있는 데모 API")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api-docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  })

  await app.listen(3000)

  console.log("🚀 Application is running on: http://localhost:3000")
  console.log("📚 Swagger docs: http://localhost:3000/api-docs")
  console.log("🧪 Demo endpoints: http://localhost:3000/demo/filters-interceptors")
}

bootstrap()
```

**생성되는 YAML 예시:**

```yaml
paths:
  /demo/filters-interceptors/success:
    get:
      tags:
        - 필터 & 인터셉터 데모
      summary: 성공 응답 데모
      description: 정상적인 성공 응답을 반환하여 Transform Interceptor의 동작을 확인합니다.
      parameters:
        - name: delay
          in: query
          required: false
          description: 응답 지연 시간 (밀리초)
          schema:
            type: number
            example: 100
      responses:
        '200':
          description: 성공 응답 (Transform Interceptor 적용됨)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/StandardApiResponse'
              example:
                success: true
                statusCode: 200
                message: 요청이 성공적으로 처리되었습니다
                data:
                  id: 1
                  scenario: success
                  result: Demo executed successfully
                  processingTime: 50
                  executedAt: '2024-01-01T00:00:00.000Z'
                timestamp: '2024-01-01T00:00:00.000Z'
                path: /demo/filters-interceptors/success
                requestId: req-123456

  /demo/filters-interceptors/validation-error:
    post:
      tags:
        - 필터 & 인터셉터 데모
      summary: 유효성 검사 에러 데모
      description: 잘못된 데이터를 전송하여 Validation Exception Filter의 동작을 확인합니다.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DemoRequestDto'
            examples:
              invalid_scenario:
                summary: 잘못된 시나리오 값
                value:
                  scenario: invalid-scenario
                  delay: 100
                  data: test data
              invalid_delay:
                summary: 잘못된 지연 시간
                value:
                  scenario: success
                  delay: -100
                  data: test data
      responses:
        '400':
          description: 유효성 검사 실패 (Validation Exception Filter 적용됨)
          content:
            application/json:
              schema:
                example:
                  statusCode: 400
                  timestamp: '2024-01-01T00:00:00.000Z'
                  path: /demo/filters-interceptors/validation-error
                  method: POST
                  message: 입력 데이터 검증에 실패했습니다
                  error: Validation Error
                  errorCode: VALIDATION_FAILED
                  validationErrors:
                    - field: scenario
                      value: invalid-scenario
                      constraints:
                        isIn: scenario must be one of the following values: success, validation-error, not-found, server-error
                  requestId: req-123456

components:
  schemas:
    StandardApiResponse:
      type: object
      properties:
        success:
          type: boolean
          description: 요청 성공 여부
          example: true
        statusCode:
          type: number
          description: HTTP 상태 코드
          example: 200
        message:
          type: string
          description: 응답 메시지
          example: 요청이 성공적으로 처리되었습니다
        data:
          description: 응답 데이터
        timestamp:
          type: string
          description: 응답 시간
          example: '2024-01-01T00:00:00.000Z'
        path:
          type: string
          description: 요청 경로
          example: /demo/filters-interceptors/success
        requestId:
          type: string
          description: 요청 ID (추적용)
          example: req-123456

    ErrorResponse:
      type: object
      properties:
        statusCode:
          type: number
          description: HTTP 상태 코드
          example: 400
        timestamp:
          type: string
          description: 에러 발생 시각
          example: '2024-01-01T00:00:00.000Z'
        path:
          type: string
          description: 요청 경로
          example: /users
        method:
          type: string
          description: HTTP 메서드
          example: POST
        message:
          oneOf:
            - type: string
              example: 잘못된 요청입니다
            - type: array
              items:
                type: string
              example: [이메일은 필수입니다, 비밀번호는 8자 이상이어야 합니다]
          description: 에러 메시지
        error:
          type: string
          description: 에러 타입
          example: Bad Request
        errorCode:
          type: string
          description: 상세 에러 코드 (선택사항)
          example: ValidationError
        requestId:
          type: string
          description: 요청 ID (추적용)
          example: req-123456

    DemoRequestDto:
      type: object
      required:
        - scenario
      properties:
        scenario:
          type: string
          enum: [success, validation-error, not-found, server-error]
          description: 테스트할 시나리오
          example: success
        delay:
          type: number
          minimum: 0
          maximum: 10000
          description: 응답 지연 시간 (밀리초)
          example: 100
        data:
          type: string
          description: 테스트 데이터
          example: Test data for demo

    DemoResponse:
      type: object
      properties:
        id:
          type: number
          description: Demo ID
          example: 1
        scenario:
          type: string
          enum: [success, validation-error, not-found, server-error]
          description: 실행된 시나리오
          example: success
        result:
          type: string
          description: 실행 결과
          example: Demo executed successfully
        processingTime:
          type: number
          description: 처리 시간 (밀리초)
          example: 150
        executedAt:
          type: string
          format: date-time
          description: 실행 시간
          example: '2024-01-01T00:00:00.000Z'
```

이제 모든 챕터가 완성되었습니다! 각 챕터별로:

1. **1장**: 기본 설정 및 CLI 플러그인 활용
2. **2장**: CRUD 예시와 고급 쿼리 처리
3. **3장**: 인증 시스템과 제네릭 응답
4. **4장**: 파일 업로드 (건너뜀)
5. **5장**: 필터와 인터셉터 완전 가이드

실무에서 바로 사용할 수 있는 포괄적인 예시들과 함께 OpenAPI YAML 구조까지 포함되어 있습니다.
