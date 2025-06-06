import { Module } from "@nestjs/common"
import { HttpModule } from "@nestjs/axios"
import { ConfigModule } from "@nestjs/config"

// Application Layer
import { BaekjoonFacadeService } from "./application/services/facade/baekjoon-facade.service"
import { 
  StartVerificationUseCaseImpl,
  CompleteVerificationUseCaseImpl,
  GetProfileUseCaseImpl,
  GetStatisticsUseCaseImpl
} from "./application/services/usecases"
import { BaekjoonMapper } from "./application/mappers/baekjoon.mapper"

// Infrastructure Layer - In Adapters
import { BaekjoonController } from "./infrastructure/adapter/in/controllers/baekjoon.controller"
import { BaekjoonRequestMapper } from "./infrastructure/adapter/in/mappers/baekjoon-request.mapper"

// Infrastructure Layer - Out Adapters
import { SolvedAcHttpClient } from "./infrastructure/adapter/out/external/solved-ac-http.client"
import { SolvedAcApiAdapter } from "./infrastructure/adapter/out/external/solved-ac-api.adapter"
import { NoSqlBaekjoonRepository } from "./infrastructure/adapter/out/persistence/repositories/nosql-baekjoon.repository"
import { BaekjoonPersistenceMapper } from "./infrastructure/adapter/out/persistence/mappers/baekjoon-persistence.mapper"
import { BaekjoonCacheService } from "./infrastructure/adapter/out/services/cache/baekjoon-cache.service"
import { BaekjoonRateLimitService } from "./infrastructure/adapter/out/services/rate-limit/baekjoon-rate-limit.service"

// Ports
import { StartVerificationUseCase } from "./application/ports/in/start-verification.usecase"
import { CompleteVerificationUseCase } from "./application/ports/in/complete-verification.usecase"
import { GetProfileUseCase } from "./application/ports/in/get-profile.usecase"
import { GetStatisticsUseCase } from "./application/ports/in/get-statistics.usecase"
import { SolvedAcApiPort } from "./application/ports/out/solved-ac-api.port"
import { BaekjoonRepositoryPort } from "./application/ports/out/baekjoon-repository.port"
import { CachePort } from "./application/ports/out/cache.port"
import { RateLimitPort } from "./application/ports/out/rate-limit.port"

// Shared Modules
import { CacheModule } from "@/shared/infrastructure/cache/redis/cache.module"
import { NoSqlModule } from "@/shared/infrastructure/persistence/nosql/nosql.module"

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
    NoSqlModule,
  ],
  controllers: [
    BaekjoonController,
  ],
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
  ],
})
export class BaekjoonModule {}
