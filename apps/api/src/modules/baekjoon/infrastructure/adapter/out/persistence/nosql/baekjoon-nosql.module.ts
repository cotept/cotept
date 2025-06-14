import { BaekjoonTagNosqlAdapter } from "@/modules/baekjoon/infrastructure/adapter/out/persistence/nosql/baekjoon-nosql.adapter"
import { BaekjoonNosqlMapper } from "@/modules/baekjoon/infrastructure/adapter/out/persistence/nosql/mappers"
import { BaekjoonTagNosqlRepository } from "@/modules/baekjoon/infrastructure/adapter/out/persistence/nosql/repositories"
import { NoSQLModule } from "@/shared/infrastructure/persistence/nosql/nosql.module"
import { Module } from "@nestjs/common"

/**
 * 백준 NoSQL 모듈
 * 백준 모듈의 NoSQL 관련 구성 요소들을 관리
 */
@Module({
  imports: [
    // Shared NoSQL 모듈을 feature 모드로 가져오기
    NoSQLModule.forFeature([
      // 매퍼들 등록
      BaekjoonNosqlMapper,

      // 레포지토리들 등록
      BaekjoonTagNosqlRepository,

      // 어댑터들 등록
      BaekjoonTagNosqlAdapter,
    ]),
  ],
  providers: [
    // 매퍼들
    BaekjoonNosqlMapper,
    // 레포지토리들
    BaekjoonTagNosqlRepository,

    // 어댑터들
    BaekjoonTagNosqlAdapter,
  ],
  exports: [
    // 포트 구현체들만 export (다른 모듈에서 주입받을 수 있도록)
    BaekjoonTagNosqlAdapter,
  ],
})
export class BaekjoonNoSQLModule {}
