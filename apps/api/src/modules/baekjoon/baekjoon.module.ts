import { HttpModule } from "@nestjs/axios"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"

// Application Layer
import { BaekjoonDomainMapper, BaekjoonResponseMapper } from "./application/mappers"
// Ports
import {
  CompleteVerificationUseCase,
  GetProfileUseCase,
  GetStatisticsUseCase,
  StartVerificationUseCase,
  SyncVerificationStatusUseCase,
} from "./application/ports/in"
import { BaekjoonProfileRepositoryPort } from "./application/ports/out/baekjoon-profile-repository.port"
import { BaekjoonStatisticsRepositoryPort } from "./application/ports/out/baekjoon-statistics-repository.port"
import { CachePort } from "./application/ports/out/cache.port"
import { RateLimitPort } from "./application/ports/out/rate-limit.port"
import { SolvedAcApiPort } from "./application/ports/out/solved-ac-api.port"
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
import { BaekjoonStatisticsRepository } from "./infrastructure/adapter/out/persistence/nosql"
// ✅ NoSQL 모듈 import 추가
import { BaekjoonNoSQLModule } from "./infrastructure/adapter/out/persistence/nosql/baekjoon-nosql.module"
import { BaekjoonProfileEntity } from "./infrastructure/adapter/out/persistence/typeorm/entities"
import { BaekjoonProfileMapper } from "./infrastructure/adapter/out/persistence/typeorm/mappers/baekjoon.mapper"
import { BaekjoonProfileRepository } from "./infrastructure/adapter/out/persistence/typeorm/repositories/typeorm-baekjoon-profile.repository"
// Infrastructure Layer - Out Adapters - Services
import { BaekjoonCacheService } from "./infrastructure/adapter/out/services/cache/baekjoon-cache.service"
import { BaekjoonRateLimitService } from "./infrastructure/adapter/out/services/rate-limit/baekjoon-rate-limit.service"

// Shared Modules
import { CacheModule } from "@/shared/infrastructure/cache/redis/cache.module"
import { DatabaseModule } from "@/shared/infrastructure/persistence/database.module"

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
    DatabaseModule.forFeature([BaekjoonProfileEntity]),
    BaekjoonNoSQLModule,
  ],
  controllers: [BaekjoonController],
  providers: [
    // Application Services
    BaekjoonFacadeService,
    BaekjoonDomainMapper,
    BaekjoonResponseMapper,

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
    BaekjoonProfileMapper,
    {
      provide: BaekjoonProfileRepositoryPort,
      useClass: BaekjoonProfileRepository,
    },
    {
      provide: "BaekjoonProfileRepositoryPort",
      useClass: BaekjoonProfileRepository,
    },
    {
      provide: BaekjoonStatisticsRepositoryPort, // 태그 통계용 포트
      useClass: BaekjoonStatisticsRepository, // NoSQL Repository 사용
    },
    {
      provide: "BaekjoonStatisticsRepositoryPort",
      useClass: BaekjoonStatisticsRepository,
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
