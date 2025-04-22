import { CacheModule } from "@/shared/infrastructure/cache/redis/cache.module"
import { Module } from "@nestjs/common"
import { MiddlewareModule } from "./common/middlewares/middleware.module"
import { DatabaseModule } from "./persistence/database.module"
import { CryptoService } from "./services/crypto/crypto.service"

@Module({
  imports: [MiddlewareModule, DatabaseModule, CacheModule],
  providers: [CryptoService],
  exports: [MiddlewareModule, DatabaseModule, CacheModule, CryptoService],
})
export class InfrastructureModule {}
