import { Module } from "@nestjs/common"

import { StorageFacadeService } from "./application/services/facade/storage-facade.service"
import { GenerateUploadUrlUseCase } from "./application/services/usecases/generate-upload-url.usecase"
import { StorageController } from "./infrastructure/adapter/in/web/storage.controller"

import { InfrastructureModule } from "@/shared/infrastructure/infrastructure.module"

@Module({
  imports: [InfrastructureModule],
  controllers: [StorageController],
  providers: [StorageFacadeService, GenerateUploadUrlUseCase],
})
export class StorageModule {}
