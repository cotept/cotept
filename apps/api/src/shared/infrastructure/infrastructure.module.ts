import { Module } from "@nestjs/common"

import { MiddlewareModule } from "./common/middlewares/middleware.module"
import { DatabaseModule } from "./persistence/database.module"
import { CryptoService } from "./services/crypto/crypto.service"

import { CacheModule } from "@/shared/infrastructure/cache/redis/cache.module"
import { OciClientFactory } from "@/shared/infrastructure/oci/clients/oci-client.factory"
import { ObjectStorageService } from "@/shared/infrastructure/oci/services/object-storage.service"

@Module({
  imports: [MiddlewareModule, DatabaseModule, CacheModule],
  providers: [CryptoService, OciClientFactory, ObjectStorageService],
  exports: [MiddlewareModule, DatabaseModule, CacheModule, CryptoService, OciClientFactory, ObjectStorageService],
})
export class InfrastructureModule {}
