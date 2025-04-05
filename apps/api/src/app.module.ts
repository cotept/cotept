import { ConfigModule } from "@/configs"
import { InfrastructureModule } from "@/shared/infrastructure"
import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
// import { AuthModule } from "./modules/auth/auth.module"

@Module({
  imports: [
    InfrastructureModule,
    ConfigModule,
    // , AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
