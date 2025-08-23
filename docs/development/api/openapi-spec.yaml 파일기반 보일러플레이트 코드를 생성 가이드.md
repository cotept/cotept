# OpenAPI Spec 기반 보일러플레이트 코드 생성 가이드

## 1. 개요

이 가이드는 API First 개발 방법론과 AI(Gemini)의 협업을 통해 OpenAPI Specification (OAS) 파일을 기반으로 NestJS 백엔드 서버의 보일러플레이트 코드를 효율적으로 생성하는 방법을 설명합니다. 이를 통해 API 계약의 일관성을 유지하고, 개발 시작 시간을 단축하며, 휴먼 에러를 줄일 수 있습니다.

## 2. 전제 조건

AI가 정확하고 프로젝트 컨벤션에 맞는 보일러플레이트 코드를 생성하기 위해서는 다음 정보가 필요합니다:

1.  **OpenAPI 스펙 내용**:
    *   생성하고자 하는 API 엔드포인트 및 관련 스키마가 정의된 `openapi-spec.yaml` 파일의 전체 내용 또는 해당 부분.
    *   특히 `paths` 섹션(경로, HTTP 메서드, 요청/응답 스키마, 파라미터 등)과 `components/schemas` 섹션(DTO 정의)이 중요합니다.

2.  **대상 모듈/도메인 이름**:
    *   생성된 코드가 위치할 프로젝트 내의 특정 모듈 이름 (예: `user`, `auth`, `mentoring`). 이는 `modules/{모듈명}/` 경로를 결정합니다.

3.  **생성할 API 오퍼레이션**:
    *   OpenAPI 스펙 내에서 어떤 특정 API 오퍼레이션(예: `createUser`, `getUserById`, `updateSessionStatus`)에 대한 보일러플레이트를 생성할지 명확히 지정해야 합니다.

## 3. AI의 보일러플레이트 생성 과정

제공된 정보를 바탕으로 AI는 다음과 같은 단계를 거쳐 보일러플레이트 코드를 생성합니다:

1.  **스펙 파싱**: OpenAPI 스펙에서 지정된 API 오퍼레이션의 세부 정보(HTTP 메서드, 경로, 요청 본문(Request Body)의 스키마, 응답 스키마, 파라미터, 요약, 설명 등)를 추출합니다.
2.  **폴더 구조 매핑**: 대상 모듈 이름(`modules/{모듈명}/`)을 기반으로 프로젝트의 표준 폴더 구조(`presentation/http`, `business/usecases`, `business/facade`, `infrastructure/mappers`, `domain/model`, `infrastructure/persistence/entities`, `infrastructure/persistence/repositories` 등)에 맞춰 파일 경로를 결정합니다.
3.  **`@apps/src/shared` 컴포넌트 활용**: 프로젝트의 `apps/api/src/shared` 디렉토리에 정의된 공통 인프라스트럭처 컴포넌트들을 적극적으로 참조하고 활용하여 일관된 아키텍처를 유지합니다.
    *   **기본 클래스/추상화**:
        *   `BaseUseCase` (`business/abstracts/base.usecase.ts`): 모든 유스케이스의 기본 로직(로깅, 에러 핸들링)을 상속받아 사용합니다.
        *   `AbstractRepository` (`infrastructure/persistence/base/abstract.repository.ts`): TypeORM 기반 리포지토리의 공통 인터페이스를 정의합니다.
        *   `AbstractNoSQLRepository` (`infrastructure/persistence/base/abstract.nosql.repository.ts`): NoSQL 기반 리포지토리의 공통 인터페이스를 정의합니다.
        *   `BaseEntity` (`infrastructure/persistence/base/base.entity.ts`): TypeORM 엔티티의 기본 필드(idx, createdAt, updatedAt)를 제공합니다.
    *   **매퍼**:
        *   `BaseMapper` (`infrastructure/mappers/base.mapper.ts`): 공통 매핑 유틸리티를 제공합니다.
        *   `EntityMapper` (`infrastructure/mappers/entity.mapper.ts`): 도메인 모델과 TypeORM 엔티티 간의 변환을 담당합니다.
        *   `DtoMapper` (`infrastructure/mappers/dto.mapper.ts`): 도메인 모델과 DTO 간의 변환을 담당합니다.
    *   **공통 유틸리티/서비스**:
        *   `ApiResponse`, `ErrorResponse` (`infrastructure/dto/api-response.dto.ts`): 표준화된 API 응답 및 에러 응답 형식을 사용합니다.
        *   `ApiOkResponseWrapper`, `ApiStandardErrors` 등 (`infrastructure/decorators/api-response.decorator.ts`, `common-error-responses.decorator.ts`): Swagger 문서화를 위한 커스텀 데코레이터를 활용합니다.
        *   `CryptoService` (`infrastructure/services/crypto/crypto.service.ts`): 암호화 관련 기능을 필요시 참조합니다.
        *   `CacheService` (`infrastructure/cache/redis/cache.service.ts`): 캐싱 로직을 필요시 참조합니다.
        *   `winstonLogger` (`infrastructure/common/logger/winston.logger.ts`): 일관된 로깅을 위해 사용합니다.
        *   `HttpErrorFilter`, `HttpResponseInterceptor` (`infrastructure/common/filters/http-error.filter.ts`, `infrastructure/common/interceptors/http-response.interceptor.ts`): 전역 필터 및 인터셉터 설정을 고려합니다.
        *   `ValidationPipe`, `IsNotSequential` 등 (`infrastructure/common/validators/is-not-sequential.validator.ts`): 유효성 검사 로직을 적용합니다.
