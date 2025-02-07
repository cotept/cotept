import { Module } from "@nestjs/common"
import { MiddlewareModule } from "./common/middlewares/middleware.module"
import { DatabaseModule } from "./persistence/database.module"

@Module({
  imports: [MiddlewareModule, DatabaseModule],
  exports: [MiddlewareModule, DatabaseModule],
})
export class InfrastructureModule {}
