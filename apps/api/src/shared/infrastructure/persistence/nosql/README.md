## FieldValue 타입 안전성

`BaseNoSQLRepository`는 Oracle NoSQL의 `FieldValue` 타입을 사용해 타입 안전성을 강화했습니다.

```typescript
import { FieldValue } from "oracle-nosqldb"

// 엔티티 인터페이스 정의
// Oracle NoSQL에서 지원하는 필드 값 타입만 사용 가능
interface User extends Record<string, FieldValue> {
  id: string
  name: string
  email: string
  age: number
  active: boolean
  registeredAt: Date
  preferences?: Record<string, FieldValue>
  profilePhoto?: Buffer
  tags?: string[]
}

// 레포지토리 사용 예시
class UserRepository extends BaseNoSQLRepository<User> {
  constructor(@Inject(OCI_NOSQL_CLIENT) client: NoSQLClient) {
    super(client, "users")
  }

  // 타입 안전성이 보장되는 필터링
  async findActiveUsersByAge(minAge: number): Promise<User[]> {
    return this.getAll({ active: true }).then((users) => users.filter((user) => user.age >= minAge))
  }
}
```

`FieldValue` 타입은 다음과 같은 타입을 지원합니다:

- 기본 타입: `string`, `number`, `boolean`, `null`
- 날짜 타입: `Date`
- 배열 타입: `FieldValue[]`
- 객체 타입: `Record<string, FieldValue>`
- 이진 데이터: `Buffer` 또는 `Uint8Array`

# OCI NoSQL 모듈 사용법

Oracle Cloud Infrastructure NoSQL Database를 NestJS 애플리케이션에서 간단하게 사용하기 위한 모듈입니다.

## 기본 설정

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NoSQLModule } from '@/shared/infrastructure/persistence/nosql.module';

