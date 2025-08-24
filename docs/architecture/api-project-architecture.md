# CotePT API 실용주의 아키텍처 가이드

## 1. 개요

### 1.1. 문서의 목적

이 문서는 CotePT API 서버의 아키텍처를 정의하고, 개발 과정에서의 일관성을 유지하기 위한 가이드입니다. 과거 헥사고날 아키텍처를 적용하며 겪었던 문제점들을 해결하고, **1인 개발 환경에 최적화된 실용적인 아키텍처**를 수립하는 것을 목표로 합니다.

### 1.2. 우리가 해결하려는 문제

기존 아키텍처에서는 다음과 같은 어려움이 있었습니다.

-   **과도한 보일러플레이트**: 각 계층을 연결하기 위한 매퍼(Mapper) 클래스 등 반복적인 코드가 많았습니다.
-   **높은 변경 비용**: 데이터베이스 스키마 변경(예: `idx` 타입 변경)이 발생했을 때, 엔티티부터 DTO까지 이어지는 모든 매퍼 체인을 수정해야 했습니다. 이로 인해 간단한 변경에도 **30개 이상의 파일을 수정**하는 등 생산성이 저하되었습니다.
-   **개발자 피로감 증가**: 위와 같은 문제들이 1인 개발 환경에서의 피로감을 가중시키는 주요 원인이었습니다.

### 1.3. 새로운 아키텍처의 핵심 철학

이러한 문제들을 해결하기 위해, 우리는 다음과 같은 핵심 철학을 지향합니다.

-   **실용성 우선 (Pragmatism over Purity)**
    -   아키텍처의 이론적 순수함보다는 실제 개발 생산성과 유지보수 비용을 우선으로 고려합니다.
-   **보일러플레이트 최소화 (Minimize Boilerplate)**
    -   `class-transformer`와 같은 도구를 적극 활용하여 DTO-도메인-엔티티 간의 변환을 자동화하고, 별도의 매퍼 클래스 작성을 지양합니다.
-   **변경 용이성 (Easy to Change)**
    -   계층 간의 결합을 느슨하게 하고, 구조적 일치성을 통해 특정 부분의 변경이 다른 계층에 미치는 영향을 최소화합니다.
-   **1인 개발 최적화 (Optimized for Solo Dev)**
    -   규칙은 단순하게, 구조는 직관적으로 만들어 코드 파악에 드는 인지적 비용을 줄입니다.

---

## 2. 프로젝트 구조

앞서 정의한 설계 원칙들을 만족시키기 위해, 다음과 같은 표준 디렉토리 구조를 채택합니다. 이 구조는 **계층의 명확성**, **높은 응집도**, **낮은 결합도**, **최소한의 뎁스**를 목표로 합니다.

### 2.1. 전체 구조 (Monorepo)

프로젝트는 pnpm 워크스페이스 기반의 모노레포로 구성됩니다.

```
/
├── apps/
│   ├── api/      # (현재 작업 영역) NestJS 백엔드 애플리케이션
│   └── web/      # 프론트엔드 애플리케이션
├── packages/
│   ├── api-client/ # OpenAPI Spec으로 자동 생성된 클라이언트
│   └── ...       # 기타 공용 패키지
└── ...
```

### 2.2. API 애플리케이션 상세 구조 (`apps/api/src`)

API 애플리케이션 내부는 기능별 `modules`와 공통 `shared` 모듈로 구성됩니다.

```
src/
├── modules/      # 비즈니스 기능별 모듈 집합
│   └── user/     # (예시) 사용자 모듈
│
├── shared/       # 여러 모듈에서 공유되는 기능
│
├── swagger/      # OpenAPI(Swagger) 설정
│
└── main.ts       # 애플리케이션 시작점 및 전역 설정
```

### 2.3. 모듈 내 표준 구조 (예: `user` 모듈)

모든 기능 모듈은 다음의 표준 구조를 따릅니다. 이는 **헥사고날 아키텍처**를 기반으로 하되, 뎁스를 줄이고 직관성을 높인 구조입니다.

```
user/
├── application/    # 📥 응용 계층: UseCase 실행, 트랜잭션 관리
│   ├── user.facade.service.ts
│   └── usecases/
│       ├── create-user.usecase.ts
│       └── get-user.usecase.ts
│
├── data/           # 💾 데이터 계층: DB 연동, Entity 정의
│   ├── user.entity.ts
│   └── user.repository.ts
│
├── domain/         # 👑 도메인 계층: 순수 비즈니스 로직 및 모델, Port 정의
│   ├── user.model.ts
│   └── user.repository.port.ts
│
├── presentation/   # 💻 표현 계층: 외부 통신 (HTTP, WebSocket 등)
│   ├── user.http.controller.ts
│   └── user.ws.gateway.ts
│
├── dto/            # 📦 데이터 전송 객체
│   ├── user.base.dto.ts
│   ├── user.http.dto.ts
│   └── user.ws.dto.ts
│
└── user.module.ts  # ⚙️ 모듈 의존성 정의 및 캡슐화
```

