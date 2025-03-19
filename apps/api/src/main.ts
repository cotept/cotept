import { ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { winstonLogger } from "./shared/infrastructure/common/logger"
import { SwaggerModule } from "./swagger/swagger.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, logger: winstonLogger })
  app.useGlobalPipes(new ValidationPipe())

  const swagger = new SwaggerModule()
  swagger.setup(app)

  await app.listen(process.env.PORT ?? 3002)
}
bootstrap()
