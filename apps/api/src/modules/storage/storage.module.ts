import { Module } from "@nestjs/common"

import { InfrastructureModule } from "@/shared/infrastructure/infrastructure.module"

import { StorageFacadeService } from "./application/services/facade/storage-facade.service"
import { GenerateUploadUrlUseCase } from "./application/services/usecases/generate-upload-url.usecase"
import { StorageController } from "./infrastructure/adapter/in/web/storage.controller"

@Module({
  imports: [InfrastructureModule],
  controllers: [StorageController],
  providers: [StorageFacadeService, GenerateUploadUrlUseCase],
})
export class StorageModule {}
