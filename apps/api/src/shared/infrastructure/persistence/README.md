# 데이터 영속성 계층

이 디렉토리는 데이터 영속성 계층을 포함합니다. 현재 다음과 같은 데이터베이스 시스템을 지원합니다:

1. **TypeORM (PostgreSQL)** - 관계형 데이터베이스용
2. **NoSQL (OCI NoSQL)** - 비관계형 데이터베이스용 (자세한 내용은 [NoSQL README.md](./nosql/README.md) 참고)

## 구조

```
persistence/
├── base/                # 추상 클래스 및 공통 인터페이스
│   ├── abstract.repository.ts        # 관계형 DB 레포지토리 기본 클래스
│   ├── abstract.nosql.repository.ts  # NoSQL 레포지토리 기본 클래스
│   └── base.entity.ts                # 기본 엔티티 클래스
│
├── database.module.ts   # TypeORM 모듈 (관계형 DB)
├── nosql.module.ts      # NoSQL 모듈
│
├── typeorm/             # TypeORM 구현체
│   ├── entities/        # 엔티티 클래스
│   └── repositories/    # 레포지토리 구현체
│
└── nosql/               # NoSQL 구현체 (자세한 내용은 하위 README.md 참고)
    ├── client/          # NoSQL 클라이언트 관련
    └── repositories/    # NoSQL 레포지토리 구현체
```

## TypeORM 모듈 사용법

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/infrastructure/persistence/database.module';
import { databaseConfig } from './configs/database/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig]
    }),
    DatabaseModule.forRoot(),
    // 기타 모듈...
  ],
})
export class AppModule {}
```

## 환경 변수 설정

`.env` 파일에 필요한 PostgreSQL 환경 변수:

```
# PostgreSQL (TypeORM) 설정
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=cotept
DATABASE_SCHEMA=public
```

OCI NoSQL 관련 환경 변수 및 자세한 설정 방법은 [NoSQL README.md](./nosql/README.md)를 참조하세요.