### 2.4. 각 디렉토리의 역할과 책임

-   **presentation**: 외부 세계와의 인터페이스. 프로토콜별(http, ws)로 파일을 분리하여 다중 프로토콜 지원. Controller, Gateway가 위치.
-   **application**: 비즈니스 로직의 흐름을 오케스트레이션. `facade.service`가 UseCase들을 조합하여 클라이언트에 단일 인터페이스를 제공.
-   **domain**: 시스템의 가장 핵심적인 비즈니스 규칙과 데이터 모델. 외부 의존성이 없는 순수한 TypeScript 코드로 작성. Repository Port(추상 클래스)를 정의하여 데이터 영속성 계층과의 의존성을 역전시킴 (DIP).
-   **data**: `domain` 계층의 Port를 구현(implement)하는 데이터 영속성 계층. TypeORM Entity와 Repository 구현체가 위치.
-   **dto**: 계층 간 데이터 전달을 위한 객체. `base.dto`를 정의하고 `mapped-types`를 이용해 프로토콜별 DTO를 파생시켜 중복을 최소화.

이 구조는 각 계층이 자신의 책임에만 집중하도록 하여 **응집도**를 높이고, Port를 통한 의존성 역전으로 **결합도**를 낮춰 TDD와 유지보수를 용이하게 합니다.

## 3. 핵심 구현 패턴

이 섹션에서는 앞서 정의한 아키텍처 원칙과 구조를 따르는 실제 코드 예시를 보여줍니다. `user` 모듈을 기준으로 각 계층의 구현 방법을 설명합니다.

### 3.1. 매핑(Mapping) 전략: 순수 함수 래퍼

라이브러리 격리를 위해 `class-transformer`의 함수들을 순수 함수로 한 번 래핑(Wrapping)하여 사용합니다. 이를 통해 코드 전체에서 `class-transformer`에 대한 직접 의존성을 제거합니다.

```typescript
// src/shared/utils/mapping.utils.ts
import {
  plainToInstance as libPlainToInstance,
  instanceToPlain as libInstanceToPlain,
  ClassConstructor,
  ClassTransformOptions,
} from 'class-transformer';

// 라이브러리 격리를 위한 래퍼 함수
export function plainToInstance<T, V>(
  cls: ClassConstructor<T>,
  plain: V,
  options?: ClassTransformOptions,
): T {
  return libPlainToInstance(cls, plain, options);
}

export function instanceToPlain<T>(
  object: T,
  options?: ClassTransformOptions,
): Record<string, any> {
  return libInstanceToPlain(object, options);
}
```

### 3.2. Domain 계층: 순수한 비즈니스 로직

-   **`user.repository.port.ts`**: 데이터베이스와 소통하는 Port를 `abstract class`로 정의합니다.
-   **`user.model.ts`**: 순수한 비즈니스 모델 클래스입니다.

```typescript
// src/modules/user/domain/user.repository.port.ts
import { User } from "./user.model"

export abstract class UserRepositoryPort {
  abstract findById(id: number): Promise<User | null>
  abstract save(user: User): Promise<User>
}
```

```typescript
// src/modules/user/domain/user.model.ts
export class User {
  idx: number
  userId: string
  email: string
  passwordHash: string

  constructor(properties: Partial<User>) {
    Object.assign(this, properties)
  }

  comparePassword(password: string): boolean {
    // 예시: 실제로는 bcrypt.compare 사용
    return this.passwordHash === password
  }
}
```

### 3.3. Data 계층: 데이터 영속성 구현

-   Repository는 `domain`의 Port를 구현하며, `Entity`와 `Domain` 모델 간의 변환을 래핑된 `plainToInstance` 함수로 처리합니다.

```typescript
// src/modules/user/data/user.repository.ts
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { plainToInstance } from "@/shared/utils/mapping.utils" // 래퍼 함수 임포트
import { UserRepositoryPort } from "../domain/user.repository.port"
import { User } from "../domain/user.model"
import { UserEntity } from "./user.entity"

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findById(id: number): Promise<User | null> {
    const entity = await this.repo.findOneBy({ idx: id })
    return entity ? plainToInstance(User, entity) : null
  }

  async save(user: User): Promise<User> {
    const entity = plainToInstance(UserEntity, user)
    const savedEntity = await this.repo.save(entity)
    return plainToInstance(User, savedEntity)
  }
}
```

