# OCI NoSQL 통합 모듈

어니언 아키텍처를 활용한 Cotept 프로젝트의 OCI NoSQL 통합 모듈입니다. 이 모듈은 Oracle Cloud Infrastructure NoSQL Database 서비스와 NestJS 애플리케이션을 효율적으로 연결하기 위해 설계되었습니다.

## 모듈 구조

```
nosql/
├── client/               # NoSQL 클라이언트 관련
│   ├── nosql-client.interface.ts  # 인터페이스 정의
│   └── nosql-client.provider.ts   # 프로바이더 구현
│
├── repositories/         # 레포지토리 관련
│   └── base-nosql.repository.ts   # 기본 레포지토리 구현
│
└── README.md             # 이 문서
```

## 주요 특징

- **어니언 아키텍처 적용**: 기술적 관심사(인프라)와 비즈니스 관심사(도메인)의 명확한 분리
- **TypeORM과 일관된 API**: 기존 TypeORM 레포지토리와 유사한 인터페이스로 학습 곡선 최소화
- **OCI 무료 티어 최적화**: 무료 티어 한도(테이블당 25GB, 월 1억 3300만 읽기/쓰기)에 최적화
- **자동 에러 처리**: 에러 타입별 자동 변환 및 로깅 지원
- **확장 가능한 구조**: 향후 오픈소스 라이브러리로 발전 가능한 확장성 있는 설계

## 설치

1. 라이브러리 설치:

```bash
npm install oracle-nosqldb
# 또는
pnpm add oracle-nosqldb
```

2. `.env` 파일에 필요한 환경 변수 설정:

```
# OCI NoSQL 설정
OCI_NOSQL_ENDPOINT=https://nosql.ap-seoul-1.oci.oraclecloud.com
OCI_COMPARTMENT_ID=your-compartment-id
OCI_CONFIG_PROFILE=DEFAULT
OCI_NOSQL_TIMEOUT=30000
OCI_NOSQL_POOL_MIN=1
OCI_NOSQL_POOL_MAX=10
OCI_NOSQL_READ_UNITS=10
OCI_NOSQL_WRITE_UNITS=10
OCI_NOSQL_STORAGE_GB=1
```

## 사용 방법

### 1. 앱 모듈에 NoSQL 모듈 추가

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NoSQLModule } from '@/shared/infrastructure/persistence/nosql.module';
import { nosqlConfig } from '@/configs/nosql';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [nosqlConfig],
      // ...
    }),
    NoSQLModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => 
        configService.get('nosql'),
      inject: [ConfigService],
    }),
    // 기타 모듈...
  ],
})
export class AppModule {}
```

### 2. 도메인 엔티티 및 레포지토리 인터페이스 정의

```typescript
// modules/session/domain/entities/session.entity.ts
export class Session {
  id: string;
  // ... 다른 필드 및 메서드
}

// modules/session/domain/repositories/session.repository.interface.ts
export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  findByMentorId(mentorId: string): Promise<Session[]>;
  // ... 다른 메서드
}
```

### 3. 도메인별 레포지토리 구현

```typescript
// modules/session/infrastructure/repositories/session.repository.ts
import { BaseNoSQLRepository } from '@/shared/infrastructure/persistence/nosql/repositories/base-nosql.repository';
import { Session } from '../../domain/entities/session.entity';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface';

@Injectable()
export class SessionRepository extends BaseNoSQLRepository<Session> implements ISessionRepository {
  constructor(@Inject(OCI_NOSQL_CLIENT) client: INoSQLClient) {
    super(client, 'mentoring_sessions');
  }
  
  // 엔티티 매핑 구현
  protected mapToEntity(row: Record<string, any>): Session {
    const session = new Session();
    session.id = row.id;
    // ... 다른 필드 매핑
    return session;
  }
  
  // 로우 매핑 구현
  protected mapToRow(entity: Session): Record<string, any> {
    return {
      id: entity.id,
      // ... 다른 필드 매핑
    };
  }
  
  // 도메인 특화 메서드 구현
  async findByMentorId(mentorId: string): Promise<Session[]> {
    return this.findAll({ mentorId });
  }
}
```

### 4. 도메인 모듈에서 레포지토리 등록

```typescript
// modules/session/session.module.ts
import { Module } from '@nestjs/common';
import { NoSQLModule } from '@/shared/infrastructure/persistence/nosql.module';
import { SessionRepository } from './infrastructure/repositories/session.repository';
import { ISessionRepository } from './domain/repositories/session.repository.interface';

@Module({
  imports: [
    NoSQLModule.forFeature([SessionRepository])
  ],
  providers: [
    {
      provide: ISessionRepository,
      useClass: SessionRepository
    },
    // 기타 서비스...
  ],
  exports: [ISessionRepository]
})
export class SessionModule {}
```

### 5. 서비스에서 사용

```typescript
// modules/session/application/services/session.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import { Session } from '../../domain/entities/session.entity';

@Injectable()
export class SessionService {
  constructor(
    @Inject(ISessionRepository)
    private readonly sessionRepository: ISessionRepository
  ) {}
  
  async getSessionById(id: string): Promise<Session> {
    return this.sessionRepository.findById(id);
  }
  
  // ... 기타 메서드
}
```

## 추가 기능 및 확장 가능성

이 모듈은 Cotept 프로젝트의 요구사항을 충족하도록 설계되었지만, 향후 다음과 같은 확장이 가능합니다:

1. **페이지네이션 지원**: 대량의 데이터 처리를 위한 페이징 메커니즘
2. **트랜잭션 지원**: 여러 작업의 원자성 보장을 위한 트랜잭션
3. **스키마 자동 생성**: 테이블 스키마 자동 생성 및 마이그레이션
4. **보편적인 오픈소스 라이브러리로 전환**: Cotept에 특화된 구현을 일반화하여 독립 라이브러리로 공개

## 성능 최적화 팁

- **데이터 모델링**: 스키마 설계 시 NoSQL의 특성을 활용 (중첩 객체, 비정규화 등)
- **인덱스 활용**: 자주 쿼리하는 필드에 대한 인덱스 생성
- **벌크 작업**: 여러 작업을 일괄 처리하여 네트워크 왕복 횟수 최소화
- **캐싱 고려**: 자주 액세스하는 데이터에 대해 Redis 캐싱 적용 검토

이 모듈을 통해 MongoDB와 유사한 개발 경험을 유지하면서도 OCI NoSQL의 강력한 기능을 활용할 수 있습니다.
