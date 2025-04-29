import { ApiErrorFilter } from "@/shared/infrastructure/common/filters/api-error.filter"
import { Logger, ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import cookieParser from "cookie-parser"
import { AppModule } from "./app.module"
import { winstonLogger } from "./shared/infrastructure/common/logger"
import { SwaggerModule } from "./swagger/swagger.module"

async function bootstrap() {
  const logger = new Logger("Bootstrap")

  const app = await NestFactory.create(AppModule, { bufferLogs: true, logger: winstonLogger })

  // 쿠키 파서 미들웨어 추가
  app.use(cookieParser())

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

  const port = process.env.PORT ?? 3002
  await app.listen(port, "0.0.0.0", () => {
    logger.log(`server is running on port ${port}`)
  })
}
bootstrap()
