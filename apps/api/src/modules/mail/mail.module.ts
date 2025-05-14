import { MailConfig } from "@/configs/mail"
import { MailerModule, MailerService } from "@nestjs-modules/mailer"
import { PugAdapter } from "@nestjs-modules/mailer/dist/adapters/pug.adapter"
import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"

// 애플리케이션 계층
import { MailMapper } from "./application/mappers/mail.mapper"
import { GetMailAuditUseCase } from "./application/ports/in/get-mail-audit.usecase"
import { SendMailUseCase } from "./application/ports/in/send-mail.usecase"
import { MailAuditRepositoryPort } from "./application/ports/out/mail-audit-repository.port"
import { MailServicePort } from "./application/ports/out/mail-service.port"
import { MailFacadeService } from "./application/services/facade/mail-facade.service"
import { SendMailUseCaseImpl } from "./application/services/usecases"
import { GetMailAuditUseCaseImpl } from "./application/services/usecases/get-mail-audit.usecase.impl"

// 인프라스트럭처 계층
import { join } from "path"
import { MailAuditController } from "./infrastructure/adapter/in/controllers/mail-audit.controller"
import { MailController } from "./infrastructure/adapter/in/controllers/mail.controller"
import { MailAuditEntity } from "./infrastructure/adapter/out/persistence/entities/mail-audit.entity"
import { TypeOrmMailAuditRepository } from "./infrastructure/adapter/out/persistence/repositories/typeorm-mail-audit.repository"
import { MailService } from "./infrastructure/adapter/out/services/mail.service"

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([MailAuditEntity]),
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
          from: `"코테PT" <${configService.getOrThrow<MailConfig>("mail").mailFrom}>`,
        },
        template: {
          // dir: __dirname + "/infrastructure/common/templates",
          dir: join(process.cwd(), "src/modules/mail/infrastructure/common/templates"),
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    // 매퍼
    MailMapper,

    // 리포지토리
    {
      provide: MailAuditRepositoryPort,
      useClass: TypeOrmMailAuditRepository,
    },

    // 어댑터 (아웃바운드 포트 구현체)
    {
      provide: MailServicePort,
      useClass: MailService,
    },

    // 유스케이스 (인바운드 포트 구현체)
    {
      provide: SendMailUseCase,
      useClass: SendMailUseCaseImpl,
    },
    {
      provide: GetMailAuditUseCase,
      useClass: GetMailAuditUseCaseImpl,
    },

    // 파사드 서비스
    {
      provide: MailFacadeService,
      useFactory: (mailerService: MailerService, sendMailUseCase: SendMailUseCase) => {
        return new MailFacadeService(mailerService, sendMailUseCase)
      },
      inject: [MailerService, SendMailUseCase],
    },
  ],
  controllers: [MailController, MailAuditController],
  exports: [MailFacadeService],
})
export class MailModule {}
