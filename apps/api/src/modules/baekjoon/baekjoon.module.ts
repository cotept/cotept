import { HttpModule } from "@nestjs/axios"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"

// Application Layer
import { BaekjoonMapper } from "./application/mappers/baekjoon.mapper"
import { BaekjoonFacadeService } from "./application/services/facade/baekjoon-facade.service"
import {
  CompleteVerificationUseCaseImpl,
  GetProfileUseCaseImpl,
  GetStatisticsUseCaseImpl,
  StartVerificationUseCaseImpl,
  SyncVerificationStatusUseCaseImpl,
} from "./application/services/usecases"

// Infrastructure Layer - In Adapters
import { BaekjoonController } from "./infrastructure/adapter/in/controllers/baekjoon.controller"
import { BaekjoonRequestMapper } from "./infrastructure/adapter/in/mappers/baekjoon-request.mapper"

// Infrastructure Layer - Out Adapters
import { SolvedAcApiAdapter } from "./infrastructure/adapter/out/external/solved-ac-api.adapter"
import { SolvedAcHttpClient } from "./infrastructure/adapter/out/external/solved-ac-http.client"
import { BaekjoonPersistenceMapper } from "./infrastructure/adapter/out/persistence/mappers/baekjoon-persistence.mapper"
import { NoSqlBaekjoonRepository } from "./infrastructure/adapter/out/persistence/repositories/nosql-baekjoon.repository"
import { BaekjoonCacheService } from "./infrastructure/adapter/out/services/cache/baekjoon-cache.service"
import { BaekjoonRateLimitService } from "./infrastructure/adapter/out/services/rate-limit/baekjoon-rate-limit.service"
// ✅ NoSQL 모듈 import 추가
import { BaekjoonNoSQLModule } from "./infrastructure/adapter/out/persistence/nosql/baekjoon-nosql.module"

// Ports
import {
  CompleteVerificationUseCase,
  GetProfileUseCase,
  GetStatisticsUseCase,
  StartVerificationUseCase,
  SyncVerificationStatusUseCase,
} from "./application/ports/in"
import { BaekjoonRepositoryPort } from "./application/ports/out/baekjoon-repository.port"
import { CachePort } from "./application/ports/out/cache.port"
import { RateLimitPort } from "./application/ports/out/rate-limit.port"
import { SolvedAcApiPort } from "./application/ports/out/solved-ac-api.port"

// Shared Modules
import { CacheModule } from "@/shared/infrastructure/cache/redis/cache.module"
import { NoSQLModule } from "@/shared/infrastructure/persistence/nosql/nosql.module"
import { BaekjoonStatisticsRepositoryPort } from "./application/ports/out/baekjoon-statistics-repository.port"
import { BaekjoonTagNosqlAdapter } from "./infrastructure/adapter/out/persistence/nosql"

/**
 * 백준 모듈
 * 백준 ID 인증 및 프로필 관리 기능을 제공하는 모듈
 */
@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule,
    CacheModule,
    // ✅ NoSQL 모듈 import
    NoSQLModule,
    BaekjoonNoSQLModule,
  ],
  controllers: [BaekjoonController],
  providers: [
    // Application Services
    BaekjoonFacadeService,
    BaekjoonMapper,

    // Use Cases
    {
      provide: StartVerificationUseCase,
      useClass: StartVerificationUseCaseImpl,
    },
    {
      provide: CompleteVerificationUseCase,
      useClass: CompleteVerificationUseCaseImpl,
    },
    {
      provide: GetProfileUseCase,
      useClass: GetProfileUseCaseImpl,
    },
    {
      provide: GetStatisticsUseCase,
      useClass: GetStatisticsUseCaseImpl,
    },
    {
      provide: SyncVerificationStatusUseCase,
      useClass: SyncVerificationStatusUseCaseImpl,
    },

    // Infrastructure Adapters - External
    SolvedAcHttpClient,
    {
      provide: SolvedAcApiPort,
      useClass: SolvedAcApiAdapter,
    },

    // Infrastructure Adapters - Persistence
    BaekjoonPersistenceMapper,
    {
      provide: BaekjoonRepositoryPort,
      useClass: NoSqlBaekjoonRepository,
    },
    {
      provide: BaekjoonStatisticsRepositoryPort, // 태그 통계용 포트
      useClass: BaekjoonTagNosqlAdapter, // NoSQL 어댑터 사용
    },
    // Infrastructure Adapters - Services
    {
      provide: CachePort,
      useClass: BaekjoonCacheService,
    },
    {
      provide: RateLimitPort,
      useClass: BaekjoonRateLimitService,
    },

    // Infrastructure Adapters - Mappers
    BaekjoonRequestMapper,
  ],
  exports: [
    BaekjoonFacadeService,
    StartVerificationUseCase,
    CompleteVerificationUseCase,
    GetProfileUseCase,
    GetStatisticsUseCase,
    SyncVerificationStatusUseCase,
  ],
})
export class BaekjoonModule {}