### 3.4. DTO (Data Transfer Object)

-   `class-validator`와 `@nestjs/swagger`의 `mapped-types`를 활용하여 효율적으로 DTO를 정의합니다.

```typescript
// src/modules/user/dto/user.http.dto.ts
import { PickType } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"
import { UserEntity } from "../data/user.entity"

// 모든 User 관련 DTO의 기반이 될 Base DTO. Entity를 재활용하여 중복 제거.
export class UserBaseDto extends UserEntity {}

export class CreateUserDto extends PickType(UserBaseDto, [
  "userId",
  "email",
] as const) {
  @IsString()
  @IsNotEmpty()
  password!: string // Entity에 없는 DTO만의 필드
}

export class UserResponseDto extends PickType(UserBaseDto, [
  "idx",
  "userId",
  "email",
  "createdAt",
] as const) {}
```

### 3.5. Presentation 계층: API 엔드포인트

-   Controller는 DTO를 통해 요청을 받고, `plainToInstance`를 사용해 응답 DTO로 변환하여 반환합니다.

```typescript
// src/modules/user/presentation/user.http.controller.ts
import { Body, Controller, Get, Param, Post } from "@nestjs/common"
import { plainToInstance } from "@/shared/utils/mapping.utils" // 래퍼 함수 임포트
import { UserFacadeService } from "../application/user.facade.service"
import { CreateUserDto, UserResponseDto } from "../dto/user.http.dto"

@Controller("users")
export class UserController {
  constructor(private readonly userFacade: UserFacadeService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const userDomain = await this.userFacade.createUser(dto)
    return plainToInstance(UserResponseDto, userDomain)
  }

  @Get(":id")
  async getUserById(@Param("id") id: number): Promise<UserResponseDto> {
    const userDomain = await this.userFacade.getUserById(id)
    return plainToInstance(UserResponseDto, userDomain)
  }
}
```

## 4. 공유 모듈 (Shared Module)

`shared` 모듈은 여러 기능 모듈에서 공통으로 사용되는 기능들을 모아놓은 재사용 가능한 모듈입니다. `SharedModule`을 `import`하는 것만으로 모든 공통 기능을 사용할 수 있도록 캡슐화하는 것을 목표로 합니다.

### 4.1. `shared` 디렉토리 구조

```
shared/
├── infrastructure/ # 공통 인프라스트럭처 계층
│   ├── cache/
│   ├── common/     # (filters, interceptors, logger)
│   ├── decorators/
│   ├── dto/
│   ├── persistence/
│   └── services/
│
├── utils/          # 순수 함수 유틸리티
│   ├── database.util.ts
│   ├── error.util.ts
│   └── sanitize.util.ts
│
└── shared.module.ts # 위 기능들을 export하는 캡슐
```

### 4.2. 주요 디렉토리 역할

-   **`infrastructure/`**: 특정 도메인에 종속되지 않는 공통 기술(인프라) 코드를 관리합니다.
    -   `cache`: Redis 등 캐시 관련 설정을 담당합니다.
    -   `common`: `HttpErrorFilter`, `HttpResponseInterceptor`, `winstonLogger` 등 애플리케이션 전반에 적용되는 구성 요소를 포함합니다.
    -   `decorators`: `@User()` 등 인증/인가와 관련된 커스텀 데코레이터를 제공합니다.
    -   `dto`: `ApiResponseDto` 와 같이 모든 응답에서 사용될 수 있는 공통 DTO를 정의합니다.
    -   `persistence`: `BaseEntity` 등 모든 엔티티가 상속받는 기본 데이터베이스 스키마를 제공합니다.
-   **`utils/`**: 다른 의존성이 없는 순수 함수들의 집합입니다. `mapping.utils.ts`에서 정의한 `plainToInstance` 래퍼 함수도 여기에 위치하는 것이 적합합니다.
-   **`shared.module.ts`**: `infrastructure`와 `utils`에서 제공하는 Provider와 서비스들을 `exports`하여, 다른 모듈에서 `SharedModule`만 `import`하면 모든 공통 기능을 사용할 수 있도록 만들어줍니다.

> **참고**: 기존 `shared/infrastructure/mappers/` 디렉토리는 새로운 매핑 전략(순수 함수 래퍼)에 따라 더 이상 사용되지 않으므로 삭제 대상입니다.