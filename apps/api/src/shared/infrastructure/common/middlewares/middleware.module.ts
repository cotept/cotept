import { Module } from "@nestjs/common"
import { LoggerModule } from "./logger-middleware.module"

@Module({
  imports: [LoggerModule],
  exports: [LoggerModule],
})
export class MiddlewareModule {}
