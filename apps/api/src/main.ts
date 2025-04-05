import { ApiErrorFilter } from "@/shared/infrastructure/common/filters/api-error.filter"
import { ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { winstonLogger } from "./shared/infrastructure/common/logger"
import { SwaggerModule } from "./swagger/swagger.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, logger: winstonLogger })
  // 향상된 ValidationPipe 설정 적용
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 필터링
      forbidNonWhitelisted: true, // 정의되지 않은 속성이 있을 경우 예외 발생
      transform: true, // 값을 DTO 객체로 자동 변환 (인스턴스화)
      transformOptions: {
        enableImplicitConversion: true, // 타입에 맞게 자동 변환
      },
    }),
  )
  app.useGlobalFilters(new ApiErrorFilter())

  const swagger = new SwaggerModule()
  swagger.setup(app)

  await app.listen(process.env.PORT ?? 3002)
}
bootstrap()
