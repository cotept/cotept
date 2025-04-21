import { AppController } from "@/app.controller"
import { AppService } from "@/app.service"
import { ConfigModule } from "@/configs"
import { AuthModule } from "@/modules/auth/auth.module"
import { UserModule } from "@/modules/user/user.module"
import { InfrastructureModule } from "@/shared/infrastructure"
import { Module } from "@nestjs/common"

@Module({
  imports: [UserModule, AuthModule, InfrastructureModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
