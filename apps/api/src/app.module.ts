import { ConfigModule } from "@/configs"
import { InfrastructureModule } from "@/shared/infrastructure"
import { Module } from "@nestjs/common"
import { AuthModule } from "./modules/auth/auth.module"

@Module({
  imports: [InfrastructureModule, ConfigModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
