import { Module } from "@nestjs/common"
import { JwtAuthGuard } from "./infrastructure/guards/jwt-auth.guard"

@Module({
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class SharedModule {}
