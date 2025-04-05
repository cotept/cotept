import { CacheModule } from "@/shared/infrastructure/cache/redis/cache.module"
import { Module } from "@nestjs/common"
import { MiddlewareModule } from "./common/middlewares/middleware.module"
import { DatabaseModule } from "./persistence/database.module"
@Module({
  imports: [MiddlewareModule, DatabaseModule, CacheModule],
  exports: [MiddlewareModule, DatabaseModule, CacheModule],
})
export class InfrastructureModule {}
