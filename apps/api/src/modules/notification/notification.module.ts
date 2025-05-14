import { MailConfig } from "@/configs/mail"
import { MailerModule } from "@nestjs-modules/mailer"
import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.getOrThrow<MailConfig>("mail").host,
          port: configService.getOrThrow<MailConfig>("mail").port,
          secure: false, // true for 465, false for other ports
          auth: {
            user: configService.getOrThrow<MailConfig>("mail").user,
            pass: configService.getOrThrow<MailConfig>("mail").password,
          },
          pool: true, // 연결 풀링 활성화
          maxConnections: configService.getOrThrow<MailConfig>("mail").maxConnections, // 동시에 유지할 최대 연결 수
          maxMessages: configService.getOrThrow<MailConfig>("mail").maxMessage, // 연결당 최대 메시지 수 (이후 연결 재사용)
          rateDelta: configService.getOrThrow<MailConfig>("mail").rateDelta, // 발송 간격 (밀리초)
        },
        defaults: {
          from: configService.getOrThrow<MailConfig>("mail").mailFrom,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class NotificationModule {}