4.  **보일러플레이트 코드 생성**: 추출된 정보와 참조된 공통 컴포넌트들을 기반으로 다음 파일들을 생성하고, 필요한 DTO, 인터페이스, 메서드 시그니처 등을 자동으로 채워 넣습니다.

    *   `modules/{모듈명}/presentation/http/{모듈명}.controller.ts`
    *   `modules/{모듈명}/business/usecases/{오퍼레이션명}.usecase.ts`
    *   `modules/{모듈명}/business/facade/{모듈명}-facade.service.ts`
    *   `modules/{모듈명}/infrastructure/mappers/{모듈명}.mapper.ts`
    *   `modules/{모듈명}/domain/model/{모듈명}.ts`
    *   `modules/{모듈명}/infrastructure/persistence/entities/{모듈명}.entity.ts`
    *   `modules/{모듈명}/infrastructure/persistence/repositories/{모듈명}.repository.ts` (인터페이스 및 구현체)
    *   `modules/{모듈명}/{모듈명}.module.ts` (새로 생성된 컴포넌트들을 포함하도록 업데이트)

## 4. 예시 (OpenAPI 스펙 -> 생성될 코드 구조)

### OpenAPI 스펙 조각 (`paths/user.yaml` 및 `components/schemas.yaml` 일부)

```yaml
# paths/user.yaml
/users:
  post:
    summary: Create a new user
    operationId: createUser
    tags:
      - User
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/CreateUserDto'
    responses:
      '201':
        description: User created successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserDto'
      '400':
        description: Bad Request
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ErrorResponse'
      '409':
        description: Conflict (e.g., email already exists)
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ErrorResponse'

# components/schemas.yaml
components:
  schemas:
    CreateUserDto:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
          example: user@example.com
        password:
          type: string
          minLength: 8
          example: password123
        name:
          type: string
          nullable: true
          example: John Doe
    UserDto:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: 123e4567-e89b-12d3-a456-426614174000
        email:
          type: string
          format: email
          example: user@example.com
        name:
          type: string
          nullable: true
          example: John Doe
        createdAt:
          type: string
          format: date-time
          example: 2024-01-01T10:00:00Z
    ErrorResponse:
      type: object
      properties:
        statusCode:
          type: number
          example: 400
        message:
          type: string
          example: Bad Request
        code:
          type: string
          example: VALIDATION_ERROR
```

### 생성될 보일러플레이트 코드 구조 (예시: `user` 모듈, `createUser` 오퍼레이션)

```
modules/user/
├── presentation/
│   └── http/
│       └── user.controller.ts # @Post('/users') createUser 메서드 스텁
├── business/
│   ├── facade/
│   │   └── user-facade.service.ts # createUser 메서드 위임 스텁
│   └── usecases/
│       └── create-user.usecase.ts # 비즈니스 로직 구현 스텁 (BaseUseCase 상속)
├── infrastructure/
│   ├── mappers/
│   │   └── user.mapper.ts # User 도메인-엔티티/DTO 매핑 스텁 (EntityMapper, DtoMapper 상속)
│   └── persistence/
│       ├── entities/
│       │   └── user.entity.ts # TypeORM User 엔티티 스텁 (BaseEntity 상속)
│       └── repositories/
│           └── user.repository.ts # UserRepositoryInterface 및 구현 스텁 (AbstractRepository 상속)
├── domain/
│   ├── model/
│   │   └── user.ts # User 도메인 모델 스텁
│   └── interfaces/
│       └── user-repository.interface.ts # UserRepositoryInterface 정의
└── user.module.ts # 생성된 컴포넌트들 등록 및 의존성 주입 설정
```

## 5. 기대 효과 및 한계

### 기대 효과

*   **API 계약 준수**: OAS를 기반으로 코드를 생성하여 프론트엔드-백엔드 간 API 계약 불일치 문제를 최소화합니다.
*   **개발 속도 향상**: 반복적인 보일러플레이트 코드 작성 시간을 절약하여 핵심 비즈니스 로직 구현에 집중할 수 있습니다.
*   **일관성 유지**: 프로젝트의 아키텍처 패턴과 `shared` 컴포넌트들을 활용하여 일관된 코드 스타일과 구조를 유지합니다.
*   **휴먼 에러 감소**: 수동 작성 시 발생할 수 있는 오타나 누락을 줄입니다.

### 한계

*   **핵심 비즈니스 로직 미생성**: AI는 스펙에 정의된 인터페이스와 구조만 생성하며, 실제 비즈니스 로직(예: 데이터 검증, 복잡한 계산, 외부 서비스 연동 로직)은 개발자가 직접 구현해야 합니다.
*   **커스터마이징 필요**: 생성된 코드는 스텁 형태이므로, 프로젝트의 특정 요구사항이나 복잡한 시나리오에 맞춰 추가적인 커스터마이징이 필요합니다.
*   **스펙의 정확성 의존**: 생성되는 코드의 품질은 입력된 OpenAPI 스펙의 정확성과 상세함에 직접적으로 비례합니다.

## 6. 사용 방법

AI에게 보일러플레이트 코드 생성을 요청할 때, 다음 형식으로 정보를 제공해주세요:

*   **OpenAPI 스펙 내용**: (YAML 형식으로 제공)
*   **대상 모듈 이름**: (예: `user`)
*   **생성할 API 오퍼레이션**: (예: `createUser`)