@Module({
  imports: [
    NoSQLModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        endpoint: configService.get('OCI_NOSQL_ENDPOINT'),
        compartment: configService.get('OCI_COMPARTMENT_ID'),
        auth: {
          iam: {
            configProvider: /* OCI 인증 제공자 */,
            profileName: configService.get('OCI_CONFIG_PROFILE'),
          },
        },
        timeout: 30000,
        poolMin: 1,
        poolMax: 10,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## 레포지토리 패턴 사용

BaseNoSQLRepository를 상속받아 도메인별 레포지토리를 구현합니다.

```typescript
import { Injectable, Inject } from "@nestjs/common"
import { BaseNoSQLRepository } from "@/shared/infrastructure/persistence/nosql/repositories/base-nosql.repository"
import { OCI_NOSQL_CLIENT } from "@/shared/infrastructure/persistence/nosql/client/nosql-client.provider"
import { NoSQLClient } from "oracle-nosqldb"

@Injectable()
export class UserRepository extends BaseNoSQLRepository<User> {
  constructor(@Inject(OCI_NOSQL_CLIENT) client: NoSQLClient) {
    super(client, "users")
  }

  // 추가 메서드 구현
  async findByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE email = "${email}"`
    try {
      const result = await this.query(query)
      return result.length > 0 ? result[0] : null
    } catch (error) {
      this.handleError(error, "findByEmail")
    }
  }
}
```

## 기본 CRUD 작업

BaseNoSQLRepository에는 기본적인 CRUD 작업이 구현되어 있습니다:

```typescript
// 단일 엔티티 조회
const user = await userRepository.getById("user123")

// 조건에 맞는 여러 엔티티 조회
const users = await userRepository.getAll({ status: "active" })

// 엔티티 생성
await userRepository.create({
  id: "user456",
  name: "John Doe",
  email: "john@example.com",
})

// 엔티티 업데이트 (부분 업데이트 지원)
await userRepository.update("user456", { name: "John Updated" })

// 엔티티 삭제
await userRepository.delete("user456")
```

## 중앙 집중화된 에러 처리

이 모듈은 중앙 집중화된 에러 처리 방식을 채택하여 코드의 중복을 제거하고 유지보수성을 높였습니다.

```typescript
private handleError(error: unknown, functionName: string): never {
  if (error instanceof NoSQLArgumentError) {
    this.logger.error(`Invalid argument in ${functionName}: ${error.message}`, error.stack);
  } else if (error instanceof NoSQLTimeoutError) {
    this.logger.error(`Timeout in ${functionName}: ${error.message}`, error.stack);
  } else if (error instanceof NoSQLServiceError) {
    this.logger.error(`Service error in ${functionName}: ${error.message}`, error.stack);
  } else if (error instanceof NoSQLAuthorizationError) {
    this.logger.error(`Authorization error in ${functionName}: ${error.message}`, error.stack);
  } else if (error instanceof NoSQLError) {
    this.logger.error(`NoSQL error in ${functionName}: ${error.message}`, error.stack);
  } else {
    this.logger.error(`Unknown error in ${functionName}: ${(error as Error).message}`, (error as Error).stack);
  }
  throw error;
}
```

각 메서드는 에러 발생 시 자신의 이름을 handleError 메서드에 전달합니다:

```typescript
try {
  // 핵심 로직
} catch (error: unknown) {
  this.handleError(error, this.methodName.name)
}
```

## 추가 기능

### 일괄 작업

```typescript
// 여러 엔티티 생성
const users = await userRepository.createBatch([
  { id: "id1", name: "User 1" },
  { id: "id2", name: "User 2" },
])

// 여러 엔티티 삭제
const success = await userRepository.deleteBatch(["id1", "id2"])
```

### 사용자 정의 쿼리

```typescript
// 직접 SQL 쿼리 실행
const activeAdminUsers = await userRepository.query(`SELECT * FROM users WHERE status = "active" AND role = "admin"`)
```

### 범위 삭제

```typescript
// 특정 범위의 레코드 삭제
const deletedCount = await userRepository.deleteRange(
  { department: "IT" }, // 파티션 키
  { field: "createdAt", start: "2023-01-01", end: "2023-12-31" }, // 필드 범위
)
```

## Oracle NoSQL SDK 주요 메서드

BaseNoSQLRepository는 다음 Oracle NoSQL SDK 메서드를 활용합니다:

| SDK 메서드  | 설명                       |
| ----------- | -------------------------- |
| get         | 단일 레코드 조회           |
| put         | 레코드 추가 또는 수정      |
| delete      | 레코드 삭제                |
| query       | SQL 쿼리로 데이터 조회     |
| putMany     | 여러 레코드 일괄 추가/수정 |
| deleteMany  | 여러 레코드 일괄 삭제      |
| deleteRange | 범위 기반 레코드 삭제      |

## 개선된 BaseNoSQLRepository 코드 예시

아래는 최근에 개선된 `BaseNoSQLRepository` 클래스의 사용 예시입니다. 메소드 이름이 더 명확하고 일관성 있게 변경되었습니다.

```typescript
import { Inject, Logger, NotFoundException } from "@nestjs/common"
import {
  AnyRow,
  DeleteOpResult,
  NoSQLArgumentError,
  NoSQLAuthorizationError,
  NoSQLClient,
  NoSQLError,
  NoSQLServiceError,
  NoSQLTimeoutError,
  PutOpResult,
} from "oracle-nosqldb"
import { AbstractNoSQLRepository } from "../../base/abstract.nosql.repository"
import { OCI_NOSQL_CLIENT } from "../client/nosql-client.provider"

/**
 * NoSQL 데이터베이스 기본 레포지토리
 *
 * Oracle NoSQL SDK의 기본 CRUD 기능을 활용합니다.
 * 참조: https://oracle.github.io/nosql-node-sdk/classes/NoSQLClient.html
 */
export abstract class BaseNoSQLRepository<T extends Record<string, any>> extends AbstractNoSQLRepository<T> {
  protected readonly logger = new Logger(this.constructor.name)

  constructor(
    @Inject(OCI_NOSQL_CLIENT) protected readonly client: NoSQLClient,
    protected readonly tableName: string,
  ) {
    super()
  }

  /**
   * ID로 엔티티 조회
   */
  async getById(id: string): Promise<T> {
    try {
      const key = this.getKeyObject(id)
      const result = await this.client.get(this.tableName, key)

      if (!result.row) {
        throw new NotFoundException(`Entity with id ${id} not found`)
      }

      return result.row as T
    } catch (error: unknown) {
      this.handleError(error, this.getById.name)
    }
  }

  /**
   * 조건에 맞는 엔티티 목록 조회
   */
  async getAll(filter: Partial<Record<string, any>> = {}): Promise<T[]> {
    try {
      // 전체 테이블 쿼리
      const query = `SELECT * FROM ${this.tableName}`
      const result = await this.client.query(query)

      // 결과에서 필터 조건에 맞는 항목만 필터링
      if (Object.keys(filter).length === 0) {
        return result.rows as T[]
      }

      return result.rows.filter((row) => {
        for (const [key, value] of Object.entries(filter)) {
          if (row[key] !== value) {
            return false
          }
        }
        return true
      }) as T[]
    } catch (error: unknown) {
      this.handleError(error, this.getAll.name)
    }
  }

  /**
   * 사용자 정의 쿼리 실행
   */
  async query(query: string): Promise<T[]> {
    try {
      const result = await this.client.query(query)
      return result.rows as T[]
    } catch (error: unknown) {
      this.handleError(error, this.query.name)
    }
  }

  /**
   * 엔티티 생성
   */
  async create(entity: T): Promise<T> {
    try {
      await this.client.put(this.tableName, entity)
      return entity
    } catch (error: unknown) {
      this.handleError(error, this.create.name)
    }
  }

  /**
   * 엔티티 수정
   * @param id 수정할 엔티티의 ID
   * @param partialEntity 수정할 필드가 포함된 부분 엔티티
   */
  async update(id: string, partialEntity: Partial<T>): Promise<T> {
    try {
      // 먼저 기존 엔티티를 가져옵니다
      const existing = await this.getById(id)

      // 부분 업데이트를 위해 기존 엔티티와 새 필드를 병합합니다
      const updatedEntity = { ...existing, ...partialEntity }

      // 업데이트된 엔티티를 저장합니다
      await this.client.put(this.tableName, updatedEntity)
      return updatedEntity as T
    } catch (error: unknown) {
      this.handleError(error, this.update.name)
    }
  }

  /**
   * 엔티티 삭제
   */
  async delete(id: string): Promise<boolean> {
    try {
      const key = this.getKeyObject(id)
      const result = await this.client.delete(this.tableName, key)
      return result.success
    } catch (error: unknown) {
      this.handleError(error, this.delete.name)
    }
  }

  /**
   * 여러 엔티티 일괄 생성
   */
  async createBatch(entities: T[]): Promise<T[]> {
    try {
      await this.client.putMany(this.tableName, entities)
      return entities
    } catch (error: unknown) {
      this.handleError(error, this.createBatch.name)
    }
  }

  /**
   * 여러 엔티티 일괄 삭제
   */
  async deleteBatch(ids: string[]): Promise<(DeleteOpResult<AnyRow> | PutOpResult<AnyRow>)[] | undefined> {
    try {
      const keys = ids.map((id) => this.getKeyObject(id))
      const result = await this.client.deleteMany(this.tableName, keys)
      return result.results
    } catch (error: unknown) {
      this.handleError(error, this.deleteBatch.name)
    }
  }

  /**
   * 범위 삭제 (필요한 경우에만 사용)
   */
  async deleteRange(partialKey: Partial<T>, fieldRange?: any): Promise<number> {
    try {
      const result = await this.client.deleteRange(this.tableName, partialKey, { fieldRange })
      return result.deletedCount
    } catch (error: unknown) {
      this.handleError(error, this.deleteRange.name)
    }
  }

  /**
   * 공통 에러 처리 함수
   * 각 메서드의 에러 처리를 통합적으로 관리합니다.
   */
  private handleError(error: unknown, functionName: string): never {
    if (error instanceof NoSQLArgumentError) {
      this.logger.error(`Invalid argument in ${functionName}: ${error.message}`, error.stack)
    } else if (error instanceof NoSQLTimeoutError) {
      this.logger.error(`Timeout in ${functionName}: ${error.message}`, error.stack)
    } else if (error instanceof NoSQLServiceError) {
      this.logger.error(`Service error in ${functionName}: ${error.message}`, error.stack)
    } else if (error instanceof NoSQLAuthorizationError) {
      this.logger.error(`Authorization error in ${functionName}: ${error.message}`, error.stack)
    } else if (error instanceof NoSQLError) {
      this.logger.error(`NoSQL error in ${functionName}: ${error.message}`, error.stack)
    } else {
      this.logger.error(`Unknown error in ${functionName}: ${(error as Error).message}`, (error as Error).stack)
    }
    throw error
  }

  /**
   * ID로 키 객체 생성
   * 복합키 사용 시 오버라이드
   */
  protected getKeyObject(id: string): Record<string, any> {
    return { id }
  }
}
```

# NoSQL 모듈 사용법

## 1. 모듈 선택

### 통합 사용 (권장)

```typescript
// app.module.ts
import { DatabaseModule } from "@/shared/infrastructure/persistence/database.module"

@Module({
  imports: [DatabaseModule], // TypeORM + NoSQL 모두 포함
})
export class AppModule {}
```

### NoSQL만 사용

```typescript
// app.module.ts
import { NoSQLModule } from "@/shared/infrastructure/persistence/nosql/nosql.module"

@Module({
  imports: [
    NoSQLModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        endpoint: configService.get("nosql.connection.endpoint"),
        compartment: configService.get("nosql.connection.compartmentId"),
        // ... 설정
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## 2. 기능별 모듈 등록

```typescript
// baekjoon.module.ts
import { DatabaseModule } from "@/shared/infrastructure/persistence/database.module"

@Module({
  imports: [
    DatabaseModule.forNoSQL([BaekjoonNoSQLRepository]), // NoSQL 레포지토리 등록
  ],
  providers: [BaekjoonNoSQLRepository],
  exports: [BaekjoonNoSQLRepository],
})
export class BaekjoonModule {}
```

## 3. 레포지토리 구현

```typescript
// baekjoon-nosql.repository.ts
import { Injectable, Inject } from "@nestjs/common"
import { BaseNoSQLRepository } from "@/shared/infrastructure/persistence/nosql/repositories/base.nosql.repository"
import { OCI_NOSQL_CLIENT } from "@/shared/infrastructure/persistence/nosql/client/nosql-client.provider"
import { NoSQLClient } from "oracle-nosqldb"

@Injectable()
export class BaekjoonNoSQLRepository extends BaseNoSQLRepository<BaekjoonProfile> {
  constructor(@Inject(OCI_NOSQL_CLIENT) client: NoSQLClient) {
    super(client, "baekjoon_profiles")
  }

  async findByBaekjoonId(baekjoonId: string): Promise<BaekjoonProfile | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE baekjoonId = "${baekjoonId}"`
    const result = await this.query(query)
    return result.length > 0 ? result[0] : null
  }
}
```

### 4. 서비스에서 사용

```typescript
// baekjoon-facade.service.ts
import { Injectable } from "@nestjs/common"
import { BaekjoonNoSQLRepository } from "../repositories/baekjoon-nosql.repository"

@Injectable()
export class BaekjoonFacadeService {
  constructor(private readonly baekjoonNoSQLRepository: BaekjoonNoSQLRepository) {}

  async getProfile(baekjoonId: string): Promise<BaekjoonProfile> {
    // 기본 CRUD 작업
    return await this.baekjoonNoSQLRepository.findByBaekjoonId(baekjoonId)
  }

  async createProfile(profile: BaekjoonProfile): Promise<BaekjoonProfile> {
    return await this.baekjoonNoSQLRepository.create(profile)
  }

  async updateProfile(id: string, updates: Partial<BaekjoonProfile>): Promise<BaekjoonProfile> {
    return await this.baekjoonNoSQLRepository.update(id, updates)
  }
}
```
