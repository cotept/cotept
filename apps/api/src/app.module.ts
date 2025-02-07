import { ConfigModule } from "@/configs"
import { InfrastructureModule } from "@/shared/infrastructure"
import { Module } from "@nestjs/common"

@Module({
  imports: [InfrastructureModule, ConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
