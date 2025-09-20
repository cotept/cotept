import { Module } from "@nestjs/common"

import { AppController } from "@/app.controller"
import { AppService } from "@/app.service"
import { ConfigModule } from "@/configs"
import { AuthModule } from "@/modules/auth/auth.module"
import { MailModule } from "@/modules/mail/mail.module"
import { MentorModule } from "@/modules/mentor/mentor.module"
import { OnboardingModule } from "@/modules/onboarding/onboarding.module"
import { UserModule } from "@/modules/user/user.module"
import { UserProfileModule } from "@/modules/user-profile/user-profile.module"
import { InfrastructureModule } from "@/shared/infrastructure"

@Module({
  imports: [
    UserModule,
    UserProfileModule,
    AuthModule,
    MailModule,
    MentorModule,
    OnboardingModule,
    InfrastructureModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
