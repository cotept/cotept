import { Module } from "@nestjs/common"

import { BaekjoonNosqlMapper } from "@/modules/baekjoon/infrastructure/adapter/out/persistence/nosql/mappers"
import { BaekjoonStatisticsRepository } from "@/modules/baekjoon/infrastructure/adapter/out/persistence/nosql/repositories/baekjoon-statistics.repository"
import { DatabaseModule } from "@/shared/infrastructure/persistence/database.module"

/**
 * 백준 NoSQL 모듈
 * 백준 모듈의 NoSQL 관련 구성 요소들을 관리
 */
@Module({
  imports: [
    // Shared NoSQL 모듈을 feature 모드로 가져오기
    DatabaseModule.forFeature([
      // 매퍼들 등록
      BaekjoonNosqlMapper,

      // Repository 등록
      BaekjoonStatisticsRepository,
    ]),
  ],
  providers: [
    // 매퍼들
    BaekjoonNosqlMapper,
    // Repository
    BaekjoonStatisticsRepository,
  ],
  exports: [
    // Repository export (다른 모듈에서 주입받을 수 있도록)
    BaekjoonStatisticsRepository,
    // Mapper export (Repository가 의존하므로)
    BaekjoonNosqlMapper,
  ],
})
export class BaekjoonNoSQLModule {}
